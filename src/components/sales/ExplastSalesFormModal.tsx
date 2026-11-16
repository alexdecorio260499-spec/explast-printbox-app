'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Check, AlertTriangle, ArrowRight, ArrowLeft, Save, 
  Search, Plus, FileText, Upload, Building, User, 
  Calendar, Clock, ShieldAlert, CheckCircle2, ChevronRight,
  Package, Palette, Truck, Layers, RefreshCw, Scissors, Repeat,
  FileSpreadsheet, Sparkles
} from 'lucide-react';
import { Client } from '@/types/sales';
import { 
  ExplastMaterialFamily, 
  ExplastMaterialGrade, 
  ExplastFormulation, 
  ExplastFinalProductType,
  ExplastSalesDraft,
  ExplastTechAssessmentStatus,
} from '@/types/explast';
import { 
  EXPLAST_HIERARCHY, 
  EXPLAST_FINAL_PRODUCT_TYPES, 
  getFormulationsForFamilyAndGrade, 
  evaluateExplastQuotationReadiness,
  createInitialExplastDraft 
} from '@/lib/sales/explast-data';
import { ExplastSalesService } from '@/lib/sales/explast-service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface ExplastSalesFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (projectId: string) => void;
  resumeDraftId?: string;
}

export function ExplastSalesFormModal({
  isOpen,
  onClose,
  onSuccess,
  resumeDraftId,
}: ExplastSalesFormModalProps) {
  // Current step (0 to 10)
  const [currentStep, setCurrentStep] = useState<number>(0);

  // Data states
  const [clients, setClients] = useState<Client[]>([]);
  const [clientHistory, setClientHistory] = useState<any[]>([]);
  const [savedDrafts, setSavedDrafts] = useState<ExplastSalesDraft[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Form State
  const [draft, setDraft] = useState<ExplastSalesDraft>(() => createInitialExplastDraft());

  // Customer UI State
  const [clientSearch, setClientSearch] = useState('');
  const [newClientMode, setNewClientMode] = useState(false);
  const [repeatModeChoice, setRepeatModeChoice] = useState<'prompt' | 'repeat' | 'modified' | 'new'>('prompt');
  const [selectedHistoricalProject, setSelectedHistoricalProject] = useState<any | null>(null);

  // Step 1 New Client Registration Fields
  const [newClientData, setNewClientData] = useState({
    company_name: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    industry: 'Industrial',
    location_type: 'Local (Mauritius)',
    delivery_address: '',
    notes: '',
  });

  // Quotation readiness evaluation
  const readiness = useMemo(() => evaluateExplastQuotationReadiness(draft), [draft]);

  // Load clients and drafts on open
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const [loadedClients] = await Promise.all([
          ExplastSalesService.getClients(),
        ]);
        if (isMounted) {
          setClients(loadedClients);
          setSavedDrafts(ExplastSalesService.getDrafts());

          if (resumeDraftId) {
            const existing = ExplastSalesService.getDraft(resumeDraftId);
            if (existing) {
              setDraft(existing);
              setCurrentStep(existing.current_step || 1);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load initial Explast sales data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [isOpen, resumeDraftId]);

  // Load customer Explast history when client is selected
  useEffect(() => {
    if (draft.client_id) {
      ExplastSalesService.getClientExplastHistory(draft.client_id).then(history => {
        setClientHistory(history);
      });
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
        await ExplastSalesService.saveDraft({ ...draft, current_step: currentStep });
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (e) {
        setSaveStatus('error');
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [draft, currentStep]);

  if (!isOpen) return null;

  function updateDraft(updater: Partial<ExplastSalesDraft> | ((prev: ExplastSalesDraft) => ExplastSalesDraft)) {
    setDraft(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      return next;
    });
  }

  async function handleManualSaveDraft() {
    setSaveStatus('saving');
    try {
      await ExplastSalesService.saveDraft({ ...draft, current_step: currentStep });
      setSaveStatus('saved');
      setSavedDrafts(ExplastSalesService.getDrafts());
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (e) {
      setSaveStatus('error');
    }
  }

  async function handleSubmitFinal() {
    if (readiness.missing_requirements.length > 0) {
      alert('Cannot submit request. Please resolve missing requirements:\n• ' + readiness.missing_requirements.join('\n• '));
      return;
    }
    setSaveStatus('saving');
    try {
      const res = await ExplastSalesService.submitExplastProject({
        ...draft,
        is_submitted: true,
        status: draft.technical_assessment?.status === 'approved' ? 'ready_for_quotation' : 'submitted',
      });
      if (res.success) {
        onSuccess(res.projectId);
        onClose();
      }
    } catch (e) {
      alert('Failed to submit Explast project. Draft is safely stored locally.');
      setSaveStatus('error');
    }
  }

  // Steps definition for Explast Manufacturing Flow
  const stepsList = [
    { num: 0, label: 'Entry' },
    { num: 1, label: 'Customer' },
    { num: 2, label: 'Project Info' },
    { num: 3, label: 'Material Family' },
    { num: 4, label: 'Grade / Formulation' },
    { num: 5, label: 'Extrusion & Print' },
    { num: 6, label: 'Final Product' },
    { num: 7, label: 'Technical Specs' },
    { num: 8, label: 'Assessment' },
    { num: 9, label: 'Review & Quotation' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div 
        data-brand="explast"
        className="bg-bg-page w-full max-w-5xl rounded-xl border border-border-strong shadow-2xl flex flex-col max-h-[94vh] overflow-hidden text-text-primary font-sans"
      >
        {/* HEADER BAR */}
        <div className="bg-bg-card border-b border-border-subtle px-6 py-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded bg-[#DDF2EF] text-[#0F625F]">
                EXPLAST MANUFACTURING
              </span>
              <div>
                <h2 className="text-sm font-semibold text-text-primary truncate max-w-md">
                  {draft.project_name || 'New Explast Packaging Request'}
                </h2>
                <p className="text-[11px] text-text-muted">
                  Step {currentStep} of 9 — {stepsList.find(s => s.num === currentStep)?.label}
                </p>
              </div>
            </div>

            {/* Save Status & Close */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 text-xs">
                {saveStatus === 'saving' && (
                  <span className="flex items-center gap-1 text-text-muted">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving draft...
                  </span>
                )}
                {saveStatus === 'saved' && (
                  <span className="flex items-center gap-1 text-[#168C86] font-medium">
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
                  type="button"
                  onClick={handleManualSaveDraft}
                  className="px-3 py-1.5 text-xs font-medium rounded border border-border-strong bg-bg-card text-text-secondary hover:bg-bg-secondary flex items-center gap-1.5 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" /> Save Draft
                </button>
              )}

              <button
                type="button"
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
              className="bg-[#168C86] h-full transition-all duration-300 ease-out"
              style={{ width: `${(currentStep / 9) * 100}%` }}
            />
          </div>
        </div>

        {/* STEP CONTENT BODY */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">

          {/* ================================================================= */}
          {/* STEP 0: ENTRY POINT & SAVED DRAFTS                                */}
          {/* ================================================================= */}
          {currentStep === 0 && (
            <div className="space-y-6 max-w-2xl mx-auto py-4 animate-in fade-in">
              <div className="text-center space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#168C86]">
                  Extrusion, Printing & Converting
                </span>
                <h1 className="text-2xl sm:text-3xl font-medium text-text-primary">
                  Explast Sales Request Workflow
                </h1>
                <p className="text-sm text-text-secondary">
                  Create an adaptive sales and manufacturing request for LDPE, MDPE, or PP film packaging.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <Card 
                  onClick={() => setCurrentStep(1)}
                  className="cursor-pointer border-2 border-border-strong hover:border-[#168C86] transition-all p-6 text-center space-y-3 group"
                >
                  <div className="w-12 h-12 rounded-full bg-[#DDF2EF] text-[#168C86] flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                    <Plus className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-text-primary text-base">New Explast Request</h3>
                  <p className="text-xs text-text-secondary">
                    Guide through customer history, material formulation, plain rolls from extrusion, printing, and bag/roll conversion.
                  </p>
                </Card>

                <Card className="border border-border-strong p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Active Drafts</span>
                    <Badge variant="neutral">{savedDrafts.length}</Badge>
                  </div>
                  {savedDrafts.length === 0 ? (
                    <div className="text-center py-6 text-xs text-text-muted">
                      No saved drafts found.
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
                          className="p-2.5 rounded border border-border-subtle hover:border-[#168C86] bg-bg-card hover:bg-[#DDF2EF]/30 cursor-pointer flex justify-between items-center text-left transition-colors"
                        >
                          <div className="truncate pr-2">
                            <p className="text-xs font-medium text-text-primary truncate">{d.project_name || 'Untitled Draft'}</p>
                            <p className="text-[10px] text-text-muted">{d.formulation} • {new Date(d.updated_at).toLocaleDateString()}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#168C86] shrink-0" />
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* STEP 1: CUSTOMER IDENTIFICATION & HISTORICAL SPECIFICATIONS       */}
          {/* ================================================================= */}
          {currentStep === 1 && (
            <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Step 1 of 9</span>
                <h2 className="text-2xl font-medium text-text-primary">Customer Identification</h2>
                <p className="text-sm text-text-secondary mt-1">
                  Is this an existing Explast customer or a new customer?
                </p>
              </div>

              {/* Mode Toggle */}
              <div className="flex gap-3 border-b border-border-subtle pb-4">
                <button
                  type="button"
                  onClick={() => setNewClientMode(false)}
                  className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-md transition-colors ${
                    !newClientMode 
                      ? 'bg-[#168C86] text-white' 
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
                      ? 'bg-[#168C86] text-white' 
                      : 'bg-bg-card border border-border-strong text-text-secondary hover:bg-bg-secondary'
                  }`}
                >
                  + New Customer Registration
                </button>
              </div>

              {!newClientMode ? (
                /* EXISTING CUSTOMER PATH */
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="w-4 h-4 text-text-muted absolute left-3 top-3" />
                    <input 
                      type="text"
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                      placeholder="Search existing client by company name, contact, phone, or email..."
                      className="w-full bg-bg-card border border-border-strong rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#168C86]/40"
                    />
                  </div>

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
                                project_name: draft.project_name.startsWith('New Explast Packaging Request') 
                                  ? `${c.company_name} - Explast Request` 
                                  : draft.project_name
                              });
                            }}
                            className={`p-4 rounded-lg border cursor-pointer transition-all ${
                              isSelected 
                                ? 'border-[#168C86] bg-[#DDF2EF]/20 ring-1 ring-[#168C86]' 
                                : 'border-border-subtle bg-bg-card hover:border-border-strong'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <h4 className="font-semibold text-sm text-text-primary">{c.company_name}</h4>
                              <Badge variant={isSelected ? 'brand' : 'neutral'}>{c.industry || 'Industrial'}</Badge>
                            </div>
                            <p className="text-xs text-text-secondary mt-1">{c.contact_name} • {c.contact_phone || c.contact_email}</p>
                          </div>
                        );
                      })}
                  </div>

                  {/* Selected Client Summary & Repeat Project Inquiry */}
                  {draft.client && (
                    <Card className="border-l-4 border-l-[#168C86] bg-bg-card p-5 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Selected Customer</span>
                          <h3 className="text-base font-semibold text-text-primary">{draft.client.company_name}</h3>
                          <p className="text-xs text-text-secondary">
                            {draft.client.contact_name} ({draft.client.contact_email} / {draft.client.contact_phone})
                          </p>
                        </div>
                        <Badge variant="brand">{draft.client.location_type || 'Local'}</Badge>
                      </div>

                      {/* Question: Has this product been previously manufactured or quoted? */}
                      <div className="pt-3 border-t border-border-subtle space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                            Is this a product previously manufactured or quoted for this customer?
                          </h4>
                          <span className="text-xs text-text-muted">
                            {clientHistory.length} Explast Record(s) Found
                          </span>
                        </div>

                        {clientHistory.length === 0 ? (
                          <div className="p-3 rounded bg-bg-secondary/60 text-xs text-text-secondary">
                            No prior Explast configurations on file for this customer. Proceeding with a new product configuration.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <p className="text-xs text-text-secondary">
                              Select a previous approved configuration below to repeat or modify:
                            </p>
                            <div className="space-y-2">
                              {clientHistory.map(hp => {
                                const isChosen = selectedHistoricalProject?.id === hp.id || draft.parent_project_id === hp.id;
                                return (
                                  <div 
                                    key={hp.id} 
                                    className={`p-3.5 rounded-lg border transition-all ${
                                      isChosen 
                                        ? 'border-[#168C86] bg-[#DDF2EF]/20' 
                                        : 'border-border-subtle bg-bg-secondary/40 hover:border-border-strong'
                                    }`}
                                  >
                                    <div className="flex justify-between items-start mb-1.5">
                                      <div>
                                        <p className="text-xs font-bold text-text-primary">{hp.project_name}</p>
                                        <p className="text-[11px] text-text-secondary">
                                          {hp.material_family} ({hp.material_grade || 'Standard'}) • {hp.formulation} • {hp.final_product_type} • {hp.print_type === 'printed' ? 'Printed' : 'Plain'}
                                        </p>
                                      </div>
                                      <Badge variant="success">Approved</Badge>
                                    </div>

                                    <div className="flex items-center gap-2 pt-2 border-t border-border-subtle/50 text-[11px]">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSelectedHistoricalProject(hp);
                                          // EXACT REPEAT PATH
                                          updateDraft({
                                            is_repeat: true,
                                            parent_project_id: hp.id,
                                            repeat_type: 'exact_repeat',
                                            material_family: hp.material_family,
                                            material_grade: hp.material_grade,
                                            formulation: hp.formulation,
                                            print_type: hp.print_type,
                                            final_product_type: hp.final_product_type,
                                            extrusion_spec: hp.extrusion_spec || draft.extrusion_spec,
                                            printing_spec: hp.printing_spec || draft.printing_spec,
                                            product_spec: hp.product_spec || draft.product_spec,
                                            technical_assessment: hp.technical_assessment || { status: 'approved' },
                                          });
                                          alert(`Loaded exact specifications from "${hp.project_name}". Previous approved technical assessment preserved.`);
                                        }}
                                        className="px-2.5 py-1 rounded bg-[#168C86] text-white font-medium hover:bg-[#0F625F] transition-colors"
                                      >
                                        Exact Repeat
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSelectedHistoricalProject(hp);
                                          // MODIFIED PROJECT PATH
                                          updateDraft({
                                            is_repeat: true,
                                            parent_project_id: hp.id,
                                            repeat_type: 'modified',
                                            material_family: hp.material_family,
                                            material_grade: hp.material_grade,
                                            formulation: hp.formulation,
                                            print_type: hp.print_type,
                                            final_product_type: hp.final_product_type,
                                            extrusion_spec: hp.extrusion_spec || draft.extrusion_spec,
                                            printing_spec: hp.printing_spec || draft.printing_spec,
                                            product_spec: hp.product_spec || draft.product_spec,
                                            technical_assessment: {
                                              status: 'awaiting_assessment',
                                              observations: `Modified configuration based on parent project ${hp.id}`,
                                            },
                                          });
                                          alert(`Loaded specifications from "${hp.project_name}" as base. Modified fields will be flagged for technical review.`);
                                        }}
                                        className="px-2.5 py-1 rounded bg-bg-card border border-border-strong text-text-primary hover:bg-bg-secondary font-medium transition-colors"
                                      >
                                        Modify Specifications
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  )}
                </div>
              ) : (
                /* NEW CUSTOMER ONBOARDING */
                <Card className="space-y-4 p-6 border border-border-strong bg-bg-card">
                  <h3 className="text-sm font-semibold text-text-primary">New Explast Customer Registration</h3>
                  {duplicateWarning && (
                    <div className="p-3 rounded bg-color-warning/10 border border-color-warning/30 text-xs text-color-warning flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{duplicateWarning}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Company / Legal Name *</label>
                      <input 
                        type="text" 
                        required
                        value={newClientData.company_name}
                        onChange={(e) => {
                          setNewClientData({ ...newClientData, company_name: e.target.value });
                          setDuplicateWarning(null);
                        }}
                        placeholder="Company Name"
                        className="w-full bg-bg-card border border-border-strong rounded px-3 py-2 text-sm focus:ring-2 focus:ring-[#168C86]/40"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Contact Person</label>
                      <input 
                        type="text" 
                        value={newClientData.contact_name}
                        onChange={(e) => setNewClientData({ ...newClientData, contact_name: e.target.value })}
                        placeholder="Primary Representative"
                        className="w-full bg-bg-card border border-border-strong rounded px-3 py-2 text-sm focus:ring-2 focus:ring-[#168C86]/40"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Email Address</label>
                      <input 
                        type="email" 
                        value={newClientData.contact_email}
                        onChange={(e) => setNewClientData({ ...newClientData, contact_email: e.target.value })}
                        placeholder="rep@company.mu"
                        className="w-full bg-bg-card border border-border-strong rounded px-3 py-2 text-sm focus:ring-2 focus:ring-[#168C86]/40"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Telephone</label>
                      <input 
                        type="tel" 
                        value={newClientData.contact_phone}
                        onChange={(e) => setNewClientData({ ...newClientData, contact_phone: e.target.value })}
                        placeholder="+230 5000 0000"
                        className="w-full bg-bg-card border border-border-strong rounded px-3 py-2 text-sm focus:ring-2 focus:ring-[#168C86]/40"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Business Sector</label>
                      <select
                        value={newClientData.industry}
                        onChange={(e) => setNewClientData({ ...newClientData, industry: e.target.value })}
                        className="w-full bg-bg-card border border-border-strong rounded px-3 py-2 text-sm focus:ring-2 focus:ring-[#168C86]/40"
                      >
                        <option value="Industrial">Industrial Manufacturing</option>
                        <option value="Food Service">Food Processing & Packaging</option>
                        <option value="Agriculture">Agriculture & Horticulture</option>
                        <option value="Retail">Commercial & Retail</option>
                        <option value="Textile">Textile Packaging</option>
                        <option value="Pharma">Pharmaceutical</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Location</label>
                      <select
                        value={newClientData.location_type}
                        onChange={(e) => setNewClientData({ ...newClientData, location_type: e.target.value })}
                        className="w-full bg-bg-card border border-border-strong rounded px-3 py-2 text-sm focus:ring-2 focus:ring-[#168C86]/40"
                      >
                        <option value="Local (Mauritius)">Local (Mauritius)</option>
                        <option value="Export (International)">Export (Indian Ocean / Africa)</option>
                      </select>
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Delivery Address</label>
                      <input 
                        type="text" 
                        value={newClientData.delivery_address}
                        onChange={(e) => setNewClientData({ ...newClientData, delivery_address: e.target.value })}
                        placeholder="Factory / Warehouse Location"
                        className="w-full bg-bg-card border border-border-strong rounded px-3 py-2 text-sm focus:ring-2 focus:ring-[#168C86]/40"
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
                        const res = await ExplastSalesService.createClient(newClientData);
                        if (res.isDuplicate) {
                          setDuplicateWarning(`Potential duplicate detected for "${res.client.company_name}".`);
                        }
                        updateDraft({
                          client_id: res.client.id,
                          client: res.client,
                          is_new_client: true,
                          project_name: `${res.client.company_name} - Explast Film Request`,
                        });
                        setClients(await ExplastSalesService.getClients());
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

          {/* ================================================================= */}
          {/* STEP 2: PROJECT TITLE & LOGISTICS                                 */}
          {/* ================================================================= */}
          {currentStep === 2 && (
            <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Step 2 of 9</span>
                <h2 className="text-2xl font-medium text-text-primary">Project Context & Delivery</h2>
                <p className="text-sm text-text-secondary mt-1">
                  Specify request title, target delivery timeframe, and internal operational notes.
                </p>
              </div>

              <Card className="p-6 space-y-4 border border-border-strong bg-bg-card">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Request / Project Name *</label>
                  <input 
                    type="text"
                    value={draft.project_name}
                    onChange={(e) => updateDraft({ project_name: e.target.value })}
                    placeholder="e.g., Industrial Sugar Sacks - 50kg Heavy Duty"
                    className="w-full bg-bg-card border border-border-strong rounded px-3 py-2 text-sm focus:ring-2 focus:ring-[#168C86]/40"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Requested Delivery Date</label>
                    <input 
                      type="date"
                      value={draft.requested_delivery_date || ''}
                      onChange={(e) => updateDraft({ requested_delivery_date: e.target.value })}
                      className="w-full bg-bg-card border border-border-strong rounded px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Urgency / Scheduling</label>
                    <select
                      value={draft.urgency}
                      onChange={(e) => updateDraft({ urgency: e.target.value as any })}
                      className="w-full bg-bg-card border border-border-strong rounded px-3 py-2 text-sm"
                    >
                      <option value="normal">Normal (Standard Extrusion Cycle)</option>
                      <option value="high">High Priority (Urgent Customer Schedule)</option>
                      <option value="urgent">Express Run (Factory Manager Authorization)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Internal Salesperson Notes</label>
                  <textarea 
                    rows={2}
                    value={draft.internal_notes || ''}
                    onChange={(e) => updateDraft({ internal_notes: e.target.value })}
                    placeholder="Specific extrusion requirements, palletizing specs, delivery instructions..."
                    className="w-full bg-bg-card border border-border-strong rounded px-3 py-2 text-sm focus:ring-2 focus:ring-[#168C86]/40"
                  />
                </div>
              </Card>
            </div>
          )}

          {/* ================================================================= */}
          {/* STEP 3: LEVEL 1 — MATERIAL FAMILY (LDPE, MDPE, PP)               */}
          {/* ================================================================= */}
          {currentStep === 3 && (
            <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Step 3 of 9 • Level 1</span>
                <h2 className="text-2xl font-medium text-text-primary">What Material Family is required?</h2>
                <p className="text-sm text-text-secondary mt-1">
                  Explast manufactures using three primary resin families: LDPE, MDPE, and PP.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(['LDPE', 'MDPE', 'PP'] as ExplastMaterialFamily[]).map(fam => {
                  const isSelected = draft.material_family === fam;
                  const meta = EXPLAST_HIERARCHY[fam];
                  return (
                    <div 
                      key={fam}
                      onClick={() => {
                        let defaultGrade: ExplastMaterialGrade | undefined;
                        let defaultFormulation: ExplastFormulation;

                        if (fam === 'LDPE') {
                          defaultGrade = 'Grade 2';
                          defaultFormulation = 'Grade 2 + Linear';
                        } else if (fam === 'MDPE') {
                          defaultGrade = undefined;
                          defaultFormulation = 'MDPE';
                        } else {
                          defaultGrade = 'Elpro';
                          defaultFormulation = 'PP - Elpro';
                        }

                        updateDraft({
                          material_family: fam,
                          material_grade: defaultGrade,
                          formulation: defaultFormulation,
                        });
                      }}
                      className={`p-5 rounded-lg border-2 cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected 
                          ? 'border-[#168C86] bg-[#DDF2EF]/25 ring-1 ring-[#168C86]' 
                          : 'border-border-subtle bg-bg-card hover:border-border-strong'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-base font-bold text-[#0F625F]">{fam}</span>
                          {isSelected && <CheckCircle2 className="w-5 h-5 text-[#168C86]" />}
                        </div>
                        <h4 className="text-xs font-semibold text-text-primary">{meta.label}</h4>
                        <p className="text-xs text-text-secondary leading-relaxed">{meta.description}</p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-border-subtle/60 text-[11px] text-text-muted font-medium">
                        {fam === 'LDPE' && 'Grade 2 & Grade 4'}
                        {fam === 'MDPE' && '4 Specific Formulations'}
                        {fam === 'PP' && 'Elpro & Polimaxx'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* STEP 4: GRADE & FORMULATION SELECTION                            */}
          {/* ================================================================= */}
          {currentStep === 4 && (
            <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Step 4 of 9 • Level 2</span>
                <h2 className="text-2xl font-medium text-text-primary">
                  {draft.material_family} Formulation Selection
                </h2>
                <p className="text-sm text-text-secondary mt-1">
                  {draft.material_family === 'LDPE' && 'Select Grade (Grade 2 or Grade 4), then select the precise extrusion formulation.'}
                  {draft.material_family === 'PP' && 'Select Subfamily (Elpro or Polimaxx), then select the precise extrusion formulation.'}
                  {draft.material_family === 'MDPE' && 'Select from the 4 official MDPE extrusion formulations.'}
                </p>
              </div>

              {/* Sub-grade selector for LDPE */}
              {draft.material_family === 'LDPE' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Select LDPE Grade</label>
                  <div className="grid grid-cols-2 gap-4">
                    {(['Grade 2', 'Grade 4'] as const).map(grd => {
                      const isSelected = draft.material_grade === grd;
                      return (
                        <div 
                          key={grd}
                          onClick={() => {
                            const newFormulations = getFormulationsForFamilyAndGrade('LDPE', grd);
                            updateDraft({
                              material_grade: grd,
                              formulation: newFormulations[0] as ExplastFormulation,
                            });
                          }}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            isSelected 
                              ? 'border-[#168C86] bg-[#DDF2EF]/20 ring-1 ring-[#168C86]' 
                              : 'border-border-subtle bg-bg-card hover:border-border-strong'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-bold text-text-primary">{grd}</span>
                            {isSelected && <Check className="w-4 h-4 text-[#168C86]" />}
                          </div>
                          <p className="text-xs text-text-secondary">
                            {grd === 'Grade 2' ? 'General purpose & medium duty film' : 'High tensile strength & puncture resistance'}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sub-grade selector for PP */}
              {draft.material_family === 'PP' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Select PP Product Family</label>
                  <div className="grid grid-cols-2 gap-4">
                    {(['Elpro', 'Polimaxx'] as const).map(sub => {
                      const isSelected = draft.material_grade === sub;
                      return (
                        <div 
                          key={sub}
                          onClick={() => {
                            const newFormulations = getFormulationsForFamilyAndGrade('PP', sub);
                            updateDraft({
                              material_grade: sub,
                              formulation: newFormulations[0] as ExplastFormulation,
                            });
                          }}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            isSelected 
                              ? 'border-[#168C86] bg-[#DDF2EF]/20 ring-1 ring-[#168C86]' 
                              : 'border-border-subtle bg-bg-card hover:border-border-strong'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-bold text-text-primary">PP - {sub}</span>
                            {isSelected && <Check className="w-4 h-4 text-[#168C86]" />}
                          </div>
                          <p className="text-xs text-text-secondary">
                            {sub === 'Elpro' ? 'High gloss, ultra-clear display formulation' : 'High stiffness, engineered polypropylene'}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Formulation Choices (Strictly per official diagram) */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  Official Formulations ({draft.material_family} {draft.material_grade ? `• ${draft.material_grade}` : ''})
                </label>
                <div className="space-y-2.5">
                  {getFormulationsForFamilyAndGrade(draft.material_family, draft.material_grade).map(formStr => {
                    const isSelected = draft.formulation === formStr;
                    return (
                      <div 
                        key={formStr}
                        onClick={() => updateDraft({ formulation: formStr as ExplastFormulation })}
                        className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected 
                            ? 'border-[#168C86] bg-[#DDF2EF]/30 ring-1 ring-[#168C86]' 
                            : 'border-border-subtle bg-bg-card hover:border-border-strong'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <p className="text-sm font-semibold text-text-primary">{formStr}</p>
                          <div className="flex gap-2 text-[10px] text-text-muted">
                            {formStr.includes('Linear') && <span className="bg-bg-secondary px-1.5 py-0.5 rounded">+ Linear</span>}
                            {formStr.includes('Recycled') && <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-medium">+ Recycled</span>}
                            {formStr.includes('Masterbatch') && <span className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded font-medium">+ Masterbatch</span>}
                            {formStr.includes('OXO') && <span className="bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-medium">+ OXO Additive</span>}
                            {formStr.includes('UV') && <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-medium">+ UV Stabilizer</span>}
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-[#168C86] bg-[#168C86] text-white' : 'border-border-strong'
                        }`}>
                          {isSelected && <Check className="w-2.5 h-2.5" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* STEP 5: MANUFACTURING PROCESS: EXTRUSION & PLAIN VS PRINTED       */}
          {/* ================================================================= */}
          {currentStep === 5 && (
            <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Step 5 of 9 • Manufacturing Process</span>
                <h2 className="text-2xl font-medium text-text-primary">Plain Rolls from Extrusion</h2>
                <p className="text-sm text-text-secondary mt-1">
                  Extrusion creates the plain master rolls. Will the final product be supplied <strong>PLAIN</strong> or proceed through flexographic <strong>PRINTING</strong>?
                </p>
              </div>

              {/* Manufacturing Diagram Milestone Indicator */}
              <div className="p-4 rounded-lg bg-bg-secondary/70 border border-border-subtle flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#168C86] text-white flex items-center justify-center font-bold text-sm shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-text-primary">Extrusion Stage: Plain Rolls from Extrusion</p>
                  <p className="text-text-secondary">
                    Resin blend: <strong className="text-[#0F625F]">{draft.formulation}</strong>
                  </p>
                </div>
              </div>

              {/* PLAIN VS PRINTED Choice */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div 
                  onClick={() => updateDraft({ 
                    print_type: 'plain',
                    printing_spec: { ...draft.printing_spec, is_printed: false }
                  })}
                  className={`p-5 rounded-lg border-2 cursor-pointer transition-all ${
                    draft.print_type === 'plain'
                      ? 'border-[#168C86] bg-[#DDF2EF]/20 ring-1 ring-[#168C86]'
                      : 'border-border-subtle bg-bg-card hover:border-border-strong'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-text-primary uppercase tracking-wide">PLAIN</span>
                    {draft.print_type === 'plain' && <CheckCircle2 className="w-5 h-5 text-[#168C86]" />}
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Unprinted clear, natural, or solid coloured plastic. Directly routed from extrusion to bag converting or roll packaging.
                  </p>
                </div>

                <div 
                  onClick={() => updateDraft({ 
                    print_type: 'printed',
                    printing_spec: { ...draft.printing_spec, is_printed: true }
                  })}
                  className={`p-5 rounded-lg border-2 cursor-pointer transition-all ${
                    draft.print_type === 'printed'
                      ? 'border-[#6E4A9E] bg-[#EEE7F6]/25 ring-1 ring-[#6E4A9E]'
                      : 'border-border-subtle bg-bg-card hover:border-border-strong'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-text-primary uppercase tracking-wide">PRINTED</span>
                    {draft.print_type === 'printed' && <CheckCircle2 className="w-5 h-5 text-[#6E4A9E]" />}
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    High precision flexographic printing. Up to 8 colours supported depending on cylinder size and dimensions.
                  </p>
                </div>
              </div>

              {/* Conditional Printing Questions if PRINTED */}
              {draft.print_type === 'printed' && (
                <Card className="p-6 space-y-5 border border-border-strong bg-bg-card">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-[#6E4A9E]" />
                    <h3 className="text-sm font-semibold text-text-primary">Printing & Artwork Requirements</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                        Number of Printing Colours (1 to 8) *
                      </label>
                      <input 
                        type="number"
                        min={1}
                        max={8}
                        value={draft.printing_spec.num_colors}
                        onChange={(e) => {
                          const val = Math.max(1, Math.min(8, Number(e.target.value) || 1));
                          updateDraft({
                            printing_spec: {
                              ...draft.printing_spec,
                              num_colors: val,
                              feasibility_review_required: val > 4,
                            }
                          });
                        }}
                        className="w-full bg-bg-card border border-border-strong rounded px-3 py-1.5 text-sm font-semibold"
                      />
                      <p className="text-[10px] text-text-muted">Strict limit: 1 to 8 colors</p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Artwork Status</label>
                      <select
                        value={draft.printing_spec.artwork_status}
                        onChange={(e) => updateDraft({
                          printing_spec: {
                            ...draft.printing_spec,
                            artwork_status: e.target.value as any,
                          }
                        })}
                        className="w-full bg-bg-card border border-border-strong rounded px-3 py-1.5 text-sm"
                      >
                        <option value="approved_existing">Existing Approved Artwork (Unchanged)</option>
                        <option value="new_design">New Design (Artwork Supplied)</option>
                        <option value="in_development">Artwork in Development by Client</option>
                        <option value="none">No Artwork Yet</option>
                      </select>
                    </div>

                    <div className="col-span-2 space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Printing References & Color Specifications</label>
                      <textarea 
                        rows={2}
                        value={draft.printing_spec.print_requirements_notes || ''}
                        onChange={(e) => updateDraft({
                          printing_spec: {
                            ...draft.printing_spec,
                            print_requirements_notes: e.target.value,
                          }
                        })}
                        placeholder="Pantone references, ink opacity requirements, surface vs reverse print..."
                        className="w-full bg-bg-card border border-border-strong rounded px-3 py-2 text-sm"
                      />
                    </div>
                  </div>

                  {/* Artwork File Upload Box */}
                  <div className="p-4 border-2 border-dashed border-border-strong rounded-lg text-center space-y-1.5 hover:border-[#6E4A9E] transition-colors">
                    <Upload className="w-6 h-6 text-text-muted mx-auto" />
                    <p className="text-xs font-medium text-text-primary">
                      {draft.printing_spec.artwork_file_name 
                        ? `Attached: ${draft.printing_spec.artwork_file_name}`
                        : 'Upload Artwork File (AI, EPS, PDF, High-Res TIFF)'}
                    </p>
                    <input 
                      type="file"
                      id="explast_art_input"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          updateDraft({
                            printing_spec: {
                              ...draft.printing_spec,
                              artwork_file_name: file.name,
                              artwork_file_url: URL.createObjectURL(file),
                            }
                          });
                        }
                      }}
                    />
                    <label htmlFor="explast_art_input" className="inline-block">
                      <span className="px-3 py-1 text-xs font-semibold rounded bg-bg-secondary border border-border-strong cursor-pointer hover:bg-bg-card">
                        Browse Files
                      </span>
                    </label>
                  </div>

                  {/* High Color Notice */}
                  {draft.printing_spec.num_colors > 4 && (
                    <div className="p-3 rounded bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                      <div>
                        <p className="font-semibold">Technical Feasibility Notice ({draft.printing_spec.num_colors} Colours)</p>
                        <p className="text-[11px] leading-relaxed">
                          The official diagram specifies up to 8 colours depending on dimensions. Machine cylinder availability and repeat length will be reviewed by the technical team before quotation release.
                        </p>
                      </div>
                    </div>
                  )}
                </Card>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* STEP 6: FINAL PRODUCT TYPE SELECTION                             */}
          {/* ================================================================= */}
          {currentStep === 6 && (
            <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Step 6 of 9 • Final Product Type</span>
                <h2 className="text-2xl font-medium text-text-primary">Select Final Product Configuration</h2>
                <p className="text-sm text-text-secondary mt-1">
                  Both PLAIN and PRINTED configurations can be converted into the four official product types below.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {EXPLAST_FINAL_PRODUCT_TYPES.map(prod => {
                  const isSelected = draft.final_product_type === prod.type;
                  return (
                    <div 
                      key={prod.type}
                      onClick={() => updateDraft({ 
                        final_product_type: prod.type,
                        product_spec: {
                          ...draft.product_spec,
                          product_type: prod.type,
                        }
                      })}
                      className={`p-5 rounded-lg border-2 cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected 
                          ? 'border-[#168C86] bg-[#DDF2EF]/20 ring-1 ring-[#168C86]' 
                          : 'border-border-subtle bg-bg-card hover:border-border-strong'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <h4 className="font-semibold text-sm text-text-primary">{prod.label}</h4>
                          {isSelected && <CheckCircle2 className="w-5 h-5 text-[#168C86]" />}
                        </div>
                        <p className="text-xs text-text-secondary leading-relaxed">{prod.description}</p>
                      </div>
                      <div className="mt-3 pt-2 text-[10px] font-bold uppercase tracking-wider text-text-muted border-t border-border-subtle/50">
                        {prod.category === 'bag' ? 'Bag Conversion' : 'Direct Roll Preparation'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* STEP 7: PRODUCT-SPECIFIC TECHNICAL SPECIFICATIONS                 */}
          {/* ================================================================= */}
          {currentStep === 7 && (
            <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Step 7 of 9 • Technical Parameters</span>
                <h2 className="text-2xl font-medium text-text-primary">{draft.final_product_type} Specifications</h2>
                <p className="text-sm text-text-secondary mt-1">
                  Specify dimensions, film thickness, color, and production quantity. Units are explicit in millimeters and microns (µm).
                </p>
              </div>

              <Card className="p-6 space-y-5 border border-border-strong bg-bg-card">
                {/* BAG SPECIFIC QUESTIONS (Side Seal, Bottom Seal, Tape Bag) */}
                {draft.final_product_type !== 'Roll' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Width (mm) *</label>
                      <input 
                        type="number"
                        min={10}
                        value={draft.product_spec.width_mm || ''}
                        onChange={(e) => updateDraft({
                          product_spec: { ...draft.product_spec, width_mm: Number(e.target.value) || undefined }
                        })}
                        placeholder="e.g. 250"
                        className="w-full bg-bg-card border border-border-strong rounded px-3 py-1.5 text-sm font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Length / Height (mm) *</label>
                      <input 
                        type="number"
                        min={10}
                        value={draft.product_spec.length_mm || ''}
                        onChange={(e) => updateDraft({
                          product_spec: { ...draft.product_spec, length_mm: Number(e.target.value) || undefined }
                        })}
                        placeholder="e.g. 350"
                        className="w-full bg-bg-card border border-border-strong rounded px-3 py-1.5 text-sm font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Thickness (Micron / µm) *</label>
                      <input 
                        type="number"
                        min={15}
                        max={300}
                        value={draft.product_spec.thickness_micron || ''}
                        onChange={(e) => updateDraft({
                          product_spec: { ...draft.product_spec, thickness_micron: Number(e.target.value) || 0 },
                          extrusion_spec: { ...draft.extrusion_spec, thickness_micron: Number(e.target.value) || 0 }
                        })}
                        placeholder="e.g. 40"
                        className="w-full bg-bg-card border border-border-strong rounded px-3 py-1.5 text-sm font-semibold"
                      />
                    </div>

                    {/* Specific to Bag with Sealing Tape */}
                    {draft.final_product_type === 'Bag with Sealing Tape' && (
                      <>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Lip / Flap Size (mm)</label>
                          <input 
                            type="number"
                            value={draft.product_spec.lip_size_mm || ''}
                            onChange={(e) => updateDraft({
                              product_spec: { ...draft.product_spec, lip_size_mm: Number(e.target.value) || undefined }
                            })}
                            placeholder="e.g. 40"
                            className="w-full bg-bg-card border border-border-strong rounded px-3 py-1.5 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Sealing Tape Type</label>
                          <select
                            value={draft.product_spec.tape_type || 'resealable'}
                            onChange={(e) => updateDraft({
                              product_spec: { ...draft.product_spec, tape_type: e.target.value as any }
                            })}
                            className="w-full bg-bg-card border border-border-strong rounded px-3 py-1.5 text-sm"
                          >
                            <option value="resealable">Resealable (Apparel & Retail Bags)</option>
                            <option value="permanent">Permanent / Tamper-Evident (Courier / Security)</option>
                            <option value="anti_static">Anti-Static Release Tape</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Tape Notes</label>
                          <input 
                            type="text"
                            value={draft.product_spec.tape_requirements || ''}
                            onChange={(e) => updateDraft({
                              product_spec: { ...draft.product_spec, tape_requirements: e.target.value }
                            })}
                            placeholder="e.g. Hot-melt adhesive strip"
                            className="w-full bg-bg-card border border-border-strong rounded px-3 py-1.5 text-sm"
                          />
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  /* ROLL SPECIFIC QUESTIONS */
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Roll Width (mm) *</label>
                      <input 
                        type="number"
                        min={50}
                        value={draft.product_spec.roll_width_mm || ''}
                        onChange={(e) => updateDraft({
                          product_spec: { ...draft.product_spec, roll_width_mm: Number(e.target.value) || undefined },
                          extrusion_spec: { ...draft.extrusion_spec, roll_width_mm: Number(e.target.value) || undefined }
                        })}
                        placeholder="e.g. 600"
                        className="w-full bg-bg-card border border-border-strong rounded px-3 py-1.5 text-sm font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Thickness (Micron / µm) *</label>
                      <input 
                        type="number"
                        min={15}
                        max={300}
                        value={draft.product_spec.thickness_micron || ''}
                        onChange={(e) => updateDraft({
                          product_spec: { ...draft.product_spec, thickness_micron: Number(e.target.value) || 0 },
                          extrusion_spec: { ...draft.extrusion_spec, thickness_micron: Number(e.target.value) || 0 }
                        })}
                        placeholder="e.g. 50"
                        className="w-full bg-bg-card border border-border-strong rounded px-3 py-1.5 text-sm font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Roll Length (Meters)</label>
                      <input 
                        type="number"
                        value={draft.product_spec.roll_length_meters || ''}
                        onChange={(e) => updateDraft({
                          product_spec: { ...draft.product_spec, roll_length_meters: Number(e.target.value) || undefined }
                        })}
                        placeholder="e.g. 500"
                        className="w-full bg-bg-card border border-border-strong rounded px-3 py-1.5 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Roll Weight (kg)</label>
                      <input 
                        type="number"
                        value={draft.product_spec.roll_weight_kg || ''}
                        onChange={(e) => updateDraft({
                          product_spec: { ...draft.product_spec, roll_weight_kg: Number(e.target.value) || undefined }
                        })}
                        placeholder="e.g. 25"
                        className="w-full bg-bg-card border border-border-strong rounded px-3 py-1.5 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Core Diameter (mm)</label>
                      <input 
                        type="number"
                        value={draft.product_spec.core_diameter_mm || ''}
                        onChange={(e) => updateDraft({
                          product_spec: { ...draft.product_spec, core_diameter_mm: Number(e.target.value) || undefined }
                        })}
                        placeholder="e.g. 76 (3 inch)"
                        className="w-full bg-bg-card border border-border-strong rounded px-3 py-1.5 text-sm"
                      />
                    </div>
                  </div>
                )}

                {/* Common Material Color & Volume */}
                <div className="pt-2 border-t border-border-subtle grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Material Colour</label>
                    <input 
                      type="text"
                      value={draft.product_spec.material_color}
                      onChange={(e) => updateDraft({
                        product_spec: { ...draft.product_spec, material_color: e.target.value },
                        extrusion_spec: { ...draft.extrusion_spec, material_color: e.target.value },
                      })}
                      placeholder="e.g. Natural Clear, White, Opaque Black"
                      className="w-full bg-bg-card border border-border-strong rounded px-3 py-1.5 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Requested Quantity *</label>
                    <input 
                      type="number"
                      min={1}
                      value={draft.quantity || ''}
                      onChange={(e) => updateDraft({ quantity: Number(e.target.value) || 0 })}
                      placeholder="e.g. 20000"
                      className="w-full bg-bg-card border border-border-strong rounded px-3 py-1.5 text-sm font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Quantity Unit</label>
                    <select
                      value={draft.quantity_unit}
                      onChange={(e) => updateDraft({ quantity_unit: e.target.value as any })}
                      className="w-full bg-bg-card border border-border-strong rounded px-3 py-1.5 text-sm"
                    >
                      <option value="units">Bags (Units)</option>
                      <option value="kg">Kilograms (kg)</option>
                      <option value="rolls">Rolls</option>
                    </select>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* ================================================================= */}
          {/* STEP 8: TECHNICAL ASSESSMENT WORKFLOW                             */}
          {/* ================================================================= */}
          {currentStep === 8 && (
            <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Step 8 of 9 • Technical Assessment</span>
                <h2 className="text-2xl font-medium text-text-primary">Manufacturing Feasibility Assessment</h2>
                <p className="text-sm text-text-secondary mt-1">
                  Evaluates extrusion, printing, and bag/roll conversion. Technical approval is required before quotation release for custom or high-spec runs.
                </p>
              </div>

              <Card className="p-6 space-y-5 border border-border-strong bg-bg-card">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Assessment Status</span>
                  <select
                    value={draft.technical_assessment?.status || 'not_required'}
                    onChange={(e) => updateDraft({
                      technical_assessment: {
                        ...draft.technical_assessment,
                        status: e.target.value as ExplastTechAssessmentStatus,
                      }
                    })}
                    className="text-xs bg-bg-secondary border border-border-strong rounded px-3 py-1.5 font-semibold"
                  >
                    <option value="not_required">Not Required (Standard Proven Run)</option>
                    <option value="pending_info">Pending Information</option>
                    <option value="awaiting_assessment">Awaiting Technical Assessment</option>
                    <option value="in_progress">Assessment In Progress</option>
                    <option value="awaiting_approval">Awaiting Head of Production Approval</option>
                    <option value="approved">Approved for Production</option>
                    <option value="rejected">Rejected / Requires Modification</option>
                  </select>
                </div>

                {/* Manufacturing Stage Feasibility Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 bg-bg-secondary/50 rounded border border-border-subtle space-y-1.5">
                    <p className="text-xs font-bold text-text-primary">1. Extrusion Stage</p>
                    <p className="text-[11px] text-text-secondary">Film melt index, bubble stability, and thickness tolerance.</p>
                    <Badge variant={draft.technical_assessment?.extrusion_feasibility === 'feasible' ? 'success' : 'neutral'}>
                      {draft.technical_assessment?.extrusion_feasibility || 'Feasible'}
                    </Badge>
                  </div>

                  <div className="p-3 bg-bg-secondary/50 rounded border border-border-subtle space-y-1.5">
                    <p className="text-xs font-bold text-text-primary">2. Printing Stage</p>
                    <p className="text-[11px] text-text-secondary">
                      {draft.print_type === 'printed' ? `${draft.printing_spec.num_colors} Colours flexographic ink adhesion` : 'Plain product (Skipped)'}
                    </p>
                    <Badge variant={draft.print_type === 'plain' ? 'neutral' : draft.printing_spec.num_colors > 4 ? 'warning' : 'success'}>
                      {draft.print_type === 'plain' ? 'Plain' : draft.printing_spec.num_colors > 4 ? 'Review Needed' : 'Feasible'}
                    </Badge>
                  </div>

                  <div className="p-3 bg-bg-secondary/50 rounded border border-border-subtle space-y-1.5">
                    <p className="text-xs font-bold text-text-primary">3. Converting Stage</p>
                    <p className="text-[11px] text-text-secondary">{draft.final_product_type} seal strength and cutting speed.</p>
                    <Badge variant={draft.technical_assessment?.conversion_feasibility === 'feasible' ? 'success' : 'neutral'}>
                      {draft.technical_assessment?.conversion_feasibility || 'Feasible'}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Responsible Technical Person</label>
                    <input 
                      type="text"
                      value={draft.technical_assessment?.responsible_person || ''}
                      onChange={(e) => updateDraft({
                        technical_assessment: {
                          ...draft.technical_assessment,
                          responsible_person: e.target.value,
                        }
                      })}
                      placeholder="e.g. Sunil (Extrusion Manager)"
                      className="w-full bg-bg-card border border-border-strong rounded px-3 py-1.5 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Technical Observations</label>
                    <input 
                      type="text"
                      value={draft.technical_assessment?.observations || ''}
                      onChange={(e) => updateDraft({
                        technical_assessment: {
                          ...draft.technical_assessment,
                          observations: e.target.value,
                        }
                      })}
                      placeholder="e.g. Die opening set to 1.2mm, corona treat film to 42 dynes"
                      className="w-full bg-bg-card border border-border-strong rounded px-3 py-1.5 text-sm"
                    />
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* ================================================================= */}
          {/* STEP 9: QUOTATION READINESS & FINAL REVIEW                        */}
          {/* ================================================================= */}
          {currentStep === 9 && (
            <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Step 9 of 9 • Final Review</span>
                <h2 className="text-2xl font-medium text-text-primary">Review & Quotation Readiness</h2>
                <p className="text-sm text-text-secondary mt-1">
                  Inspect the complete Explast manufacturing request before saving as draft or submitting for commercial quotation.
                </p>
              </div>

              {/* Quotation Readiness Banner */}
              <div className={`p-4 rounded-lg border flex items-start gap-3 ${
                readiness.is_ready 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                  : readiness.missing_requirements.length > 0 
                  ? 'bg-rose-50 border-rose-200 text-rose-900' 
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                {readiness.is_ready ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : readiness.missing_requirements.length > 0 ? (
                  <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="text-xs space-y-1">
                  <p className="font-bold">
                    {readiness.is_ready 
                      ? 'Ready for Commercial Quotation' 
                      : readiness.missing_requirements.length > 0 
                      ? 'Incomplete Request — Missing Required Specifications' 
                      : 'Quotation Restricted Awaiting Technical Approval'}
                  </p>
                  {readiness.missing_requirements.length > 0 && (
                    <ul className="list-disc list-inside space-y-0.5">
                      {readiness.missing_requirements.map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  )}
                  {readiness.warnings.length > 0 && (
                    <ul className="list-disc list-inside space-y-0.5 text-text-secondary">
                      {readiness.warnings.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Specification Audit Cards */}
              <div className="space-y-3 text-xs">
                {/* 1. Customer Card */}
                <Card className="p-4 space-y-2 border border-border-strong bg-bg-card">
                  <div className="flex justify-between items-center">
                    <span className="font-bold uppercase tracking-wider text-text-muted text-[10px]">1. Customer</span>
                    <button onClick={() => setCurrentStep(1)} className="text-[#168C86] font-medium hover:underline">Edit</button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-text-primary">
                    <p><span className="text-text-muted">Company:</span> <strong>{draft.client?.company_name || 'Not Selected'}</strong></p>
                    <p><span className="text-text-muted">Contact:</span> {draft.client?.contact_name || 'N/A'}</p>
                    <p><span className="text-text-muted">Location:</span> {draft.client?.location_type || 'Local'}</p>
                  </div>
                </Card>

                {/* 2. Material Formulation Card */}
                <Card className="p-4 space-y-2 border border-border-strong bg-bg-card">
                  <div className="flex justify-between items-center">
                    <span className="font-bold uppercase tracking-wider text-text-muted text-[10px]">2. Material & Extrusion</span>
                    <button onClick={() => setCurrentStep(3)} className="text-[#168C86] font-medium hover:underline">Edit</button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-text-primary">
                    <p><span className="text-text-muted">Material Family:</span> <strong>{draft.material_family}</strong></p>
                    <p><span className="text-text-muted">Grade / Subfamily:</span> {draft.material_grade || 'Standard'}</p>
                    <p><span className="text-text-muted">Exact Formulation:</span> <strong className="text-[#0F625F]">{draft.formulation}</strong></p>
                    <p><span className="text-text-muted">Print Mode:</span> <Badge variant={draft.print_type === 'printed' ? 'brand' : 'neutral'}>{draft.print_type.toUpperCase()}</Badge></p>
                    {draft.print_type === 'printed' && (
                      <p><span className="text-text-muted">Colours:</span> {draft.printing_spec.num_colors} Colours</p>
                    )}
                  </div>
                </Card>

                {/* 3. Final Product & Conversion Card */}
                <Card className="p-4 space-y-2 border border-border-strong bg-bg-card">
                  <div className="flex justify-between items-center">
                    <span className="font-bold uppercase tracking-wider text-text-muted text-[10px]">3. Final Product & Conversion</span>
                    <button onClick={() => setCurrentStep(7)} className="text-[#168C86] font-medium hover:underline">Edit</button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-text-primary">
                    <p><span className="text-text-muted">Product Type:</span> <strong>{draft.final_product_type}</strong></p>
                    <p><span className="text-text-muted">Quantity:</span> <strong>{draft.quantity?.toLocaleString()} {draft.quantity_unit}</strong></p>
                    <p><span className="text-text-muted">Thickness:</span> {draft.product_spec.thickness_micron} µm (micron)</p>
                    {draft.final_product_type !== 'Roll' ? (
                      <p><span className="text-text-muted">Dimensions:</span> {draft.product_spec.width_mm} x {draft.product_spec.length_mm} mm</p>
                    ) : (
                      <p><span className="text-text-muted">Roll Specs:</span> {draft.product_spec.roll_width_mm} mm width</p>
                    )}
                    <p><span className="text-text-muted">Colour:</span> {draft.product_spec.material_color}</p>
                    {draft.final_product_type === 'Bag with Sealing Tape' && (
                      <p><span className="text-text-muted">Tape:</span> {draft.product_spec.tape_type}</p>
                    )}
                  </div>
                </Card>

                {/* 4. Technical Assessment Status Card */}
                <Card className="p-4 space-y-2 border border-border-strong bg-bg-card">
                  <div className="flex justify-between items-center">
                    <span className="font-bold uppercase tracking-wider text-text-muted text-[10px]">4. Technical Assessment</span>
                    <button onClick={() => setCurrentStep(8)} className="text-[#168C86] font-medium hover:underline">Edit</button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-text-primary">
                    <p><span className="text-text-muted">Status:</span> <Badge variant={draft.technical_assessment?.status === 'approved' ? 'success' : 'neutral'}>{draft.technical_assessment?.status}</Badge></p>
                    <p><span className="text-text-muted">Extrusion:</span> {draft.technical_assessment?.extrusion_feasibility}</p>
                    <p><span className="text-text-muted">Conversion:</span> {draft.technical_assessment?.conversion_feasibility}</p>
                  </div>
                </Card>
              </div>

              {/* Action Buttons */}
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
                  disabled={readiness.missing_requirements.length > 0}
                >
                  <Check className="w-4 h-4 mr-2" /> Submit Explast Sales Request
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER BAR NAVIGATION */}
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
                type="button"
                onClick={() => setCurrentStep(s.num)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  currentStep === s.num 
                    ? 'w-6 bg-[#168C86]' 
                    : s.num < currentStep 
                    ? 'bg-[#DDF2EF]' 
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
                // Step validations before progressing
                if (currentStep === 1 && !draft.client_id) {
                  alert('Please select or register a customer before proceeding.');
                  return;
                }
                if (currentStep === 2 && !draft.project_name.trim()) {
                  alert('Please specify a project / request name.');
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
              disabled={readiness.missing_requirements.length > 0}
            >
              Submit Request <Check className="w-4 h-4 ml-1.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
