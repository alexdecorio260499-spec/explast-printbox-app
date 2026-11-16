'use client';

import React from 'react';
import { DemoQuotation, DemoQuotationStatus } from '@/types/demo';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import {
  X,
  FileText,
  Printer,
  CheckCircle,
  Clock,
  Building,
  User,
  Calendar,
  Layers,
  Sparkles,
  Info,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';

interface QuotationDetailModalProps {
  quotation: DemoQuotation | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (id: string, status: DemoQuotationStatus) => void;
  onNavigateToCustomer?: (customerId: string) => void;
}

export function QuotationDetailModal({
  quotation,
  isOpen,
  onClose,
  onStatusChange,
  onNavigateToCustomer,
}: QuotationDetailModalProps) {
  if (!isOpen || !quotation) return null;

  const statusBadgeVariants: Record<DemoQuotationStatus, 'brand' | 'success' | 'warning' | 'error' | 'neutral'> = {
    draft: 'neutral',
    pending_approval: 'warning',
    sent: 'brand',
    awaiting_response: 'warning',
    accepted: 'success',
    rejected: 'error',
    expired: 'neutral',
    revised: 'brand',
  };

  const statusLabels: Record<DemoQuotationStatus, string> = {
    draft: 'Draft (Internal)',
    pending_approval: 'Awaiting Internal Approval',
    sent: 'Sent to Customer',
    awaiting_response: 'Awaiting Client Response',
    accepted: 'Accepted / PO Confirmed',
    rejected: 'Declined / Renegotiating',
    expired: 'Expired Validity',
    revised: 'Revised (Superseded)',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-bg-card border border-border-subtle rounded-xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-bg-secondary/40">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-brand-primary-light text-brand-primary flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-semibold text-text-primary tracking-tight">
                  {quotation.quotation_number}
                </h2>
                <Badge variant={statusBadgeVariants[quotation.status]}>
                  {statusLabels[quotation.status]}
                </Badge>
                <span className="text-[11px] text-text-muted font-medium bg-bg-secondary px-2 py-0.5 rounded">
                  v{quotation.version}.0
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-0.5">
                Linked Request: <span className="text-text-primary font-medium">{quotation.project_name}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-secondary rounded-lg transition-colors"
              title="Print Quotation"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-secondary rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* DEMO NOTICE BANNER */}
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2 flex items-center justify-between text-xs text-amber-700 dark:text-amber-400">
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 flex-shrink-0" />
            <span><strong>Demonstration Dataset:</strong> Commercial unit prices, setup fees and totals are illustrative model values.</span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-amber-500/20 rounded">
            Explast Demo ERP
          </span>
        </div>

        {/* CONTENT BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TOP METRICS & METADATA */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Customer Box */}
            <Card className="p-4 bg-bg-secondary/30">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5 mb-2">
                <Building className="w-3.5 h-3.5" /> Customer Account
              </span>
              <p className="font-semibold text-text-primary text-sm">{quotation.client_name}</p>
              <p className="text-xs text-text-secondary mt-0.5">{quotation.contact_name}</p>
              <p className="text-xs text-text-muted mt-0.5">{quotation.contact_email}</p>
              {onNavigateToCustomer && (
                <button
                  onClick={() => {
                    onClose();
                    onNavigateToCustomer(quotation.client_id);
                  }}
                  className="mt-3 text-xs text-brand-primary hover:underline font-medium flex items-center gap-1"
                >
                  View 360° Client Profile →
                </button>
              )}
            </Card>

            {/* Commercial Terms Box */}
            <Card className="p-4 bg-bg-secondary/30">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5 mb-2">
                <Calendar className="w-3.5 h-3.5" /> Commercial Terms
              </span>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-muted">Issue Date:</span>
                  <span className="font-medium text-text-primary">{quotation.created_at.substring(0, 10)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Valid Until:</span>
                  <span className="font-medium text-text-primary">{quotation.valid_until.substring(0, 10)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Payment:</span>
                  <span className="font-medium text-text-primary">{quotation.payment_terms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Est. Lead Time:</span>
                  <span className="font-medium text-brand-primary">{quotation.estimated_lead_time_days} Days</span>
                </div>
              </div>
            </Card>

            {/* Sales Representative */}
            <Card className="p-4 bg-bg-secondary/30">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5 mb-2">
                <User className="w-3.5 h-3.5" /> Sales Specialist
              </span>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-xs">
                  {quotation.salesperson.substring(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{quotation.salesperson}</p>
                  <p className="text-[11px] text-text-muted">Manufacturing Sales Lead</p>
                </div>
              </div>
              <p className="text-xs text-text-secondary">
                Delivery: <span className="text-text-primary font-medium">{quotation.delivery_terms}</span>
              </p>
            </Card>
          </div>

          {/* SPECIFICATION SUMMARY */}
          {quotation.items.map((item, idx) => (
            <Card key={item.id || idx} className="p-4 border-l-4 border-l-brand-primary">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-border-subtle">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-primary">
                    Packaging Specification
                  </span>
                  <h3 className="text-sm font-semibold text-text-primary mt-0.5">{item.description}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="neutral">{item.final_product_type}</Badge>
                  <Badge variant={item.print_type === 'printed' ? 'brand' : 'neutral'}>
                    {item.print_type === 'printed' ? `${item.num_colors} Colours Printed` : 'Plain Film'}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3 text-xs">
                <div>
                  <span className="text-text-muted text-[10px] uppercase font-semibold">Material Family</span>
                  <p className="font-medium text-text-primary mt-0.5">{item.material_family} {item.material_grade ? `(${item.material_grade})` : ''}</p>
                </div>
                <div>
                  <span className="text-text-muted text-[10px] uppercase font-semibold">Exact Formulation</span>
                  <p className="font-medium text-text-primary mt-0.5 truncate" title={item.formulation}>{item.formulation}</p>
                </div>
                <div>
                  <span className="text-text-muted text-[10px] uppercase font-semibold">Film Gauge</span>
                  <p className="font-medium text-text-primary mt-0.5">{item.thickness_micron} µm (Micron)</p>
                </div>
                <div>
                  <span className="text-text-muted text-[10px] uppercase font-semibold">Dimensions</span>
                  <p className="font-medium text-text-primary mt-0.5">{item.dimensions_summary}</p>
                </div>
              </div>
            </Card>
          ))}

          {/* COMMERCIAL LINE ITEMS TABLE */}
          <div className="border border-border-subtle rounded-lg overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-bg-secondary text-text-muted uppercase text-[10px] tracking-wider font-semibold border-b border-border-subtle">
                <tr>
                  <th className="px-4 py-3">Item Specification</th>
                  <th className="px-4 py-3 text-right">Quantity</th>
                  <th className="px-4 py-3 text-right">Unit Price (MUR)</th>
                  <th className="px-4 py-3 text-right">Tooling / Cylinders</th>
                  <th className="px-4 py-3 text-right font-bold">Subtotal (MUR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {quotation.items.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-text-primary max-w-xs">
                      {item.description}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {item.quantity.toLocaleString()} {item.quantity_unit}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      Rs {item.unit_price_mur.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-text-secondary">
                      {item.tooling_stereos_fee_mur > 0 ? `Rs ${item.tooling_stereos_fee_mur.toLocaleString()}` : 'Included'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-text-primary">
                      Rs {item.subtotal_mur.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TOTALS & BREAKDOWN */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-2">
            <div className="text-xs text-text-secondary max-w-md space-y-1">
              <p className="font-semibold text-text-primary">Special Commercial Notes:</p>
              <p>{quotation.internal_notes || 'Price valid for standard manufacturing run. Delivery as per agreed schedule. Quality warranty according to Explast packaging standard tolerances (±5% gauge).'}</p>
            </div>

            <div className="w-full sm:w-72 bg-bg-secondary/40 p-4 rounded-lg border border-border-subtle space-y-2 text-xs">
              <div className="flex justify-between text-text-secondary">
                <span>Subtotal (Excl. VAT):</span>
                <span className="font-mono font-medium text-text-primary">Rs {quotation.subtotal_mur.toLocaleString()}</span>
              </div>
              {quotation.tooling_charges_mur > 0 && (
                <div className="flex justify-between text-text-secondary">
                  <span>Prepress Tooling / Plates:</span>
                  <span className="font-mono font-medium text-text-primary">Rs {quotation.tooling_charges_mur.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-text-secondary">
                <span>VAT ({quotation.tax_rate_percent}%):</span>
                <span className="font-mono font-medium text-text-primary">Rs {quotation.tax_mur.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-border-subtle flex justify-between text-sm font-bold text-text-primary">
                <span>Total Amount:</span>
                <span className="font-mono text-brand-primary">Rs {quotation.total_mur.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* AUDIT TIMELINE */}
          <div className="pt-4 border-t border-border-subtle">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">
              Version & Approval History
            </h4>
            <div className="space-y-2">
              {quotation.history.map((h, i) => (
                <div key={i} className="flex items-start text-xs space-x-3 p-2 rounded bg-bg-secondary/30">
                  <div className="w-2 h-2 rounded-full bg-brand-primary mt-1.5" />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-semibold text-text-primary">{h.action}</span>
                      <span className="text-text-muted text-[11px]">{h.date}</span>
                    </div>
                    <p className="text-text-secondary text-[11px] mt-0.5">By {h.actor} {h.notes && `— ${h.notes}`}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MODAL FOOTER ACTIONS */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border-subtle bg-bg-secondary/40">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>

          <div className="flex items-center space-x-2">
            {onStatusChange && quotation.status !== 'accepted' && (
              <Button
                variant="outline"
                onClick={() => {
                  onStatusChange(quotation.id, 'accepted');
                }}
                className="text-color-success border-color-success/40 hover:bg-color-success/10"
              >
                <CheckCircle className="w-4 h-4 mr-1.5" /> Mark as Accepted
              </Button>
            )}

            {onStatusChange && quotation.status === 'sent' && (
              <Button
                variant="outline"
                onClick={() => {
                  onStatusChange(quotation.id, 'revised');
                }}
              >
                Issue Revised Quote
              </Button>
            )}

            <Button onClick={() => window.print()}>
              <Printer className="w-4 h-4 mr-1.5" /> Print / Export
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
