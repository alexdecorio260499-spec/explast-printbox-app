'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { KPICard } from '../components/ui/KPICard';
import { EntityCard } from '../components/ui/EntityCard';
import { PageHeader } from '../components/ui/PageHeader';
import { BrandToggle } from '../components/ui/BrandToggle';
import { AdaptiveSalesFormModal } from '../components/sales/AdaptiveSalesFormModal';
import { ExplastSalesFormModal } from '../components/sales/ExplastSalesFormModal';
import { QuotationsView } from '../components/sales/QuotationsView';
import { DesignView } from '../components/sales/DesignView';
import { ProductionView } from '../components/sales/ProductionView';
import { ReportsView } from '../components/sales/ReportsView';
import { ClientDetailModal } from '../components/sales/ClientDetailModal';
import { NewClientModal } from '../components/sales/NewClientModal';
import { ProjectDetailModal } from '../components/sales/ProjectDetailModal';
import { AppUser, APP_USERS } from '../types/demo';
import { SalesDataService } from '../lib/sales/data-service';
import { ExplastSalesService } from '../lib/sales/explast-service';
import { DemoService } from '../lib/sales/demo-service';
import { Client } from '../types/sales';

import {
  LayoutDashboard,
  Users,
  FolderKanban,
  FileText,
  Palette,
  Factory,
  BarChart,
  Settings,
  Bell,
  Search,
  Plus,
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Building2,
  Shield,
  UserCheck,
} from 'lucide-react';

export default function App() {
  const [brand, setBrand] = useState<'Explast' | 'PrintBox'>('Explast');
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [currentUser, setCurrentUser] = useState<AppUser>(APP_USERS[0]); // Alex L. by default
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [resumeDraftId, setResumeDraftId] = useState<string | undefined>();
  const [projects, setProjects] = useState<any[]>(() => {
    DemoService.initialize();
    return DemoService.getProjects();
  });
  const [clients, setClients] = useState<Client[]>(() => {
    DemoService.initialize();
    return DemoService.getCustomers() as unknown as Client[];
  });
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedProjectForModal, setSelectedProjectForModal] = useState<any | null>(null);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);

  // Refresh projects and clients across both systems and demo dataset
  async function refreshData() {
    try {
      DemoService.initialize();
      const demoClients = DemoService.getCustomers();
      const demoProjects = DemoService.getProjects();

      const projectMap = new Map<string, any>();
      // Layer in demo projects first so the view is never empty
      demoProjects.forEach(p => projectMap.set(p.id, p));

      const clientMap = new Map<string, any>();
      // Layer in demo clients first
      demoClients.forEach(c => clientMap.set(c.id, c));

      // Attempt remote or local fetch safely without blocking
      try {
        const [allPrintboxProjects, allExplastProjects, allClients] = await Promise.all([
          SalesDataService.getAllProjects(),
          ExplastSalesService.getAllExplastProjects(),
          SalesDataService.getClients(),
        ]);

        if (Array.isArray(allPrintboxProjects)) {
          allPrintboxProjects.forEach(p => projectMap.set(p.id, p));
        }
        if (Array.isArray(allExplastProjects)) {
          allExplastProjects.forEach(p => projectMap.set(p.id, p));
        }
        if (Array.isArray(allClients)) {
          allClients.forEach(c => clientMap.set(c.id, c));
        }
      } catch (err) {
        console.warn('Remote sync skipped or failed, using rich demo dataset:', err);
      }

      setProjects(Array.from(projectMap.values()));
      setClients(Array.from(clientMap.values()));
    } catch (e) {
      console.error('Error refreshing app data:', e);
    }
  }

  useEffect(() => {
    refreshData();
  }, []);

  const navigation = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Clients', icon: Users },
    { name: 'Projects', icon: FolderKanban },
    { name: 'Quotations', icon: FileText },
    { name: 'Design', icon: Palette },
    { name: 'Production', icon: Factory },
    { name: 'Reports', icon: BarChart },
    { name: 'Settings', icon: Settings },
  ];

  return (
    <div data-brand={brand.toLowerCase()} className="min-h-screen bg-bg-page text-text-primary font-sans flex">
      {/* SIDEBAR */}
      <aside className="w-[180px] flex-shrink-0 bg-bg-card border-r border-border-subtle flex flex-col h-screen sticky top-0">
        <div className="p-6 h-16 flex items-center border-b border-border-subtle">
          <span className="text-[13px] font-bold tracking-widest uppercase text-text-primary">
            {brand}
          </span>
        </div>
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navigation.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-md transition-colors ${
                activeTab === item.name
                  ? 'bg-brand-primary-light text-brand-primary-dark border-l-2 border-brand-primary font-medium'
                  : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
              }`}
            >
              <item.icon className={`w-4 h-4 ${activeTab === item.name ? 'text-brand-primary' : 'text-text-muted'}`} />
              <span>{item.name}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-border-subtle">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center text-xs font-bold">
              {currentUser.avatar}
            </div>
            <div className="text-sm min-w-0">
              <p className="font-medium text-text-primary truncate">{currentUser.name}</p>
              <p className="text-xs text-text-muted capitalize">
                {currentUser.role === 'admin' ? 'Global Admin' : 'Sales Rep'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* HEADER */}
        <header className="h-16 bg-bg-card border-b border-border-subtle flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center space-x-4">
            <h1 className="text-sm font-medium text-text-primary">
              {brand} <span className="text-text-muted mx-2">/</span> {brand === 'Explast' ? 'Extrusion, Printing & Converting Operations' : 'Paper Packaging Studio'}
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
              <Sparkles className="w-3 h-3" /> Live Demo Mode
            </span>
          </div>
          
          <div className="flex items-center space-x-5">
            {/* ROLE & PERMISSION SWITCHER */}
            <div className="flex items-center gap-2 bg-bg-secondary px-3 py-1.5 rounded-lg border border-border-subtle shadow-sm">
              <div className="w-6 h-6 rounded-full bg-brand-primary text-white flex items-center justify-center text-[10px] font-bold">
                {currentUser.avatar}
              </div>
              <div className="flex items-center gap-1.5">
                <select
                  value={currentUser.id}
                  onChange={(e) => {
                    const u = APP_USERS.find(x => x.id === e.target.value);
                    if (u) setCurrentUser(u);
                  }}
                  className="bg-transparent text-xs font-semibold text-text-primary focus:outline-none cursor-pointer pr-1"
                >
                  {APP_USERS.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role === 'admin' ? 'Admin / Full View' : 'Sales Rep'})
                    </option>
                  ))}
                </select>
                <Badge variant={currentUser.role === 'admin' ? 'neutral' : 'brand'} className="text-[9px] px-1.5 py-0">
                  {currentUser.role === 'admin' ? 'Admin' : 'Sales'}
                </Badge>
              </div>
            </div>

            <BrandToggle brand={brand} onChange={setBrand} />
            <div className="flex items-center space-x-4 text-text-muted">
              <button className="hover:text-text-primary transition-colors"><Search className="w-5 h-5" /></button>
              <button className="hover:text-text-primary transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-brand-accent rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {/* CONTENT AREA */}
        <div className="p-8 lg:p-10 max-w-7xl mx-auto w-full flex-1">
          {activeTab === 'Dashboard' && (
            <DashboardView 
              brand={brand} 
              projects={projects}
              currentUser={currentUser}
              onNewProject={() => {
                setResumeDraftId(undefined);
                setIsFormOpen(true);
              }}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenClient={(cId) => setSelectedCustomerId(cId)}
              onOpenProject={(proj) => setSelectedProjectForModal(proj)}
            />
          )}

          {activeTab === 'Projects' && (
            <PipelineView 
              brand={brand} 
              projects={projects}
              currentUser={currentUser}
              onNewProject={() => {
                setResumeDraftId(undefined);
                setIsFormOpen(true);
              }} 
              onOpenProject={(proj) => setSelectedProjectForModal(proj)}
            />
          )}

          {activeTab === 'Clients' && (
            <ClientsView 
              brand={brand} 
              clients={clients}
              currentUser={currentUser}
              onAddNewClient={() => setIsNewClientModalOpen(true)}
              onAddClientRequest={() => {
                setResumeDraftId(undefined);
                setIsFormOpen(true);
              }}
              onSelectClient={(client) => setSelectedCustomerId(client.id)}
            />
          )}

          {activeTab === 'Quotations' && (
            <QuotationsView
              brand={brand}
              currentUser={currentUser}
              onNavigateToCustomer={(cId) => setSelectedCustomerId(cId)}
            />
          )}

          {activeTab === 'Design' && (
            <DesignView
              brand={brand}
              currentUser={currentUser}
              onNavigateToCustomer={(cId) => setSelectedCustomerId(cId)}
            />
          )}

          {activeTab === 'Production' && (
            <ProductionView
              brand={brand}
              currentUser={currentUser}
              onNavigateToCustomer={(cId) => setSelectedCustomerId(cId)}
            />
          )}

          {activeTab === 'Reports' && (
            <ReportsView brand={brand} currentUser={currentUser} />
          )}

          {activeTab === 'Settings' && (
            <SettingsView
              currentUser={currentUser}
              onResetDemo={() => {
                DemoService.resetDemoData();
                refreshData();
              }}
            />
          )}
        </div>
      </main>

      {/* DEDICATED INDEPENDENT WORKFLOW MODALS */}
      {brand === 'Explast' ? (
        <ExplastSalesFormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          resumeDraftId={resumeDraftId}
          onSuccess={async (projectId) => {
            await refreshData();
            setActiveTab('Projects');
          }}
        />
      ) : (
        <AdaptiveSalesFormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          initialBrand="PrintBox"
          resumeDraftId={resumeDraftId}
          onSuccess={async (projectId) => {
            await refreshData();
            setActiveTab('Projects');
          }}
        />
      )}

      {/* 360° CLIENT PROFILE MODAL */}
      <ClientDetailModal
        customerId={selectedCustomerId}
        isOpen={!!selectedCustomerId}
        onClose={() => setSelectedCustomerId(null)}
        onNewRequest={() => {
          setResumeDraftId(undefined);
          setIsFormOpen(true);
        }}
      />

      {/* NEW CLIENT REGISTRATION MODAL */}
      <NewClientModal
        isOpen={isNewClientModalOpen}
        onClose={() => setIsNewClientModalOpen(false)}
        onSuccess={async (newClient) => {
          await refreshData();
          setSelectedCustomerId(newClient.id);
        }}
        currentUser={currentUser}
      />

      {/* COMPREHENSIVE PROJECT CARD MODAL */}
      <ProjectDetailModal
        project={selectedProjectForModal}
        isOpen={!!selectedProjectForModal}
        onClose={() => setSelectedProjectForModal(null)}
        onOpenClient={(clientId: string) => setSelectedCustomerId(clientId)}
        currentUser={currentUser}
      />
    </div>
  );
}

function DashboardView({
  brand,
  projects,
  currentUser,
  onNewProject,
  onNavigateTab,
  onOpenClient,
  onOpenProject,
}: {
  brand: string;
  projects: any[];
  currentUser: AppUser;
  onNewProject: () => void;
  onNavigateTab: (tab: string) => void;
  onOpenClient: (customerId: string) => void;
  onOpenProject: (project: any) => void;
}) {
  const isAdmin = currentUser.role === 'admin';
  const brandProjects = projects
    .filter(p => !p.brand || p.brand === brand || p.business_unit === brand)
    .filter(p => isAdmin || p.assigned_salesperson === currentUser.name || p.salesperson === currentUser.name);

  const metrics = DemoService.getAnalyticsMetrics(isAdmin ? undefined : currentUser.name);
  const activities = DemoService.getActivities();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <PageHeader
        eyebrow={isAdmin ? 'Executive Global Overview' : 'Commercial Sales Representative Portal'}
        badgeText={isAdmin ? 'Full Company Access' : `Assigned: ${currentUser.name}`}
        badgeVariant={isAdmin ? 'neutral' : 'brand'}
        title={brand === 'Explast' ? 'Explast Manufacturing Dashboard' : 'PrintBox Studio Dashboard'}
        actions={
          <Button onClick={onNewProject}>
            <Plus className="w-4 h-4 mr-2" /> New Request
          </Button>
        }
      />

      {/* DYNAMIC TOP KPIS DERIVED FROM ACTUAL DEMO DATA */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <KPICard
          label={isAdmin ? 'Active Sales Requests' : 'My Active Requests'}
          value={String(brandProjects.length)}
          trend={isAdmin ? 'Across all client accounts' : 'In your assigned portfolio'}
          accent="brand"
        />
        <KPICard
          label={isAdmin ? 'Total Quoted Pipeline' : 'My Quoted Pipeline'}
          value={`Rs ${Math.round(metrics.sales.totalQuotationValue / 1000)}k`}
          trend={`${metrics.sales.totalQuotationsCount} active proposals`}
          accent="purple"
        />
        <KPICard
          label={isAdmin ? 'Plant Orders in Progress' : 'My Plant Orders in Run'}
          value={String(metrics.production.activeJobsCount)}
          trend="Line 1, 2 & 3 operational"
          accent="success"
        />
        <KPICard
          label={isAdmin ? 'Commercial Win Rate' : 'My Win Rate'}
          value={`${metrics.sales.conversionRate}%`}
          trend={`Rs ${Math.round(metrics.sales.acceptedQuotationValue / 1000)}k signed revenue`}
          accent="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* RECENT PROJECTS TABLE */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">
              {isAdmin ? 'Recent Packaging Requests (All Representatives)' : `My Recent Requests (${currentUser.name})`}
            </h3>
            <button
              onClick={() => onNavigateTab('Projects')}
              className="text-xs text-brand-primary hover:underline font-medium flex items-center gap-1"
            >
              View Pipeline Kanban ({brandProjects.length}) →
            </button>
          </div>
          <Card className="p-0 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-bg-secondary text-text-muted text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3 font-medium">Project</th>
                  <th className="px-6 py-3 font-medium">Client</th>
                  {isAdmin && <th className="px-6 py-3 font-medium">Sales Rep</th>}
                  <th className="px-6 py-3 font-medium">Specification / Blend</th>
                  <th className="px-6 py-3 font-medium">Stage</th>
                  <th className="px-6 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {brandProjects.slice(0, 6).map((p, idx) => (
                  <tr
                    key={p.id || idx}
                    onClick={() => onOpenProject(p)}
                    className="hover:bg-bg-secondary/50 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4 font-medium text-text-primary">
                      {p.project_name}
                      {p.request_type && (
                        <span className="ml-2 text-[10px] text-text-muted uppercase">({p.request_type})</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          p.client_id && onOpenClient(p.client_id);
                        }}
                        className="hover:text-brand-primary hover:underline text-left"
                      >
                        {p.client?.company_name || p.clients?.company_name || p.client_name || 'Client Record'}
                      </button>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-xs text-text-primary">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] font-bold flex items-center justify-center">
                            {(p.assigned_salesperson || p.salesperson || 'AL').substring(0, 2).toUpperCase()}
                          </span>
                          {p.assigned_salesperson || p.salesperson || 'Alex L.'}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4 text-xs text-text-secondary">
                      {p.formulation ? (
                        <span>
                          <strong className="text-text-primary">{p.material_family}</strong> • {p.formulation}
                        </span>
                      ) : p.items?.[0] ? (
                        <span>{p.items[0].description || p.items[0].product_family}</span>
                      ) : (
                        'Standard'
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={p.request_status === 'submitted' || p.request_status === 'ready_for_quotation' ? 'brand' : 'neutral'}>
                        {p.kanban_stage || p.status || 'Discovery'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenProject(p);
                        }}
                        className="text-xs text-brand-primary hover:underline font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Open Card →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* CHRONOLOGICAL ACTIVITY LOG */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Live Plant & Commercial Activity</h3>
            <Card className="p-4 space-y-3">
              {activities.slice(0, 5).map((act) => (
                <div key={act.id} className="flex items-start justify-between text-xs pb-2 border-b border-border-subtle/50 last:border-b-0 last:pb-0">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-text-primary">{act.title}</p>
                    <p className="text-text-secondary text-[11px]">{act.description}</p>
                  </div>
                  <span className="font-mono text-[10px] text-text-muted whitespace-nowrap ml-4">
                    {act.timestamp}
                  </span>
                </div>
              ))}
            </Card>
          </div>
        </div>

        {/* RIGHT COLUMN: NEEDS ATTENTION */}
        <div className="space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Urgent Operational Items</h3>
          <div className="space-y-4">
            <AttentionCard 
              title="8-Colour Cylinder Feasibility"
              desc="QuickBite 8-Color Photo Carrier requires stack press repeat verification"
              type="warning"
              time="2 hrs ago"
              onClick={() => onNavigateTab('Design')}
            />
            <AttentionCard 
              title="Extruder Line 1 Yellow Run"
              desc="AgriFertilizer 2,750kg heavy yellow film ready for conversion"
              type="brand"
              time="4 hrs ago"
              onClick={() => onNavigateTab('Production')}
            />
            <AttentionCard 
              title="Quotation Pending Acceptance"
              desc="Le Supermarché du Nord QUO-EXP-2026-0101 (MUR 166,750)"
              type="brand"
              time="Yesterday"
              onClick={() => onNavigateTab('Quotations')}
            />
            <AttentionCard 
              title="Microperforation Tool Check"
              desc="Needle puncture wheel clearance calibrated on Sealer #1"
              type="success"
              time="1 day ago"
              onClick={() => onNavigateTab('Production')}
            />
          </div>
        </div>

      </div>
    </div>
  );
}

function AttentionCard({ title, desc, type, time, onClick }: { title: string; desc: string; type: 'warning'|'brand'|'error'|'success'; time: string; onClick?: () => void }) {
  const icons = {
    warning: AlertCircle,
    brand: Clock,
    error: AlertCircle,
    success: CheckCircle2,
  };
  const Icon = icons[type];

  const colors = {
    warning: 'text-color-warning bg-color-warning/10 border-color-warning/20',
    brand: 'text-brand-primary bg-brand-primary-light border-brand-primary/20',
    error: 'text-color-error bg-color-error/10 border-color-error/20',
    success: 'text-color-success bg-color-success/10 border-color-success/20',
  };

  return (
    <Card
      onClick={onClick}
      className={`p-4 border transition-colors cursor-pointer group hover:border-brand-primary ${colors[type]}`}
    >
      <div className="flex items-start space-x-3">
        <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex justify-between">
            <h4 className="text-sm font-medium text-text-primary">{title}</h4>
            <span className="text-[10px] text-text-muted">{time}</span>
          </div>
          <p className="text-xs text-text-secondary mt-1">{desc}</p>
        </div>
      </div>
    </Card>
  );
}

function PipelineView({
  brand,
  projects,
  currentUser,
  onNewProject,
  onOpenProject,
}: {
  brand: string;
  projects: any[];
  currentUser: AppUser;
  onNewProject: () => void;
  onOpenProject: (project: any) => void;
}) {
  const isAdmin = currentUser.role === 'admin';
  const brandProjects = projects
    .filter(p => !p.brand || p.brand === brand || p.business_unit === brand)
    .filter(p => isAdmin || p.assigned_salesperson === currentUser.name || p.salesperson === currentUser.name);
  
  const stages = [
    { name: 'Discovery', label: '1. Discovery & Enquiry' },
    { name: 'Quoting', label: '2. Commercial Quoting' },
    { name: 'Production Order', label: '3. Production Released' },
    { name: 'Completed', label: '4. Closed & Completed' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <PageHeader
        eyebrow={isAdmin ? 'Enterprise Pipeline Kanban' : 'Assigned Pipeline Portfolio'}
        badgeText={isAdmin ? 'All Sales Reps' : `${brandProjects.length} Projects for ${currentUser.name}`}
        badgeVariant={isAdmin ? 'neutral' : 'brand'}
        title={isAdmin ? `Active ${brand} Projects (Company-wide)` : `My Active ${brand} Projects`}
        actions={
          <Button onClick={onNewProject}><Plus className="w-4 h-4 mr-2" /> New Request</Button>
        }
      />

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-6 min-w-[1000px]">
          {stages.map((stage) => {
            const stageProjects = brandProjects.filter(p => {
              if (stage.name === 'Discovery') return p.kanban_stage === 'Discovery' || !p.kanban_stage;
              if (stage.name === 'Quoting') return p.kanban_stage === 'Quoting' || p.kanban_stage === 'Negotiation';
              if (stage.name === 'Production Order') return p.kanban_stage === 'Production Order' || p.kanban_stage === 'In Production';
              if (stage.name === 'Completed') return p.kanban_stage === 'Completed' || p.kanban_stage === 'Closed';
              return false;
            });

            return (
              <div key={stage.name} className="flex-1 bg-bg-secondary/40 p-4 rounded-xl border border-border-subtle flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">{stage.label}</h3>
                  <Badge variant="neutral">{stageProjects.length}</Badge>
                </div>

                <div className="space-y-4 flex-1">
                  {stageProjects.map((proj) => (
                    <EntityCard
                      key={proj.id}
                      category={proj.final_product_type || proj.request_type || 'Packaging'}
                      title={proj.project_name}
                      subtitle={proj.client?.company_name || proj.clients?.company_name || proj.client_name || 'Client Record'}
                      specPrimary={
                        proj.formulation ? (
                          <>
                            <strong className="text-text-primary font-medium">{proj.material_family}</strong> • {proj.formulation}
                          </>
                        ) : 'Standard Packaging'
                      }
                      specSecondary={
                        proj.print_type === 'printed' ? `${proj.printing_spec?.num_colors || 1} Colors` : 'Plain'
                      }
                      salespersonName={proj.assigned_salesperson || proj.salesperson || 'Alex L.'}
                      statusLabel={proj.technical_assessment?.status || proj.request_status || proj.kanban_stage || 'Active'}
                      statusVariant="brand"
                      hoverActionText="Open Details →"
                      onClick={() => onOpenProject(proj)}
                    />
                  ))}

                  {stageProjects.length === 0 && (
                    <div className="border border-dashed border-border-subtle rounded-lg p-6 text-center text-xs text-text-muted">
                      No projects in this stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ClientsView({
  brand,
  clients,
  currentUser,
  onAddNewClient,
  onAddClientRequest,
  onSelectClient,
}: {
  brand: string;
  clients: Client[];
  currentUser: AppUser;
  onAddNewClient: () => void;
  onAddClientRequest: () => void;
  onSelectClient: (client: Client) => void;
}) {
  const isAdmin = currentUser.role === 'admin';
  const visibleClients = clients.filter(c =>
    isAdmin || (c as any).assigned_salesperson === currentUser.name || (c as any).salesperson === currentUser.name
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <PageHeader
        eyebrow={isAdmin ? 'Enterprise CRM & Accounts Directory' : 'Assigned Customer Portfolio'}
        badgeText={isAdmin ? `${visibleClients.length} Total Accounts` : `${visibleClients.length} Assigned to ${currentUser.name}`}
        badgeVariant={isAdmin ? 'neutral' : 'brand'}
        title="Client Directory & Accounts"
        actions={
          <>
            <Button variant="outline" onClick={onAddNewClient}>
              <Building2 className="w-4 h-4 mr-2" /> Add New Client
            </Button>
            <Button onClick={onAddClientRequest}>
              <Plus className="w-4 h-4 mr-2" /> Add Client Request
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleClients.map(c => (
          <EntityCard
            key={c.id}
            category={c.industry || 'Packaging'}
            title={c.company_name}
            subtitle={c.contact_name ? `${c.contact_name} • ${c.contact_phone || c.contact_email || 'Contact'}` : (c.contact_phone || c.contact_email || 'Direct Account')}
            specPrimary={
              <>
                <strong className="text-text-primary font-medium">{c.location_type || 'Local (Mauritius)'}</strong> • {c.account_tier || 'Client'}
              </>
            }
            specSecondary={`${(c as any).active_projects_count ?? 1} Projects`}
            salespersonName={(c as any).assigned_salesperson || (c as any).salesperson || 'Alex L.'}
            statusLabel={c.account_tier || 'Active Account'}
            statusVariant={c.account_tier === 'Key Account' || c.account_tier === 'VIP' ? 'brand' : 'neutral'}
            hoverActionText="View 360° Profile →"
            onClick={() => onSelectClient(c)}
          />
        ))}
      </div>
    </div>
  );
}

function SettingsView({ currentUser, onResetDemo }: { currentUser: AppUser; onResetDemo: () => void }) {
  const [resetDone, setResetDone] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-3xl">
      <PageHeader
        eyebrow="Configuration & ERP Control"
        title="System Settings"
      />

      {/* DEMO DATASET CONTROL CARD */}
      <Card className="p-6 space-y-4 border-l-4 border-l-brand-primary">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Client Presentation & Demonstration Dataset</h3>
            <p className="text-xs text-text-secondary mt-1">
              Active demo data includes 12 customers, 18 manufacturing projects, 12 quotations, 10 prepress designs, and 10 production jobs.
            </p>
          </div>
          <Badge variant="brand">Active Demo Dataset</Badge>
        </div>

        <div className="pt-2 flex items-center justify-between text-xs border-t border-border-subtle">
          <span className="text-text-muted">Reset all demonstration records to pristine factory baseline state:</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onResetDemo();
              setResetDone(true);
              setTimeout(() => setResetDone(false), 3000);
            }}
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            {resetDone ? 'Demo Reset Complete!' : 'Reset Demo Records'}
          </Button>
        </div>
      </Card>

      <Card className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-text-primary mb-1">Active User Profile</h3>
          <p className="text-xs text-text-secondary mb-4">Current session identity and assigned security tier.</p>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Full Name</label>
            <input
              type="text"
              readOnly
              value={currentUser.name}
              className="w-full bg-bg-secondary border border-border-subtle rounded-md px-3 py-2 text-sm text-text-primary"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Role & Permission</label>
            <input
              type="text"
              readOnly
              value={currentUser.role === 'admin' ? 'Administrator (Full Enterprise Access)' : 'Sales Representative (Assigned Accounts Only)'}
              className="w-full bg-bg-secondary border border-border-subtle rounded-md px-3 py-2 text-sm text-text-primary font-medium"
            />
          </div>
          <div className="col-span-2 space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Email Address</label>
            <input
              type="email"
              readOnly
              value={currentUser.email}
              className="w-full bg-bg-secondary border border-border-subtle rounded-md px-3 py-2 text-sm text-text-primary"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
