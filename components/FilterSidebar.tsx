'use client';

import { DashboardFilters, SortOption } from '@/lib/types';

interface FilterSidebarProps {
  filters: DashboardFilters;
  onFiltersChange: (filters: DashboardFilters) => void;
  stockCount: number;
  researchedCount: number;
  watchlistCount: number;
  peRange: { min: number; max: number };
  roceRange: { min: number; max: number };
  profitVarRange: { min: number; max: number };
  isOpen: boolean;
  onClose: () => void;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'priority_score_desc', label: 'Priority Score' },
  { value: 'roce_desc', label: 'ROCE (High → Low)' },
  { value: 'profit_growth_desc', label: 'Profit Growth (High → Low)' },
  { value: 'pe_asc', label: 'P/E (Low → High)' },
  { value: 'recently_researched', label: 'Recently Researched' },
  { value: 's_no_asc', label: 'S.No (Default)' },
];

export default function FilterSidebar({
  filters,
  onFiltersChange,
  stockCount,
  researchedCount,
  watchlistCount,
  peRange,
  roceRange,
  profitVarRange,
  isOpen,
  onClose,
}: FilterSidebarProps) {
  const updateFilter = <K extends keyof DashboardFilters>(key: K, value: DashboardFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleRangeChange = (
    prefix: 'pe' | 'roce' | 'profit_var_3yrs',
    min: number | null,
    max: number | null
  ) => {
    updateFilter(`${prefix}_min` as keyof DashboardFilters, min);
    updateFilter(`${prefix}_max` as keyof DashboardFilters, max);
  };

  const completionPct = stockCount > 0 ? Math.round((researchedCount / stockCount) * 100) : 0;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed md:sticky md:top-14 inset-y-0 md:inset-y-auto left-0 z-50 md:z-0 w-72 md:w-64 md:flex-shrink-0 bg-background md:bg-transparent border-r border-app md:border-r-0 transform transition-transform md:translate-x-0 overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ maxHeight: 'calc(100vh - 3.5rem)' }}
      >
        <div className="p-4 md:p-0 md:py-4 space-y-5">
          <div className="flex items-center justify-between md:hidden">
            <h2 className="text-sm font-semibold text-foreground">Filters</h2>
            <button
              onClick={onClose}
              className="p-1 rounded text-muted hover:text-foreground"
              aria-label="Close filters"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Overview stats */}
          <div className="rounded-lg border border-app bg-card p-4 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">Overview</h3>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Total</span>
                <span className="font-medium text-foreground">{stockCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Researched</span>
                <span className="font-medium text-success">{researchedCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Watchlist</span>
                <span className="font-medium text-warning">{watchlistCount}</span>
              </div>
              <div className="pt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted">Progress</span>
                  <span className="font-medium text-primary">{completionPct}%</span>
                </div>
                <div className="h-1.5 bg-background rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">
              Search
            </label>
            <div className="relative">
              <svg
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                placeholder="Company name..."
                className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-app bg-card text-foreground placeholder-muted focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">
              Sort by
            </label>
            <select
              value={filters.sort_by}
              onChange={(e) => updateFilter('sort_by', e.target.value as SortOption)}
              className="w-full px-3 py-2 text-sm rounded-md border border-app bg-card text-foreground focus:outline-none focus:border-primary"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Quick filters */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">
              Filters
            </label>
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground hover:text-primary">
                <input
                  type="checkbox"
                  checked={filters.show_unresearched_only}
                  onChange={(e) => updateFilter('show_unresearched_only', e.target.checked)}
                  className="rounded border-app bg-card text-primary focus:ring-primary"
                />
                <span>Unresearched only</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground hover:text-primary">
                <input
                  type="checkbox"
                  checked={filters.show_red_flags_only}
                  onChange={(e) => updateFilter('show_red_flags_only', e.target.checked)}
                  className="rounded border-app bg-card text-primary focus:ring-primary"
                />
                <span>Has red flags</span>
              </label>
            </div>
          </div>

          {/* P/E range */}
          <RangeField
            label="P/E"
            min={filters.pe_min}
            max={filters.pe_max}
            minRange={peRange.min}
            maxRange={peRange.max}
            step={0.1}
            onChange={(min, max) => handleRangeChange('pe', min, max)}
          />

          {/* ROCE range */}
          <RangeField
            label="ROCE (%)"
            min={filters.roce_min}
            max={filters.roce_max}
            minRange={roceRange.min}
            maxRange={roceRange.max}
            step={0.5}
            onChange={(min, max) => handleRangeChange('roce', min, max)}
          />

          {/* Profit Growth range */}
          <RangeField
            label="Profit 3Y (%)"
            min={filters.profit_var_3yrs_min}
            max={filters.profit_var_3yrs_max}
            minRange={profitVarRange.min}
            maxRange={profitVarRange.max}
            step={1}
            onChange={(min, max) => handleRangeChange('profit_var_3yrs', min, max)}
          />

          <button
            onClick={() =>
              onFiltersChange({
                pe_min: null,
                pe_max: null,
                roce_min: null,
                roce_max: null,
                profit_var_3yrs_min: null,
                profit_var_3yrs_max: null,
                search: '',
                show_unresearched_only: false,
                show_red_flags_only: false,
                sort_by: 'priority_score_desc',
              })
            }
            className="w-full px-3 py-2 text-sm font-medium rounded-md border border-app bg-card text-muted hover:text-foreground hover:bg-card-hover"
          >
            Clear all filters
          </button>
        </div>
      </aside>
    </>
  );
}

function RangeField({
  label,
  min,
  max,
  minRange,
  maxRange,
  step,
  onChange,
}: {
  label: string;
  min: number | null;
  max: number | null;
  minRange: number;
  maxRange: number;
  step: number;
  onChange: (min: number | null, max: number | null) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">
        {label}
      </label>
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          value={min ?? ''}
          onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : null, max)}
          placeholder={minRange.toFixed(step < 1 ? 1 : 0)}
          step={step}
          className="w-full px-2 py-1.5 text-sm rounded-md border border-app bg-card text-foreground placeholder-muted focus:outline-none focus:border-primary"
        />
        <input
          type="number"
          value={max ?? ''}
          onChange={(e) => onChange(min, e.target.value ? parseFloat(e.target.value) : null)}
          placeholder={maxRange.toFixed(step < 1 ? 1 : 0)}
          step={step}
          className="w-full px-2 py-1.5 text-sm rounded-md border border-app bg-card text-foreground placeholder-muted focus:outline-none focus:border-primary"
        />
      </div>
      <p className="text-xs text-muted mt-1">
        {minRange.toFixed(step < 1 ? 1 : 0)} – {maxRange.toFixed(step < 1 ? 1 : 0)}
      </p>
    </div>
  );
}