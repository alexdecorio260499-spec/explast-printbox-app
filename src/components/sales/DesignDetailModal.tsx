'use client';

import React from 'react';
import { DemoDesignProject, DemoDesignStatus } from '@/types/demo';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import {
  X,
  Palette,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  Info,
  Calendar,
  Building,
  User,
  Sliders,
  FileCheck,
} from 'lucide-react';

interface DesignDetailModalProps {
  design: DemoDesignProject | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (id: string, newStatus: DemoDesignStatus) => void;
  onNavigateToCustomer?: (customerId: string) => void;
}

export function DesignDetailModal({
  design,
  isOpen,
  onClose,
  onStatusChange,
  onNavigateToCustomer,
}: DesignDetailModalProps) {
  if (!isOpen || !design) return null;

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

  const statusLabels: Record<DemoDesignStatus, string> = {
    awaiting_artwork: 'Awaiting Artwork File',
    brief_received: 'Design Brief Received',
    in_design: 'Prepress in Design',
    internal_review: 'Internal Technical Review',
    awaiting_approval: 'Awaiting Client Approval',
    revision_requested: 'Revision Requested',
    approved: 'Client Approved',
    ready_for_production: 'Cylinders Mounted / Ready',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-bg-card border border-border-subtle rounded-xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-bg-secondary/40">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-lg bg-brand-primary text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-semibold text-text-primary tracking-tight">
                  {design.design_reference}
                </h2>
                <Badge variant={statusBadgeVariants[design.status]}>
                  {statusLabels[design.status]}
                </Badge>
                <span className="text-[11px] text-text-muted font-medium bg-bg-secondary px-2 py-0.5 rounded">
                  v{design.version}.0 Proof
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-0.5">
                {design.artwork_title}
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
        <div className="bg-purple-500/10 border-b border-purple-500/20 px-6 py-2 flex items-center justify-between text-xs text-purple-700 dark:text-purple-400">
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 flex-shrink-0" />
            <span><strong>Fictional Packaging Mockup:</strong> Demonstrates flexographic cylinder preparation and spot color separations.</span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-purple-500/20 rounded">
            Prepress Studio
          </span>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* VISUAL PACKAGING MOCKUP PREVIEW */}
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2">
                Prepress Vector Proof Visualizer
              </span>
              <div className="flex-1 min-h-[300px] bg-gradient-to-br from-bg-secondary to-bg-card border border-border-subtle rounded-xl p-6 flex flex-col items-center justify-center relative shadow-inner overflow-hidden">
                
                {/* SVG Visual Mockup by packaging type */}
                <div className="relative w-56 h-72 border-2 border-dashed border-border-strong rounded-lg bg-bg-card p-4 shadow-xl flex flex-col justify-between">
                  {/* Top punch or tape header */}
                  <div className="flex justify-between items-center border-b border-border-subtle pb-2">
                    <span className="text-[9px] font-bold uppercase text-text-muted">Explast Flexo</span>
                    <div className="w-12 h-2 rounded-full bg-border-strong" />
                    <span className="text-[9px] font-mono text-text-muted">{design.num_colors}C</span>
                  </div>

                  {/* Artwork Center Motif */}
                  <div className="my-auto text-center space-y-2 p-2">
                    <div
                      className="w-12 h-12 mx-auto rounded-full flex items-center justify-center font-bold text-white shadow-md text-xs"
                      style={{ backgroundColor: design.spot_colors_hex[0] || '#168C86' }}
                    >
                      {design.client_name.charAt(0)}
                    </div>
                    <p className="text-xs font-bold text-text-primary leading-tight">
                      {design.client_name}
                    </p>
                    <p className="text-[10px] text-text-muted leading-tight">
                      {design.formulation}
                    </p>

                    {/* Color Swatch Bars in proof */}
                    <div className="flex justify-center gap-1.5 pt-2">
                      {design.spot_colors_hex.map((hex, i) => (
                        <div
                          key={i}
                          className="w-4 h-4 rounded-sm border border-black/20 shadow-sm"
                          style={{ backgroundColor: hex }}
                          title={design.color_names[i] || hex}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Bottom Barcode / Certification footer */}
                  <div className="border-t border-border-subtle pt-2 flex justify-between items-center text-[8px] text-text-muted font-mono">
                    <span>{design.dimensions_summary}</span>
                    <span>UN-REG 2026</span>
                  </div>
                </div>

                <span className="absolute bottom-2 right-3 text-[10px] text-text-muted font-mono">
                  Repeat: {design.cylinder_repeat_mm}mm | Web: {design.web_width_mm}mm
                </span>
              </div>
            </div>

            {/* PREPRESS & TECHNICAL SPECS */}
            <div className="space-y-4">
              <Card className="p-4 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" /> Machine Cylinder Parameters
                </span>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-text-muted">Cylinder Repeat:</span>
                    <p className="font-semibold text-text-primary font-mono">{design.cylinder_repeat_mm} mm</p>
                  </div>
                  <div>
                    <span className="text-text-muted">Web Printing Width:</span>
                    <p className="font-semibold text-text-primary font-mono">{design.web_width_mm} mm</p>
                  </div>
                  <div>
                    <span className="text-text-muted">Plate Thickness:</span>
                    <p className="font-semibold text-text-primary font-mono">{design.plate_thickness_mm} mm Photopolymer</p>
                  </div>
                  <div>
                    <span className="text-text-muted">Assigned Designer:</span>
                    <p className="font-semibold text-text-primary">{design.assigned_designer}</p>
                  </div>
                </div>
              </Card>

              {/* SPOT COLORS & SEPARATIONS */}
              <Card className="p-4 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5" /> Color Channels & Spot Pantones ({design.num_colors} Total)
                </span>

                <div className="space-y-2">
                  {design.color_names.map((cName, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded bg-bg-secondary/40 text-xs">
                      <div className="flex items-center space-x-2.5">
                        <div
                          className="w-5 h-5 rounded border border-border-strong shadow-sm"
                          style={{ backgroundColor: design.spot_colors_hex[idx] || '#ccc' }}
                        />
                        <span className="font-medium text-text-primary">{cName}</span>
                      </div>
                      <span className="font-mono text-[11px] text-text-muted">Plate #{idx + 1}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* CUSTOMER & PROJECT LINK */}
              <Card className="p-4 bg-bg-secondary/20">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Client Account</span>
                    <p className="text-sm font-semibold text-text-primary">{design.client_name}</p>
                    <p className="text-xs text-text-secondary mt-0.5">Project: {design.project_name}</p>
                  </div>
                  {onNavigateToCustomer && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onClose();
                        onNavigateToCustomer(design.client_id);
                      }}
                      className="text-xs"
                    >
                      Client 360° →
                    </Button>
                  )}
                </div>
              </Card>
            </div>

          </div>

          {/* REVISIONS & AUDIT LOG */}
          <div className="pt-4 border-t border-border-subtle">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">
              Prepress Proofing & Approval Log
            </h4>
            <div className="space-y-2">
              {design.revisions.map((rev, i) => (
                <div key={i} className="flex items-start text-xs space-x-3 p-3 rounded bg-bg-secondary/30 border border-border-subtle/50">
                  <Badge variant={rev.status.includes('Approved') || rev.status.includes('Production') ? 'success' : 'neutral'}>
                    v{rev.version}
                  </Badge>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-semibold text-text-primary">{rev.author} ({rev.status})</span>
                      <span className="text-text-muted text-[11px]">{rev.date}</span>
                    </div>
                    <p className="text-text-secondary text-xs mt-1">{rev.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ACTIONS */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border-subtle bg-bg-secondary/40">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>

          <div className="flex items-center space-x-2">
            {onStatusChange && design.status !== 'ready_for_production' && (
              <Button
                variant="outline"
                onClick={() => {
                  onStatusChange(design.id, 'ready_for_production');
                }}
                className="text-color-success border-color-success/40 hover:bg-color-success/10"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" /> Approve & Release to Production
              </Button>
            )}

            {onStatusChange && design.status === 'awaiting_approval' && (
              <Button
                variant="outline"
                onClick={() => {
                  onStatusChange(design.id, 'revision_requested');
                }}
              >
                Request Modification
              </Button>
            )}

            <Button onClick={() => window.print()}>
              <FileCheck className="w-4 h-4 mr-1.5" /> Export Proof Sheet
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
