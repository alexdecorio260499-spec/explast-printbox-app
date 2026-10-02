content = """'use client';

import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { BrandToggle } from '../components/ui/BrandToggle';

import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Package,
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

  const navigation = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Clients', icon: Users },
    { name: 'Projects', icon: FolderKanban },
    { name: 'Products', icon: Package },
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
              <p className="text-xs text-text-muted">Operations</p>
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
              {brand} <span className="text-text-muted mx-2">/</span> {brand === 'Explast' ? 'Packaging Operations' : 'Paper Packaging Studio'}
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
          {activeTab === 'Dashboard' && <DashboardView brand={brand} />}
          {activeTab === 'Projects' && <PipelineView brand={brand} />}
          {activeTab === 'Clients' && <ClientsView brand={brand} />}
          {activeTab === 'Settings' && <SettingsView />}
          {['Products', 'Quotations', 'Design', 'Production', 'Reports'].includes(activeTab) && (
            <div className="flex flex-col items-center justify-center h-64 border border-dashed border-border-strong rounded-lg">
              <p className="text-text-muted text-sm uppercase tracking-widest">{activeTab} MODULE</p>
              <p className="text-text-secondary mt-2">This section is currently under construction.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function DashboardView({ brand }: { brand: string }) {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1">Overview</h2>
          <h1 className="text-2xl font-medium text-text-primary">Operations Dashboard</h1>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" /> New Project</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <KPICard label="Active Projects" value="24" trend="+3 this week" accent="brand" />
        <KPICard label="Open Quotations" value="8" trend="Awaiting approval" accent="purple" />
        <KPICard label="Pending Approvals" value="5" trend="Needs attention" accent="amber" />
        <KPICard label="In Production" value="12" trend="On schedule" accent="success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Recent Activity</h3>
          <Card className="p-0 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-bg-secondary text-text-muted text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3 font-medium">Project</th>
                  <th className="px-6 py-3 font-medium">Client</th>
                  <th className="px-6 py-3 font-medium">Stage</th>
                  <th className="px-6 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                <tr className="hover:bg-bg-secondary/50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-text-primary">Custom Takeaway Boxes</td>
                  <td className="px-6 py-4 text-text-secondary">ABC Restaurant</td>
                  <td className="px-6 py-4"><Badge variant="brand">Design</Badge></td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-text-muted hover:text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="w-4 h-4 ml-auto" />
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-bg-secondary/50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-text-primary">Eco Coffee Cups</td>
                  <td className="px-6 py-4 text-text-secondary">Bean Roasters</td>
                  <td className="px-6 py-4"><Badge variant="neutral">Quotation</Badge></td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-text-muted hover:text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="w-4 h-4 ml-auto" />
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-bg-secondary/50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-text-primary">Luxury Paper Bags</td>
                  <td className="px-6 py-4 text-text-secondary">Boutique Paris</td>
                  <td className="px-6 py-4"><Badge variant="success">Production</Badge></td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-text-muted hover:text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="w-4 h-4 ml-auto" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </Card>
        </div>

        <div className="space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Needs Attention</h3>
          <div className="space-y-4">
            <AttentionCard 
              title="Quotation Awaiting Approval"
              desc="Bean Roasters - Eco Coffee Cups"
              type="warning"
              time="2 days ago"
            />
            <AttentionCard 
              title="Design Feedback Required"
              desc="ABC Restaurant - Takeaway Boxes"
              type="brand"
              time="4 hrs ago"
            />
            <AttentionCard 
              title="Production Blocked"
              desc="Gourmet Burger - Wrapping Paper"
              type="error"
              time="1 hr ago"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ label, value, trend, accent }: { label: string, value: string, trend: string, accent: 'brand'|'purple'|'amber'|'success' }) {
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

function AttentionCard({ title, desc, type, time }: { title: string, desc: string, type: 'warning'|'error'|'brand', time: string }) {
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

function PipelineView({ brand }: { brand: string }) {
  const stages = [
    { name: 'DISCOVERY', count: 2, type: 'neutral' },
    { name: 'DESIGN', count: 5, type: 'active' },
    { name: 'QUOTATION', count: 3, type: 'neutral' },
    { name: 'PRODUCTION', count: 12, type: 'completed' },
  ];

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1">Pipeline</h2>
          <h1 className="text-2xl font-medium text-text-primary">Active Projects</h1>
        </div>
        <div className="flex gap-3">
          <Button variant="outline"><Search className="w-4 h-4 mr-2" /> Search</Button>
          <Button><Plus className="w-4 h-4 mr-2" /> New Project</Button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-6 min-w-max h-full">
          {stages.map(stage => (
            <div key={stage.name} className="w-[320px] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    stage.type === 'active' ? 'bg-brand-primary' : 
                    stage.type === 'completed' ? 'bg-brand-primary-light' : 'bg-border-strong'
                  }`} />
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">{stage.name}</h3>
                </div>
                <span className="text-xs font-medium text-text-muted bg-bg-secondary px-2 py-0.5 rounded">{stage.count}</span>
              </div>
              
              <div className="flex-1 space-y-4">
                {/* Dummy Cards for Stage */}
                <Card className={`p-4 border-t-2 shadow-sm ${stage.type === 'active' ? 'border-t-brand-primary' : 'border-t-transparent'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Takeaway Boxes</span>
                    <button className="text-text-muted hover:text-text-primary"><MoreVertical className="w-3 h-3" /></button>
                  </div>
                  <h4 className="text-sm font-medium text-text-primary mb-1">ABC Restaurant</h4>
                  <p className="text-xs text-text-secondary mb-4">5,000 units • Kraft Paper</p>
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1 text-text-muted">
                      <div className="w-5 h-5 rounded-full bg-brand-primary-light text-brand-primary-dark flex items-center justify-center font-bold text-[9px]">AL</div>
                      <span>Operations</span>
                    </div>
                    {stage.type === 'active' && <span className="text-color-warning font-medium">Awaiting Feedback</span>}
                  </div>
                </Card>
                {stage.name === 'PRODUCTION' && (
                  <Card className="p-4 border-t-2 border-t-transparent shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Luxury Bags</span>
                      <button className="text-text-muted hover:text-text-primary"><MoreVertical className="w-3 h-3" /></button>
                    </div>
                    <h4 className="text-sm font-medium text-text-primary mb-1">Boutique Paris</h4>
                    <p className="text-xs text-text-secondary mb-4">10,000 units • Matte Finish</p>
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1 text-text-muted">
                        <div className="w-5 h-5 rounded-full bg-bg-secondary text-text-secondary flex items-center justify-center font-bold text-[9px]">JD</div>
                        <span>Production</span>
                      </div>
                      <span className="text-color-success font-medium">Printing</span>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ClientsView({ brand }: { brand: string }) {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1">Directory</h2>
          <h1 className="text-2xl font-medium text-text-primary">Clients</h1>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" /> Add Client</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ClientCard name="ABC Restaurant" projects={3} industry="Hospitality" action="Awaiting artwork approval" />
        <ClientCard name="Bean Roasters" projects={1} industry="Food & Beverage" action="Quotation pending" />
        <ClientCard name="Boutique Paris" projects={4} industry="Retail" action="In Production" />
        <ClientCard name="TechGadget Inc" projects={0} industry="Electronics" action="Follow up required" />
      </div>
    </div>
  );
}

function ClientCard({ name, projects, industry, action }: { name: string, projects: number, industry: string, action: string }) {
  return (
    <Card className="flex flex-col relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-1 h-full bg-brand-primary opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-base font-medium text-text-primary">{name}</h3>
          <p className="text-xs text-text-secondary mt-1">{industry}</p>
        </div>
        <div className="w-8 h-8 rounded bg-brand-primary-light text-brand-primary-dark flex items-center justify-center font-bold text-xs">
          {name.charAt(0)}
        </div>
      </div>
      
      <div className="mt-auto pt-4 border-t border-border-subtle space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="text-text-muted uppercase tracking-wider font-semibold text-[10px]">Active Projects</span>
          <span className="font-medium text-text-primary">{projects}</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-text-muted uppercase tracking-wider font-semibold text-[10px]">Next Action</span>
          <span className="text-brand-primary font-medium truncate ml-4">{action}</span>
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
          <p className="text-xs text-text-secondary mb-4">Update your account details and preferences.</p>
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
            <input type="email" defaultValue="alex@explast.com" className="w-full bg-bg-input border border-border-strong rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-colors" />
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
"""

with open('src/app/page.tsx', 'w') as f:
    f.write(content)

print("Page updated")
