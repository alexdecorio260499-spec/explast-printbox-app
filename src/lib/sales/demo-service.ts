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
    if (!isInitialized || force) {
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

  // Projects
  getProjects(): any[] {
    this.initialize();
    return getStore<any[]>(STORAGE_KEYS.PROJECTS, DEMO_PROJECTS);
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

  updateQuotationStatus(id: string, newStatus: DemoQuotationStatus): void {
    const quotes = this.getQuotations();
    const updated = quotes.map(q => {
      if (q.id === id) {
        const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
        return {
          ...q,
          status: newStatus,
          history: [
            {
              date: now,
              action: `Status Changed to ${newStatus.replace('_', ' ').toUpperCase()}`,
              actor: 'Demo User (Alex L.)',
              notes: 'Updated interactively in client demonstration.',
            },
            ...q.history,
          ],
        };
      }
      return q;
    });
    setStore(STORAGE_KEYS.QUOTATIONS, updated);
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

  // Comprehensive Analytics Engine
  getAnalyticsMetrics() {
    const projects = this.getProjects();
    const quotations = this.getQuotations();
    const customers = this.getCustomers();
    const productionJobs = this.getProductionJobs();

    // 1. Sales Performance
    const totalRequests = projects.length;
    const totalQuotationsCount = quotations.length;
    const totalQuotationValue = quotations.reduce((acc, q) => acc + q.total_mur, 0);
    const acceptedQuotations = quotations.filter(q => q.status === 'accepted');
    const acceptedQuotationValue = acceptedQuotations.reduce((acc, q) => acc + q.total_mur, 0);
    const conversionRate = totalQuotationsCount > 0 ? (acceptedQuotations.length / totalQuotationsCount) * 100 : 0;
    const pendingQuotations = quotations.filter(q => q.status === 'sent' || q.status === 'awaiting_response' || q.status === 'pending_approval');
    const pendingQuotationValue = pendingQuotations.reduce((acc, q) => acc + q.total_mur, 0);

    // 2. Customer Breakdown
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.active_projects_count > 0).length;
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

    quotations.forEach(q => {
      const rep = q.salesperson || 'Alex L.';
      if (!salesReps[rep]) salesReps[rep] = { requests: 0, quotes: 0, acceptedValue: 0 };
      salesReps[rep].quotes++;
      if (q.status === 'accepted') {
        salesReps[rep].acceptedValue += q.total_mur;
      }
    });

    return {
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
