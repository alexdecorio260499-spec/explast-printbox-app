import React from 'react';

export function Card({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const hasCustomPadding = /\bp[xytbr]?-|\bp-\b/.test(className);
  return (
    <div
      className={`bg-bg-card rounded-lg border border-border-subtle ${
        hasCustomPadding ? '' : 'p-5 sm:p-7'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
