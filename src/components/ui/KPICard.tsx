import React from 'react';
import { Card } from './Card';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Sparkline } from './charts/Sparkline';

export interface KPICardProps {
  label: string;
  value: string | number;
  trend?: string;
  variation?: {
    percent: number;
    isPositive?: boolean;
    comparisonText?: string;
  };
  sparklineData?: number[];
  sparklineColor?: 'teal' | 'purple' | 'emerald' | 'amber';
  accent?: 'brand' | 'purple' | 'amber' | 'success' | 'info' | 'neutral';
  icon?: LucideIcon;
  onClick?: () => void;
  className?: string;
}

export function KPICard({
  label,
  value,
  trend,
  variation,
  sparklineData,
  sparklineColor = 'teal',
  accent = 'brand',
  icon: Icon,
  onClick,
  className = '',
}: KPICardProps) {
  const accentBorders = {
    brand: 'border-l-brand-primary',
    purple: 'border-l-[#6E4A9E]',
    amber: 'border-l-color-warning',
    success: 'border-l-color-success',
    info: 'border-l-color-info',
    neutral: 'border-l-border-strong',
  };

  const accentValueColors = {
    brand: 'text-text-primary',
    purple: 'text-[#6E4A9E]',
    amber: 'text-color-warning',
    success: 'text-color-success',
    info: 'text-color-info',
    neutral: 'text-text-primary',
  };

  return (
    <Card
      onClick={onClick}
      className={`p-4 border-l-4 ${accentBorders[accent]} shadow-sm hover:shadow-md transition-all ${
        onClick ? 'cursor-pointer hover:border-brand-primary' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted truncate">
          {label}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          {sparklineData && sparklineData.length > 1 && (
            <Sparkline
              data={sparklineData}
              color={sparklineColor}
              width={56}
              height={18}
            />
          )}
          {Icon && <Icon className="w-4 h-4 text-text-muted shrink-0" />}
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2 mt-1">
        <p className={`font-mono text-2xl font-bold ${accentValueColors[accent]}`}>{value}</p>
        
        {variation && (
          <div
            className={`flex items-center gap-0.5 text-[11px] font-bold shrink-0 ${
              variation.percent >= 0 ? 'text-[#4F8F68]' : 'text-[#B85C5C]'
            }`}
          >
            {variation.percent >= 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>
              {variation.percent >= 0 ? `+${variation.percent}%` : `${variation.percent}%`}
            </span>
          </div>
        )}
      </div>

      {(trend || variation?.comparisonText) && (
        <span className="text-[11px] text-text-secondary mt-1.5 block truncate">
          {trend || variation?.comparisonText}
        </span>
      )}
    </Card>
  );
}
