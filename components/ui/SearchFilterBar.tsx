import React from 'react';
import { Search } from 'lucide-react';

export interface FilterOption<T extends string = string> {
  value: T;
  label: string;
  count?: number;
}

interface SearchFilterBarProps<T extends string = string> {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filterOptions?: FilterOption<T>[];
  activeFilter?: T;
  onFilterChange?: (value: T) => void;
  className?: string;
  rightSlot?: React.ReactNode;
}

export default function SearchFilterBar<T extends string = string>({
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filterOptions,
  activeFilter,
  onFilterChange,
  className = '',
  rightSlot,
}: SearchFilterBarProps<T>) {
  return (
    <div
      className={`bg-card/90 border border-gunmetal p-4 flex flex-col md:flex-row items-center justify-between gap-4 ${className}`}
    >
      <div className="relative w-full md:w-80">
        <Search className="w-4 h-4 text-mutedKhaki absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-surface border border-gunmetal pl-10 pr-4 py-2 text-xs font-mono text-tacticalWhite placeholder-mutedKhaki/60 focus:outline-none focus:border-olive"
        />
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 flex-wrap">
        {filterOptions &&
          onFilterChange &&
          filterOptions.map((opt) => {
            const isActive = activeFilter === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onFilterChange(opt.value)}
                className={`px-3 py-1.5 text-xs font-mono uppercase font-bold tracking-wider transition-colors border ${
                  isActive
                    ? 'bg-olive text-black font-bold border-olive'
                    : 'bg-surface text-mutedKhaki border-gunmetal hover:text-tacticalWhite'
                }`}
              >
                {opt.label} {opt.count !== undefined ? `(${opt.count})` : ''}
              </button>
            );
          })}
        {rightSlot}
      </div>
    </div>
  );
}

