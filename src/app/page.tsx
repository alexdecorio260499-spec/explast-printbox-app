"use client";

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, KanbanSquare, Package, Leaf, 
  UploadCloud, FileText, CheckCircle, X, Factory, FileSpreadsheet, 
  Search, AlertTriangle, TrendingUp, Clock, Activity, FileCheck, DollarSign
} from 'lucide-react';

const MOCK_PROJECTS = [
  { id: 1, title: 'Cozy Burger Takeaway Boxes', brand: 'PrintBox', client: 'Cozy Burger Ltd', stage: 'Design & Mockups', value: 4500, type: 'Custom Offset', specs: { dim: '20cm x 15cm x 8cm', colors: 'CMYK (4 Colors)', material: '250gsm Kraft Recycled', custom: 'Fully Customized' } },
  { id: 2, title: 'AgroCorp Fertilizer Sacks', brand: 'Explast', client: 'AgroCorp Mauritius', stage: 'Quoting', value: 12000, type: 'Heavy Duty Plastic', specs: { dim: '60cm x 90cm', gauge: '120 Microns', material: 'Recycled PP (Woven)', custom: 'Standardized + Logo Flexo' } },
  { id: 3, title: 'Cafe Lux Coffee Cups', brand: 'PrintBox', client: 'Cafe Lux', stage: 'Discovery', value: 2500, type: 'Standard Paper', specs: { dim: '8 oz', colors: 'Pantone 476 C', material: 'Food-safe Paperboard', custom: 'Fully Customized' } },
  { id: 4, title: 'BuildMat Shrink Wrap', brand: 'Explast', client: 'BuildMat', stage: 'Pending Approval', value: 8000, type: 'Industrial Wrap', specs: { dim: '500mm width x 300m', gauge: '50 Microns', material: 'Virgin PE', custom: 'Standardized (Plain)' } },
  { id: 5, title: 'EcoBoutique Carrier Bags', brand: 'PrintBox', client: 'EcoBoutique', stage: 'Pending Approval', value: 15000, type: 'Kraft Recycled', specs: { dim: '30cm x 40cm x 12cm', colors: 'Black Only (Eco Ink)', material: '150gsm Kraft', custom: 'Fully Customized' } },
  { id: 6, title: 'Textile Export Liners', brand: 'Explast', client: 'Mauritius Textiles', stage: 'Design & Mockups', value: 22000, type: 'Garment Bags', specs: { dim: '60cm x 100cm', gauge: '30 Microns', material: 'OXO-Biodegradable PE', custom: 'Customized + Flexo (1 Color)' } },
];

const MOCK_CLIENTS = [
  { id: 1, name: 'Cozy Burger Ltd', industry: 'Food Service', status: 'Client', lastContact: '2 days ago', rep: 'Rajesh S.' },
  { id: 2, name: 'AgroCorp Mauritius', industry: 'Agriculture', status: 'Client', lastContact: '1 week ago', rep: 'Kevin M.' },
  { id: 3, name: 'Mauritius Textiles', industry: 'Textile', status: 'Lead', lastContact: '5 days ago', rep: 'Rajesh S.' },
  { id: 4, name: 'Island Pharma', industry: 'Pharmaceutical', status: 'Cold', lastContact: '65 days ago', rep: 'Sarah L.' },
  { id: 5, name: 'Cafe Lux', industry: 'Food Service', status: 'Client', lastContact: '1 day ago', rep: 'Sarah L.' },
  { id: 6, name: 'BuildMat', industry: 'Construction', status: 'Lead', lastContact: '14 days ago', rep: 'Kevin M.' },
];

const STAGES = ['Discovery', 'Design & Mockups', 'Quoting', 'Pending Approval', 'Production Order'];

export default function App() {
  const [brand, setBrand] = useState('Explast');
  const [role, setRole] = useState('Sales');
  const [activeView, setActiveView] = useState('Dashboard');
  
  const [projects, setProjects] = useState(MOCK_PROJECTS);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [modalTab, setModalTab] = useState('design');
  const [quoteValue, setQuoteValue] = useState(0);

  // Client Filters
  const [clientIndustry, setClientIndustry] = useState('All');
  const [clientStatus, setClientStatus] = useState('All');
  const [clientRep, setClientRep] = useState('All');
  const [clientSort, setClientSort] = useState('default');

  const theme = brand === 'Explast' ? {
    primary: 'bg-blue-600',
    primaryHover: 'hover:bg-blue-700',
    primaryText: 'text-blue-600',
    primaryBorder: 'border-blue-600',
    primaryLight: 'bg-blue-50',
    appBg: 'bg-slate-50',
    sidebarBg: 'bg-slate-900',
    sidebarHover: 'hover:bg-slate-800',
    badge: 'bg-blue-100 text-blue-800'
  } : {
    primary: 'bg-emerald-600',
    primaryHover: 'hover:bg-emerald-700',
    primaryText: 'text-emerald-600',
    primaryBorder: 'border-emerald-600',
    primaryLight: 'bg-emerald-50',
    appBg: 'bg-stone-50',
    sidebarBg: 'bg-stone-900',
    sidebarHover: 'hover:bg-stone-800',
    badge: 'bg-emerald-100 text-emerald-800'
  };

  const openProject = (project: any) => {
    setSelectedProject(project);
    setQuoteValue(project.value);
    setModalTab('design');
  };

  useEffect(() => {
    if (activeView === 'Pipeline') {
      const timer = setTimeout(() => {
        const cards = document.querySelectorAll<HTMLElement>('.pipeline-project-card');
        let maxHeight = 0;
        cards.forEach(card => {
          card.style.height = 'auto'; 
          maxHeight = Math.max(maxHeight, card.offsetHeight);
        });
        cards.forEach(card => {
          card.style.height = `${maxHeight}px`;
        });
      }, 50); // slight delay to let DOM render
      return () => clearTimeout(timer);
    }
  }, [activeView, brand, projects]);

  const filteredProjects = projects.filter(p => p.brand === brand);

  const renderDashboard = () => {
    if (role === 'Sales') {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className={`p-4 rounded-full ${theme.primaryLight} ${theme.primaryText}`}><Users size={24} /></div>
              <div><p className="text-sm text-gray-700 font-bold">My Leads</p><h3 className="text-2xl font-bold text-gray-900">4 Active</h3></div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className={`p-4 rounded-full ${theme.primaryLight} ${theme.primaryText}`}><Activity size={24} /></div>
              <div><p className="text-sm text-gray-700 font-bold">Active Projects</p><h3 className="text-2xl font-bold text-gray-900">12 Deals</h3></div>
            </div>
            <div className="bg-red-50 p-6 rounded-xl border border-red-200 shadow-sm flex items-center gap-4">
              <div className="p-4 rounded-full bg-red-100 text-red-600"><AlertTriangle size={24} /></div>
              <div><p className="text-sm text-red-700 font-bold">Cold Clients ({'>'}60 Days)</p><h3 className="text-2xl font-bold text-red-900">2 Action Needed</h3></div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-bold text-lg mb-4 text-gray-900">Recent Sales Activity</h3>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className={`w-2 h-2 rounded-full ${theme.primary}`}></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">Quote sent to Cozy Burger Ltd</p>
                    <p className="text-sm text-gray-500">2 hours ago • Custom Takeaway Boxes</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (role === 'Design') {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className={`p-4 rounded-full ${theme.primaryLight} ${theme.primaryText}`}><FileCheck size={24} /></div>
              <div><p className="text-sm text-gray-500 font-semibold">Design Files Needed</p><h3 className="text-2xl font-bold">3 Projects</h3></div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className={`p-4 rounded-full ${theme.primaryLight} ${theme.primaryText}`}><Clock size={24} /></div>
              <div><p className="text-sm text-gray-500 font-semibold">Pending Mockups</p><h3 className="text-2xl font-bold">5 Awaiting Creation</h3></div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
            <h3 className="font-bold text-lg mb-2">Global Asset Ingestion (Isabelle's Upload Endpoint)</h3>
            <p className="text-gray-500 mb-6">Drag and drop Adobe Illustrator or PDF files here to auto-extract metadata for recurrent orders.</p>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer">
              <div className={`p-4 rounded-full ${theme.primaryLight} mb-4`}>
                <UploadCloud size={40} className={theme.primaryText} />
              </div>
              <p className="font-bold text-gray-700 text-xl">Drop design files here</p>
              <p className="text-gray-400 mt-2">Metadata will automatically populate the associated project card.</p>
            </div>
          </div>
        </div>
      );
    }

    if (role === 'Management') {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-amber-50 p-6 rounded-xl border border-amber-200 shadow-sm flex items-center gap-4">
              <div className="p-4 rounded-full bg-amber-100 text-amber-700"><CheckCircle size={24} /></div>
              <div><p className="text-sm text-amber-700 font-semibold">Pending Production Approvals</p><h3 className="text-2xl font-bold text-amber-800">4 Needs Sign-off</h3></div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className={`p-4 rounded-full ${theme.primaryLight} ${theme.primaryText}`}><DollarSign size={24} /></div>
              <div><p className="text-sm text-gray-500 font-semibold">Pending Quotations</p><h3 className="text-2xl font-bold">7 Awaiting Price</h3></div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg">Monthly Revenue Projection (MUR)</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${theme.badge}`}>{brand} Unit</span>
            </div>
            <div className="h-48 flex items-end justify-between gap-4 pt-4">
              {[40, 70, 45, 90, 65, 80].map((height, i) => (
                <div key={i} className="w-full bg-gray-100 rounded-t-md relative group">
                  <div 
                    className={`absolute bottom-0 w-full rounded-t-md ${theme.primary} transition-all duration-500`}
                    style={{ height: `${height}%` }}
                  ></div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 text-sm text-gray-500 font-medium">
              <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
            </div>
          </div>
        </div>
      );
    };
  }

  const getDays = (str: string) => {
    const num = parseInt(str) || 0;
    if (str.includes('day')) return num;
    if (str.includes('week')) return num * 7;
    if (str.includes('month')) return num * 30;
    return num;
  };

  const renderClients = () => {
    let filteredClients = MOCK_CLIENTS.filter(c => {
      if (clientIndustry !== 'All' && c.industry !== clientIndustry) return false;
      if (clientStatus !== 'All' && c.status !== clientStatus) return false;
      if (clientRep !== 'All' && c.rep !== clientRep) return false;
      return true;
    });

    if (clientSort === 'high') {
      filteredClients.sort((a, b) => getDays(b.lastContact) - getDays(a.lastContact));
    } else if (clientSort === 'low') {
      filteredClients.sort((a, b) => getDays(a.lastContact) - getDays(b.lastContact));
    }

    const industries = ['All', ...Array.from(new Set(MOCK_CLIENTS.map(c => c.industry)))];
    const statuses = ['All', ...Array.from(new Set(MOCK_CLIENTS.map(c => c.status)))];
    const reps = ['All', ...Array.from(new Set(MOCK_CLIENTS.map(c => c.rep)))];

    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">Client Directory</h2>
          <button className={`px-4 py-2 ${theme.primary} text-white rounded-lg font-medium ${theme.primaryHover}`}>+ New Client</button>
        </div>
        
        <div className="p-4 bg-white border-b border-gray-200 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-800">Industry:</span>
            <select value={clientIndustry} onChange={(e) => setClientIndustry(e.target.value)} className="border border-gray-300 rounded-lg px-2 py-1 text-sm bg-gray-50 focus:outline-none text-gray-900 font-medium">
              {industries.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-800">Status:</span>
            <select value={clientStatus} onChange={(e) => setClientStatus(e.target.value)} className="border border-gray-300 rounded-lg px-2 py-1 text-sm bg-gray-50 focus:outline-none text-gray-900 font-medium">
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-800">Sales Rep:</span>
            <select value={clientRep} onChange={(e) => setClientRep(e.target.value)} className="border border-gray-300 rounded-lg px-2 py-1 text-sm bg-gray-50 focus:outline-none text-gray-900 font-medium">
              {reps.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm font-bold text-gray-800">Last Contact:</span>
            <select value={clientSort} onChange={(e) => setClientSort(e.target.value)} className="border border-gray-300 rounded-lg px-2 py-1 text-sm bg-gray-50 focus:outline-none text-gray-900 font-medium">
              <option value="default">Default</option>
              <option value="high">Longest Ago (High)</option>
              <option value="low">Most Recent (Low)</option>
            </select>
          </div>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
              <th className="p-4 font-semibold">Company Name</th>
              <th className="p-4 font-semibold">Industry</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">Last Contact</th>
              <th className="p-4 font-semibold">Sales Rep</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((client) => (
              <tr key={client.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${client.status === 'Cold' ? 'bg-red-50/50' : ''}`}>
                <td className="p-4 font-bold text-gray-800">{client.name}</td>
                <td className="p-4 text-gray-600">{client.industry}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs font-bold rounded-full 
                    ${client.status === 'Client' ? 'bg-green-100 text-green-800' : 
                      client.status === 'Lead' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                    {client.status}
                  </span>
                </td>
                <td className={`p-4 font-medium ${client.status === 'Cold' ? 'text-red-600 flex items-center gap-2' : 'text-gray-500'}`}>
                  {client.status === 'Cold' && <AlertTriangle size={14} />} {client.lastContact}
                </td>
                <td className="p-4 text-gray-600">{client.rep}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className={`flex h-screen w-full font-sans ${theme.appBg} transition-colors duration-300`}>
      
      {/* Sidebar */}
      <div className={`w-64 ${theme.sidebarBg} text-white flex flex-col transition-colors duration-300 shadow-xl z-10`}>
        <div className="p-6 flex items-center gap-3">
          {brand === 'Explast' ? <Factory size={28} className="text-blue-400" /> : <Leaf size={28} className="text-emerald-400" />}
          <h1 className="text-2xl font-bold tracking-tight">{brand}</h1>
        </div>
        
        <nav className="flex-1 px-4 mt-6 space-y-2">
          <button onClick={() => setActiveView('Dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeView === 'Dashboard' ? theme.primary : theme.sidebarHover}`}>
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button onClick={() => setActiveView('Clients')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeView === 'Clients' ? theme.primary : theme.sidebarHover}`}>
            <Users size={20} /> Clients
          </button>
          <button onClick={() => setActiveView('Pipeline')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeView === 'Pipeline' ? theme.primary : theme.sidebarHover}`}>
            <KanbanSquare size={20} /> Projects
          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <header className="bg-white h-20 border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-10">
          <div className="flex items-center gap-6">
            <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
              <button 
                onClick={() => setBrand('Explast')}
                className={`px-6 py-2 rounded-md font-semibold transition-all ${brand === 'Explast' ? 'bg-white shadow-sm text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Explast Industrial
              </button>
              <button 
                onClick={() => setBrand('PrintBox')}
                className={`px-6 py-2 rounded-md font-semibold transition-all ${brand === 'PrintBox' ? 'bg-white shadow-sm text-emerald-700' : 'text-gray-500 hover:text-gray-700'}`}
              >
                PrintBox Eco
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-500">Simulate Role:</span>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-700 font-bold focus:outline-none focus:ring-2 focus:ring-opacity-50 cursor-pointer"
              style={{ outlineColor: theme.primaryText }}
            >
              <option value="Sales">Sales Rep</option>
              <option value="Design">Design Team (Isabelle)</option>
              <option value="Management">Management (Michel)</option>
            </select>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-x-auto overflow-y-auto p-8">
          {activeView === 'Dashboard' && renderDashboard()}
          {activeView === 'Clients' && renderClients()}
          
          {/* Projects Pipeline */}
          {activeView === 'Pipeline' && (
            <div className="grid grid-cols-5 gap-4 h-full min-w-0">
              {STAGES.map(stage => (
                <div key={stage} className="flex flex-col min-w-0">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-700 uppercase tracking-wider text-sm">{stage}</h3>
                    <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">
                      {filteredProjects.filter(p => p.stage === stage).length}
                    </span>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    {filteredProjects.filter(p => p.stage === stage).map(project => (
                      <div 
                        key={project.id} 
                        onClick={() => openProject(project)}
                        className={`pipeline-project-card flex flex-col bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-1 hover:border-gray-300`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <span className={`text-xs font-bold px-2 py-1 rounded bg-gray-100 text-gray-600`}>{project.type}</span>
                        </div>
                        <h4 className="font-bold text-gray-900 mb-1 leading-tight">{project.title}</h4>
                        <p className="text-sm text-gray-500 mb-4 font-medium">{project.client}</p>
                        
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                          <span className="text-sm font-bold text-gray-700">MUR {project.value.toLocaleString()}</span>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${theme.badge}`}>
                            <FileText size={14} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className={`px-8 py-6 flex items-center justify-between border-b border-gray-200 bg-gray-50`}>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${theme.badge}`}>
                    {selectedProject.brand}
                  </span>
                  <span className="text-sm font-medium text-gray-500">Project ID: #{selectedProject.id}109</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedProject.title}</h2>
                <p className="text-gray-500 font-medium">{selectedProject.client}</p>
              </div>
              <button onClick={() => setSelectedProject(null)} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex px-8 border-b border-gray-200 bg-white">
              <button 
                onClick={() => setModalTab('design')}
                className={`py-4 px-6 font-semibold border-b-2 transition-colors ${modalTab === 'design' ? `${theme.primaryText} ${theme.primaryBorder}` : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                {selectedProject.brand === 'Explast' ? 'Discovery & Specs' : 'Design & Metadata'}
              </button>
              <button 
                onClick={() => setModalTab('quote')}
                className={`py-4 px-6 font-semibold border-b-2 transition-colors ${modalTab === 'quote' ? `${theme.primaryText} ${theme.primaryBorder}` : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                Quotation Details
              </button>
              <button 
                onClick={() => setModalTab('production')}
                className={`py-4 px-6 font-semibold border-b-2 transition-colors ${modalTab === 'production' ? `${theme.primaryText} ${theme.primaryBorder}` : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                Production Order
              </button>
            </div>

            <div className="p-8 flex-1 overflow-y-auto bg-white">
              {modalTab === 'design' && (
                <div className="space-y-6">
                  {selectedProject.brand === 'Explast' ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                        <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                          <Factory size={20} className="text-blue-600"/>
                          Technical Discovery & Specifications
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm">
                            <span className="text-xs text-blue-500 font-bold uppercase tracking-wider">Material Profile</span>
                            <p className="font-semibold text-gray-800 mt-1">{selectedProject.specs?.material}</p>
                          </div>
                          <div className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm">
                            <span className="text-xs text-blue-500 font-bold uppercase tracking-wider">Thickness / Gauge</span>
                            <p className="font-semibold text-gray-800 mt-1">{selectedProject.specs?.gauge}</p>
                          </div>
                          <div className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm">
                            <span className="text-xs text-blue-500 font-bold uppercase tracking-wider">Dimensions</span>
                            <p className="font-semibold text-gray-800 mt-1">{selectedProject.specs?.dim}</p>
                          </div>
                          <div className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm">
                            <span className="text-xs text-blue-500 font-bold uppercase tracking-wider">Customization</span>
                            <p className="font-semibold text-gray-800 mt-1">{selectedProject.specs?.custom}</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          Client Reference Files
                        </h4>
                        <div className="border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-xl p-6 flex items-center justify-between bg-white transition-colors cursor-pointer group">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-full bg-blue-50 group-hover:bg-blue-100 transition-colors`}>
                              <UploadCloud size={24} className="text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-700">Upload Reference Specs / Logos</p>
                              <p className="text-xs text-gray-500 mt-1">Accepts PDF, AI, or JPG for Flexo print workflows.</p>
                            </div>
                          </div>
                          <button className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors`}>
                            Browse Files
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <Leaf size={20} className="text-emerald-600" />
                          Design Asset Management
                        </h3>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-white hover:border-emerald-400 transition-colors cursor-pointer">
                          <div className={`p-3 rounded-full ${theme.primaryLight} mb-3`}>
                            <UploadCloud size={28} className={theme.primaryText} />
                          </div>
                          <p className="font-semibold text-gray-700">Drag & Drop working files here</p>
                          <p className="text-xs text-gray-500 mt-1 mb-4">Adobe Illustrator, PDF, or 3D Mockup links</p>
                          <button className={`px-4 py-2 ${theme.primary} text-white rounded-lg font-medium text-sm`}>Browse Files</button>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-3">Extracted Metadata Resume</h4>
                        <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-5 font-mono text-sm text-gray-700 space-y-2">
                          <p><span className="font-bold text-gray-900">Material:</span> {selectedProject.specs?.material}</p>
                          <p><span className="font-bold text-gray-900">Dimensions:</span> {selectedProject.specs?.dim}</p>
                          <p><span className="font-bold text-gray-900">Color Spec:</span> {selectedProject.specs?.colors}</p>
                          <p className="text-emerald-700 mt-3 flex items-center gap-1 font-sans font-semibold border-t border-emerald-200 pt-3">
                            <CheckCircle size={16}/> Design Verified & Ready
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {modalTab === 'quote' && (
                <div className="max-w-xl">
                  <h3 className="font-bold text-gray-800 mb-6 text-xl">Financial Details</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Total Value (MUR)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-500">Rs.</span>
                        <input 
                          type="number" 
                          value={quoteValue}
                          onChange={(e) => setQuoteValue(Number(e.target.value))}
                          className="w-full border border-gray-300 rounded-xl py-3 pl-12 pr-4 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
                          style={{ outlineColor: theme.primaryText }}
                        />
                      </div>
                    </div>

                    <div className={`p-5 rounded-xl border ${quoteValue >= 3000 ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'} transition-colors`}>
                      <div className="flex items-center gap-3">
                        <Package size={24} className={quoteValue >= 3000 ? 'text-emerald-600' : 'text-gray-400'} />
                        <div>
                          <h4 className={`font-bold ${quoteValue >= 3000 ? 'text-emerald-800' : 'text-gray-700'}`}>
                            {quoteValue >= 3000 ? 'Free Delivery Eligible' : 'Standard Delivery'}
                          </h4>
                          <p className={`text-sm mt-1 ${quoteValue >= 3000 ? 'text-emerald-700' : 'text-gray-500'}`}>
                            {quoteValue >= 3000 ? "Order exceeds 3,000 MUR." : "Order under threshold."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {modalTab === 'production' && (
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <h3 className="font-bold text-gray-800 mb-6 text-xl">Production Handoff</h3>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8">
                      <h4 className="font-semibold text-gray-800 mb-4">Final Checks</h4>
                      <ul className="space-y-3 text-sm text-gray-600">
                        <li className="flex justify-between border-b border-gray-200 pb-2"><span>Client</span> <span className="font-bold text-gray-900">{selectedProject.client}</span></li>
                        <li className="flex justify-between border-b border-gray-200 pb-2"><span>Product Type</span> <span className="font-bold text-gray-900">{selectedProject.type}</span></li>
                        <li className="flex justify-between pb-2"><span>Management Approval</span> <span className="font-bold text-green-600">Approved</span></li>
                      </ul>
                    </div>
                  </div>

                  <div className="text-center pt-8">
                    <button className={`w-full max-w-md mx-auto flex items-center justify-center gap-3 py-4 px-6 bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-lg shadow-lg transition-all`}>
                      <FileSpreadsheet size={24} />
                      Generate Production Order (PDF)
                    </button>
                    <p className="text-sm text-gray-500 mt-4">Print this document and hand it to the factory floor.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
