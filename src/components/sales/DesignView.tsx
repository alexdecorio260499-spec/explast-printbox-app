'use client';

import React, { useState } from 'react';
import { DemoDesignProject, DemoDesignStatus, AppUser } from '@/types/demo';
import { DemoService } from '@/lib/sales/demo-service';
import { DesignDetailModal } from './DesignDetailModal';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import {
  Palette,
  Search,
  Sliders,
  Layers,
  Sparkles,
  Eye,
  CheckCircle2,
} from 'lucide-react';

interface DesignViewProps {
  brand: string;
  currentUser?: AppUser;
  onNavigateToCustomer?: (customerId: string) => void;
  onNewRequest?: () => void;
}

export function DesignView({
  brand,
  currentUser,
  onNavigateToCustomer,
}: DesignViewProps) {
  const [designs, setDesigns] = useState<DemoDesignProject[]>(() => DemoService.getDesignProjects());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDesign, setSelectedDesign] = useState<DemoDesignProject | null>(null);

  function handleStatusChange(id: string, newStatus: DemoDesignStatus) {
    DemoService.updateDesignStatus(id, newStatus);
    const updated = DemoService.getDesignProjects();
    setDesigns(updated);
    if (selectedDesign && selectedDesign.id === id) {
      setSelectedDesign(updated.find(d => d.id === id) || null);
    }
  }

  const filteredDesigns = designs.filter(d => {
    const matchesSearch =
      d.design_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.artwork_title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const statusBadgeVariants: Record<DemoDesignStatus, 'brand' | 'success' | 'warning' | 'error' | 'neutral'> = {
    awaiting_artwork: 'neutral',
    brief_received: 'warning',
    in_design: 'brand',
    internal_review: 'warning',
    awaiting_approval: 'brand',
    revision_requested: 'error',
    approved: 'success',
    ready_for_production: 'success',
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
            Prepress & Cylinder Engineering
          </h2>
          <h1 className="text-2xl font-medium text-text-primary">Design & Artwork Management</h1>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs text-text-muted bg-bg-secondary px-3 py-1.5 rounded-lg border border-border-subtle flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Automated Prepress from Approved Briefs
          </span>
        </div>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search design reference, customer, or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-bg-card border border-border-subtle rounded-lg pl-9 pr-4 py-2 text-xs text-text-primary focus:outline-none focus:border-brand-primary transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          {[
            { id: 'all', label: 'All Projects' },
            { id: 'in_design', label: 'In Design' },
            { id: 'awaiting_approval', label: 'Customer Approval' },
            { id: 'approved', label: 'Approved' },
            { id: 'ready_for_production', label: 'Cylinders Mounted' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                statusFilter === f.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-bg-card text-text-secondary hover:text-text-primary border border-border-subtle'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* DESIGN CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDesigns.map((d) => (
          <Card
            key={d.id}
            className="p-5 flex flex-col justify-between hover:border-purple-500 transition-all cursor-pointer group shadow-sm"
            onClick={() => setSelectedDesign(d)}
          >
            <div>
              {/* TOP HEADER */}
              <div className="flex justify-between items-start mb-3">
                <span className="font-mono text-xs font-bold text-text-primary">{d.design_reference}</span>
                <Badge variant={statusBadgeVariants[d.status]}>
                  {d.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>

              {/* MOCKUP VISUAL PREVIEW TILE */}
              <div className="w-full h-36 bg-gradient-to-br from-bg-secondary to-bg-card border border-border-subtle rounded-lg mb-3 flex flex-col items-center justify-center p-3 relative overflow-hidden group-hover:border-purple-500/50 transition-colors">
                <div className="w-24 h-28 border border-border-strong rounded bg-bg-card shadow flex flex-col items-center justify-between p-2">
                  <div className="w-8 h-1 rounded-full bg-border-strong" />
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow"
                    style={{ backgroundColor: d.spot_colors_hex[0] || '#168C86' }}
                  >
                    {d.client_name.charAt(0)}
                  </div>
                  <div className="w-full flex justify-center gap-1">
                    {d.spot_colors_hex.slice(0, 4).map((hex, i) => (
                      <div key={i} className="w-2 h-2 rounded-xs" style={{ backgroundColor: hex }} />
                    ))}
                  </div>
                </div>
                <span className="absolute bottom-1.5 right-2 text-[9px] font-mono text-text-muted">
                  {d.cylinder_repeat_mm}mm cylinder
                </span>
              </div>

              {/* DETAILS */}
              <h3 className="text-sm font-semibold text-text-primary line-clamp-1">{d.artwork_title}</h3>
              <p className="text-xs text-text-secondary mt-0.5">{d.client_name}</p>

              {/* SPEC TAGS */}
              <div className="mt-3 pt-3 border-t border-border-subtle flex flex-wrap gap-1.5 text-[10px]">
                <span className="bg-bg-secondary px-2 py-0.5 rounded font-mono text-text-muted">
                  {d.num_colors} Colours
                </span>
                <span className="bg-bg-secondary px-2 py-0.5 rounded text-text-muted">
                  {d.product_type}
                </span>
                <span className="bg-bg-secondary px-2 py-0.5 rounded text-text-muted">
                  {d.material_family}
                </span>
              </div>
            </div>

            {/* FOOTER */}
            <div className="mt-4 pt-3 border-t border-border-subtle flex justify-between items-center text-xs">
              <span className="text-text-muted text-[11px]">Designer: {d.assigned_designer}</span>
              <span className="text-purple-600 font-medium group-hover:underline flex items-center gap-1">
                View Prepress Proof →
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* DETAIL MODAL */}
      <DesignDetailModal
        design={selectedDesign}
        isOpen={!!selectedDesign}
        onClose={() => setSelectedDesign(null)}
        onStatusChange={handleStatusChange}
        onNavigateToCustomer={onNavigateToCustomer}
      />

    </div>
  );
}
