'use client';

import React, { useState } from 'react';
import { DemoProductionJob, DemoProductionStage, AppUser } from '@/types/demo';
import { DemoService } from '@/lib/sales/demo-service';
import { ProductionDetailModal } from './ProductionDetailModal';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { KPICard } from '../ui/KPICard';
import { PageHeader } from '../ui/PageHeader';
import { FilterToolbar } from '../ui/FilterToolbar';
import {
  Factory,
  Search,
  Layers,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface ProductionViewProps {
  brand: string;
  currentUser?: AppUser;
  onNavigateToCustomer?: (customerId: string) => void;
}

export function ProductionView({
  brand,
  currentUser,
  onNavigateToCustomer,
}: ProductionViewProps) {
  const [jobs, setJobs] = useState<DemoProductionJob[]>(() => DemoService.getProductionJobs());
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [selectedJob, setSelectedJob] = useState<DemoProductionJob | null>(null);

  function handleStageChange(id: string, newStage: DemoProductionStage) {
    DemoService.updateProductionStage(id, newStage);
    const updated = DemoService.getProductionJobs();
    setJobs(updated);
    if (selectedJob && selectedJob.id === id) {
      setSelectedJob(updated.find(j => j.id === id) || null);
    }
  }

  // KPIs
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(j => j.current_stage !== 'completed').length;
  const extrusionJobs = jobs.filter(j => j.current_stage === 'extrusion').length;
  const printingJobs = jobs.filter(j => j.current_stage === 'printing').length;
  const conversionJobs = jobs.filter(j => j.current_stage === 'conversion').length;
  const qcJobs = jobs.filter(j => j.current_stage === 'quality_control').length;
  const completedJobs = jobs.filter(j => j.current_stage === 'completed').length;

  const filteredJobs = jobs.filter(j => {
    const matchesSearch =
      j.job_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.project_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStage = stageFilter === 'all' || j.current_stage === stageFilter;

    return matchesSearch && matchesStage;
  });

  const stageBadgeVariants: Record<DemoProductionStage, 'brand' | 'success' | 'warning' | 'error' | 'neutral'> = {
    scheduled: 'neutral',
    awaiting_material: 'warning',
    extrusion: 'brand',
    awaiting_printing: 'warning',
    printing: 'brand',
    conversion: 'brand',
    quality_control: 'warning',
    completed: 'success',
    on_hold: 'error',
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* HEADER */}
      <PageHeader
        eyebrow="Manufacturing Execution System (MES)"
        title="Production & Plant Floor"
        actions={
          <span className="text-xs text-text-muted bg-bg-secondary px-3 py-1.5 rounded-lg border border-border-subtle flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-color-success" /> Auto-Dispatched via Accepted Client Quotations
          </span>
        }
      />

      {/* KPI METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard label="Active Runs" value={activeJobs} accent="brand" />
        <KPICard label="In Extrusion" value={extrusionJobs} accent="brand" />
        <KPICard label="In Printing" value={printingJobs} accent="purple" />
        <KPICard label="In Conversion" value={conversionJobs} accent="success" />
        <KPICard label="In QC Testing" value={qcJobs} accent="amber" />
        <KPICard label="Completed Runs" value={completedJobs} accent="success" />
      </div>

      {/* SEARCH & FILTERS */}
      <FilterToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search job #, customer, or product..."
        activeFilter={stageFilter}
        onFilterChange={setStageFilter}
        filterOptions={[
          { id: 'all', label: 'All Jobs' },
          { id: 'extrusion', label: 'Extrusion' },
          { id: 'printing', label: 'Printing' },
          { id: 'conversion', label: 'Conversion' },
          { id: 'quality_control', label: 'QC' },
          { id: 'completed', label: 'Completed' },
        ]}
      />

      {/* PRODUCTION JOBS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredJobs.map((j) => (
          <Card
            key={j.id}
            className="p-4 border-t-2 border-t-brand-primary shadow-sm hover:border-brand-primary hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            onClick={() => setSelectedJob(j)}
          >
            <div>
              {/* HEADER */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm font-bold text-text-primary">{j.job_reference}</span>
                    <Badge variant={stageBadgeVariants[j.current_stage]}>
                      {j.current_stage.toUpperCase()}
                    </Badge>
                  </div>
                  <h3 className="text-xs font-semibold text-text-secondary mt-0.5">{j.client_name}</h3>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-text-muted uppercase">Target</span>
                  <p className="text-xs font-mono font-medium text-text-primary">{j.target_completion_date}</p>
                </div>
              </div>

              {/* PROGRESS BAR */}
              <div className="space-y-1 mb-4">
                <div className="flex justify-between text-[11px]">
                  <span className="text-text-muted">Progress</span>
                  <span className="font-mono font-bold text-brand-primary">{j.progress_percent}%</span>
                </div>
                <div className="w-full h-1.5 bg-bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-primary transition-all duration-300"
                    style={{ width: `${j.progress_percent}%` }}
                  />
                </div>
              </div>

              {/* PRODUCT SPECS & MACHINE LINE */}
              <div className="grid grid-cols-2 gap-3 text-xs p-3 bg-bg-secondary/30 rounded-lg border border-border-subtle mb-3">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-text-muted">Specification</span>
                  <p className="font-medium text-text-primary mt-0.5">{j.product_type}</p>
                  <p className="text-[11px] text-text-secondary truncate">{j.formulation}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-text-muted">Machine Line</span>
                  <p className="font-medium text-text-primary mt-0.5 truncate">{j.extrusion_line}</p>
                  <p className="text-[11px] text-text-secondary truncate">{j.conversion_line}</p>
                </div>
              </div>

              {/* VOLUME */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-muted">
                  Batch: <strong>{j.produced_quantity.toLocaleString()}</strong> of {j.required_quantity.toLocaleString()} {j.quantity_unit}
                </span>
                <span className="text-[11px] font-mono font-medium text-color-success">
                  QC: {j.qc_status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* CARD FOOTER */}
            <div className="mt-4 pt-3 border-t border-border-subtle flex justify-between items-center text-xs">
              <span className="text-text-muted text-[11px]">{j.assigned_team}</span>
              <span className="text-brand-primary font-medium group-hover:underline flex items-center gap-1">
                Open Production Traveler →
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* DETAIL MODAL */}
      <ProductionDetailModal
        job={selectedJob}
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        onStageChange={handleStageChange}
        onNavigateToCustomer={onNavigateToCustomer}
      />

    </div>
  );
}
