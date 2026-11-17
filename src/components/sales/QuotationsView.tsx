'use client';

import React, { useState } from 'react';
import { DemoQuotation, DemoQuotationStatus, AppUser } from '@/types/demo';
import { DemoService } from '@/lib/sales/demo-service';
import { QuotationDetailModal } from './QuotationDetailModal';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { KPICard } from '../ui/KPICard';
import { PageHeader } from '../ui/PageHeader';
import { FilterToolbar } from '../ui/FilterToolbar';
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
      <PageHeader
        eyebrow="Commercial ERP Module"
        badgeText={isSalesScoped ? `Personal Pipeline (${currentUser?.name})` : undefined}
        badgeVariant="brand"
        title="Quotations & Pricing Governance"
        actions={
          <span className="text-xs text-text-muted bg-bg-secondary px-3 py-1.5 rounded-lg border border-border-subtle flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-primary" /> Admin Margin Verification Required
          </span>
        }
      />

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard
          label="Total Quoted Volume"
          value={`Rs ${totalValue.toLocaleString()}`}
          trend={`${quotations.length} active quotations`}
          accent="brand"
        />
        <KPICard
          label="Accepted Orders"
          value={`Rs ${acceptedValue.toLocaleString()}`}
          trend={`${acceptedQuotes.length} orders signed`}
          accent="success"
        />
        <KPICard
          label="Pending Client Decision"
          value={`Rs ${pendingValue.toLocaleString()}`}
          trend={`${pendingQuotes.length} active in market`}
          accent="amber"
        />
        <KPICard
          label="Conversion Ratio"
          value={`${conversionRate}%`}
          trend="Win rate on issued quotes"
          accent="purple"
        />
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <FilterToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search quotation #, customer, or project..."
        activeFilter={statusFilter}
        onFilterChange={setStatusFilter}
        filterOptions={[
          { id: 'all', label: 'All Quotations' },
          { id: 'sent', label: 'Sent' },
          { id: 'accepted', label: 'Accepted' },
          { id: 'awaiting_response', label: 'In Negotiation' },
          { id: 'pending_approval', label: 'Pending Approval' },
        ]}
      />

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
