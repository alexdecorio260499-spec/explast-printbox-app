import React from 'react';
import { Badge } from './Badge';

export interface EntityCardProps {
  id?: string;
  category: string;
  title: string;
  subtitle: string;
  specPrimary?: React.ReactNode;
  specSecondary?: React.ReactNode;
  salespersonName?: string;
  salespersonInitials?: string;
  statusLabel: string;
  statusVariant?: 'brand' | 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'outline';
  hoverActionText?: string;
  onClick?: () => void;
  className?: string;
  compact?: boolean;
}

export function EntityCard({
  category,
  title,
  subtitle,
  specPrimary,
  specSecondary,
  salespersonName,
  salespersonInitials,
  statusLabel,
  statusVariant = 'brand',
  hoverActionText = 'Open Details →',
  onClick,
  className = '',
  compact = false,
}: EntityCardProps) {
  const initials = salespersonInitials || (salespersonName ? salespersonName.substring(0, 2).toUpperCase() : 'AL');

  return (
    <div
      onClick={onClick}
      className={`bg-bg-card rounded-lg border border-border-subtle ${
        compact ? 'p-3' : 'p-3.5 sm:p-4'
      } border-t-2 border-t-brand-primary shadow-xs hover:border-brand-primary hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between ${className}`}
    >
      <div>
        {/* TOP ROW: CATEGORY & HOVER ACTION */}
        <div className="flex justify-between items-start gap-1.5 mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted truncate max-w-[65%]">
            {category}
          </span>
          <span className="text-[10px] text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity font-semibold shrink-0">
            {hoverActionText}
          </span>
        </div>

        {/* TITLE & SUBTITLE */}
        <h4
          className={`${
            compact ? 'text-xs' : 'text-sm'
          } font-semibold text-text-primary group-hover:text-brand-primary transition-colors line-clamp-2 leading-snug mb-0.5`}
        >
          {title}
        </h4>
        <p className={`${compact ? 'text-[11px] mb-1.5' : 'text-xs mb-2'} text-text-secondary truncate`}>
          {subtitle}
        </p>

        {/* MIDDLE SPECIFICATION / METADATA CHIP */}
        {(specPrimary || specSecondary) && (
          <div
            className={`${
              compact ? 'mb-2 py-1 px-2' : 'mb-2.5 py-1.5 px-2.5'
            } text-[10px] text-text-muted bg-bg-secondary rounded flex items-center justify-between gap-1.5`}
          >
            <span className="truncate">{specPrimary}</span>
            {specSecondary && (
              <span className="shrink-0 font-medium text-text-secondary font-mono">{specSecondary}</span>
            )}
          </div>
        )}
      </div>

      {/* FOOTER: SALES REP & STATUS BADGE */}
      <div
        className={`flex items-center justify-between text-[10px] ${
          compact ? 'pt-2' : 'pt-2.5'
        } border-t border-border-subtle/60 mt-auto`}
      >
        <div className="flex items-center gap-1.5 text-text-muted min-w-0">
          <div
            className={`${
              compact ? 'w-4 h-4 text-[8px]' : 'w-5 h-5 text-[9px]'
            } rounded-full bg-brand-primary-light text-brand-primary-dark flex items-center justify-center font-bold shrink-0`}
          >
            {initials}
          </div>
          <span className="text-[10px] font-medium text-text-secondary truncate">
            {salespersonName || 'Sales'}
          </span>
        </div>
        <Badge
          variant={statusVariant}
          className={`shrink-0 ${compact ? 'text-[9px] px-1.5 py-0' : 'text-[10px]'}`}
        >
          {statusLabel}
        </Badge>
      </div>
    </div>
  );
}
