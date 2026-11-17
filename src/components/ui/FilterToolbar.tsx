import React from 'react';
import { Search } from 'lucide-react';

export interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

export interface FilterToolbarProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  searchPlaceholder?: string;
  filterOptions?: FilterOption[];
  activeFilter?: string;
  onFilterChange?: (id: string) => void;
  rightContent?: React.ReactNode;
  className?: string;
}

export function FilterToolbar({
  searchTerm,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  filterOptions,
  activeFilter,
  onFilterChange,
  rightContent,
  className = '',
}: FilterToolbarProps) {
  return (
    <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 ${className}`}>
      {/* SEARCH BAR */}
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-bg-card border border-border-subtle rounded-lg pl-9 pr-4 py-2 text-xs text-text-primary focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 transition-colors"
        />
      </div>

      {/* FILTER PILLS & OPTIONAL RIGHT CONTENT */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 text-xs">
        {filterOptions && onFilterChange && (
          <div className="flex items-center gap-1.5">
            {filterOptions.map((opt) => {
              const isActive = activeFilter === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => onFilterChange(opt.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-brand-primary text-white shadow-xs'
                      : 'bg-bg-card text-text-secondary hover:text-text-primary border border-border-subtle hover:bg-bg-secondary/60'
                  }`}
                >
                  {opt.label}
                  {opt.count !== undefined && (
                    <span className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive ? 'bg-white/20 text-white' : 'bg-bg-secondary text-text-muted'
                    }`}>
                      {opt.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {rightContent && (
          <div className="shrink-0">
            {rightContent}
          </div>
        )}
      </div>
    </div>
  );
}
