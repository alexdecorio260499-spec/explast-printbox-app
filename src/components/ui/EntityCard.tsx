import React from 'react';
import { Card } from './Card';
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
}: EntityCardProps) {
  const initials = salespersonInitials || (salespersonName ? salespersonName.substring(0, 2).toUpperCase() : 'AL');

  return (
    <Card
      onClick={onClick}
      className={`p-4 border-t-2 border-t-brand-primary shadow-sm hover:border-brand-primary hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between h-full ${className}`}
    >
      <div>
        {/* TOP ROW: CATEGORY & HOVER ACTION */}
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted truncate max-w-[60%]">
            {category}
          </span>
          <span className="text-[11px] text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity font-medium shrink-0">
            {hoverActionText}
          </span>
        </div>

        {/* TITLE & SUBTITLE */}
        <h4 className="text-sm font-semibold text-text-primary mb-1 group-hover:text-brand-primary transition-colors truncate">
          {title}
        </h4>
        <p className="text-xs text-text-secondary mb-2 truncate">
          {subtitle}
        </p>

        {/* MIDDLE SPECIFICATION / METADATA CHIP */}
        {(specPrimary || specSecondary) && (
          <div className="mb-3 text-[10px] text-text-muted bg-bg-secondary px-2.5 py-1.5 rounded flex items-center justify-between gap-2">
            <span className="truncate">{specPrimary}</span>
            {specSecondary && (
              <span className="shrink-0 font-medium text-text-secondary font-mono">{specSecondary}</span>
            )}
          </div>
        )}
      </div>

      {/* FOOTER: SALES REP & STATUS BADGE */}
      <div className="flex items-center justify-between text-[11px] pt-2.5 border-t border-border-subtle/60">
        <div className="flex items-center gap-1.5 text-text-muted min-w-0">
          <div className="w-5 h-5 rounded-full bg-brand-primary-light text-brand-primary-dark flex items-center justify-center font-bold text-[9px] shrink-0">
            {initials}
          </div>
          <span className="text-[10px] font-medium text-text-secondary truncate">
            {salespersonName || 'Sales'}
          </span>
        </div>
        <Badge variant={statusVariant} className="shrink-0">
          {statusLabel}
        </Badge>
      </div>
    </Card>
  );
}
