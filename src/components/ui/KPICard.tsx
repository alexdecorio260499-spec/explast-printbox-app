import React from 'react';
import { Card } from './Card';
import { LucideIcon } from 'lucide-react';

export interface KPICardProps {
  label: string;
  value: string | number;
  trend?: string;
  accent?: 'brand' | 'purple' | 'amber' | 'success' | 'info' | 'neutral';
  icon?: LucideIcon;
  onClick?: () => void;
  className?: string;
}

export function KPICard({
  label,
  value,
  trend,
  accent = 'brand',
  icon: Icon,
  onClick,
  className = '',
}: KPICardProps) {
  const accentBorders = {
    brand: 'border-l-brand-primary',
    purple: 'border-l-purple-500',
    amber: 'border-l-color-warning',
    success: 'border-l-color-success',
    info: 'border-l-color-info',
    neutral: 'border-l-border-strong',
  };

  const accentValueColors = {
    brand: 'text-text-primary',
    purple: 'text-purple-600',
    amber: 'text-color-warning',
    success: 'text-color-success',
    info: 'text-color-info',
    neutral: 'text-text-primary',
  };

  return (
    <Card
      onClick={onClick}
      className={`p-4 border-l-4 ${accentBorders[accent]} ${
        onClick ? 'cursor-pointer hover:border-brand-primary transition-all' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted truncate mr-2">
          {label}
        </span>
        {Icon && <Icon className="w-3.5 h-3.5 text-text-muted shrink-0" />}
      </div>
      <p className={`font-mono text-2xl font-bold mt-1 ${accentValueColors[accent]}`}>{value}</p>
      {trend && <span className="text-xs text-text-secondary mt-1 block truncate">{trend}</span>}
    </Card>
  );
}
