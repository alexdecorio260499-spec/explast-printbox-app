'use client';

import React, { useState } from 'react';
import { DemoService } from '@/lib/sales/demo-service';
import { ExplastSalesService } from '@/lib/sales/explast-service';
import { AppUser } from '@/types/demo';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import {
  X,
  Building,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface NewClientModalProps {
  isOpen: boolean;
  currentUser?: AppUser;
  onClose: () => void;
  onSuccess: (newClient: any) => void;
}

export function NewClientModal({
  isOpen,
  currentUser,
  onClose,
  onSuccess,
}: NewClientModalProps) {
  const [formData, setFormData] = useState({
    company_name: '',
    industry: 'Industrial',
    location_type: 'Local (Mauritius)',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    delivery_address: '',
    brn_number: '',
    vat_number: '',
    account_tier: 'Regular',
    credit_terms: '30 Days End of Month',
    assigned_salesperson: currentUser?.role === 'sales' ? currentUser.name : 'Alex L.',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.company_name.trim()) {
      setError('Company / Legal Name is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Add to Demo Service store
      const created = DemoService.addCustomer({
        company_name: formData.company_name.trim(),
        industry: formData.industry,
        location_type: formData.location_type as any,
        contact_name: formData.contact_name.trim(),
        contact_email: formData.contact_email.trim(),
        contact_phone: formData.contact_phone.trim(),
        delivery_address: formData.delivery_address.trim(),
        brn_number: formData.brn_number.trim() || `C2026${Math.floor(1000 + Math.random() * 9000)}`,
        vat_number: formData.vat_number.trim() || `VAT${Math.floor(10000000 + Math.random() * 90000000)}`,
        status: 'Client',
        account_tier: formData.account_tier as any,
        assigned_salesperson: formData.assigned_salesperson,
        credit_terms: formData.credit_terms,
        notes: formData.notes.trim(),
      });

      // 2. Mirror into shared CRM service
      try {
        await ExplastSalesService.createClient({
          company_name: formData.company_name.trim(),
          industry: formData.industry,
          location_type: formData.location_type,
          contact_name: formData.contact_name.trim(),
          contact_email: formData.contact_email.trim(),
          contact_phone: formData.contact_phone.trim(),
          delivery_address: formData.delivery_address.trim(),
          status: 'Client',
        });
      } catch (err) {
        console.warn('ExplastSalesService client mirror warning:', err);
      }

      onSuccess(created);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to register customer');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-bg-card border border-border-subtle rounded-xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-bg-secondary/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-brand-primary text-white flex items-center justify-center shadow-sm">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-semibold text-text-primary tracking-tight">
                  Add New Customer Account
                </h2>
                <Badge variant="brand">Client Directory</Badge>
              </div>
              <p className="text-xs text-text-secondary mt-0.5">
                Onboard a new company into the CRM without launching a sales request immediately.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FORM BODY */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3 rounded-lg bg-color-error/10 border border-color-error/20 text-xs text-color-error flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* BASIC COMPANY IDENTIFIERS */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
              <Building className="w-3.5 h-3.5" /> Company Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  Company / Legal Name <span className="text-color-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Phoenix Beverages Ltd or Supermarché Express"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="w-full bg-bg-card border border-border-strong rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  Business Sector / Industry
                </label>
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full bg-bg-card border border-border-strong rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                >
                  <option value="Food Service">Food Processing & Packaging</option>
                  <option value="Retail">Retail & Supermarket</option>
                  <option value="Industrial">Industrial Manufacturing</option>
                  <option value="Agriculture">Agriculture & Horticulture</option>
                  <option value="Textile">Textile & Garments</option>
                  <option value="Pharma">Pharmaceutical & Medical</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  Location Jurisdiction
                </label>
                <select
                  value={formData.location_type}
                  onChange={(e) => setFormData({ ...formData, location_type: e.target.value })}
                  className="w-full bg-bg-card border border-border-strong rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                >
                  <option value="Local (Mauritius)">Local (Mauritius)</option>
                  <option value="Export (Regional)">Export (Indian Ocean / Africa)</option>
                  <option value="Export (International)">Export (International)</option>
                </select>
              </div>
            </div>
          </div>

          {/* CONTACT PERSON */}
          <div className="pt-4 border-t border-border-subtle space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
              <User className="w-3.5 h-3.5" /> Primary Representative
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  Contact Name
                </label>
                <input
                  type="text"
                  placeholder="Jean Dupont"
                  value={formData.contact_name}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  className="w-full bg-bg-card border border-border-strong rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="j.dupont@company.mu"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  className="w-full bg-bg-card border border-border-strong rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  Telephone
                </label>
                <input
                  type="tel"
                  placeholder="+230 5000 0000"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  className="w-full bg-bg-card border border-border-strong rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                />
              </div>
            </div>
          </div>

          {/* COMMERCIAL TERMS & LEGAL IDENTIFIERS */}
          <div className="pt-4 border-t border-border-subtle space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
              <CreditCard className="w-3.5 h-3.5" /> Commercial Terms & Legal Info
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  BRN Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. C12098765"
                  value={formData.brn_number}
                  onChange={(e) => setFormData({ ...formData, brn_number: e.target.value })}
                  className="w-full bg-bg-card border border-border-strong rounded-lg px-3.5 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  VAT Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. VAT27019842"
                  value={formData.vat_number}
                  onChange={(e) => setFormData({ ...formData, vat_number: e.target.value })}
                  className="w-full bg-bg-card border border-border-strong rounded-lg px-3.5 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  Payment Terms
                </label>
                <select
                  value={formData.credit_terms}
                  onChange={(e) => setFormData({ ...formData, credit_terms: e.target.value })}
                  className="w-full bg-bg-card border border-border-strong rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                >
                  <option value="30 Days End of Month">30 Days End of Month</option>
                  <option value="15 Days from Invoice">15 Days from Invoice</option>
                  <option value="Cash on Delivery (COD)">Cash on Delivery (COD)</option>
                  <option value="50% Deposit / 50% on Delivery">50% Deposit / 50% on Delivery</option>
                  <option value="100% Advance Payment">100% Advance Payment</option>
                </select>
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  Delivery / Factory Address
                </label>
                <input
                  type="text"
                  placeholder="Industrial Zone, Plaine Lauzun or Royal Road, Grand Baie"
                  value={formData.delivery_address}
                  onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                  className="w-full bg-bg-card border border-border-strong rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  Assigned Sales Representative
                </label>
                <select
                  disabled={currentUser?.role === 'sales'}
                  value={formData.assigned_salesperson}
                  onChange={(e) => setFormData({ ...formData, assigned_salesperson: e.target.value })}
                  className="w-full bg-bg-card border border-border-strong rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50 disabled:bg-bg-secondary disabled:text-text-muted"
                >
                  <option value="Alex L.">Alex L. (Senior Sales)</option>
                  <option value="Sunil R.">Sunil R. (Technical Sales)</option>
                  <option value="Sarah M.">Sarah M. (Key Accounts)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Internal Commercial Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Uses Grade 2 perforated rolls, requires food safety certificate on shipments..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-bg-card border border-border-strong rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50 resize-none"
            />
          </div>

          {/* FOOTER ACTIONS */}
          <div className="pt-4 border-t border-border-subtle flex items-center justify-between">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <div className="flex items-center space-x-3">
              <Button type="submit" disabled={isSubmitting}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Registering...' : 'Save & Add Customer'}
              </Button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}
