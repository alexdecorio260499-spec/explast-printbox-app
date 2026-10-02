import os

components = {
    "src/components/ui/Button.tsx": """import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) {
  const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary/50 disabled:opacity-50 disabled:pointer-events-none";
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };
  
  const variantClasses = {
    primary: "bg-brand-primary text-white hover:bg-brand-primary-dark",
    secondary: "bg-bg-card border border-border-strong text-text-primary hover:bg-bg-secondary",
    accent: "bg-brand-secondary text-white hover:bg-brand-secondary-dark",
    outline: "border border-brand-primary text-brand-primary hover:bg-brand-primary-light",
    ghost: "text-text-secondary hover:bg-brand-primary-light hover:text-brand-primary-dark"
  };

  return (
    <button 
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
""",
    "src/components/ui/Card.tsx": """import React from 'react';

export function Card({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`bg-bg-card rounded-lg border border-border-subtle p-5 sm:p-7 ${className}`} {...props}>
      {children}
    </div>
  );
}
""",
    "src/components/ui/Badge.tsx": """import React from 'react';

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
""",
    "src/components/ui/BrandToggle.tsx": """import React from 'react';

interface BrandToggleProps {
  brand: 'Explast' | 'PrintBox';
  onChange: (brand: 'Explast' | 'PrintBox') => void;
}

export function BrandToggle({ brand, onChange }: BrandToggleProps) {
  return (
    <div className="inline-flex items-center rounded-md border border-border-strong p-1 bg-bg-card">
      <button
        onClick={() => onChange('Explast')}
        className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors ${
          brand === 'Explast'
            ? 'bg-brand-primary text-white'
            : 'text-text-secondary hover:bg-bg-secondary'
        }`}
      >
        Explast
      </button>
      <button
        onClick={() => onChange('PrintBox')}
        className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors ${
          brand === 'PrintBox'
            ? 'bg-brand-primary text-white'
            : 'text-text-secondary hover:bg-bg-secondary'
        }`}
      >
        PrintBox
      </button>
    </div>
  );
}
"""
}

for path, content in components.items():
    with open(path, 'w') as f:
        f.write(content)

print("Created components")
