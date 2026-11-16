import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { Client } from '@/types/sales';
import { ExplastSalesDraft, ExplastSpecificationSnapshot } from '@/types/explast';
import { SalesDataService } from './data-service';
import { DEMO_PROJECTS } from './demo-data';

const LOCAL_EXPLAST_DRAFTS_KEY = 'explast_manufacturing_drafts_v1';
const LOCAL_EXPLAST_PROJECTS_KEY = 'explast_manufacturing_projects_v1';

const inMemoryExplastCache: Record<string, any> = {};

function getLocalStore<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return inMemoryExplastCache[key] !== undefined ? inMemoryExplastCache[key] : defaultValue;
  }
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return inMemoryExplastCache[key] !== undefined ? inMemoryExplastCache[key] : defaultValue;
  }
}

function setLocalStore<T>(key: string, value: T): void {
  inMemoryExplastCache[key] = value;
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('LocalStorage write failed:', e);
  }
}

// Initial fallback historical Explast projects (backed by full rich demo dataset)
const DEFAULT_EXPLAST_HISTORICAL_PROJECTS = DEMO_PROJECTS;

export const ExplastSalesService = {
  // --------------------------------------------------------------------------
  // CLIENTS & SHARED CRM
  // --------------------------------------------------------------------------
  async getClients(): Promise<Client[]> {
    return SalesDataService.getClients();
  },

  async createClient(newClient: Omit<Client, 'id'>) {
    return SalesDataService.createClient(newClient);
  },

  // --------------------------------------------------------------------------
  // CLIENT HISTORY (PREVIOUS EXPLAST CONFIGURATIONS & APPROVED SPECS)
  // --------------------------------------------------------------------------
  async getClientExplastHistory(clientId: string): Promise<any[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select(`
            *,
            explast_specifications(*),
            explast_technical_assessments(*),
            design_assets(*)
          `)
          .eq('client_id', clientId)
          .eq('business_unit', 'Explast')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (e) {
        console.warn('Remote getClientExplastHistory error, using fallback:', e);
      }
    }

    const localProjects = getLocalStore<any[]>(LOCAL_EXPLAST_PROJECTS_KEY, DEFAULT_EXPLAST_HISTORICAL_PROJECTS);
    return localProjects.filter(p => p.client_id === clientId);
  },

  // --------------------------------------------------------------------------
  // DRAFTS (PERSISTENCE & RESUME)
  // --------------------------------------------------------------------------
  async saveDraft(draft: ExplastSalesDraft): Promise<void> {
    const now = new Date().toISOString();
    const updatedDraft = {
      ...draft,
      updated_at: now,
    };

    // 1. Local storage & memory cache for instant resilience
    const drafts = getLocalStore<ExplastSalesDraft[]>(LOCAL_EXPLAST_DRAFTS_KEY, []);
    const filtered = drafts.filter(d => d.id !== draft.id);
    setLocalStore(LOCAL_EXPLAST_DRAFTS_KEY, [updatedDraft, ...filtered]);

    // 2. Remote draft sync to projects.form_data_temp
    try {
      if (draft.client_id) {
        await supabase
          .from('projects')
          .upsert({
            id: draft.id,
            client_id: draft.client_id,
            business_unit: 'Explast',
            project_name: draft.project_name || 'Draft Explast Packaging Request',
            workflow_path: 'Path B',
            kanban_stage: 'Discovery',
            request_type: draft.repeat_type || 'new_config',
            request_status: 'draft',
            form_data_temp: updatedDraft,
            updated_at: now,
          });
      }
    } catch (e) {
      console.warn('Remote Explast draft save warning, preserved locally:', e);
    }
  },

  getDrafts(): ExplastSalesDraft[] {
    return getLocalStore<ExplastSalesDraft[]>(LOCAL_EXPLAST_DRAFTS_KEY, []);
  },

  getDraft(draftId: string): ExplastSalesDraft | null {
    const drafts = this.getDrafts();
    return drafts.find(d => d.id === draftId) || null;
  },

  removeDraft(draftId: string): void {
    const drafts = this.getDrafts();
    setLocalStore(LOCAL_EXPLAST_DRAFTS_KEY, drafts.filter(d => d.id !== draftId));
  },

  // --------------------------------------------------------------------------
  // SUBMISSION (STRUCTURED MANUFACTURING PERSISTENCE)
  // --------------------------------------------------------------------------
  async submitExplastProject(draft: ExplastSalesDraft): Promise<{ projectId: string; success: boolean }> {
    const now = new Date().toISOString();

    // 1. Structured Local Persistence
    const localProjects = getLocalStore<any[]>(LOCAL_EXPLAST_PROJECTS_KEY, DEFAULT_EXPLAST_HISTORICAL_PROJECTS);
    
    const newProjectRecord = {
      id: draft.id,
      client_id: draft.client_id,
      client: draft.client,
      project_name: draft.project_name,
      brand: 'Explast',
      business_unit: 'Explast',
      request_type: draft.repeat_type || 'new_config',
      request_status: draft.technical_assessment?.status === 'approved' ? 'ready_for_quotation' : 'technical_review',
      kanban_stage: draft.technical_assessment?.status === 'approved' ? 'Quoting' : 'Discovery',
      workflow_path: 'Path B',
      created_at: draft.created_at || now,
      updated_at: now,
      is_repeat: draft.is_repeat ?? false,
      parent_project_id: draft.parent_project_id || null,
      
      // Explast manufacturing parameters
      material_family: draft.material_family,
      material_grade: draft.material_grade,
      formulation: draft.formulation,
      print_type: draft.print_type,
      final_product_type: draft.final_product_type,
      quantity: draft.quantity,
      quantity_unit: draft.quantity_unit,
      requested_delivery_date: draft.requested_delivery_date,
      extrusion_spec: draft.extrusion_spec,
      printing_spec: draft.printing_spec,
      product_spec: draft.product_spec,
      technical_assessment: draft.technical_assessment,
      quotation_readiness: draft.quotation_readiness,
    };

    setLocalStore(LOCAL_EXPLAST_PROJECTS_KEY, [newProjectRecord, ...localProjects]);
    this.removeDraft(draft.id);

    // 2. Remote Supabase Insertion
    try {
      if (draft.client_id) {
        // Upsert project
        const { error: projErr } = await supabase
          .from('projects')
          .upsert({
            id: draft.id,
            client_id: draft.client_id,
            business_unit: 'Explast',
            project_name: draft.project_name,
            workflow_path: 'Path B',
            kanban_stage: draft.technical_assessment?.status === 'approved' ? 'Quoting' : 'Discovery',
            request_type: draft.repeat_type || 'new_config',
            request_status: draft.technical_assessment?.status === 'approved' ? 'submitted' : 'technical_review',
            parent_project_id: draft.parent_project_id || null,
            requested_delivery_date: draft.requested_delivery_date || null,
            urgency: draft.urgency || 'normal',
            internal_notes: draft.internal_notes || null,
            form_data_temp: null, // Clear discovery temp per schema rule
            updated_at: now,
          });

        if (projErr) {
          console.warn('Remote project insert note:', projErr.message);
        }

        // Insert explast_specifications
        await supabase
          .from('explast_specifications')
          .insert({
            project_id: draft.id,
            material_family: draft.material_family,
            material_grade: draft.material_grade || null,
            formulation: draft.formulation,
            print_type: draft.print_type,
            final_product_type: draft.final_product_type,
            extrusion_spec: draft.extrusion_spec,
            printing_spec: draft.printing_spec,
            product_spec: draft.product_spec,
            quantity: draft.quantity,
            quantity_unit: draft.quantity_unit,
          });

        // Insert explast_technical_assessments
        await supabase
          .from('explast_technical_assessments')
          .insert({
            project_id: draft.id,
            assessment_status: draft.technical_assessment?.status || 'not_required',
            responsible_person: draft.technical_assessment?.responsible_person || null,
            assessment_date: draft.technical_assessment?.assessment_date || now,
            extrusion_feasibility: draft.technical_assessment?.extrusion_feasibility || 'feasible',
            printing_feasibility: draft.technical_assessment?.printing_feasibility || 'feasible',
            conversion_feasibility: draft.technical_assessment?.conversion_feasibility || 'feasible',
            observations: draft.technical_assessment?.observations || null,
            calculations: draft.technical_assessment?.calculations || {},
            approval_status: draft.technical_assessment?.status === 'approved' ? 'Approved' : 'Pending',
          });

        // Insert artwork asset if file attached
        if (draft.printing_spec?.artwork_file_url) {
          await supabase
            .from('design_assets')
            .insert({
              project_id: draft.id,
              file_url: draft.printing_spec.artwork_file_url,
              file_name: draft.printing_spec.artwork_file_name || 'explast_artwork',
              asset_type: 'Client Logo',
            });
        }
      }
    } catch (e) {
      console.warn('Remote Explast project insert warning, cached locally:', e);
    }

    return { projectId: draft.id, success: true };
  },

  async getAllExplastProjects(): Promise<any[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select(`
            *,
            clients(*),
            explast_specifications(*),
            explast_technical_assessments(*)
          `)
          .eq('business_unit', 'Explast')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (e) {
        console.warn('Remote getAllExplastProjects error:', e);
      }
    }

    return getLocalStore<any[]>(LOCAL_EXPLAST_PROJECTS_KEY, DEFAULT_EXPLAST_HISTORICAL_PROJECTS);
  },
};
