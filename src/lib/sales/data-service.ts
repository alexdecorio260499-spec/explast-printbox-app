import { supabase } from '@/lib/supabase/client';
import { Client, Product, SalesProjectDraft, BrandUnit, ProductFamily } from '@/types/sales';
import { DEFAULT_CATALOGUE_PRODUCTS } from './product-families';

const LOCAL_CLIENTS_KEY = 'explast_local_clients_v1';
const LOCAL_DRAFTS_KEY = 'explast_local_drafts_v1';
const LOCAL_PROJECTS_KEY = 'explast_local_projects_v1';

// Initial fallback mock clients
const DEFAULT_CLIENTS: Client[] = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    company_name: 'ABC Restaurant',
    industry: 'Food Service',
    location_type: 'Local (Mauritius)',
    contact_name: 'Jean Michel',
    contact_email: 'jm@abcrestaurant.mu',
    contact_phone: '+230 5123 4567',
    status: 'Client',
    delivery_address: 'Royal Road, Grand Baie',
  },
  {
    id: 'a0000000-0000-0000-0000-000000000002',
    company_name: 'Bean Roasters Cafe',
    industry: 'Food Service',
    location_type: 'Local (Mauritius)',
    contact_name: 'Sarah Chen',
    contact_email: 'sarah@beanroasters.mu',
    contact_phone: '+230 5987 6543',
    status: 'Client',
    delivery_address: 'Caudan Waterfront, Port Louis',
  },
  {
    id: 'a0000000-0000-0000-0000-000000000003',
    company_name: 'Boutique Paris',
    industry: 'Retail',
    location_type: 'Local (Mauritius)',
    contact_name: 'Marie Dupont',
    contact_email: 'marie@boutiqueparis.mu',
    contact_phone: '+230 5456 7890',
    status: 'Client',
    delivery_address: 'Bagatelle Mall, Moka',
  },
  {
    id: 'a0000000-0000-0000-0000-000000000004',
    company_name: 'Industrial Plastics Ltd',
    industry: 'Industrial',
    location_type: 'Local (Mauritius)',
    contact_name: 'Kevin Ramgoolam',
    contact_email: 'kevin@ipl.mu',
    contact_phone: '+230 5234 5678',
    status: 'Lead',
    delivery_address: 'Plaine Lauzun Industrial Zone',
  },
];

// Fallback historical projects for client history review
const DEFAULT_HISTORICAL_PROJECTS = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    client_id: 'a0000000-0000-0000-0000-000000000001',
    project_name: 'ABC Takeaway Boxes 2025',
    brand: 'PrintBox' as BrandUnit,
    request_type: 'new_standard',
    status: 'In Production',
    created_at: '2025-11-10T10:00:00Z',
    items: [
      {
        id: 'item-h1',
        item_type: 'standard',
        product_id: 'b0000000-0000-0000-0000-000000000002',
        product_family: 'takeaway_box' as ProductFamily,
        description: 'Standard Flap-Folded Burger Box',
        quantity: 5000,
        quantity_status: 'confirmed',
        dimensions: { width: 120, length: 120, height: 90, unit: 'mm', dimension_type: 'internal', status: 'confirmed' },
        material: { material_type: 'Virgin Kraft Board (280 GSM)', food_grade: true, status: 'confirmed' },
        printing: { print_type: 'existing_artwork', surfaces: 2, artwork_ready: true, status: 'confirmed' },
      }
    ],
    artwork: {
      status: 'existing_approved',
      file_name: 'abc-burger-box-artwork-v1.pdf',
      file_url: 'https://example.com/assets/abc-box.pdf'
    }
  }
];

const inMemoryCache: Record<string, any> = {};

function getLocalStore<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return inMemoryCache[key] !== undefined ? inMemoryCache[key] : defaultValue;
  }
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return inMemoryCache[key] !== undefined ? inMemoryCache[key] : defaultValue;
  }
}

function setLocalStore<T>(key: string, value: T): void {
  inMemoryCache[key] = value;
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('LocalStorage write failed:', e);
  }
}

export const SalesDataService = {
  // --------------------------------------------------------------------------
  // CLIENTS
  // --------------------------------------------------------------------------
  async getClients(): Promise<Client[]> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('company_name');

      if (!error && data && data.length > 0) {
        return data as Client[];
      }
    } catch (e) {
      console.warn('Supabase getClients error, using fallback:', e);
    }

    const localClients = getLocalStore<Client[]>(LOCAL_CLIENTS_KEY, DEFAULT_CLIENTS);
    return localClients;
  },

  async createClient(newClient: Omit<Client, 'id'>): Promise<{ client: Client; isDuplicate: boolean }> {
    const existingClients = await this.getClients();
    
    // Check for likely duplicate
    const duplicate = existingClients.find(
      c => c.company_name.toLowerCase() === newClient.company_name.toLowerCase() ||
           (newClient.contact_email && c.contact_email?.toLowerCase() === newClient.contact_email.toLowerCase())
    );

    if (duplicate) {
      return { client: duplicate, isDuplicate: true };
    }

    const clientWithId: Client = {
      ...newClient,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };

    // Attempt remote insert
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert({
          id: clientWithId.id,
          company_name: clientWithId.company_name,
          contact_name: clientWithId.contact_name,
          contact_email: clientWithId.contact_email,
          contact_phone: clientWithId.contact_phone,
          industry: clientWithId.industry,
          location_type: clientWithId.location_type,
          status: clientWithId.status || 'Client',
        })
        .select()
        .single();

      if (!error && data) {
        return { client: data as Client, isDuplicate: false };
      }
    } catch (e) {
      console.warn('Remote client insert failed, persisting locally:', e);
    }

    // Local persistence fallback
    const updated = [clientWithId, ...existingClients];
    setLocalStore(LOCAL_CLIENTS_KEY, updated);
    return { client: clientWithId, isDuplicate: false };
  },

  // --------------------------------------------------------------------------
  // PRODUCTS
  // --------------------------------------------------------------------------
  async getProducts(brand?: BrandUnit): Promise<Product[]> {
    try {
      let query = supabase.from('products').select('*').eq('is_active', true);
      if (brand) {
        query = query.eq('brand_unit', brand);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as Product[];
      }
    } catch (e) {
      console.warn('Supabase getProducts error, using defaults:', e);
    }

    if (brand) {
      return DEFAULT_CATALOGUE_PRODUCTS.filter(p => p.brand_unit === brand);
    }
    return DEFAULT_CATALOGUE_PRODUCTS;
  },

  // --------------------------------------------------------------------------
  // CLIENT HISTORY (REPEAT ORDERS / PREVIOUS SPECS)
  // --------------------------------------------------------------------------
  async getClientHistory(clientId: string) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*, project_items(*), design_assets(*)')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (e) {
      console.warn('Remote getClientHistory error, using fallback:', e);
    }

    const localProjects = getLocalStore<any[]>(LOCAL_PROJECTS_KEY, DEFAULT_HISTORICAL_PROJECTS);
    return localProjects.filter(p => p.client_id === clientId);
  },

  // --------------------------------------------------------------------------
  // DRAFTS (SAVE & RESUME)
  // --------------------------------------------------------------------------
  async saveDraft(draft: SalesProjectDraft): Promise<void> {
    const now = new Date().toISOString();
    const updatedDraft = {
      ...draft,
      updated_at: now,
    };

    // 1. Always update local storage immediately for zero-loss recovery
    const drafts = getLocalStore<SalesProjectDraft[]>(LOCAL_DRAFTS_KEY, []);
    const filtered = drafts.filter(d => d.id !== draft.id);
    setLocalStore(LOCAL_DRAFTS_KEY, [updatedDraft, ...filtered]);

    // 2. Attempt remote draft sync to projects.form_data_temp
    try {
      if (draft.client_id) {
        await supabase
          .from('projects')
          .upsert({
            id: draft.id,
            client_id: draft.client_id,
            business_unit: draft.brand,
            project_name: draft.project_name || 'Draft Packaging Request',
            workflow_path: 'Path A',
            kanban_stage: 'Discovery',
            request_type: draft.request_type,
            request_status: 'draft',
            form_data_temp: updatedDraft,
            updated_at: now,
          });
      }
    } catch (e) {
      console.warn('Remote draft save failed, preserved locally:', e);
    }
  },

  getDrafts(): SalesProjectDraft[] {
    return getLocalStore<SalesProjectDraft[]>(LOCAL_DRAFTS_KEY, []);
  },

  getDraft(draftId: string): SalesProjectDraft | null {
    const drafts = this.getDrafts();
    return drafts.find(d => d.id === draftId) || null;
  },

  removeDraft(draftId: string): void {
    const drafts = this.getDrafts();
    setLocalStore(LOCAL_DRAFTS_KEY, drafts.filter(d => d.id !== draftId));
  },

  // --------------------------------------------------------------------------
  // SUBMISSION (STRUCTURED PERSISTENCE)
  // --------------------------------------------------------------------------
  async submitRequest(draft: SalesProjectDraft): Promise<{ projectId: string; success: boolean }> {
    const now = new Date().toISOString();
    
    // 1. Local structured persistence
    const localProjects = getLocalStore<any[]>(LOCAL_PROJECTS_KEY, DEFAULT_HISTORICAL_PROJECTS);
    const newProjectRecord = {
      id: draft.id,
      client_id: draft.client_id,
      client: draft.client,
      project_name: draft.project_name,
      brand: draft.brand,
      business_unit: draft.brand,
      request_type: draft.request_type,
      request_status: 'submitted',
      kanban_stage: 'Discovery',
      workflow_path: 'Path A',
      created_at: draft.created_at || now,
      updated_at: now,
      items: draft.items,
      artwork: draft.artwork,
      delivery: draft.delivery,
    };
    setLocalStore(LOCAL_PROJECTS_KEY, [newProjectRecord, ...localProjects]);
    this.removeDraft(draft.id);

    // 2. Remote Supabase insertion
    try {
      if (draft.client_id) {
        const { error: projectErr } = await supabase
          .from('projects')
          .upsert({
            id: draft.id,
            client_id: draft.client_id,
            business_unit: draft.brand,
            project_name: draft.project_name,
            workflow_path: 'Path A',
            kanban_stage: 'Discovery',
            request_type: draft.request_type,
            request_status: 'submitted',
            parent_project_id: draft.parent_project_id || null,
            requested_delivery_date: draft.delivery.requested_date || null,
            delivery_instructions: draft.delivery.delivery_location || null,
            urgency: draft.delivery.urgency || 'normal',
            internal_notes: draft.delivery.internal_notes || null,
            form_data_temp: null, // Clear discovery temp as per schema rule
            updated_at: now,
          });

        if (projectErr) {
          console.warn('Remote project insert warning:', projectErr.message);
        }

        // Insert items if table exists
        if (draft.items && draft.items.length > 0) {
          for (const item of draft.items) {
            await supabase.from('project_items').insert({
              project_id: draft.id,
              product_id: item.product_id || null,
              item_type: item.item_type || draft.request_type,
              product_family: item.product_family,
              description: item.description,
              quantity: item.quantity,
              quantity_status: item.quantity_status,
              dimensions: item.dimensions,
              material_specs: item.material,
              printing_specs: item.printing,
              technical_status: item.technical_status,
            });
          }
        }

        // Insert artwork asset if file uploaded
        if (draft.artwork && draft.artwork.file_url) {
          await supabase.from('design_assets').insert({
            project_id: draft.id,
            file_url: draft.artwork.file_url,
            file_name: draft.artwork.file_name || 'uploaded_artwork',
            asset_type: 'Client Logo',
          });
        }
      }
    } catch (e) {
      console.warn('Remote submission warning, saved to local cache:', e);
    }

    return { projectId: draft.id, success: true };
  },

  async getAllProjects(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*, clients(*)')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (e) {
      console.warn('Remote getAllProjects error:', e);
    }

    return getLocalStore<any[]>(LOCAL_PROJECTS_KEY, DEFAULT_HISTORICAL_PROJECTS);
  }
};
