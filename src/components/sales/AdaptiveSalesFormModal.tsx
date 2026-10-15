'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Check, AlertTriangle, ArrowRight, ArrowLeft, Save, 
  Search, Plus, FileText, Upload, Sparkles, Building, User, 
  Calendar, Clock, ShieldAlert, CheckCircle2, ChevronRight,
  Package, Palette, Truck, HelpCircle, Layers, RefreshCw
} from 'lucide-react';
import { 
  BrandUnit, RequestType, ProductFamily, TechStatus, 
  Client, Product, SalesProjectDraft, ProjectItemSpec 
} from '@/types/sales';
import { PRODUCT_FAMILIES } from '@/lib/sales/product-families';
import { SalesDataService } from '@/lib/sales/data-service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface AdaptiveSalesFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (projectId: string) => void;
  initialBrand?: BrandUnit;
  resumeDraftId?: string;
}

export function AdaptiveSalesFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialBrand = 'Explast',
  resumeDraftId
}: AdaptiveSalesFormModalProps) {
  // Current active step (0 to 9)
  const [currentStep, setCurrentStep] = useState<number>(0);
  
  // Data states
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [clientHistory, setClientHistory] = useState<any[]>([]);
  const [savedDrafts, setSavedDrafts] = useState<SalesProjectDraft[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Form State
  const [draft, setDraft] = useState<SalesProjectDraft>(() => createInitialDraft(initialBrand));

  // Search & Filters
  const [clientSearch, setClientSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [newClientMode, setNewClientMode] = useState(false);

  // Step 2 new customer form fields
  const [newClientData, setNewClientData] = useState({
    company_name: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    industry: 'Food Service',
    location_type: 'Local (Mauritius)',
    delivery_address: '',
    notes: '',
  });

  // Step 8 validation
  const validation = useMemo(() => evaluateCompleteness(draft), [draft]);

  // Load initial clients, products, drafts
  useEffect(() => {
    if (!isOpen) return;
    
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const [loadedClients, loadedProducts] = await Promise.all([
          SalesDataService.getClients(),
          SalesDataService.getProducts(draft.brand),
        ]);
        if (isMounted) {
          setClients(loadedClients);
          setProducts(loadedProducts);
          setSavedDrafts(SalesDataService.getDrafts());
          
          if (resumeDraftId) {
            const existing = SalesDataService.getDraft(resumeDraftId);
            if (existing) {
              setDraft(existing);
              setCurrentStep(existing.current_step || 1);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load initial sales data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [isOpen, resumeDraftId]);

  // When brand changes in draft, reload compatible products
  useEffect(() => {
    async function updateProducts() {
      const prods = await SalesDataService.getProducts(draft.brand);
      setProducts(prods);
    }
    updateProducts();
  }, [draft.brand]);

  // When client changes, load previous project history
  useEffect(() => {
    if (draft.client_id) {
      SalesDataService.getClientHistory(draft.client_id).then(setClientHistory);
    } else {
      setClientHistory([]);
    }
  }, [draft.client_id]);

  // Autosave draft debounce
  useEffect(() => {
    if (!draft.id || currentStep === 0) return;
    setSaveStatus('saving');
    const timer = setTimeout(async () => {
      try {
        await SalesDataService.saveDraft({ ...draft, current_step: currentStep });
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (e) {
        setSaveStatus('error');
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [draft, currentStep]);

  if (!isOpen) return null;

  // Primary active item
  const activeItem = draft.items[0] || createInitialItem(draft.brand === 'Explast' ? 'plastic_sack' : 'paper_bag');

  function updateDraft(updater: Partial<SalesProjectDraft> | ((prev: SalesProjectDraft) => SalesProjectDraft)) {
    setDraft(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      return next;
    });
  }

  function updateActiveItem(updater: Partial<ProjectItemSpec> | ((prev: ProjectItemSpec) => ProjectItemSpec)) {
    setDraft(prev => {
      const currentItem = prev.items[0] || createInitialItem(prev.brand === 'Explast' ? 'plastic_sack' : 'paper_bag');
      const updatedItem = typeof updater === 'function' ? updater(currentItem) : { ...currentItem, ...updater };
      return {
        ...prev,
        items: [updatedItem, ...prev.items.slice(1)],
      };
    });
  }

  async function handleManualSaveDraft() {
    setSaveStatus('saving');
    try {
      await SalesDataService.saveDraft({ ...draft, current_step: currentStep });
      setSaveStatus('saved');
      setSavedDrafts(SalesDataService.getDrafts());
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (e) {
      setSaveStatus('error');
    }
  }

  async function handleSubmitFinal() {
    if (validation.blockingErrors.length > 0) {
      alert('Please resolve all blocking errors before submitting:\n• ' + validation.blockingErrors.join('\n• '));
      return;
    }
    setSaveStatus('saving');
    try {
      const res = await SalesDataService.submitRequest({
        ...draft,
        is_submitted: true,
        request_status: 'submitted',
      });
      if (res.success) {
        onSuccess(res.projectId);
        onClose();
      }
    } catch (e) {
      alert('Failed to submit request. Your draft is safely saved locally.');
      setSaveStatus('error');
    }
  }

  const stepsList = [
    { num: 0, label: 'Start' },
    { num: 1, label: 'Brand' },
    { num: 2, label: 'Customer' },
    { num: 3, label: 'Request Type' },
    { num: 4, label: 'Product' },
    { num: 5, label: 'Specifications' },
    { num: 6, label: 'Artwork' },
    { num: 7, label: 'Delivery' },
    { num: 8, label: 'Validation' },
    { num: 9, label: 'Review' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div 
        data-brand={draft.brand.toLowerCase()}
        className="bg-bg-page w-full max-w-5xl rounded-xl border border-border-strong shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-text-primary font-sans"
      >
        {/* TOP BAR / PROGRESS */}
        <div className="bg-bg-card border-b border-border-subtle px-6 py-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded bg-brand-primary-light text-brand-primary-dark">
                {draft.brand}
              </span>
              <div>
                <h2 className="text-sm font-semibold text-text-primary truncate max-w-md">
                  {draft.project_name || 'New Packaging Request'}
                </h2>
                <p className="text-[11px] text-text-muted">
                  Step {currentStep} of 9 — {stepsList.find(s => s.num === currentStep)?.label}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              {/* Save Status Badge */}
              <div className="hidden sm:flex items-center gap-1.5 text-xs">
                {saveStatus === 'saving' && (
                  <span className="flex items-center gap-1 text-text-muted">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving...
                  </span>
                )}
                {saveStatus === 'saved' && (
                  <span className="flex items-center gap-1 text-color-success font-medium">
                    <Check className="w-3.5 h-3.5" /> Draft Saved
                  </span>
                )}
                {saveStatus === 'error' && (
                  <span className="flex items-center gap-1 text-color-error font-medium">
                    <AlertTriangle className="w-3.5 h-3.5" /> Save error
                  </span>
                )}
              </div>

              {currentStep > 0 && (
                <button
                  onClick={handleManualSaveDraft}
                  className="px-3 py-1.5 text-xs font-medium rounded border border-border-strong bg-bg-card text-text-secondary hover:bg-bg-secondary flex items-center gap-1.5 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" /> Save Draft
                </button>
              )}

              <button
                onClick={onClose}
                className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="w-full bg-border-subtle h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-brand-primary h-full transition-all duration-300 ease-out"
              style={{ width: `${(currentStep / 9) * 100}%` }}
            />
          </div>
        </div>

        {/* STEP CONTENT BODY */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* STEP 0: ENTRY POINT */}
          {currentStep === 0 && (
            <div className="space-y-6 max-w-2xl mx-auto py-4 animate-in fade-in">
              <div className="text-center space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-brand-primary">Adaptive Sales Workflow</span>
                <h1 className="text-2xl sm:text-3xl font-medium text-text-primary">New Packaging Request</h1>
                <p className="text-sm text-text-secondary">
                  Create a structured packaging enquiry for Explast or PrintBox, or resume an existing draft.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <Card 
                  onClick={() => setCurrentStep(1)}
                  className="cursor-pointer border-2 hover:border-brand-primary transition-all p-6 text-center space-y-3 group"
                >
                  <div className="w-12 h-12 rounded-full bg-brand-primary-light text-brand-primary flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                    <Plus className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-text-primary text-base">Start New Request</h3>
                  <p className="text-xs text-text-secondary">
                    Guide through customer selection, product families, dimensions, printing, and timeframe.
                  </p>
                </Card>

                <Card className="border border-border-strong p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Saved Drafts</span>
                    <Badge variant="neutral">{savedDrafts.length}</Badge>
                  </div>
                  {savedDrafts.length === 0 ? (
                    <div className="text-center py-6 text-xs text-text-muted">
                      No active drafts found.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {savedDrafts.map(d => (
                        <div 
                          key={d.id}
                          onClick={() => {
                            setDraft(d);
                            setCurrentStep(d.current_step || 1);
                          }}
                          className="p-2.5 rounded border border-border-subtle hover:border-brand-primary bg-bg-card hover:bg-brand-primary-light/30 cursor-pointer flex justify-between items-center text-left transition-colors"
                        >
                          <div className="truncate pr-2">
                            <p className="text-xs font-medium text-text-primary truncate">{d.project_name || 'Untitled Draft'}</p>
                            <p className="text-[10px] text-text-muted">{d.brand} • {new Date(d.updated_at).toLocaleDateString()}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-brand-primary shrink-0" />
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            </div>
          )}

          {/* STEP 1: SELECT BRAND */}
          {currentStep === 1 && (
            <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Step 1 of 9</span>
                <h2 className="text-2xl font-medium text-text-primary">Select Business Unit</h2>
                <p className="text-sm text-text-secondary mt-1">
                  Which brand does this packaging request belong to? The workflow and technical catalogue will adapt accordingly.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* EXPLAST */}
                <div 
                  onClick={() => {
                    if (draft.brand !== 'Explast' && activeItem.product_id) {
                      if (!confirm('Switching brands will reset the selected product. Continue?')) return;
                      updateActiveItem({ product_id: undefined, product_family: 'plastic_sack' });
                    }
                    updateDraft({ brand: 'Explast' });
                  }}
                  className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                    draft.brand === 'Explast'
                      ? 'border-[#168C86] bg-[#DDF2EF]/20'
                      : 'border-border-strong bg-bg-card hover:border-border-strong/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold tracking-widest uppercase text-[#0F625F]">EXPLAST</span>
                    {draft.brand === 'Explast' && <CheckCircle2 className="w-5 h-5 text-[#168C86]" />}
                  </div>
                  <h4 className="font-semibold text-text-primary text-base mb-1">Industrial & Commercial Plastics</h4>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Heavy-duty LDPE/HDPE sacks, crate liners, shrink wrap, food-grade agricultural packaging, and specialty films.
                  </p>
                </div>

                {/* PRINTBOX */}
                <div 
                  onClick={() => {
                    if (draft.brand !== 'PrintBox' && activeItem.product_id) {
                      if (!confirm('Switching brands will reset the selected product. Continue?')) return;
                      updateActiveItem({ product_id: undefined, product_family: 'paper_bag' });
                    }
                    updateDraft({ brand: 'PrintBox' });
                  }}
                  className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                    draft.brand === 'PrintBox'
                      ? 'border-[#2F6B5F] bg-[#E2F0EC]/20'
                      : 'border-border-strong bg-bg-card hover:border-border-strong/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold tracking-widest uppercase text-[#214D45]">PRINTBOX</span>
                    {draft.brand === 'PrintBox' && <CheckCircle2 className="w-5 h-5 text-[#2F6B5F]" />}
                  </div>
                  <h4 className="font-semibold text-text-primary text-base mb-1">Paper Packaging & Studio</h4>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Custom takeaway burger boxes, food cartons, twisted handle paper bags, coffee cups, retail packaging, and brand design.
                  </p>
                </div>
              </div>

              {/* Title input */}
              <div className="pt-2 space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  Request / Project Name
                </label>
                <input 
                  type="text" 
                  value={draft.project_name}
                  onChange={(e) => updateDraft({ project_name: e.target.value })}
                  placeholder="e.g., ABC Restaurant Takeaway Boxes 2026"
                  className="w-full bg-bg-card border border-border-strong rounded-md px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                />
              </div>
            </div>
          )}

          {/* STEP 2: IDENTIFY CUSTOMER */}
          {currentStep === 2 && (
            <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Step 2 of 9</span>
                <h2 className="text-2xl font-medium text-text-primary">Who is this request for?</h2>
                <p className="text-sm text-text-secondary mt-1">
                  Select an existing customer to review historical projects, or register a new customer account.
                </p>
              </div>

              {/* Mode Toggle */}
              <div className="flex gap-3 border-b border-border-subtle pb-4">
                <button
                  type="button"
                  onClick={() => setNewClientMode(false)}
                  className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-md transition-colors ${
                    !newClientMode 
                      ? 'bg-brand-primary text-white' 
                      : 'bg-bg-card border border-border-strong text-text-secondary hover:bg-bg-secondary'
                  }`}
                >
                  Existing Customer
                </button>
                <button
                  type="button"
                  onClick={() => setNewClientMode(true)}
                  className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-md transition-colors ${
                    newClientMode 
                      ? 'bg-brand-primary text-white' 
                      : 'bg-bg-card border border-border-strong text-text-secondary hover:bg-bg-secondary'
                  }`}
                >
                  + New Customer Registration
                </button>
              </div>

              {/* PATH A: EXISTING CUSTOMER */}
              {!newClientMode ? (
                <div className="space-y-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-text-muted absolute left-3 top-3" />
                    <input 
                      type="text"
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                      placeholder="Search by company name, contact, phone, or email..."
                      className="w-full bg-bg-card border border-border-strong rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                    />
                  </div>

                  {/* Clients List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
                    {clients
                      .filter(c => 
                        c.company_name.toLowerCase().includes(clientSearch.toLowerCase()) ||
                        c.contact_name?.toLowerCase().includes(clientSearch.toLowerCase()) ||
                        c.contact_email?.toLowerCase().includes(clientSearch.toLowerCase())
                      )
                      .map(c => {
                        const isSelected = draft.client_id === c.id;
                        return (
                          <div 
                            key={c.id}
                            onClick={() => {
                              updateDraft({ 
                                client_id: c.id, 
                                client: c, 
                                is_new_client: false,
                                project_name: draft.project_name.startsWith('New Packaging Request') 
                                  ? `${c.company_name} - ${draft.brand} Request` 
                                  : draft.project_name
                              });
                            }}
                            className={`p-4 rounded-lg border cursor-pointer transition-all ${
                              isSelected 
                                ? 'border-brand-primary bg-brand-primary-light/20 ring-1 ring-brand-primary' 
                                : 'border-border-subtle bg-bg-card hover:border-border-strong'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <h4 className="font-semibold text-sm text-text-primary">{c.company_name}</h4>
                              <Badge variant={isSelected ? 'brand' : 'neutral'}>{c.industry || 'General'}</Badge>
                            </div>
                            <p className="text-xs text-text-secondary mt-1">{c.contact_name} • {c.contact_phone || c.contact_email}</p>
                            {c.delivery_address && (
                              <p className="text-[11px] text-text-muted mt-1 truncate">{c.delivery_address}</p>
                            )}
                          </div>
                        );
                      })}
                  </div>

                  {/* Selected Client Summary & History */}
                  {draft.client && (
                    <Card className="border-l-4 border-l-brand-primary bg-bg-card p-5 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Selected Client</span>
                          <h3 className="text-base font-semibold text-text-primary">{draft.client.company_name}</h3>
                          <p className="text-xs text-text-secondary">{draft.client.contact_name} ({draft.client.contact_email} / {draft.client.contact_phone})</p>
                        </div>
                        <Badge variant="brand">{draft.client.location_type || 'Local'}</Badge>
                      </div>

                      {/* History Section */}
                      <div className="pt-3 border-t border-border-subtle space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                            Previous Packaging Projects ({clientHistory.length})
                          </span>
                        </div>

                        {clientHistory.length === 0 ? (
                          <p className="text-xs text-text-muted italic">No prior projects recorded for this client.</p>
                        ) : (
                          <div className="space-y-2">
                            {clientHistory.map(hp => (
                              <div key={hp.id} className="p-3 bg-bg-secondary/60 rounded border border-border-subtle flex items-center justify-between">
                                <div>
                                  <p className="text-xs font-semibold text-text-primary">{hp.project_name}</p>
                                  <p className="text-[11px] text-text-secondary">
                                    {hp.brand || hp.business_unit} • {hp.items?.[0]?.description || 'Custom Item'} • Qty: {hp.items?.[0]?.quantity || 0}
                                  </p>
                                </div>
                                <Button 
                                  variant="secondary" 
                                  size="sm"
                                  onClick={() => {
                                    if (hp.items?.[0]) {
                                      const prevItem = hp.items[0];
                                      updateActiveItem({
                                        description: prevItem.description,
                                        product_family: prevItem.product_family,
                                        dimensions: prevItem.dimensions,
                                        material: prevItem.material,
                                        printing: prevItem.printing,
                                        quantity: prevItem.quantity,
                                        quantity_status: 'confirmed',
                                      });
                                    }
                                    updateDraft({ 
                                      parent_project_id: hp.id, 
                                      request_type: 'repeat' 
                                    });
                                    alert(`Specifications from "${hp.project_name}" loaded into current draft. (Values are unapproved until confirmed)`);
                                  }}
                                >
                                  Use Previous Specs
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </Card>
                  )}
                </div>
              ) : (
                /* PATH B: NEW CUSTOMER REGISTRATION */
                <Card className="space-y-4 p-6 border border-border-strong">
                  <h3 className="text-sm font-semibold text-text-primary">New Client Registration Form</h3>
                  {duplicateWarning && (
                    <div className="p-3 rounded bg-color-warning/10 border border-color-warning/30 text-xs text-color-warning flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{duplicateWarning}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Company Name *</label>
                      <input 
                        type="text" 
                        required
                        value={newClientData.company_name}
                        onChange={(e) => {
                          setNewClientData({ ...newClientData, company_name: e.target.value });
                          setDuplicateWarning(null);
                        }}
                        placeholder="Company or Trading Name"
                        className="w-full bg-bg-card border border-border-strong rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Contact Person</label>
                      <input 
                        type="text" 
                        value={newClientData.contact_name}
                        onChange={(e) => setNewClientData({ ...newClientData, contact_name: e.target.value })}
                        placeholder="Primary Contact"
                        className="w-full bg-bg-card border border-border-strong rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Email Address</label>
                      <input 
                        type="email" 
                        value={newClientData.contact_email}
                        onChange={(e) => setNewClientData({ ...newClientData, contact_email: e.target.value })}
                        placeholder="contact@company.com"
                        className="w-full bg-bg-card border border-border-strong rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Phone Number</label>
                      <input 
                        type="tel" 
                        value={newClientData.contact_phone}
                        onChange={(e) => setNewClientData({ ...newClientData, contact_phone: e.target.value })}
                        placeholder="+230 5000 0000"
                        className="w-full bg-bg-card border border-border-strong rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Industry</label>
                      <select
                        value={newClientData.industry}
                        onChange={(e) => setNewClientData({ ...newClientData, industry: e.target.value })}
                        className="w-full bg-bg-card border border-border-strong rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                      >
                        <option value="Food Service">Food Service</option>
                        <option value="Retail">Retail</option>
                        <option value="Industrial">Industrial</option>
                        <option value="Agriculture">Agriculture</option>
                        <option value="Textile">Textile</option>
                        <option value="Pharma">Pharma</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Location</label>
                      <select
                        value={newClientData.location_type}
                        onChange={(e) => setNewClientData({ ...newClientData, location_type: e.target.value })}
                        className="w-full bg-bg-card border border-border-strong rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                      >
                        <option value="Local (Mauritius)">Local (Mauritius)</option>
                        <option value="Export (International)">Export (International)</option>
                      </select>
                    </div>
                    <div className="col-span-2 space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Delivery Address</label>
                      <input 
                        type="text" 
                        value={newClientData.delivery_address}
                        onChange={(e) => setNewClientData({ ...newClientData, delivery_address: e.target.value })}
                        placeholder="Street, City, Postal Code"
                        className="w-full bg-bg-card border border-border-strong rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      onClick={async () => {
                        if (!newClientData.company_name.trim()) {
                          alert('Company name is required');
                          return;
                        }
                        const res = await SalesDataService.createClient(newClientData);
                        if (res.isDuplicate) {
                          setDuplicateWarning(`Potential duplicate found for "${res.client.company_name}". Click select to use existing record.`);
                        }
                        updateDraft({
                          client_id: res.client.id,
                          client: res.client,
                          is_new_client: true,
                          project_name: `${res.client.company_name} - ${draft.brand} Packaging`,
                        });
                        setClients(await SalesDataService.getClients());
                        setNewClientMode(false);
                      }}
                    >
                      Save & Select Customer
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* STEP 3: DEFINE REQUEST TYPE */}
          {currentStep === 3 && (
            <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Step 3 of 9</span>
                <h2 className="text-2xl font-medium text-text-primary">What does the customer need?</h2>
                <p className="text-sm text-text-secondary mt-1">
                  Choose the category of request. The downstream questions will adapt to capture only relevant technical details.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    type: 'repeat' as RequestType,
                    title: 'A. Repeat an Existing Product',
                    desc: 'Reorder a previous packaging product with identical or near-identical specifications.',
                    badge: 'History Linked',
                  },
                  {
                    type: 'modified' as RequestType,
                    title: 'B. Existing Product with Changes',
                    desc: 'Customer wants a previous product with specific modifications (e.g., new artwork, adjusted dimensions, new material).',
                    badge: 'Technical Review',
                  },
                  {
                    type: 'new_standard' as RequestType,
                    title: 'C. New Standard Catalogue Product',
                    desc: 'Select from verified standard packaging products and standard variants with known MOQs.',
                    badge: 'Verified Catalogue',
                  },
                  {
                    type: 'new_custom' as RequestType,
                    title: 'D. New Custom Product',
                    desc: 'Tailored packaging dimensions, custom die-cut layout, unique materials, or unlisted requirements.',
                    badge: 'Custom Formulation',
                  },
                  {
                    type: 'concept' as RequestType,
                    title: 'E. Concept or Design Enquiry',
                    desc: 'Early-stage packaging project. Customer has ideas or branding goals but unconfirmed technical specs.',
                    badge: 'Studio Brief',
                  },
                ].map(opt => {
                  const isSelected = draft.request_type === opt.type;
                  return (
                    <div 
                      key={opt.type}
                      onClick={() => updateDraft({ request_type: opt.type })}
                      className={`p-4 rounded-lg border cursor-pointer transition-all flex items-start justify-between ${
                        isSelected 
                          ? 'border-brand-primary bg-brand-primary-light/20 ring-1 ring-brand-primary' 
                          : 'border-border-subtle bg-bg-card hover:border-border-strong'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm text-text-primary">{opt.title}</h4>
                          <Badge variant={isSelected ? 'brand' : 'neutral'}>{opt.badge}</Badge>
                        </div>
                        <p className="text-xs text-text-secondary">{opt.desc}</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-1 ${
                        isSelected ? 'border-brand-primary bg-brand-primary text-white' : 'border-border-strong'
                      }`}>
                        {isSelected && <Check className="w-2.5 h-2.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sub-aspects if 'modified' is chosen */}
              {draft.request_type === 'modified' && (
                <Card className="p-4 bg-bg-secondary/40 border border-border-strong space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                    Which aspects of the product have changed?
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                    {[
                      { key: 'artwork', label: 'New / Modified Artwork' },
                      { key: 'dimensions', label: 'Different Dimensions' },
                      { key: 'material', label: 'Different Material / GSM' },
                      { key: 'quantity', label: 'Quantity / Repeat Cycle' },
                      { key: 'delivery', label: 'Delivery Requirements' },
                    ].map(ch => (
                      <label key={ch.key} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={draft.changes_summary?.[ch.key as keyof typeof draft.changes_summary] || false}
                          onChange={(e) => {
                            const prevSummary = draft.changes_summary || {
                              artwork: false,
                              dimensions: false,
                              material: false,
                              quantity: false,
                              delivery: false,
                            };
                            updateDraft({ 
                              changes_summary: {
                                ...prevSummary,
                                [ch.key]: e.target.checked
                              } 
                            });
                          }}
                          className="rounded text-brand-primary focus:ring-brand-primary"
                        />
                        <span className="text-text-primary">{ch.label}</span>
                      </label>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* STEP 4: SELECT OR DEFINE PRODUCT */}
          {currentStep === 4 && (
            <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Step 4 of 9</span>
                <h2 className="text-2xl font-medium text-text-primary">
                  {draft.request_type === 'new_custom' || draft.request_type === 'concept' 
                    ? 'Define Product Family & Description' 
                    : 'Select Catalogue Product'}
                </h2>
                <p className="text-sm text-text-secondary mt-1">
                  Brand: <strong className="text-brand-primary">{draft.brand}</strong> • Select an active product or choose a packaging family.
                </p>
              </div>

              {/* STANDARD CATALOGUE SELECTION */}
              {draft.request_type !== 'new_custom' && draft.request_type !== 'concept' ? (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="w-4 h-4 text-text-muted absolute left-3 top-3" />
                    <input 
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Filter catalogue products by name, code, or material..."
                      className="w-full bg-bg-card border border-border-strong rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {products
                      .filter(p => 
                        p.product_name.toLowerCase().includes(productSearch.toLowerCase()) ||
                        p.product_code?.toLowerCase().includes(productSearch.toLowerCase()) ||
                        p.material_base?.toLowerCase().includes(productSearch.toLowerCase())
                      )
                      .map(p => {
                        const isSelected = activeItem.product_id === p.id;
                        return (
                          <div 
                            key={p.id}
                            onClick={() => {
                              updateActiveItem({
                                product_id: p.id,
                                product_family: p.product_family,
                                description: p.product_name,
                                quantity: activeItem.quantity || p.moq,
                                material: {
                                  ...activeItem.material,
                                  material_type: p.material_base || '',
                                  status: 'confirmed',
                                },
                              });
                            }}
                            className={`p-4 rounded-lg border cursor-pointer transition-all space-y-2 ${
                              isSelected 
                                ? 'border-brand-primary bg-brand-primary-light/20 ring-1 ring-brand-primary' 
                                : 'border-border-subtle bg-bg-card hover:border-border-strong'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">{p.product_code}</span>
                                <h4 className="font-semibold text-sm text-text-primary">{p.product_name}</h4>
                              </div>
                              <Badge variant={isSelected ? 'brand' : 'neutral'}>{p.product_category}</Badge>
                            </div>
                            <p className="text-xs text-text-secondary">{p.material_base}</p>
                            <div className="pt-2 flex justify-between items-center text-xs text-text-muted border-t border-border-subtle">
                              <span>Confirmed MOQ: <strong>{p.moq.toLocaleString()} {p.unit}</strong></span>
                              <span className="text-[11px] font-medium text-brand-primary">Select</span>
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {/* Standard Variants Picker if selected */}
                  {activeItem.product_id && (
                    <Card className="p-4 space-y-3 bg-bg-secondary/40 border border-border-strong">
                      <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                        Available Standard Sizes & Variants
                      </span>
                      {(() => {
                        const p = products.find(x => x.id === activeItem.product_id);
                        if (!p || !p.standard_variants || p.standard_variants.length === 0) {
                          return <p className="text-xs text-text-muted">No pre-set variants for this SKU. Dimensions can be entered manually.</p>;
                        }
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            {p.standard_variants.map(v => (
                              <button
                                key={v.variant_id}
                                type="button"
                                onClick={() => {
                                  updateActiveItem({
                                    dimensions: {
                                      width: v.width,
                                      length: v.length,
                                      height: v.height,
                                      unit: 'mm',
                                      dimension_type: 'internal',
                                      status: 'confirmed',
                                    },
                                    material: {
                                      ...activeItem.material,
                                      gsm_or_micron: v.gsm ? `${v.gsm} GSM` : v.micron ? `${v.micron} µm` : '',
                                      status: 'confirmed',
                                    }
                                  });
                                }}
                                className="p-2.5 rounded bg-bg-card border border-border-strong text-left hover:border-brand-primary text-xs space-y-1 transition-colors"
                              >
                                <p className="font-semibold text-text-primary">{v.label}</p>
                                <p className="text-[10px] text-text-muted">Dimensions confirmed</p>
                              </button>
                            ))}
                          </div>
                        );
                      })()}
                    </Card>
                  )}
                </div>
              ) : (
                /* CUSTOM / CONCEPT PRODUCT SPECIFICATION */
                <Card className="p-6 space-y-5 border border-border-strong bg-bg-card">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                      Select Packaging Family
                    </label>
                    <select
                      value={activeItem.product_family}
                      onChange={(e) => updateActiveItem({ product_family: e.target.value as ProductFamily })}
                      className="w-full bg-bg-card border border-border-strong rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                    >
                      {Object.values(PRODUCT_FAMILIES).map(f => (
                        <option key={f.id} value={f.id}>{f.label} ({f.brand})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                      Customer Description (in customer&apos;s own words)
                    </label>
                    <textarea 
                      rows={3}
                      value={activeItem.description}
                      onChange={(e) => updateActiveItem({ description: e.target.value })}
                      placeholder="e.g., Needs a greaseproof kraft burger box with top vent holes for takeaway delivery..."
                      className="w-full bg-bg-card border border-border-strong rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                      Intended Application / Use Case
                    </label>
                    <input 
                      type="text"
                      value={activeItem.intended_use || ''}
                      onChange={(e) => updateActiveItem({ intended_use: e.target.value })}
                      placeholder="e.g., Hot food takeaway, retail shopping, cold storage packaging"
                      className="w-full bg-bg-card border border-border-strong rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                    />
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* STEP 5: CAPTURE PRODUCT SPECIFICATIONS */}
          {currentStep === 5 && (
            <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Step 5 of 9</span>
                <h2 className="text-2xl font-medium text-text-primary">Product Specifications</h2>
                <p className="text-sm text-text-secondary mt-1">
                  Family: <strong className="text-brand-primary">{PRODUCT_FAMILIES[activeItem.product_family]?.label || 'Packaging'}</strong> • Only relevant questions for this product are displayed.
                </p>
              </div>

              {/* 5.1 DIMENSIONS */}
              <Card className="p-5 space-y-4 border border-border-strong bg-bg-card">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-brand-primary" />
                    <h3 className="text-sm font-semibold text-text-primary">5.1 Dimensions</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-text-muted uppercase tracking-wider">Status:</span>
                    <select
                      value={activeItem.dimensions.status}
                      onChange={(e) => updateActiveItem({
                        dimensions: { ...activeItem.dimensions, status: e.target.value as TechStatus }
                      })}
                      className="text-xs bg-bg-secondary border border-border-strong rounded px-2 py-1 font-medium"
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="approximate">Approximate</option>
                      <option value="pending_review">Pending Review</option>
                      <option value="unknown">Unknown</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Width</label>
                    <input 
                      type="number"
                      value={activeItem.dimensions.width || ''}
                      onChange={(e) => updateActiveItem({
                        dimensions: { ...activeItem.dimensions, width: Number(e.target.value) || undefined }
                      })}
                      placeholder="Width"
                      className="w-full bg-bg-card border border-border-strong rounded px-3 py-1.5 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Length</label>
                    <input 
                      type="number"
                      value={activeItem.dimensions.length || ''}
                      onChange={(e) => updateActiveItem({
                        dimensions: { ...activeItem.dimensions, length: Number(e.target.value) || undefined }
                      })}
                      placeholder="Length / Gusset"
                      className="w-full bg-bg-card border border-border-strong rounded px-3 py-1.5 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Height / Depth</label>
                    <input 
                      type="number"
                      value={activeItem.dimensions.height || ''}
                      onChange={(e) => updateActiveItem({
                        dimensions: { ...activeItem.dimensions, height: Number(e.target.value) || undefined }
                      })}
                      placeholder="Height"
                      className="w-full bg-bg-card border border-border-strong rounded px-3 py-1.5 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Unit</label>
                    <select
                      value={activeItem.dimensions.unit}
                      onChange={(e) => updateActiveItem({
                        dimensions: { ...activeItem.dimensions, unit: e.target.value as 'mm' | 'cm' }
                      })}
                      className="w-full bg-bg-card border border-border-strong rounded px-3 py-1.5 text-sm"
                    >
                      <option value="mm">mm</option>
                      <option value="cm">cm</option>
                    </select>
                  </div>
                </div>
              </Card>

              {/* 5.2 MATERIAL & CONSTRUCTION */}
              <Card className="p-5 space-y-4 border border-border-strong bg-bg-card">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-brand-primary" />
                    <h3 className="text-sm font-semibold text-text-primary">5.2 Material & Construction</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-text-muted uppercase tracking-wider">Status:</span>
                    <select
                      value={activeItem.material.status}
                      onChange={(e) => updateActiveItem({
                        material: { ...activeItem.material, status: e.target.value as TechStatus }
                      })}
                      className="text-xs bg-bg-secondary border border-border-strong rounded px-2 py-1 font-medium"
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="approximate">Approximate</option>
                      <option value="pending_review">Technical Review</option>
                      <option value="unknown">Unknown</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Material Type</label>
                    <select
                      value={activeItem.material.material_type}
                      onChange={(e) => updateActiveItem({
                        material: { ...activeItem.material, material_type: e.target.value }
                      })}
                      className="w-full bg-bg-card border border-border-strong rounded px-3 py-1.5 text-sm"
                    >
                      <option value="">Select Material...</option>
                      {(PRODUCT_FAMILIES[activeItem.product_family]?.materials || []).map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Thickness / GSM</label>
                    <input 
                      type="text"
                      value={activeItem.material.gsm_or_micron || ''}
                      onChange={(e) => updateActiveItem({
                        material: { ...activeItem.material, gsm_or_micron: e.target.value }
                      })}
                      placeholder="e.g., 280 GSM or 120 µm"
                      className="w-full bg-bg-card border border-border-strong rounded px-3 py-1.5 text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2 flex items-center gap-2 pt-1">
                    <input 
                      type="checkbox"
                      id="food_grade_check"
                      checked={activeItem.material.food_grade}
                      onChange={(e) => updateActiveItem({
                        material: { ...activeItem.material, food_grade: e.target.checked }
                      })}
                      className="rounded text-brand-primary focus:ring-brand-primary"
                    />
                    <label htmlFor="food_grade_check" className="text-xs text-text-primary cursor-pointer">
                      Food-Grade Contact Certification Required (Direct Food Contact)
                    </label>
                  </div>
                </div>
              </Card>

              {/* 5.3 PRINTING & FINISHING */}
              <Card className="p-5 space-y-4 border border-border-strong bg-bg-card">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-brand-primary" />
                  <h3 className="text-sm font-semibold text-text-primary">5.3 Printing & Branding</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Printing Requirement</label>
                    <select
                      value={activeItem.printing.print_type}
                      onChange={(e) => updateActiveItem({
                        printing: { ...activeItem.printing, print_type: e.target.value as any }
                      })}
                      className="w-full bg-bg-card border border-border-strong rounded px-3 py-1.5 text-sm"
                    >
                      <option value="plain">Plain / Unprinted</option>
                      <option value="existing_artwork">Printed with Existing Artwork</option>
                      <option value="modified_artwork">Printed with Modified Artwork</option>
                      <option value="new_artwork">Printed with New Artwork</option>
                      <option value="decide_later">To Be Decided Later</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Number of Printed Sides</label>
                    <input 
                      type="number"
                      min={0}
                      max={6}
                      value={activeItem.printing.surfaces || 0}
                      onChange={(e) => updateActiveItem({
                        printing: { ...activeItem.printing, surfaces: Number(e.target.value) }
                      })}
                      className="w-full bg-bg-card border border-border-strong rounded px-3 py-1.5 text-sm"
                    />
                  </div>
                </div>
              </Card>

              {/* 5.5 QUANTITY & MOQ WARNING */}
              <Card className="p-5 space-y-4 border border-border-strong bg-bg-card">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-text-primary">5.5 Quantity & Order Volume</h3>
                  {(() => {
                    const matchedProd = products.find(p => p.id === activeItem.product_id);
                    const moq = matchedProd?.moq || PRODUCT_FAMILIES[activeItem.product_family]?.defaultMoq || 1000;
                    return (
                      <span className="text-xs text-text-muted">
                        Reference MOQ: <strong className="text-text-primary">{moq.toLocaleString()} units</strong>
                      </span>
                    );
                  })()}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Quantity Requested *</label>
                    <input 
                      type="number"
                      min={1}
                      value={activeItem.quantity || ''}
                      onChange={(e) => updateActiveItem({ quantity: Number(e.target.value) || 0 })}
                      placeholder="e.g., 5000"
                      className="w-full bg-bg-card border border-border-strong rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-brand-primary/40 font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Quantity Status</label>
                    <select
                      value={activeItem.quantity_status}
                      onChange={(e) => updateActiveItem({ quantity_status: e.target.value as any })}
                      className="w-full bg-bg-card border border-border-strong rounded px-3 py-1.5 text-sm"
                    >
                      <option value="confirmed">Confirmed by Customer</option>
                      <option value="estimated">Estimated / In Discussion</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Repeat Frequency</label>
                    <select
                      value={activeItem.repeat_frequency || 'One-off'}
                      onChange={(e) => updateActiveItem({ repeat_frequency: e.target.value })}
                      className="w-full bg-bg-card border border-border-strong rounded px-3 py-1.5 text-sm"
                    >
                      <option value="One-off">One-off Order</option>
                      <option value="Monthly">Monthly Repeat</option>
                      <option value="Quarterly">Quarterly Repeat</option>
                      <option value="Annual">Annual Supply</option>
                    </select>
                  </div>
                </div>

                {/* MOQ WARNING BANNER */}
                {(() => {
                  const matchedProd = products.find(p => p.id === activeItem.product_id);
                  const moq = matchedProd?.moq || PRODUCT_FAMILIES[activeItem.product_family]?.defaultMoq || 1000;
                  if (activeItem.quantity > 0 && activeItem.quantity < moq) {
                    return (
                      <div className="p-3.5 rounded bg-color-warning/10 border border-color-warning/30 flex items-start gap-3 animate-in fade-in">
                        <AlertTriangle className="w-5 h-5 text-color-warning shrink-0 mt-0.5" />
                        <div className="text-xs space-y-1 text-text-primary">
                          <p className="font-semibold text-color-warning">Quantity is below confirmed MOQ ({moq.toLocaleString()} units)</p>
                          <p className="text-text-secondary leading-relaxed">
                            The requested volume ({activeItem.quantity.toLocaleString()} units) is lower than the validated factory run. You can still submit this request for technical and pricing assessment; it will be flagged for commercial review.
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
              </Card>
            </div>
          )}

          {/* STEP 6: ARTWORK & DESIGN */}
          {currentStep === 6 && (
            <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Step 6 of 9</span>
                <h2 className="text-2xl font-medium text-text-primary">Artwork & Design Requirements</h2>
                <p className="text-sm text-text-secondary mt-1">
                  Does the client have print-ready artwork, logos, reference samples, or is design development needed?
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Artwork Status</label>
                  <select
                    value={draft.artwork.status}
                    onChange={(e) => updateDraft({
                      artwork: { ...draft.artwork, status: e.target.value as any }
                    })}
                    className="w-full bg-bg-card border border-border-strong rounded px-3 py-2 text-sm focus:ring-2 focus:ring-brand-primary/40"
                  >
                    <option value="existing_approved">Existing Approved Artwork (Unchanged)</option>
                    <option value="existing_modified">Existing Artwork Needing Modification</option>
                    <option value="new_artwork">New Artwork Required (Design Brief)</option>
                    <option value="reference_only">Reference Sample / Photo Only</option>
                    <option value="no_artwork">No Artwork Yet (Customer to Provide)</option>
                    <option value="not_applicable">Not Applicable (Plain / Unprinted)</option>
                  </select>
                </div>

                {/* File Upload Zone */}
                <div className="p-6 rounded-lg border-2 border-dashed border-border-strong bg-bg-card text-center space-y-2 hover:border-brand-primary transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-text-muted mx-auto" />
                  <p className="text-sm font-medium text-text-primary">
                    {draft.artwork.file_name ? `Attached: ${draft.artwork.file_name}` : 'Click or Drag files to attach artwork / references'}
                  </p>
                  <p className="text-xs text-text-muted">PDF, AI, EPS, PNG up to 50MB</p>
                  <input 
                    type="file"
                    className="hidden"
                    id="artwork_upload"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        updateDraft({
                          artwork: {
                            ...draft.artwork,
                            file_name: file.name,
                            file_url: URL.createObjectURL(file),
                          }
                        });
                      }
                    }}
                  />
                  <label htmlFor="artwork_upload" className="inline-block mt-2">
                    <span className="px-3 py-1.5 text-xs font-semibold rounded bg-bg-secondary border border-border-strong hover:bg-bg-card cursor-pointer">
                      Browse Files
                    </span>
                  </label>
                </div>

                {/* Design Brief Textarea */}
                {(draft.artwork.status === 'new_artwork' || draft.artwork.status === 'existing_modified') && (
                  <div className="space-y-3 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                        Design Brief & Branding Notes
                      </label>
                      <textarea 
                        rows={3}
                        value={draft.artwork.design_brief || ''}
                        onChange={(e) => updateDraft({
                          artwork: { ...draft.artwork, design_brief: e.target.value }
                        })}
                        placeholder="Specify color codes (Pantone/CMYK), logo placement, text changes, or finishing..."
                        className="w-full bg-bg-card border border-border-strong rounded px-3 py-2 text-sm focus:ring-2 focus:ring-brand-primary/40"
                      />
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={draft.artwork.brand_guidelines_available}
                          onChange={(e) => updateDraft({
                            artwork: { ...draft.artwork, brand_guidelines_available: e.target.checked }
                          })}
                          className="rounded text-brand-primary focus:ring-brand-primary"
                        />
                        <span>Client Provided Brand Guidelines</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={draft.artwork.mockup_required}
                          onChange={(e) => updateDraft({
                            artwork: { ...draft.artwork, mockup_required: e.target.checked }
                          })}
                          className="rounded text-brand-primary focus:ring-brand-primary"
                        />
                        <span>3D Mockup / Digital Proof Required</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 7: DELIVERY & TIMEFRAME */}
          {currentStep === 7 && (
            <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Step 7 of 9</span>
                <h2 className="text-2xl font-medium text-text-primary">Delivery & Logistics</h2>
                <p className="text-sm text-text-secondary mt-1">
                  Specify expected timeline, urgency, delivery location, and sales follow-up notes.
                </p>
              </div>

              <Card className="p-6 space-y-4 border border-border-strong bg-bg-card">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Requested Delivery Date</label>
                    <input 
                      type="date"
                      value={draft.delivery.requested_date || ''}
                      onChange={(e) => updateDraft({
                        delivery: { ...draft.delivery, requested_date: e.target.value }
                      })}
                      className="w-full bg-bg-card border border-border-strong rounded px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Urgency Level</label>
                    <select
                      value={draft.delivery.urgency}
                      onChange={(e) => updateDraft({
                        delivery: { ...draft.delivery, urgency: e.target.value as any }
                      })}
                      className="w-full bg-bg-card border border-border-strong rounded px-3 py-2 text-sm"
                    >
                      <option value="normal">Standard Production (15-20 working days)</option>
                      <option value="high">High Priority (10-14 working days)</option>
                      <option value="urgent">Urgent / Express Run (Subject to factory schedule)</option>
                    </select>
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Delivery Destination</label>
                    <input 
                      type="text"
                      value={draft.delivery.delivery_location || draft.client?.delivery_address || ''}
                      onChange={(e) => updateDraft({
                        delivery: { ...draft.delivery, delivery_location: e.target.value }
                      })}
                      placeholder="Delivery site address / Warehouse depot"
                      className="w-full bg-bg-card border border-border-strong rounded px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Internal Salesperson Notes</label>
                    <textarea 
                      rows={2}
                      value={draft.delivery.internal_notes || ''}
                      onChange={(e) => updateDraft({
                        delivery: { ...draft.delivery, internal_notes: e.target.value }
                      })}
                      placeholder="Notes for production management or pricing calculations..."
                      className="w-full bg-bg-card border border-border-strong rounded px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* STEP 8: SMART VALIDATION & COMPLETENESS */}
          {currentStep === 8 && (
            <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Step 8 of 9</span>
                <h2 className="text-2xl font-medium text-text-primary">Completeness & Smart Validation</h2>
                <p className="text-sm text-text-secondary mt-1">
                  Review completeness before submitting. Warnings will not block your submission if information is pending follow-up.
                </p>
              </div>

              {/* Completeness Bar */}
              <Card className="p-5 space-y-3 border border-border-strong bg-bg-card">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span>Request Completeness Score</span>
                  <span className="text-brand-primary">{validation.score}%</span>
                </div>
                <div className="w-full bg-border-subtle h-2.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      validation.score >= 80 ? 'bg-color-success' : validation.score >= 50 ? 'bg-color-warning' : 'bg-brand-primary'
                    }`}
                    style={{ width: `${validation.score}%` }}
                  />
                </div>
              </Card>

              {/* Status Breakdown Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {validation.checklist.map((item, idx) => (
                  <div key={idx} className="p-3 bg-bg-card border border-border-subtle rounded flex items-center justify-between">
                    <span className="text-text-secondary font-medium">{item.label}</span>
                    <Badge variant={item.isComplete ? 'success' : item.isWarning ? 'warning' : 'neutral'}>
                      {item.statusText}
                    </Badge>
                  </div>
                ))}
              </div>

              {/* Blocking Errors */}
              {validation.blockingErrors.length > 0 && (
                <div className="p-4 rounded-lg bg-color-error/10 border border-color-error/30 space-y-2">
                  <div className="flex items-center gap-2 text-color-error font-semibold text-xs">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Blocking Requirements (Must be resolved before submission)</span>
                  </div>
                  <ul className="list-disc list-inside text-xs text-text-primary space-y-1">
                    {validation.blockingErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Non-blocking Warnings */}
              {validation.warnings.length > 0 && (
                <div className="p-4 rounded-lg bg-color-warning/10 border border-color-warning/30 space-y-2">
                  <div className="flex items-center gap-2 text-color-warning font-semibold text-xs">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Advisory Warnings (Follow-up required during workflow)</span>
                  </div>
                  <ul className="list-disc list-inside text-xs text-text-secondary space-y-1">
                    {validation.warnings.map((warn, i) => (
                      <li key={i}>{warn}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* STEP 9: FINAL REVIEW & SUBMISSION */}
          {currentStep === 9 && (
            <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Step 9 of 9</span>
                <h2 className="text-2xl font-medium text-text-primary">Review & Submit Request</h2>
                <p className="text-sm text-text-secondary mt-1">
                  Inspect the structured summary. You can save as a draft or submit directly to the sales pipeline.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                {/* Brand & Project Card */}
                <Card className="p-4 space-y-2 border border-border-strong bg-bg-card">
                  <div className="flex justify-between items-center">
                    <span className="font-bold uppercase tracking-wider text-text-muted text-[10px]">1. Project Details</span>
                    <button onClick={() => setCurrentStep(1)} className="text-brand-primary font-medium hover:underline">Edit</button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-text-primary">
                    <p><span className="text-text-muted">Brand:</span> <strong>{draft.brand}</strong></p>
                    <p><span className="text-text-muted">Title:</span> {draft.project_name}</p>
                    <p><span className="text-text-muted">Request Type:</span> <Badge variant="brand">{draft.request_type}</Badge></p>
                  </div>
                </Card>

                {/* Customer Card */}
                <Card className="p-4 space-y-2 border border-border-strong bg-bg-card">
                  <div className="flex justify-between items-center">
                    <span className="font-bold uppercase tracking-wider text-text-muted text-[10px]">2. Customer Details</span>
                    <button onClick={() => setCurrentStep(2)} className="text-brand-primary font-medium hover:underline">Edit</button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-text-primary">
                    <p><span className="text-text-muted">Company:</span> <strong>{draft.client?.company_name || 'Not Selected'}</strong></p>
                    <p><span className="text-text-muted">Contact:</span> {draft.client?.contact_name || 'N/A'}</p>
                    <p><span className="text-text-muted">Phone:</span> {draft.client?.contact_phone || 'N/A'}</p>
                    <p><span className="text-text-muted">Location:</span> {draft.client?.location_type || 'Local'}</p>
                  </div>
                </Card>

                {/* Technical Specifications Card */}
                <Card className="p-4 space-y-2 border border-border-strong bg-bg-card">
                  <div className="flex justify-between items-center">
                    <span className="font-bold uppercase tracking-wider text-text-muted text-[10px]">3. Technical Specifications</span>
                    <button onClick={() => setCurrentStep(5)} className="text-brand-primary font-medium hover:underline">Edit</button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-text-primary">
                    <p><span className="text-text-muted">Family:</span> {PRODUCT_FAMILIES[activeItem.product_family]?.label || 'Custom'}</p>
                    <p><span className="text-text-muted">Quantity:</span> <strong>{activeItem.quantity.toLocaleString()} units</strong> ({activeItem.quantity_status})</p>
                    <p><span className="text-text-muted">Dimensions:</span> {activeItem.dimensions.width || 0} x {activeItem.dimensions.length || 0} x {activeItem.dimensions.height || 0} {activeItem.dimensions.unit} ({activeItem.dimensions.status})</p>
                    <p><span className="text-text-muted">Material:</span> {activeItem.material.material_type || 'TBD'} ({activeItem.material.status})</p>
                    <p><span className="text-text-muted">Printing:</span> {activeItem.printing.print_type}</p>
                    <p><span className="text-text-muted">Food Grade:</span> {activeItem.material.food_grade ? 'Yes (Certified)' : 'No'}</p>
                  </div>
                </Card>

                {/* Artwork & Delivery Card */}
                <Card className="p-4 space-y-2 border border-border-strong bg-bg-card">
                  <div className="flex justify-between items-center">
                    <span className="font-bold uppercase tracking-wider text-text-muted text-[10px]">4. Artwork & Delivery</span>
                    <button onClick={() => setCurrentStep(6)} className="text-brand-primary font-medium hover:underline">Edit</button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-text-primary">
                    <p><span className="text-text-muted">Artwork Status:</span> {draft.artwork.status}</p>
                    <p><span className="text-text-muted">Attached File:</span> {draft.artwork.file_name || 'None'}</p>
                    <p><span className="text-text-muted">Target Date:</span> {draft.delivery.requested_date || 'Flexible'}</p>
                    <p><span className="text-text-muted">Urgency:</span> {draft.delivery.urgency}</p>
                  </div>
                </Card>
              </div>

              {/* Actions Box */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-border-subtle">
                <Button 
                  variant="secondary" 
                  onClick={async () => {
                    await handleManualSaveDraft();
                    onClose();
                  }}
                >
                  <Save className="w-4 h-4 mr-2" /> Save & Exit as Draft
                </Button>
                <Button 
                  onClick={handleSubmitFinal}
                  disabled={validation.blockingErrors.length > 0}
                >
                  <Check className="w-4 h-4 mr-2" /> Submit Sales Request
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM STEP CONTROLS */}
        <div className="bg-bg-card border-t border-border-subtle px-6 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            disabled={currentStep === 0}
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Previous
          </Button>

          <div className="flex items-center gap-1.5">
            {stepsList.map(s => (
              <button
                key={s.num}
                onClick={() => setCurrentStep(s.num)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  currentStep === s.num 
                    ? 'w-6 bg-brand-primary' 
                    : s.num < currentStep 
                    ? 'bg-brand-primary-light' 
                    : 'bg-border-strong'
                }`}
                title={s.label}
              />
            ))}
          </div>

          {currentStep < 9 ? (
            <Button
              size="sm"
              onClick={() => {
                // Minor step validations
                if (currentStep === 1 && !draft.project_name.trim()) {
                  alert('Please enter a request title.');
                  return;
                }
                if (currentStep === 2 && !draft.client_id) {
                  alert('Please select or register a customer before proceeding.');
                  return;
                }
                setCurrentStep(prev => Math.min(9, prev + 1));
              }}
            >
              Continue <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleSubmitFinal}
              disabled={validation.blockingErrors.length > 0}
            >
              Submit Request <Check className="w-4 h-4 ml-1.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// HELPER FUNCTIONS & FACTORIES
// ----------------------------------------------------------------------------

function createInitialItem(family: ProductFamily): ProjectItemSpec {
  return {
    id: crypto.randomUUID(),
    item_type: 'new_standard',
    product_family: family,
    description: '',
    quantity: 5000,
    quantity_status: 'estimated',
    dimensions: {
      width: undefined,
      length: undefined,
      height: undefined,
      unit: 'mm',
      dimension_type: 'internal',
      status: 'approximate',
    },
    material: {
      material_type: '',
      food_grade: false,
      status: 'pending_review',
    },
    printing: {
      print_type: 'new_artwork',
      surfaces: 1,
      artwork_ready: false,
      status: 'pending_review',
    },
    technical_status: 'pending_review',
  };
}

function createInitialDraft(brand: BrandUnit): SalesProjectDraft {
  const family = brand === 'Explast' ? 'plastic_sack' : 'paper_bag';
  return {
    id: crypto.randomUUID(),
    project_name: 'New Packaging Request',
    brand: brand,
    is_new_client: false,
    request_type: 'new_standard',
    items: [createInitialItem(family)],
    artwork: {
      status: 'new_artwork',
      brand_guidelines_available: false,
      mockup_required: true,
    },
    delivery: {
      is_flexible: true,
      urgency: 'normal',
    },
    current_step: 0,
    is_submitted: false,
    request_status: 'draft',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function evaluateCompleteness(draft: SalesProjectDraft) {
  const blockingErrors: string[] = [];
  const warnings: string[] = [];
  const checklist: { label: string; isComplete: boolean; isWarning: boolean; statusText: string }[] = [];

  let score = 0;

  // 1. Client Check
  if (!draft.client_id) {
    blockingErrors.push('Customer is not selected or registered.');
    checklist.push({ label: 'Customer Details', isComplete: false, isWarning: false, statusText: 'Missing' });
  } else {
    score += 20;
    checklist.push({ label: 'Customer Details', isComplete: true, isWarning: false, statusText: 'Selected' });
  }

  // 2. Product Selection
  const active = draft.items[0];
  if (!active || (!active.product_id && !active.description && draft.request_type !== 'concept')) {
    blockingErrors.push('Product selection or description is required.');
    checklist.push({ label: 'Product Selection', isComplete: false, isWarning: false, statusText: 'Incomplete' });
  } else {
    score += 20;
    checklist.push({ label: 'Product Selection', isComplete: true, isWarning: false, statusText: 'Complete' });
  }

  // 3. Dimensions
  if (active?.dimensions?.width && active?.dimensions?.length) {
    score += 15;
    if (active.dimensions.status === 'confirmed') {
      checklist.push({ label: 'Dimensions', isComplete: true, isWarning: false, statusText: 'Confirmed' });
    } else {
      warnings.push(`Dimensions are marked as ${active.dimensions.status}; require client confirmation.`);
      checklist.push({ label: 'Dimensions', isComplete: false, isWarning: true, statusText: active.dimensions.status });
    }
  } else if (draft.request_type === 'concept') {
    checklist.push({ label: 'Dimensions', isComplete: true, isWarning: false, statusText: 'Pending Concept' });
  } else {
    warnings.push('Packaging dimensions are not fully specified.');
    checklist.push({ label: 'Dimensions', isComplete: false, isWarning: true, statusText: 'Unconfirmed' });
  }

  // 4. Material
  if (active?.material?.material_type) {
    score += 15;
    checklist.push({ label: 'Material & Construction', isComplete: true, isWarning: false, statusText: active.material.material_type });
  } else {
    warnings.push('Material type has not yet been selected.');
    checklist.push({ label: 'Material & Construction', isComplete: false, isWarning: true, statusText: 'Not Selected' });
  }

  // 5. Quantity & MOQ
  if (active?.quantity > 0) {
    score += 15;
    const moq = PRODUCT_FAMILIES[active.product_family]?.defaultMoq || 1000;
    if (active.quantity < moq) {
      warnings.push(`Requested quantity (${active.quantity.toLocaleString()}) is below the standard factory MOQ (${moq.toLocaleString()}). Requires review.`);
      checklist.push({ label: 'Quantity & MOQ', isComplete: false, isWarning: true, statusText: 'Below MOQ' });
    } else {
      checklist.push({ label: 'Quantity & MOQ', isComplete: true, isWarning: false, statusText: `${active.quantity.toLocaleString()} units` });
    }
  } else {
    blockingErrors.push('Requested quantity must be greater than zero.');
    checklist.push({ label: 'Quantity & MOQ', isComplete: false, isWarning: false, statusText: 'Zero' });
  }

  // 6. Artwork
  if (draft.artwork?.status) {
    score += 10;
    if (draft.artwork.file_name) {
      checklist.push({ label: 'Artwork & Files', isComplete: true, isWarning: false, statusText: 'Attached' });
    } else if (draft.artwork.status === 'new_artwork' || draft.artwork.status === 'no_artwork') {
      warnings.push('Artwork file not yet attached (customer to supply or design pending).');
      checklist.push({ label: 'Artwork & Files', isComplete: false, isWarning: true, statusText: 'Pending File' });
    } else {
      checklist.push({ label: 'Artwork & Files', isComplete: true, isWarning: false, statusText: draft.artwork.status });
    }
  }

  // 7. Delivery
  if (draft.delivery?.requested_date) {
    score += 5;
    checklist.push({ label: 'Delivery Timeframe', isComplete: true, isWarning: false, statusText: draft.delivery.requested_date });
  } else {
    checklist.push({ label: 'Delivery Timeframe', isComplete: false, isWarning: true, statusText: 'Flexible / TBD' });
  }

  return {
    score: Math.min(100, score),
    blockingErrors,
    warnings,
    checklist,
  };
}
