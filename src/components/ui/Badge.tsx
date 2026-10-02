import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'brand' | 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'outline';
}

export function Badge({ variant = 'brand', className = '', children, ...props }: BadgeProps) {
  const baseClasses = "inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider";
  
  const variants = {
    brand: "bg-brand-primary-light text-brand-primary-dark",
    success: "bg-color-success/10 text-color-success",
    warning: "bg-color-warning/10 text-color-warning",
    error: "bg-color-error/10 text-color-error",
    info: "bg-color-info/10 text-color-info",
    neutral: "bg-bg-secondary text-text-secondary border border-border-subtle",
    outline: "border border-brand-primary text-brand-primary"
  };

  return (
    <span className={`${baseClasses} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
}
