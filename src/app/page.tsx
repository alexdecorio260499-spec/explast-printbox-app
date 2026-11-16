'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { BrandToggle } from '../components/ui/BrandToggle';
import { AdaptiveSalesFormModal } from '../components/sales/AdaptiveSalesFormModal';
import { ExplastSalesFormModal } from '../components/sales/ExplastSalesFormModal';
import { QuotationsView } from '../components/sales/QuotationsView';
import { DesignView } from '../components/sales/DesignView';
import { ProductionView } from '../components/sales/ProductionView';
import { ReportsView } from '../components/sales/ReportsView';
import { ClientDetailModal } from '../components/sales/ClientDetailModal';
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
} from 'lucide-react';

export default function App() {
  const [brand, setBrand] = useState<'Explast' | 'PrintBox'>('Explast');
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [resumeDraftId, setResumeDraftId] = useState<string | undefined>();
  const [projects, setProjects] = useState<any[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Refresh projects and clients across both systems and demo dataset
  async function refreshData() {
    try {
      DemoService.initialize();
      const demoClients = DemoService.getCustomers();
      const demoProjects = DemoService.getProjects();

      const [allPrintboxProjects, allExplastProjects, allClients] = await Promise.all([
        SalesDataService.getAllProjects(),
        ExplastSalesService.getAllExplastProjects(),
        SalesDataService.getClients(),
      ]);

      const projectMap = new Map<string, any>();
      // Layer in demo projects first
      demoProjects.forEach(p => projectMap.set(p.id, p));
      allPrintboxProjects.forEach(p => projectMap.set(p.id, p));
      allExplastProjects.forEach(p => projectMap.set(p.id, p));

      const clientMap = new Map<string, any>();
      // Layer in demo clients
      demoClients.forEach(c => clientMap.set(c.id, c));
      allClients.forEach(c => clientMap.set(c.id, c));

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
            <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center text-xs font-medium">
              AL
            </div>
            <div className="text-sm">
              <p className="font-medium text-text-primary">Alex L.</p>
              <p className="text-xs text-text-muted">{brand === 'Explast' ? 'Manufacturing Sales' : 'Studio Sales'}</p>
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
          
          <div className="flex items-center space-x-6">
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
              onNewProject={() => {
                setResumeDraftId(undefined);
                setIsFormOpen(true);
              }}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenClient={(cId) => setSelectedCustomerId(cId)}
            />
          )}

          {activeTab === 'Projects' && (
            <PipelineView 
              brand={brand} 
              projects={projects}
              onNewProject={() => {
                setResumeDraftId(undefined);
                setIsFormOpen(true);
              }} 
            />
          )}

          {activeTab === 'Clients' && (
            <ClientsView 
              brand={brand} 
              clients={clients}
              onAddClient={() => {
                setResumeDraftId(undefined);
                setIsFormOpen(true);
              }}
              onSelectClient={(client) => setSelectedCustomerId(client.id)}
            />
          )}

          {activeTab === 'Quotations' && (
            <QuotationsView
              brand={brand}
              onNavigateToCustomer={(cId) => setSelectedCustomerId(cId)}
              onNewRequest={() => {
                setResumeDraftId(undefined);
                setIsFormOpen(true);
              }}
            />
          )}

          {activeTab === 'Design' && (
            <DesignView
              brand={brand}
              onNavigateToCustomer={(cId) => setSelectedCustomerId(cId)}
              onNewRequest={() => {
                setResumeDraftId(undefined);
                setIsFormOpen(true);
              }}
            />
          )}

          {activeTab === 'Production' && (
            <ProductionView
              brand={brand}
              onNavigateToCustomer={(cId) => setSelectedCustomerId(cId)}
              onNewRequest={() => {
                setResumeDraftId(undefined);
                setIsFormOpen(true);
              }}
            />
          )}

          {activeTab === 'Reports' && (
            <ReportsView brand={brand} />
          )}

          {activeTab === 'Settings' && (
            <SettingsView
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
    </div>
  );
}

function DashboardView({
  brand,
  projects,
  onNewProject,
  onNavigateTab,
  onOpenClient,
}: {
  brand: string;
  projects: any[];
  onNewProject: () => void;
  onNavigateTab: (tab: string) => void;
  onOpenClient: (customerId: string) => void;
}) {
  const brandProjects = projects.filter(p => !p.brand || p.brand === brand || p.business_unit === brand);
  const metrics = DemoService.getAnalyticsMetrics();
  const activities = DemoService.getActivities();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1">Executive Overview</h2>
          <h1 className="text-2xl font-medium text-text-primary">
            {brand === 'Explast' ? 'Explast Manufacturing Dashboard' : 'PrintBox Studio Dashboard'}
          </h1>
        </div>
        <Button onClick={onNewProject}>
          <Plus className="w-4 h-4 mr-2" /> New Request
        </Button>
      </div>

      {/* DYNAMIC TOP KPIS DERIVED FROM ACTUAL DEMO DATA */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <KPICard
          label="Active Sales Requests"
          value={String(brandProjects.length || 18)}
          trend="Across 12 customer accounts"
          accent="brand"
        />
        <KPICard
          label="Total Quoted Pipeline"
          value={`Rs ${Math.round(metrics.sales.totalQuotationValue / 1000)}k`}
          trend={`${metrics.sales.totalQuotationsCount} active quotations`}
          accent="purple"
        />
        <KPICard
          label="Plant Orders in Progress"
          value={String(metrics.production.activeJobsCount)}
          trend="Line 1, 2 & 3 operational"
          accent="success"
        />
        <KPICard
          label="Commercial Win Rate"
          value={`${metrics.sales.conversionRate}%`}
          trend="Rs 1.48M signed orders"
          accent="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* RECENT PROJECTS TABLE */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Recent Packaging Requests</h3>
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
                  <th className="px-6 py-3 font-medium">Specification / Blend</th>
                  <th className="px-6 py-3 font-medium">Stage</th>
                  <th className="px-6 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {brandProjects.slice(0, 6).map((p, idx) => (
                  <tr key={p.id || idx} className="hover:bg-bg-secondary/50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-text-primary">
                      {p.project_name}
                      {p.request_type && (
                        <span className="ml-2 text-[10px] text-text-muted uppercase">({p.request_type})</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      <button
                        onClick={() => p.client_id && onOpenClient(p.client_id)}
                        className="hover:text-brand-primary hover:underline text-left"
                      >
                        {p.client?.company_name || p.clients?.company_name || p.client_name || 'Client Record'}
                      </button>
                    </td>
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
                        onClick={() => onNavigateTab('Projects')}
                        className="text-text-muted hover:text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="w-4 h-4 ml-auto" />
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

function KPICard({ label, value, trend, accent }: { label: string; value: string; trend: string; accent: 'brand'|'purple'|'amber'|'success' }) {
  const accentBorders = {
    brand: 'border-brand-primary',
    purple: 'border-brand-secondary',
    amber: 'border-color-warning',
    success: 'border-color-success'
  };

  return (
    <Card className={`border-l-4 ${accentBorders[accent]}`}>
      <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">{label}</span>
      <p className="text-2xl font-medium text-text-primary mt-1">{value}</p>
      <span className="text-xs text-text-secondary mt-1 block">{trend}</span>
    </Card>
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

function PipelineView({ brand, projects, onNewProject }: { brand: string; projects: any[]; onNewProject: () => void }) {
  const brandProjects = projects.filter(p => !p.brand || p.brand === brand || p.business_unit === brand);
  
  const stages = [
    { name: 'Discovery', label: '1. Discovery & Enquiry' },
    { name: 'Quoting', label: '2. Commercial Quoting' },
    { name: 'Production Order', label: '3. Production Released' },
    { name: 'Completed', label: '4. Closed & Completed' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1">Pipeline</h2>
          <h1 className="text-2xl font-medium text-text-primary">Active {brand} Projects</h1>
        </div>
        <div className="flex gap-3">
          <Button variant="outline"><Search className="w-4 h-4 mr-2" /> Search</Button>
          <Button onClick={onNewProject}><Plus className="w-4 h-4 mr-2" /> New Request</Button>
        </div>
      </div>

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
                    <Card key={proj.id} className="p-4 border-t-2 border-t-brand-primary shadow-sm hover:border-border-strong transition-colors cursor-pointer">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                          {proj.final_product_type || proj.request_type || 'Packaging'}
                        </span>
                        <button className="text-text-muted hover:text-text-primary"><MoreVertical className="w-3 h-3" /></button>
                      </div>
                      <h4 className="text-sm font-medium text-text-primary mb-1">{proj.project_name}</h4>
                      <p className="text-xs text-text-secondary mb-2">
                        {proj.client?.company_name || proj.clients?.company_name || proj.client_name || 'Client'}
                      </p>
                      
                      {/* Explast specific tags */}
                      {proj.formulation && (
                        <div className="mb-3 text-[10px] text-text-muted bg-bg-secondary px-2 py-1 rounded truncate">
                          {proj.material_family} • {proj.formulation}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-border-subtle/50">
                        <div className="flex items-center gap-1 text-text-muted">
                          <div className="w-5 h-5 rounded-full bg-brand-primary-light text-brand-primary-dark flex items-center justify-center font-bold text-[9px]">AL</div>
                          <span>Sales</span>
                        </div>
                        <Badge variant="brand">{proj.technical_assessment?.status || proj.request_status || 'Active'}</Badge>
                      </div>
                    </Card>
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
  onAddClient,
  onSelectClient,
}: {
  brand: string;
  clients: Client[];
  onAddClient: () => void;
  onSelectClient: (client: Client) => void;
}) {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1">Customer Relationship Management</h2>
          <h1 className="text-2xl font-medium text-text-primary">Client Directory & Accounts</h1>
        </div>
        <Button onClick={onAddClient}><Plus className="w-4 h-4 mr-2" /> Add Client Request</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map(c => (
          <ClientCard 
            key={c.id} 
            name={c.company_name} 
            contact={c.contact_name || ''} 
            industry={c.industry || 'Packaging'} 
            phone={c.contact_phone || ''}
            email={c.contact_email || ''}
            onClick={() => onSelectClient(c)}
          />
        ))}
      </div>
    </div>
  );
}

function ClientCard({
  name,
  contact,
  industry,
  phone,
  email,
  onClick,
}: {
  name: string;
  contact: string;
  industry: string;
  phone: string;
  email: string;
  onClick: () => void;
}) {
  return (
    <Card
      onClick={onClick}
      className="flex flex-col relative overflow-hidden group cursor-pointer hover:border-brand-primary transition-colors shadow-sm"
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-brand-primary opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-base font-semibold text-text-primary group-hover:text-brand-primary transition-colors">{name}</h3>
          <p className="text-xs text-text-secondary mt-0.5">{contact}</p>
        </div>
        <div className="w-8 h-8 rounded bg-brand-primary-light text-brand-primary-dark flex items-center justify-center font-bold text-xs">
          {name.charAt(0)}
        </div>
      </div>
      
      <div className="mt-auto pt-4 border-t border-border-subtle space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-text-muted uppercase tracking-wider font-semibold text-[10px]">Industry</span>
          <span className="font-medium text-text-primary">{industry}</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-text-muted uppercase tracking-wider font-semibold text-[10px]">Contact</span>
          <span className="text-text-secondary truncate ml-4">{phone || email || 'N/A'}</span>
        </div>
        <div className="pt-2 flex justify-end">
          <span className="text-xs font-medium text-brand-primary flex items-center gap-1 group-hover:underline">
            View 360° Profile <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Card>
  );
}

function SettingsView({ onResetDemo }: { onResetDemo: () => void }) {
  const [resetDone, setResetDone] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-3xl">
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1">Configuration & ERP Control</h2>
        <h1 className="text-2xl font-medium text-text-primary">System Settings</h1>
      </div>

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
          <h3 className="text-sm font-medium text-text-primary mb-1">Profile Information</h3>
          <p className="text-xs text-text-secondary mb-4">Sales representative identity and business defaults.</p>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">First Name</label>
            <input type="text" defaultValue="Alex" className="w-full bg-bg-input border border-border-strong rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-colors" />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Last Name</label>
            <input type="text" defaultValue="L." className="w-full bg-bg-input border border-border-strong rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-colors" />
          </div>
          <div className="col-span-2 space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Email Address</label>
            <input type="email" defaultValue="alex@explast.mu" className="w-full bg-bg-input border border-border-strong rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-colors" />
          </div>
        </div>

        <div className="pt-4 border-t border-border-subtle flex justify-end gap-3">
          <Button variant="ghost">Cancel</Button>
          <Button>Save Changes</Button>
        </div>
      </Card>
    </div>
  );
}
