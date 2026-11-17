import {
  DemoCustomerProfile,
  DemoQuotation,
  DemoDesignProject,
  DemoProductionJob,
  DemoActivityEvent,
  DemoQuotationStatus,
  DemoDesignStatus,
  DemoProductionStage,
} from '@/types/demo';
import {
  DEMO_CUSTOMERS,
  DEMO_PROJECTS,
  DEMO_QUOTATIONS,
  DEMO_DESIGN_PROJECTS,
  DEMO_PRODUCTION_JOBS,
  DEMO_ACTIVITIES,
} from './demo-data';

const STORAGE_KEYS = {
  CUSTOMERS: 'explast_demo_customers_v1',
  PROJECTS: 'explast_demo_projects_v1',
  QUOTATIONS: 'explast_demo_quotations_v1',
  DESIGNS: 'explast_demo_designs_v1',
  PRODUCTION: 'explast_demo_production_v1',
  ACTIVITIES: 'explast_demo_activities_v1',
  INITIALIZED: 'explast_demo_initialized_v1',
};

const memoryStore: Record<string, any> = {};

function getStore<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') {
    return memoryStore[key] !== undefined ? memoryStore[key] : fallback;
  }
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : (memoryStore[key] !== undefined ? memoryStore[key] : fallback);
  } catch {
    return memoryStore[key] !== undefined ? memoryStore[key] : fallback;
  }
}

function setStore<T>(key: string, value: T): void {
  memoryStore[key] = value;
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('LocalStorage write error in demo-service:', e);
  }
}

export const DemoService = {
  initialize(force = false): void {
    const isInitialized = getStore<boolean>(STORAGE_KEYS.INITIALIZED, false);
    const existingCustomers = getStore<any[]>(STORAGE_KEYS.CUSTOMERS, []);
    const isStale = !existingCustomers || existingCustomers.length < DEMO_CUSTOMERS.length;
    if (!isInitialized || force || isStale) {
      setStore(STORAGE_KEYS.CUSTOMERS, DEMO_CUSTOMERS);
      setStore(STORAGE_KEYS.PROJECTS, DEMO_PROJECTS);
      setStore(STORAGE_KEYS.QUOTATIONS, DEMO_QUOTATIONS);
      setStore(STORAGE_KEYS.DESIGNS, DEMO_DESIGN_PROJECTS);
      setStore(STORAGE_KEYS.PRODUCTION, DEMO_PRODUCTION_JOBS);
      setStore(STORAGE_KEYS.ACTIVITIES, DEMO_ACTIVITIES);
      setStore(STORAGE_KEYS.INITIALIZED, true);
    }
  },

  resetDemoData(): void {
    this.initialize(true);
  },

  // Customers
  getCustomers(): DemoCustomerProfile[] {
    this.initialize();
    return getStore<DemoCustomerProfile[]>(STORAGE_KEYS.CUSTOMERS, DEMO_CUSTOMERS);
  },

  getCustomerById(id: string): DemoCustomerProfile | undefined {
    return this.getCustomers().find(c => c.id === id);
  },

  addCustomer(customerData: Partial<DemoCustomerProfile>): DemoCustomerProfile {
    this.initialize();
    const existing = this.getCustomers();
    const newId = `DEMO-CLI-${String(existing.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString().substring(0, 10);
    const newCustomer: DemoCustomerProfile = {
      id: newId,
      company_name: customerData.company_name || 'New Customer',
      industry: customerData.industry || 'Industrial',
      location_type: (customerData.location_type as any) || 'Local (Mauritius)',
      contact_name: customerData.contact_name || '',
      contact_email: customerData.contact_email || '',
      contact_phone: customerData.contact_phone || '',
      delivery_address: customerData.delivery_address || '',
      brn_number: customerData.brn_number || 'C2026' + Math.floor(1000 + Math.random() * 9000),
      vat_number: customerData.vat_number || 'VAT' + Math.floor(10000000 + Math.random() * 90000000),
      status: customerData.status || 'Client',
      account_tier: customerData.account_tier || 'Regular',
      assigned_salesperson: customerData.assigned_salesperson || 'Alex L.',
      credit_terms: customerData.credit_terms || '30 Days End of Month',
      total_revenue_mur: 0,
      active_projects_count: 0,
      customer_since: now,
      notes: customerData.notes || '',
      is_demo: true,
      relationship_timeline: [
        {
          date: now,
          milestone: 'Direct Client Registration',
          details: `Directly registered into accounts directory by ${customerData.assigned_salesperson || 'Sales Representative'}.`,
        },
      ],
    };

    const updated = [newCustomer, ...existing];
    setStore(STORAGE_KEYS.CUSTOMERS, updated);

    // Add activity event
    const activities = this.getActivities();
    const newAct: DemoActivityEvent = {
      id: `DEMO-ACT-${Date.now()}`,
      timestamp: 'Just now',
      event_type: 'customer',
      title: `Client Account Created: ${newCustomer.company_name}`,
      description: `Added to CRM directory by ${newCustomer.assigned_salesperson}.`,
      actor: newCustomer.assigned_salesperson,
      entity_id: newId,
      severity: 'success',
    };
    setStore(STORAGE_KEYS.ACTIVITIES, [newAct, ...activities]);

    return newCustomer;
  },

  // Projects
  getProjects(): any[] {
    this.initialize();
    const rawProjects = getStore<any[]>(STORAGE_KEYS.PROJECTS, DEMO_PROJECTS);
    const customers = this.getCustomers();
    const custMap = new Map(customers.map(c => [c.id, c]));

    return rawProjects.map(p => {
      const cust = custMap.get(p.client_id);
      const companyName = cust?.company_name || p.client_name || p.client?.company_name || 'Client Record';
      const assignedRep = cust?.assigned_salesperson || p.assigned_salesperson || p.salesperson || 'Alex L.';
      return {
        ...p,
        client_name: companyName,
        assigned_salesperson: assignedRep,
        salesperson: assignedRep,
        client: cust ? { ...cust, company_name: companyName } : (p.client || { company_name: companyName }),
        clients: { company_name: companyName },
      };
    });
  },

  getProjectById(id: string): any | undefined {
    return this.getProjects().find(p => p.id === id);
  },

  // Quotations
  getQuotations(): DemoQuotation[] {
    this.initialize();
    return getStore<DemoQuotation[]>(STORAGE_KEYS.QUOTATIONS, DEMO_QUOTATIONS);
  },

  getQuotationById(id: string): DemoQuotation | undefined {
    return this.getQuotations().find(q => q.id === id);
  },

  updateQuotationStatus(
    id: string,
    newStatus: DemoQuotationStatus,
    actor = 'Alex L.',
    notes = ''
  ): void {
    const quotes = this.getQuotations();
    let targetQuote: DemoQuotation | undefined;

    const updated = quotes.map(q => {
      if (q.id === id) {
        targetQuote = q;
        const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
        const actionLabel =
          newStatus === 'admin_approved'
            ? 'Pricing & Margins Approved by Management'
            : newStatus === 'pending_approval'
            ? 'Submitted for Internal Admin Approval'
            : newStatus === 'sent'
            ? 'Official Quotation Sent to Client'
            : newStatus === 'accepted'
            ? 'Quotation Accepted by Client (Order Confirmed)'
            : newStatus === 'revised'
            ? 'Pricing Revision Requested'
            : `Status Changed to ${newStatus.replace('_', ' ').toUpperCase()}`;

        const updatedQuote: DemoQuotation = {
          ...q,
          status: newStatus,
          admin_approval:
            newStatus === 'admin_approved'
              ? {
                  approved_by: actor,
                  approved_at: now,
                  notes: notes || 'Pricing structure and target profit margins verified.',
                }
              : q.admin_approval,
          history: [
            {
              date: now,
              action: actionLabel,
              actor: actor,
              notes: notes || (newStatus === 'accepted' ? 'Order confirmed by client. Automated production release triggered.' : undefined),
            },
            ...q.history,
          ],
        };
        return updatedQuote;
      }
      return q;
    });

    setStore(STORAGE_KEYS.QUOTATIONS, updated);

    // Automated Production Release on Client Acceptance (Requirement 2 & 6)
    if (newStatus === 'accepted' && targetQuote) {
      const q = targetQuote;
      const existingJobs = this.getProductionJobs();
      const alreadyReleased = existingJobs.some(
        j => j.quotation_id === q.id || (j.project_id === q.project_id && j.is_demo)
      );

      if (!alreadyReleased) {
        const firstItem = q.items[0];
        const newJob: DemoProductionJob = {
          id: `DEMO-PROD-${Date.now()}`,
          job_reference: `JOB-EXP-2026-${Math.floor(100 + Math.random() * 900)}`,
          project_id: q.project_id,
          project_name: q.project_name,
          quotation_id: q.id,
          client_id: q.client_id,
          client_name: q.client_name,
          product_type: firstItem?.final_product_type || 'Side Sealing Bag',
          material_family: firstItem?.material_family || 'LDPE',
          material_grade: firstItem?.material_grade,
          formulation: firstItem?.formulation || 'Grade 2 + Linear',
          dimensions_summary: firstItem?.dimensions_summary || 'Standard Dimensions',
          thickness_micron: firstItem?.thickness_micron || 40,
          is_printed: firstItem?.print_type === 'printed',
          num_colors: firstItem?.num_colors || 0,
          required_quantity: firstItem?.quantity || 50000,
          quantity_unit: firstItem?.quantity_unit || 'units',
          produced_quantity: 0,
          assigned_team: 'Extrusion Line 1 (Sunil / Team A)',
          extrusion_line: 'Extruder #1 (Windmöller & Hölscher)',
          printing_press: firstItem?.print_type === 'printed' ? 'Flexo 8-Color Stack Press' : undefined,
          conversion_line: 'Automatic Side Sealer Line 1',
          planned_start_date: new Date().toISOString().substring(0, 10),
          target_completion_date: new Date(Date.now() + 14 * 86400000).toISOString().substring(0, 10),
          current_stage: 'scheduled',
          progress_percent: 5,
          priority: 'normal',
          qc_status: 'pending',
          is_demo: true,
          stages_completed: ['scheduled'],
          internal_notes: `Auto-dispatched immediately upon client acceptance of Quotation ${q.quotation_number}.`,
        };

        setStore(STORAGE_KEYS.PRODUCTION, [newJob, ...existingJobs]);
      }

      // Update linked project's kanban stage to 'Production Order'
      const rawProjects = getStore<any[]>(STORAGE_KEYS.PROJECTS, DEMO_PROJECTS);
      const updatedProjects = rawProjects.map(proj => {
        if (proj.id === q.project_id) {
          return {
            ...proj,
            kanban_stage: 'Production Order',
            request_status: 'approved',
          };
        }
        return proj;
      });
      setStore(STORAGE_KEYS.PROJECTS, updatedProjects);

      // Add timeline activity
      const activities = this.getActivities();
      const orderAct: DemoActivityEvent = {
        id: `DEMO-ACT-${Date.now()}`,
        timestamp: 'Just now',
        event_type: 'production',
        title: `Auto Production Dispatch: ${q.project_name}`,
        description: `Quotation ${q.quotation_number} accepted by client. Production order auto-scheduled on plant floor.`,
        actor: actor,
        entity_id: q.id,
        severity: 'success',
      };
      setStore(STORAGE_KEYS.ACTIVITIES, [orderAct, ...activities]);
    }
  },

  // Design Projects
  getDesignProjects(): DemoDesignProject[] {
    this.initialize();
    return getStore<DemoDesignProject[]>(STORAGE_KEYS.DESIGNS, DEMO_DESIGN_PROJECTS);
  },

  getDesignById(id: string): DemoDesignProject | undefined {
    return this.getDesignProjects().find(d => d.id === id);
  },

  updateDesignStatus(id: string, newStatus: DemoDesignStatus): void {
    const designs = this.getDesignProjects();
    const updated = designs.map(d => {
      if (d.id === id) {
        const now = new Date().toISOString().substring(0, 10);
        return {
          ...d,
          status: newStatus,
          revisions: [
            {
              version: d.version + 1,
              date: now,
              author: 'Alex L.',
              comment: `Workflow stage updated to ${newStatus.replace('_', ' ')} during presentation.`,
              status: newStatus.replace('_', ' ').toUpperCase(),
            },
            ...d.revisions,
          ],
        };
      }
      return d;
    });
    setStore(STORAGE_KEYS.DESIGNS, updated);
  },

  // Production Jobs
  getProductionJobs(): DemoProductionJob[] {
    this.initialize();
    return getStore<DemoProductionJob[]>(STORAGE_KEYS.PRODUCTION, DEMO_PRODUCTION_JOBS);
  },

  getProductionJobById(id: string): DemoProductionJob | undefined {
    return this.getProductionJobs().find(p => p.id === id);
  },

  updateProductionStage(id: string, newStage: DemoProductionStage): void {
    const jobs = this.getProductionJobs();
    const updated = jobs.map(j => {
      if (j.id === id) {
        const isComplete = newStage === 'completed';
        return {
          ...j,
          current_stage: newStage,
          progress_percent: isComplete ? 100 : Math.min(j.progress_percent + 20, 95),
          stages_completed: Array.from(new Set([...j.stages_completed, newStage])),
        };
      }
      return j;
    });
    setStore(STORAGE_KEYS.PRODUCTION, updated);
  },

  // Activities
  getActivities(): DemoActivityEvent[] {
    this.initialize();
    return getStore<DemoActivityEvent[]>(STORAGE_KEYS.ACTIVITIES, DEMO_ACTIVITIES);
  },

  // Customer 360 Ecosystem
  getCustomerRelationship(customerId: string) {
    const customer = this.getCustomerById(customerId);
    const projects = this.getProjects().filter(p => p.client_id === customerId);
    const quotations = this.getQuotations().filter(q => q.client_id === customerId);
    const designs = this.getDesignProjects().filter(d => d.client_id === customerId);
    const productionJobs = this.getProductionJobs().filter(p => p.client_id === customerId);

    return {
      customer,
      projects,
      quotations,
      designs,
      productionJobs,
    };
  },

  // Comprehensive Analytics Engine with Role & Salesperson Scoping
  getAnalyticsMetrics(salespersonName?: string) {
    const isScoped = Boolean(salespersonName && salespersonName !== 'all');
    let projects = this.getProjects();
    let quotations = this.getQuotations();
    let customers = this.getCustomers();
    let productionJobs = this.getProductionJobs();

    if (isScoped && salespersonName) {
      customers = customers.filter(c => c.assigned_salesperson === salespersonName);
      projects = projects.filter(
        p => p.assigned_salesperson === salespersonName || p.salesperson === salespersonName
      );
      quotations = quotations.filter(q => q.salesperson === salespersonName);
      productionJobs = productionJobs.filter(
        j =>
          projects.some(p => p.id === j.project_id) ||
          quotations.some(q => q.id === j.quotation_id)
      );
    }

    // 1. Sales Performance
    const totalRequests = projects.length;
    const totalQuotationsCount = quotations.length;
    const totalQuotationValue = quotations.reduce((acc, q) => acc + q.total_mur, 0);
    const acceptedQuotations = quotations.filter(q => q.status === 'accepted');
    const acceptedQuotationValue = acceptedQuotations.reduce((acc, q) => acc + q.total_mur, 0);
    const conversionRate = totalQuotationsCount > 0 ? (acceptedQuotations.length / totalQuotationsCount) * 100 : 0;
    const pendingQuotations = quotations.filter(
      q => q.status === 'sent' || q.status === 'awaiting_response' || q.status === 'pending_approval' || q.status === 'admin_approved'
    );
    const pendingQuotationValue = pendingQuotations.reduce((acc, q) => acc + q.total_mur, 0);

    // 2. Customer Breakdown
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.active_projects_count > 0 || c.total_revenue_mur > 0).length;
    const industryCounts: Record<string, number> = {};
    customers.forEach(c => {
      const ind = c.industry || 'Other';
      industryCounts[ind] = (industryCounts[ind] || 0) + 1;
    });

    // 3. Materials Breakdown
    const materialCounts: Record<string, number> = { LDPE: 0, MDPE: 0, PP: 0 };
    const printCounts: Record<string, number> = { plain: 0, printed: 0 };
    const productTypeCounts: Record<string, number> = {
      'Side Sealing Bag': 0,
      'Bottom Sealing Bag': 0,
      'Bag with Sealing Tape': 0,
      'Roll': 0,
    };
    const colorDistribution: Record<string, number> = {
      'Plain (0 cols)': 0,
      '1 - 2 Colours': 0,
      '3 - 4 Colours': 0,
      '5+ Colours (High Definition)': 0,
    };

    projects.forEach(p => {
      if (p.material_family && materialCounts[p.material_family] !== undefined) {
        materialCounts[p.material_family]++;
      }
      if (p.print_type === 'printed') {
        printCounts.printed++;
        const cols = p.printing_spec?.num_colors || 1;
        if (cols <= 2) colorDistribution['1 - 2 Colours']++;
        else if (cols <= 4) colorDistribution['3 - 4 Colours']++;
        else colorDistribution['5+ Colours (High Definition)']++;
      } else {
        printCounts.plain++;
        colorDistribution['Plain (0 cols)']++;
      }
      if (p.final_product_type && productTypeCounts[p.final_product_type] !== undefined) {
        productTypeCounts[p.final_product_type]++;
      }
    });

    // 4. Production Throughput
    const totalJobs = productionJobs.length;
    const activeJobs = productionJobs.filter(j => j.current_stage !== 'completed');
    const completedJobs = productionJobs.filter(j => j.current_stage === 'completed');
    const jobsByStage: Record<string, number> = {
      scheduled: 0,
      awaiting_material: 0,
      extrusion: 0,
      printing: 0,
      conversion: 0,
      quality_control: 0,
      completed: 0,
    };
    productionJobs.forEach(j => {
      if (jobsByStage[j.current_stage] !== undefined) {
        jobsByStage[j.current_stage]++;
      }
    });

    // 5. Sales Rep Comparison
    const salesReps: Record<string, { requests: number; quotes: number; acceptedValue: number }> = {
      'Alex L.': { requests: 0, quotes: 0, acceptedValue: 0 },
      'Sunil R.': { requests: 0, quotes: 0, acceptedValue: 0 },
      'Sarah M.': { requests: 0, quotes: 0, acceptedValue: 0 },
    };

    const allQuotesForComparison = this.getQuotations();
    allQuotesForComparison.forEach(q => {
      const rep = q.salesperson || 'Alex L.';
      if (!salesReps[rep]) salesReps[rep] = { requests: 0, quotes: 0, acceptedValue: 0 };
      salesReps[rep].quotes++;
      if (q.status === 'accepted') {
        salesReps[rep].acceptedValue += q.total_mur;
      }
    });

    return {
      isScoped,
      scopedSalesperson: salespersonName,
      sales: {
        totalRequests,
        totalQuotationsCount,
        totalQuotationValue,
        acceptedQuotationValue,
        acceptedCount: acceptedQuotations.length,
        conversionRate: Math.round(conversionRate),
        pendingQuotationValue,
        pendingCount: pendingQuotations.length,
      },
      customers: {
        totalCustomers,
        activeCustomers,
        industryCounts,
      },
      products: {
        materialCounts,
        printCounts,
        productTypeCounts,
        colorDistribution,
      },
      production: {
        totalJobs,
        activeJobsCount: activeJobs.length,
        completedJobsCount: completedJobs.length,
        jobsByStage,
      },
      salesReps,
    };
  },
};
