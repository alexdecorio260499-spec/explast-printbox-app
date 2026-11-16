'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { BrandToggle } from '../components/ui/BrandToggle';
import { AdaptiveSalesFormModal } from '../components/sales/AdaptiveSalesFormModal';
import { ExplastSalesFormModal } from '../components/sales/ExplastSalesFormModal';
import { SalesDataService } from '../lib/sales/data-service';
import { ExplastSalesService } from '../lib/sales/explast-service';
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
  AlertCircle
} from 'lucide-react';

export default function App() {
  const [brand, setBrand] = useState<'Explast' | 'PrintBox'>('Explast');
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [resumeDraftId, setResumeDraftId] = useState<string | undefined>();
  const [projects, setProjects] = useState<any[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  // Refresh projects and clients across both systems
  async function refreshData() {
    try {
      const [allPrintboxProjects, allExplastProjects, allClients] = await Promise.all([
        SalesDataService.getAllProjects(),
        ExplastSalesService.getAllExplastProjects(),
        SalesDataService.getClients(),
      ]);

      const map = new Map<string, any>();
      allPrintboxProjects.forEach(p => map.set(p.id, p));
      allExplastProjects.forEach(p => map.set(p.id, p));

      setProjects(Array.from(map.values()));
      setClients(allClients);
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
            />
          )}
          {activeTab === 'Settings' && <SettingsView />}
          {['Quotations', 'Design', 'Production', 'Reports'].includes(activeTab) && (
            <div className="flex flex-col items-center justify-center h-64 border border-dashed border-border-strong rounded-lg">
              <p className="text-text-muted text-sm uppercase tracking-widest">{activeTab} MODULE</p>
              <p className="text-text-secondary mt-2">This section is currently under construction.</p>
            </div>
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
    </div>
  );
}

function DashboardView({ brand, projects, onNewProject }: { brand: string; projects: any[]; onNewProject: () => void }) {
  const brandProjects = projects.filter(p => !p.brand || p.brand === brand || p.business_unit === brand);
  
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1">Overview</h2>
          <h1 className="text-2xl font-medium text-text-primary">
            {brand === 'Explast' ? 'Explast Manufacturing Dashboard' : 'PrintBox Studio Dashboard'}
          </h1>
        </div>
        <Button onClick={onNewProject}>
          <Plus className="w-4 h-4 mr-2" /> New Request
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <KPICard label="Active Projects" value={String(brandProjects.length || 24)} trend="+3 this week" accent="brand" />
        <KPICard label="Open Quotations" value="8" trend="Awaiting approval" accent="purple" />
        <KPICard 
          label={brand === 'Explast' ? 'Technical Reviews' : 'Pending Approvals'} 
          value="5" 
          trend="Needs attention" 
          accent="amber" 
        />
        <KPICard 
          label={brand === 'Explast' ? 'In Extrusion/Converting' : 'In Production'} 
          value="12" 
          trend="On schedule" 
          accent="success" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Recent Projects & Requests</h3>
            <span className="text-xs text-brand-primary font-medium">{brandProjects.length} Total</span>
          </div>
          <Card className="p-0 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-bg-secondary text-text-muted text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3 font-medium">Project</th>
                  <th className="px-6 py-3 font-medium">Client</th>
                  <th className="px-6 py-3 font-medium">Specification / Family</th>
                  <th className="px-6 py-3 font-medium">Stage</th>
                  <th className="px-6 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {brandProjects.slice(0, 5).map((p, idx) => (
                  <tr key={p.id || idx} className="hover:bg-bg-secondary/50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-text-primary">
                      {p.project_name}
                      {p.request_type && (
                        <span className="ml-2 text-[10px] text-text-muted uppercase">({p.request_type})</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {p.client?.company_name || p.clients?.company_name || 'Client Record'}
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
                      <button className="text-text-muted hover:text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="w-4 h-4 ml-auto" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        <div className="space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Needs Attention</h3>
          <div className="space-y-4">
            <AttentionCard 
              title={brand === 'Explast' ? 'Technical Assessment Pending' : 'Quotation Awaiting Approval'}
              desc={brand === 'Explast' ? 'IPL - LDPE Grade 4 + OXO Sack' : 'Bean Roasters - Eco Coffee Cups'}
              type="warning"
              time="2 days ago"
            />
            <AttentionCard 
              title={brand === 'Explast' ? 'Cylinder Feasibility Review' : 'Design Feedback Required'}
              desc={brand === 'Explast' ? 'ABC Restaurant - 8-Colour Poly Bag' : 'ABC Restaurant - Takeaway Boxes'}
              type="brand"
              time="4 hrs ago"
            />
            <AttentionCard 
              title="Production Schedule"
              desc={brand === 'Explast' ? 'Line 2 Extrusion running PP Elpro' : 'Gourmet Burger - Wrapping Paper'}
              type="error"
              time="1 hr ago"
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
    <Card className={`border-l-2 ${accentBorders[accent]}`}>
      <p className="text-[11px] font-bold tracking-wider uppercase text-text-muted">{label}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-3xl font-medium text-text-primary tracking-tight">{value}</span>
      </div>
      <p className="mt-1 text-xs text-text-secondary">{trend}</p>
    </Card>
  );
}

function AttentionCard({ title, desc, type, time }: { title: string; desc: string; type: 'warning'|'error'|'brand'; time: string }) {
  const icons = {
    warning: <AlertCircle className="w-4 h-4 text-color-warning" />,
    error: <AlertCircle className="w-4 h-4 text-color-error" />,
    brand: <CheckCircle2 className="w-4 h-4 text-brand-primary" />
  };
  return (
    <div className="bg-bg-card border border-border-subtle p-4 rounded-lg flex items-start gap-3 hover:border-border-strong transition-colors cursor-pointer">
      <div className="mt-0.5">{icons[type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">{title}</p>
        <p className="text-xs text-text-secondary truncate mt-0.5">{desc}</p>
        <div className="flex items-center gap-1 mt-2 text-[10px] text-text-muted uppercase tracking-wider font-semibold">
          <Clock className="w-3 h-3" />
          <span>{time}</span>
        </div>
      </div>
    </div>
  );
}

function PipelineView({ brand, projects, onNewProject }: { brand: string; projects: any[]; onNewProject: () => void }) {
  const stages = [
    { name: 'DISCOVERY', count: 0, type: 'active' },
    { name: 'DESIGN', count: 0, type: 'neutral' },
    { name: 'QUOTATION', count: 0, type: 'neutral' },
    { name: 'PRODUCTION', count: 0, type: 'completed' },
  ];

  const brandProjects = projects.filter(p => !p.brand || p.brand === brand || p.business_unit === brand);

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-300">
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

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-6 min-w-max h-full">
          {stages.map(stage => {
            const stageProjects = brandProjects.filter(p => {
              const st = (p.kanban_stage || p.status || 'Discovery').toUpperCase();
              return st.includes(stage.name);
            });

            return (
              <div key={stage.name} className="w-[320px] flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      stage.type === 'active' ? 'bg-brand-primary' : 
                      stage.type === 'completed' ? 'bg-brand-primary-light' : 'bg-border-strong'
                    }`} />
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">{stage.name}</h3>
                  </div>
                  <span className="text-xs font-medium text-text-muted bg-bg-secondary px-2 py-0.5 rounded">
                    {stageProjects.length}
                  </span>
                </div>
                
                <div className="flex-1 space-y-4">
                  {stageProjects.map(proj => (
                    <Card key={proj.id} className="p-4 border-t-2 border-t-brand-primary shadow-sm hover:border-border-strong transition-colors cursor-pointer">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                          {proj.final_product_type || proj.request_type || 'Packaging'}
                        </span>
                        <button className="text-text-muted hover:text-text-primary"><MoreVertical className="w-3 h-3" /></button>
                      </div>
                      <h4 className="text-sm font-medium text-text-primary mb-1">{proj.project_name}</h4>
                      <p className="text-xs text-text-secondary mb-2">
                        {proj.client?.company_name || proj.clients?.company_name || 'Client'}
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

function ClientsView({ brand, clients, onAddClient }: { brand: string; clients: Client[]; onAddClient: () => void }) {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1">Directory</h2>
          <h1 className="text-2xl font-medium text-text-primary">Clients Directory</h1>
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
          />
        ))}
      </div>
    </div>
  );
}

function ClientCard({ name, contact, industry, phone, email }: { name: string; contact: string; industry: string; phone: string; email: string }) {
  return (
    <Card className="flex flex-col relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-1 h-full bg-brand-primary opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-base font-medium text-text-primary">{name}</h3>
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
      </div>
    </Card>
  );
}

function SettingsView() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-3xl">
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1">Configuration</h2>
        <h1 className="text-2xl font-medium text-text-primary">Settings</h1>
      </div>

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
