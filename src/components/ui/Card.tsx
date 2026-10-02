import React from 'react';

export function Card({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`bg-bg-card rounded-lg border border-border-subtle p-5 sm:p-7 ${className}`} {...props}>
      {children}
    </div>
  );
}
