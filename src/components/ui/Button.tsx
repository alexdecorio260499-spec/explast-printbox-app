import React from 'react';

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
