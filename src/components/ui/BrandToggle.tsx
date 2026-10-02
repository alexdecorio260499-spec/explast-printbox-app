import React from 'react';

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
