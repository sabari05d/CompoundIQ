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
  { value: 'priority_score_desc', label: 'Priority Score (High to Low)' },
  { value: 'roce_desc', label: 'ROCE (High to Low)' },
  { value: 'profit_growth_desc', label: 'Profit Growth 3Y (High to Low)' },
  { value: 'pe_asc', label: 'P/E (Low to High)' },
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

  const handleRangeChange = (prefix: 'pe' | 'roce' | 'profit_var_3yrs', min: number | null, max: number | null) => {
    updateFilter(`${prefix}_min` as keyof DashboardFilters, min);
    updateFilter(`${prefix}_max` as keyof DashboardFilters, max);
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Filters"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
            <button
              onClick={onClose}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              aria-label="Close filters"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Overview</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Total Stocks</span>
                  <span className="font-medium text-gray-900 dark:text-white">{stockCount}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Researched</span>
                  <span className="font-medium text-green-600 dark:text-green-400">{researchedCount}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Watchlist</span>
                  <span className="font-medium text-yellow-600 dark:text-yellow-400">{watchlistCount}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Completion</span>
                  <span className="font-medium text-indigo-600 dark:text-indigo-400">
                    {stockCount > 0 ? Math.round((researchedCount / stockCount) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Search</h3>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                placeholder="Search by company name..."
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">P/E Range</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-10">Min</span>
                  <input
                    type="number"
                    value={filters.pe_min ?? ''}
                    onChange={(e) => handleRangeChange('pe', e.target.value ? parseFloat(e.target.value) : null, filters.pe_max)}
                    placeholder="0"
                    className="flex-1 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                    min="0"
                    step="0.1"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-10">Max</span>
                  <input
                    type="number"
                    value={filters.pe_max ?? ''}
                    onChange={(e) => handleRangeChange('pe', filters.pe_min, e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder={peRange.max.toFixed(1)}
                    className="flex-1 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                    min="0"
                    step="0.1"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Range: {peRange.min.toFixed(1)} - {peRange.max.toFixed(1)}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">ROCE Range</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-10">Min</span>
                  <input
                    type="number"
                    value={filters.roce_min ?? ''}
                    onChange={(e) => handleRangeChange('roce', e.target.value ? parseFloat(e.target.value) : null, filters.roce_max)}
                    placeholder="0"
                    className="flex-1 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                    min="0"
                    step="0.1"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-10">Max</span>
                  <input
                    type="number"
                    value={filters.roce_max ?? ''}
                    onChange={(e) => handleRangeChange('roce', filters.roce_min, e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder={roceRange.max.toFixed(1)}
                    className="flex-1 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                    min="0"
                    step="0.1"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Range: {roceRange.min.toFixed(1)}% - {roceRange.max.toFixed(1)}%</p>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Profit Growth 3Y Range</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-10">Min</span>
                  <input
                    type="number"
                    value={filters.profit_var_3yrs_min ?? ''}
                    onChange={(e) => handleRangeChange('profit_var_3yrs', e.target.value ? parseFloat(e.target.value) : null, filters.profit_var_3yrs_max)}
                    placeholder={profitVarRange.min.toFixed(1)}
                    className="flex-1 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                    step="0.1"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-10">Max</span>
                  <input
                    type="number"
                    value={filters.profit_var_3yrs_max ?? ''}
                    onChange={(e) => handleRangeChange('profit_var_3yrs', filters.profit_var_3yrs_min, e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder={profitVarRange.max.toFixed(1)}
                    className="flex-1 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                    step="0.1"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Range: {profitVarRange.min.toFixed(1)}% - {profitVarRange.max.toFixed(1)}%</p>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Quick Filters</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.show_unresearched_only}
                    onChange={(e) => updateFilter('show_unresearched_only', e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Unresearched only</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.show_red_flags_only}
                    onChange={(e) => updateFilter('show_red_flags_only', e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Has red flags only</span>
                </label>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Sort By</h3>
              <select
                value={filters.sort_by}
                onChange={(e) => updateFilter('sort_by', e.target.value as SortOption)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <button
                onClick={() => onFiltersChange({
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
                })}
                className="w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}