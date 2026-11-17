'use client';

import React, { useState } from 'react';
import { DemoProductionJob, DemoProductionStage, AppUser } from '@/types/demo';
import { DemoService } from '@/lib/sales/demo-service';
import { ProductionDetailModal } from './ProductionDetailModal';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
            Manufacturing Execution System (MES)
          </h2>
          <h1 className="text-2xl font-medium text-text-primary">Production & Plant Floor</h1>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs text-text-muted bg-bg-secondary px-3 py-1.5 rounded-lg border border-border-subtle flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-color-success" /> Auto-Dispatched via Accepted Client Quotations
          </span>
        </div>
      </div>

      {/* KPI METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-3 text-center border-t-2 border-t-brand-primary">
          <span className="text-[10px] font-bold uppercase text-text-muted">Active Runs</span>
          <p className="font-mono text-xl font-bold text-text-primary mt-1">{activeJobs}</p>
        </Card>

        <Card className="p-3 text-center border-t-2 border-t-brand-primary">
          <span className="text-[10px] font-bold uppercase text-text-muted">In Extrusion</span>
          <p className="font-mono text-xl font-bold text-brand-primary mt-1">{extrusionJobs}</p>
        </Card>

        <Card className="p-3 text-center border-t-2 border-t-purple-500">
          <span className="text-[10px] font-bold uppercase text-text-muted">In Printing</span>
          <p className="font-mono text-xl font-bold text-purple-600 mt-1">{printingJobs}</p>
        </Card>

        <Card className="p-3 text-center border-t-2 border-t-emerald-500">
          <span className="text-[10px] font-bold uppercase text-text-muted">In Conversion</span>
          <p className="font-mono text-xl font-bold text-emerald-600 mt-1">{conversionJobs}</p>
        </Card>

        <Card className="p-3 text-center border-t-2 border-t-color-warning">
          <span className="text-[10px] font-bold uppercase text-text-muted">In QC Testing</span>
          <p className="font-mono text-xl font-bold text-color-warning mt-1">{qcJobs}</p>
        </Card>

        <Card className="p-3 text-center border-t-2 border-t-color-success">
          <span className="text-[10px] font-bold uppercase text-text-muted">Completed Runs</span>
          <p className="font-mono text-xl font-bold text-color-success mt-1">{completedJobs}</p>
        </Card>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search job #, customer, or product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-bg-card border border-border-subtle rounded-lg pl-9 pr-4 py-2 text-xs text-text-primary focus:outline-none focus:border-brand-primary transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          {[
            { id: 'all', label: 'All Jobs' },
            { id: 'extrusion', label: 'Extrusion' },
            { id: 'printing', label: 'Printing' },
            { id: 'conversion', label: 'Conversion' },
            { id: 'quality_control', label: 'QC' },
            { id: 'completed', label: 'Completed' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStageFilter(f.id)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                stageFilter === f.id
                  ? 'bg-brand-primary text-white'
                  : 'bg-bg-card text-text-secondary hover:text-text-primary border border-border-subtle'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* PRODUCTION JOBS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredJobs.map((j) => (
          <Card
            key={j.id}
            className="p-5 flex flex-col justify-between hover:border-brand-primary transition-all cursor-pointer group shadow-sm"
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
