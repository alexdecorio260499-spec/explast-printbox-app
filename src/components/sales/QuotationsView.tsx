'use client';

import React, { useState } from 'react';
import { DemoQuotation, DemoQuotationStatus, AppUser } from '@/types/demo';
import { DemoService } from '@/lib/sales/demo-service';
import { QuotationDetailModal } from './QuotationDetailModal';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import {
  FileText,
  Search,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  Sparkles,
  Info,
  ShieldCheck,
} from 'lucide-react';

interface QuotationsViewProps {
  brand: string;
  currentUser?: AppUser;
  onNavigateToCustomer?: (customerId: string) => void;
  onNewRequest?: () => void;
}

export function QuotationsView({
  brand,
  currentUser,
  onNavigateToCustomer,
}: QuotationsViewProps) {
  const [quotations, setQuotations] = useState<DemoQuotation[]>(() => DemoService.getQuotations());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedQuote, setSelectedQuote] = useState<DemoQuotation | null>(null);

  function handleStatusChange(id: string, newStatus: DemoQuotationStatus, actor?: string, notes?: string) {
    DemoService.updateQuotationStatus(id, newStatus, actor || currentUser?.name || 'Alex L.', notes);
    const updated = DemoService.getQuotations();
    setQuotations(updated);
    if (selectedQuote && selectedQuote.id === id) {
      setSelectedQuote(updated.find(q => q.id === id) || null);
    }
  }

  // Role scoping: sales rep only sees their own quotes; admin sees all
  const isSalesScoped = currentUser?.role === 'sales';
  const visibleQuotations = isSalesScoped
    ? quotations.filter(q => q.salesperson === currentUser?.name)
    : quotations;

  // Calculate live summary stats from actual quotations
  const totalValue = visibleQuotations.reduce((acc, q) => acc + q.total_mur, 0);
  const acceptedQuotes = visibleQuotations.filter(q => q.status === 'accepted');
  const acceptedValue = acceptedQuotes.reduce((acc, q) => acc + q.total_mur, 0);
  const pendingQuotes = visibleQuotations.filter(
    q => q.status === 'sent' || q.status === 'awaiting_response' || q.status === 'pending_approval' || q.status === 'admin_approved'
  );
  const pendingValue = pendingQuotes.reduce((acc, q) => acc + q.total_mur, 0);
  const conversionRate = visibleQuotations.length > 0 ? Math.round((acceptedQuotes.length / visibleQuotations.length) * 100) : 0;

  // Filtered list
  const filteredQuotations = visibleQuotations.filter(q => {
    const matchesSearch =
      q.quotation_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.project_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || q.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const statusBadgeVariants: Record<DemoQuotationStatus, 'brand' | 'success' | 'warning' | 'error' | 'neutral'> = {
    draft: 'neutral',
    pending_approval: 'warning',
    admin_approved: 'brand',
    sent: 'brand',
    awaiting_response: 'warning',
    accepted: 'success',
    rejected: 'error',
    expired: 'neutral',
    revised: 'brand',
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Commercial ERP Module
            </h2>
            {isSalesScoped && (
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-brand-primary-light text-brand-primary">
                Personal Pipeline ({currentUser?.name})
              </span>
            )}
          </div>
          <h1 className="text-2xl font-medium text-text-primary mt-1">Quotations & Pricing Governance</h1>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs text-text-muted bg-bg-secondary px-3 py-1.5 rounded-lg border border-border-subtle flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-primary" /> Admin Margin Verification Required
          </span>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="p-4 border-l-4 border-l-brand-primary">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Total Quoted Volume</span>
          <p className="font-mono text-2xl font-bold text-text-primary mt-1">
            Rs {totalValue.toLocaleString()}
          </p>
          <span className="text-xs text-text-secondary mt-1 block">{quotations.length} active quotations</span>
        </Card>

        <Card className="p-4 border-l-4 border-l-color-success">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Accepted Orders</span>
          <p className="font-mono text-2xl font-bold text-color-success mt-1">
            Rs {acceptedValue.toLocaleString()}
          </p>
          <span className="text-xs text-text-secondary mt-1 block">{acceptedQuotes.length} orders signed</span>
        </Card>

        <Card className="p-4 border-l-4 border-l-color-warning">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Pending Client Decision</span>
          <p className="font-mono text-2xl font-bold text-color-warning mt-1">
            Rs {pendingValue.toLocaleString()}
          </p>
          <span className="text-xs text-text-secondary mt-1 block">{pendingQuotes.length} active in market</span>
        </Card>

        <Card className="p-4 border-l-4 border-l-purple-500">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Conversion Ratio</span>
          <p className="font-mono text-2xl font-bold text-purple-600 mt-1">
            {conversionRate}%
          </p>
          <span className="text-xs text-text-secondary mt-1 block">Win rate on issued quotes</span>
        </Card>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search quotation #, customer, or project..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-bg-card border border-border-subtle rounded-lg pl-9 pr-4 py-2 text-xs text-text-primary focus:outline-none focus:border-brand-primary transition-colors"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          {[
            { id: 'all', label: 'All Quotations' },
            { id: 'sent', label: 'Sent' },
            { id: 'accepted', label: 'Accepted' },
            { id: 'awaiting_response', label: 'In Negotiation' },
            { id: 'pending_approval', label: 'Pending Approval' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                statusFilter === f.id
                  ? 'bg-brand-primary text-white'
                  : 'bg-bg-card text-text-secondary hover:text-text-primary border border-border-subtle'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* DATA TABLE */}
      <Card className="p-0 overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-bg-secondary text-text-muted uppercase text-[10px] tracking-wider font-semibold border-b border-border-subtle">
            <tr>
              <th className="px-6 py-3.5">Quotation #</th>
              <th className="px-6 py-3.5">Customer & Project</th>
              <th className="px-6 py-3.5">Manufacturing Specification</th>
              <th className="px-6 py-3.5 text-right">Quantity</th>
              <th className="px-6 py-3.5 text-right">Total (MUR)</th>
              <th className="px-6 py-3.5 text-center">Status</th>
              <th className="px-6 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {filteredQuotations.map((q) => {
              const primaryItem = q.items[0];
              return (
                <tr
                  key={q.id}
                  className="hover:bg-bg-secondary/40 transition-colors group cursor-pointer"
                  onClick={() => setSelectedQuote(q)}
                >
                  <td className="px-6 py-4 font-mono font-semibold text-text-primary">
                    {q.quotation_number}
                    <span className="block text-[10px] font-sans font-normal text-text-muted mt-0.5">
                      v{q.version}.0 • {q.created_at.substring(0, 10)}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <p className="font-semibold text-text-primary">{q.client_name}</p>
                    <p className="text-text-secondary text-[11px] truncate max-w-xs">{q.project_name}</p>
                  </td>

                  <td className="px-6 py-4">
                    {primaryItem ? (
                      <div>
                        <span className="font-medium text-text-primary">
                          {primaryItem.material_family} • {primaryItem.final_product_type}
                        </span>
                        <p className="text-[11px] text-text-muted truncate max-w-xs">
                          {primaryItem.formulation} ({primaryItem.thickness_micron}µm)
                        </p>
                      </div>
                    ) : (
                      'Custom Configuration'
                    )}
                  </td>

                  <td className="px-6 py-4 text-right font-medium">
                    {primaryItem?.quantity.toLocaleString()} {primaryItem?.quantity_unit}
                  </td>

                  <td className="px-6 py-4 text-right font-mono font-bold text-text-primary">
                    Rs {q.total_mur.toLocaleString()}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <Badge variant={statusBadgeVariants[q.status]}>
                      {q.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedQuote(q);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" /> View
                    </Button>
                  </td>
                </tr>
              );
            })}

            {filteredQuotations.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-text-muted">
                  No quotations match the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      {/* DETAIL MODAL */}
      <QuotationDetailModal
        quotation={selectedQuote}
        isOpen={!!selectedQuote}
        currentUser={currentUser}
        onClose={() => setSelectedQuote(null)}
        onStatusChange={handleStatusChange}
        onNavigateToCustomer={onNavigateToCustomer}
      />

    </div>
  );
}
