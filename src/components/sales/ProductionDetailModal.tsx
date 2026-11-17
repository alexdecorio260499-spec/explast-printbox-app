'use client';

import React from 'react';
import { DemoProductionJob, DemoProductionStage } from '@/types/demo';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import {
  X,
  Factory,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  Info,
  Calendar,
  Building,
  User,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

interface ProductionDetailModalProps {
  job: DemoProductionJob | null;
  isOpen: boolean;
  onClose: () => void;
  onStageChange?: (id: string, newStage: DemoProductionStage) => void;
  onNavigateToCustomer?: (customerId: string) => void;
}

export function ProductionDetailModal({
  job,
  isOpen,
  onClose,
  onStageChange,
  onNavigateToCustomer,
}: ProductionDetailModalProps) {
  if (!isOpen || !job) return null;

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

  const stageLabels: Record<DemoProductionStage, string> = {
    scheduled: 'Scheduled for Extrusion',
    awaiting_material: 'Awaiting Resin / Additives',
    extrusion: 'Extrusion in Progress',
    awaiting_printing: 'Awaiting Flexo Printing',
    printing: 'Flexo Printing in Progress',
    conversion: 'Bag Sealing / Slitting Conversion',
    quality_control: 'Quality Control Inspection',
    completed: 'Production Run Completed',
    on_hold: 'Job on Hold',
  };

  // Progression steps
  const steps: { key: DemoProductionStage; label: string; icon: string }[] = job.is_printed
    ? [
        { key: 'scheduled', label: '1. Scheduled', icon: '📅' },
        { key: 'extrusion', label: '2. Extrusion', icon: '🌀' },
        { key: 'printing', label: '3. Printing', icon: '🎨' },
        { key: 'conversion', label: '4. Conversion', icon: '✂️' },
        { key: 'quality_control', label: '5. QC Check', icon: '🔬' },
        { key: 'completed', label: '6. Completed', icon: '✅' },
      ]
    : [
        { key: 'scheduled', label: '1. Scheduled', icon: '📅' },
        { key: 'extrusion', label: '2. Extrusion', icon: '🌀' },
        { key: 'conversion', label: '3. Conversion', icon: '✂️' },
        { key: 'quality_control', label: '4. QC Check', icon: '🔬' },
        { key: 'completed', label: '5. Completed', icon: '✅' },
      ];

  const currentStepIndex = steps.findIndex(s => s.key === job.current_stage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-bg-card border border-border-subtle rounded-xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-bg-secondary/40">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-lg bg-brand-primary text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
              <Factory className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-semibold text-text-primary tracking-tight font-mono">
                  {job.job_reference}
                </h2>
                <Badge variant={stageBadgeVariants[job.current_stage]}>
                  {stageLabels[job.current_stage]}
                </Badge>
                {job.priority === 'urgent' && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-color-error/15 text-color-error">
                    Urgent Priority
                  </span>
                )}
              </div>
              <p className="text-xs text-text-secondary mt-0.5">
                Client: <span className="font-semibold text-text-primary">{job.client_name}</span> • Project: {job.project_name}
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

        {/* DEMO BANNER */}
        <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-6 py-2 flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400">
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 flex-shrink-0" />
            <span><strong>Manufacturing Operations Tracker:</strong> Models Extrusion, Flexo Printing, and Conversion stages.</span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-emerald-500/20 rounded">
            Explast Plant Floor
          </span>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* STAGE PROGRESS TRACKER */}
          <div className="bg-bg-secondary/40 p-4 rounded-xl border border-border-subtle">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                Manufacturing Traveler Progression
              </span>
              <span className="text-xs font-mono font-bold text-brand-primary">
                {job.progress_percent}% Complete
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-bg-secondary rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-brand-primary transition-all duration-500"
                style={{ width: `${job.progress_percent}%` }}
              />
            </div>

            {/* Stage Steps */}
            <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-6 gap-2">
              {steps.map((s, idx) => {
                const isPassed = job.stages_completed.includes(s.key) || idx < currentStepIndex;
                const isCurrent = s.key === job.current_stage;

                return (
                  <div
                    key={s.key}
                    className={`p-2 rounded-lg border text-center text-xs transition-colors ${
                      isCurrent
                        ? 'border-brand-primary bg-brand-primary-light text-brand-primary-dark font-semibold'
                        : isPassed
                        ? 'border-color-success/30 bg-color-success/10 text-text-primary'
                        : 'border-border-subtle bg-bg-card/50 text-text-muted'
                    }`}
                  >
                    <div className="text-sm mb-1">{s.icon}</div>
                    <p className="truncate text-[11px]">{s.label}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3-COLUMN MACHINE & FORMULATION ALLOCATION */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Extrusion Specification */}
            <Card className="p-4 space-y-2 border-t-2 border-t-brand-primary">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-primary">
                1. Extrusion Stage
              </span>
              <p className="text-xs font-semibold text-text-primary">{job.extrusion_line}</p>
              <div className="text-xs space-y-1 text-text-secondary pt-1">
                <p>Material: <strong className="text-text-primary">{job.material_family}</strong></p>
                <p className="truncate" title={job.formulation}>Blend: {job.formulation}</p>
                <p>Target Gauge: <strong className="text-text-primary">{job.thickness_micron} µm</strong></p>
              </div>
            </Card>

            {/* Printing Stage */}
            <Card className="p-4 space-y-2 border-t-2 border-t-purple-500">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">
                2. Printing Stage
              </span>
              <p className="text-xs font-semibold text-text-primary">
                {job.is_printed ? (job.printing_press || 'Flexo Stack Press') : 'Bypassed (Plain Product)'}
              </p>
              <div className="text-xs space-y-1 text-text-secondary pt-1">
                <p>Print Type: <strong className="text-text-primary">{job.is_printed ? `${job.num_colors} Colours Flexo` : 'Plain Film'}</strong></p>
                <p>Solvent Ink: {job.is_printed ? 'Polyamide High Adhesion' : 'N/A'}</p>
                <p>Corona Treatment: {job.is_printed ? '42 Dynes/cm' : 'None Required'}</p>
              </div>
            </Card>

            {/* Conversion Stage */}
            <Card className="p-4 space-y-2 border-t-2 border-t-emerald-500">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                3. Final Conversion Stage
              </span>
              <p className="text-xs font-semibold text-text-primary">{job.conversion_line}</p>
              <div className="text-xs space-y-1 text-text-secondary pt-1">
                <p>Product: <strong className="text-text-primary">{job.product_type}</strong></p>
                <p>Size: {job.dimensions_summary}</p>
                <p>QC Status: <strong className="text-color-success">{job.qc_status.toUpperCase()}</strong></p>
              </div>
            </Card>
          </div>

          {/* QUANTITY & SCHEDULE METRICS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-bg-secondary/30 border border-border-subtle text-xs">
            <div>
              <span className="text-text-muted text-[10px] uppercase font-semibold">Required Volume</span>
              <p className="font-mono text-base font-bold text-text-primary mt-0.5">
                {job.required_quantity.toLocaleString()} {job.quantity_unit}
              </p>
            </div>
            <div>
              <span className="text-text-muted text-[10px] uppercase font-semibold">Produced to Date</span>
              <p className="font-mono text-base font-bold text-brand-primary mt-0.5">
                {job.produced_quantity.toLocaleString()} {job.quantity_unit}
              </p>
            </div>
            <div>
              <span className="text-text-muted text-[10px] uppercase font-semibold">Start Date</span>
              <p className="font-medium text-text-primary mt-0.5">{job.planned_start_date}</p>
            </div>
            <div>
              <span className="text-text-muted text-[10px] uppercase font-semibold">Target Completion</span>
              <p className="font-medium text-text-primary mt-0.5">{job.target_completion_date}</p>
            </div>
          </div>

          {/* OPERATOR NOTES */}
          <Card className="p-4 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-color-success" /> Quality Assurance & Production Log
            </span>
            <p className="text-xs text-text-secondary leading-relaxed">
              {job.internal_notes || 'Extrusion parameters maintained within ±3µm gauge tolerance. Heat sealing temperatures calibrated.'}
            </p>
          </Card>

        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border-subtle bg-bg-secondary/40">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>

          <div className="flex items-center space-x-2">
            {onStageChange && job.current_stage !== 'completed' && (
              <Button
                onClick={() => {
                  // Advance to next logical stage
                  const nextIndex = currentStepIndex + 1;
                  if (nextIndex < steps.length) {
                    onStageChange(job.id, steps[nextIndex].key);
                  }
                }}
              >
                Advance to Next Stage <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            )}

            {onNavigateToCustomer && (
              <Button
                variant="outline"
                onClick={() => {
                  onClose();
                  onNavigateToCustomer(job.client_id);
                }}
              >
                View Customer 360° Profile
              </Button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
