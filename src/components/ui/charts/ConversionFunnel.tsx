'use client';

import React from 'react';
import { ArrowDown } from 'lucide-react';

export interface FunnelStage {
  label: string;
  count: number;
  valueMur?: number;
  color?: string;
}

interface ConversionFunnelProps {
  stages: FunnelStage[];
  className?: string;
}

export function ConversionFunnel({ stages, className = '' }: ConversionFunnelProps) {
  if (!stages || stages.length === 0) return null;

  const topCount = stages[0].count || 1;

  const defaultColors = [
    '#119A94', // Teal (Requests)
    '#0F827E', // Darker Teal (Quotes)
    '#6E4A9E', // Purple (Sent)
    '#553780', // Darker Purple (Accepted)
    '#4F8F68', // Emerald (Production released)
  ];

  return (
    <div className={`space-y-3 ${className}`}>
      {stages.map((stage, idx) => {
        const pctOfTop = Math.round((stage.count / topCount) * 100);
        const prevCount = idx > 0 ? stages[idx - 1].count : null;
        const stepConversion = prevCount !== null && prevCount > 0
          ? Math.round((stage.count / prevCount) * 100)
          : null;
        const color = stage.color || defaultColors[idx % defaultColors.length];

        return (
          <div key={stage.label} className="space-y-1">
            {/* STAGE HEADER */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-text-primary text-[11px] truncate">
                {idx + 1}. {stage.label}
              </span>
              <div className="flex items-center gap-2 font-mono">
                {stage.valueMur !== undefined && stage.valueMur > 0 && (
                  <span className="text-text-muted text-[10px] hidden sm:inline">
                    Rs {(stage.valueMur / 1000).toFixed(0)}k
                  </span>
                )}
                <span className="font-bold text-text-primary">{stage.count}</span>
                <span className="text-[10px] font-bold text-brand-primary w-10 text-right">
                  {pctOfTop}%
                </span>
              </div>
            </div>

            {/* HORIZONTAL FUNNEL BAR */}
            <div className="w-full h-3 bg-bg-secondary rounded-full overflow-hidden flex items-center">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.max(pctOfTop, 4)}%`,
                  backgroundColor: color,
                }}
              />
            </div>

            {/* STEP DROP-OFF OR CONVERSION NOTE */}
            {stepConversion !== null && (
              <div className="flex items-center justify-end gap-1 text-[9px] text-text-muted pr-1">
                <ArrowDown className="w-2.5 h-2.5 text-text-muted" />
                <span>{stepConversion}% step retention</span>
              </div>
            )}
          </div>
        );
      })}

      {/* OVERALL WIN RATE SUMMARY */}
      {stages.length >= 4 && (
        <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between text-xs bg-brand-primary-light/40 px-3 py-2 rounded-lg">
          <span className="font-semibold text-brand-primary-dark text-[11px]">
            End-to-End Win Rate (Enquiry → Won):
          </span>
          <span className="font-mono font-bold text-brand-primary text-sm">
            {Math.round((stages[3].count / topCount) * 100)}%
          </span>
        </div>
      )}
    </div>
  );
}
