'use client';

import React, { useState } from 'react';
import { DemoCustomerProfile, DemoQuotation, DemoDesignProject, DemoProductionJob } from '@/types/demo';
import { DemoService } from '@/lib/sales/demo-service';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import {
  X,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  FolderKanban,
  FileText,
  Palette,
  Clock,
  Sparkles,
  Award,
  ArrowUpRight,
} from 'lucide-react';

interface ClientDetailModalProps {
  customerId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenQuotation?: (quotationId: string) => void;
  onOpenDesign?: (designId: string) => void;
  onNewRequest?: () => void;
}

export function ClientDetailModal({
  customerId,
  isOpen,
  onClose,
  onOpenQuotation,
  onOpenDesign,
  onNewRequest,
}: ClientDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'timeline' | 'projects' | 'quotations' | 'designs'>('timeline');

  if (!isOpen || !customerId) return null;

  const relationship = DemoService.getCustomerRelationship(customerId);
  const customer = relationship.customer;

  if (!customer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-bg-card border border-border-subtle rounded-xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-bg-secondary/40">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-lg bg-brand-primary text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
              {customer.company_name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-semibold text-text-primary tracking-tight">
                  {customer.company_name}
                </h2>
                <Badge variant={customer.account_tier === 'Key Account' || customer.account_tier === 'VIP' ? 'brand' : 'neutral'}>
                  {customer.account_tier}
                </Badge>
              </div>
              <p className="text-xs text-text-secondary mt-0.5">
                {customer.industry} • Customer since {customer.customer_since}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-secondary rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* METRICS STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-6 py-3 bg-bg-secondary/20 border-b border-border-subtle text-xs">
          <div>
            <span className="text-text-muted text-[10px] uppercase font-semibold">Total Revenue (MUR)</span>
            <p className="font-mono text-sm font-bold text-brand-primary mt-0.5">
              Rs {customer.total_revenue_mur.toLocaleString()}
            </p>
          </div>
          <div>
            <span className="text-text-muted text-[10px] uppercase font-semibold">Active Requests</span>
            <p className="font-mono text-sm font-bold text-text-primary mt-0.5">
              {relationship.projects.length} Projects
            </p>
          </div>
          <div>
            <span className="text-text-muted text-[10px] uppercase font-semibold">Credit Terms</span>
            <p className="font-medium text-text-primary mt-0.5">{customer.credit_terms}</p>
          </div>
          <div>
            <span className="text-text-muted text-[10px] uppercase font-semibold">Account Manager</span>
            <p className="font-medium text-text-primary mt-0.5">{customer.assigned_salesperson}</p>
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex border-b border-border-subtle bg-bg-secondary/20 px-6 gap-2 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-3 px-3.5 font-medium border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'timeline'
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> 360° Timeline
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`py-3 px-3.5 font-medium border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'projects'
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            <FolderKanban className="w-3.5 h-3.5" /> Requests ({relationship.projects.length})
          </button>
          <button
            onClick={() => setActiveTab('quotations')}
            className={`py-3 px-3.5 font-medium border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'quotations'
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Quotations ({relationship.quotations.length})
          </button>
          <button
            onClick={() => setActiveTab('designs')}
            className={`py-3 px-3.5 font-medium border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'designs'
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            <Palette className="w-3.5 h-3.5" /> Artwork ({relationship.designs.length})
          </button>
        </div>

        {/* TAB CONTENTS */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* TAB 1: RELATIONSHIP TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              
              {/* Profile Card */}
              <Card className="p-4 bg-bg-secondary/30">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-text-muted text-[10px] uppercase font-semibold">Contact Person</span>
                    <p className="font-semibold text-text-primary mt-0.5">{customer.contact_name}</p>
                    <p className="text-text-secondary">{customer.contact_email}</p>
                    <p className="text-text-secondary">{customer.contact_phone}</p>
                  </div>
                  <div>
                    <span className="text-text-muted text-[10px] uppercase font-semibold">Business Registration</span>
                    <p className="font-mono text-text-primary mt-0.5">BRN: {customer.brn_number}</p>
                    <p className="font-mono text-text-secondary">VAT: {customer.vat_number}</p>
                  </div>
                  <div>
                    <span className="text-text-muted text-[10px] uppercase font-semibold">Delivery Address</span>
                    <p className="text-text-secondary mt-0.5 leading-relaxed">{customer.delivery_address}</p>
                  </div>
                </div>
                {customer.notes && (
                  <p className="mt-3 pt-3 border-t border-border-subtle text-xs text-text-secondary italic">
                    &ldquo;{customer.notes}&rdquo;
                  </p>
                )}
              </Card>

              {/* Chronological Milestones */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-4">
                  Account History & Engagement Milestones
                </h4>
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border-strong">
                  {customer.relationship_timeline.map((item, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-brand-primary ring-4 ring-bg-card" />
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-text-primary">{item.milestone}</span>
                        <span className="text-[11px] font-mono text-text-muted">{item.date}</span>
                      </div>
                      <p className="text-xs text-text-secondary mt-1">{item.details}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: PROJECTS */}
          {activeTab === 'projects' && (
            <div className="space-y-3">
              {relationship.projects.length === 0 ? (
                <p className="text-center text-xs text-text-muted py-8">No projects logged yet.</p>
              ) : (
                relationship.projects.map((proj, idx) => (
                  <Card key={proj.id || idx} className="p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-semibold text-text-primary">{proj.project_name}</h4>
                        <Badge variant="neutral">{proj.final_product_type || 'Packaging'}</Badge>
                      </div>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {proj.material_family} • {proj.formulation} • {proj.quantity?.toLocaleString()} {proj.quantity_unit}
                      </p>
                    </div>
                    <Badge variant="brand">{proj.kanban_stage || proj.request_status || 'Active'}</Badge>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* TAB 3: QUOTATIONS */}
          {activeTab === 'quotations' && (
            <div className="space-y-3">
              {relationship.quotations.length === 0 ? (
                <p className="text-center text-xs text-text-muted py-8">No quotations issued yet.</p>
              ) : (
                relationship.quotations.map((quo, idx) => (
                  <Card
                    key={quo.id || idx}
                    className="p-4 flex items-center justify-between hover:border-brand-primary transition-colors cursor-pointer"
                    onClick={() => onOpenQuotation && onOpenQuotation(quo.id)}
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm font-semibold text-text-primary">{quo.quotation_number}</span>
                        <Badge variant={quo.status === 'accepted' ? 'success' : 'neutral'}>{quo.status.toUpperCase()}</Badge>
                      </div>
                      <p className="text-xs text-text-secondary mt-0.5">{quo.project_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-sm text-brand-primary">Rs {quo.total_mur.toLocaleString()}</p>
                      <p className="text-[11px] text-text-muted">Issued: {quo.created_at.substring(0, 10)}</p>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* TAB 4: DESIGNS */}
          {activeTab === 'designs' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relationship.designs.length === 0 ? (
                <p className="text-center text-xs text-text-muted py-8 col-span-2">No design proofs registered.</p>
              ) : (
                relationship.designs.map((des, idx) => (
                  <Card
                    key={des.id || idx}
                    className="p-4 space-y-2 hover:border-purple-500 transition-colors cursor-pointer"
                    onClick={() => onOpenDesign && onOpenDesign(des.id)}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-xs font-bold text-text-primary">{des.design_reference}</span>
                      <Badge variant="brand">{des.num_colors} Colours</Badge>
                    </div>
                    <p className="text-xs font-semibold text-text-primary">{des.artwork_title}</p>
                    <div className="flex items-center gap-1.5 pt-1">
                      {des.spot_colors_hex.map((hex, i) => (
                        <div key={i} className="w-3.5 h-3.5 rounded-sm border" style={{ backgroundColor: hex }} />
                      ))}
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border-subtle bg-bg-secondary/40">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>

          {onNewRequest && (
            <Button
              onClick={() => {
                onClose();
                onNewRequest();
              }}
            >
              + Create New Sales Request for {customer.company_name.split(' ')[0]}
            </Button>
          )}
        </div>

      </div>
    </div>
  );
}
