'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { DashboardFilters, SortOption } from '@/lib/types';

interface FiltersContextValue {
  filters: DashboardFilters;
  currentPage: number;
  setFilter: <K extends keyof DashboardFilters>(key: K, value: DashboardFilters[K]) => void;
  setFilters: (filters: DashboardFilters) => void;
  setCurrentPage: (page: number) => void;
  clearFilters: () => void;
  resetToDefaults: () => void;
}

const FiltersContext = createContext<FiltersContextValue | null>(null);

const DEFAULT_FILTERS: DashboardFilters = {
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
};

const STORAGE_KEY = 'multibagger_filters';
const PAGE_STORAGE_KEY = 'multibagger_page';

function serializeFilters(filters: DashboardFilters): Record<string, string> {
  const params: Record<string, string> = {};
  if (filters.pe_min !== null) params.pe_min = String(filters.pe_min);
  if (filters.pe_max !== null) params.pe_max = String(filters.pe_max);
  if (filters.roce_min !== null) params.roce_min = String(filters.roce_min);
  if (filters.roce_max !== null) params.roce_max = String(filters.roce_max);
  if (filters.profit_var_3yrs_min !== null) params.pv3_min = String(filters.profit_var_3yrs_min);
  if (filters.profit_var_3yrs_max !== null) params.pv3_max = String(filters.profit_var_3yrs_max);
  if (filters.search) params.q = filters.search;
  if (filters.show_unresearched_only) params.unresearched = '1';
  if (filters.show_red_flags_only) params.redflags = '1';
  if (filters.sort_by !== 'priority_score_desc') params.sort = filters.sort_by;
  return params;
}

function deserializeFilters(params: URLSearchParams): DashboardFilters {
  return {
    pe_min: params.get('pe_min') ? parseFloat(params.get('pe_min')!) : null,
    pe_max: params.get('pe_max') ? parseFloat(params.get('pe_max')!) : null,
    roce_min: params.get('roce_min') ? parseFloat(params.get('roce_min')!) : null,
    roce_max: params.get('roce_max') ? parseFloat(params.get('roce_max')!) : null,
    profit_var_3yrs_min: params.get('pv3_min') ? parseFloat(params.get('pv3_min')!) : null,
    profit_var_3yrs_max: params.get('pv3_max') ? parseFloat(params.get('pv3_max')!) : null,
    search: params.get('q') || '',
    show_unresearched_only: params.get('unresearched') === '1',
    show_red_flags_only: params.get('redflags') === '1',
    sort_by: (params.get('sort') as SortOption) || 'priority_score_desc',
  };
}

export function FiltersProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filters, setFiltersState] = useState<DashboardFilters>(DEFAULT_FILTERS);
  const [currentPage, setCurrentPageState] = useState(1);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from URL → localStorage → defaults
  useEffect(() => {
    if (hydrated) return;

    let loaded = DEFAULT_FILTERS;
    let page = 1;

    if (searchParams.toString()) {
      loaded = deserializeFilters(searchParams);
      const pageParam = searchParams.get('page');
      if (pageParam) page = Math.max(1, parseInt(pageParam, 10));
    } else if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          loaded = { ...DEFAULT_FILTERS, ...parsed };
        }
        const storedPage = localStorage.getItem(PAGE_STORAGE_KEY);
        if (storedPage) page = Math.max(1, parseInt(storedPage, 10));
      } catch (e) {
        // ignore
      }
    }

    setFiltersState(loaded);
    setCurrentPageState(page);
    setHydrated(true);
  }, [hydrated, searchParams]);

  // Sync to URL and localStorage whenever filters change
  useEffect(() => {
    if (!hydrated) return;
    if (pathname !== '/') return;

    const params = serializeFilters(filters);
    if (currentPage > 1) params.page = String(currentPage);

    const queryString = new URLSearchParams(params).toString();
    router.replace(queryString ? `/?${queryString}` : '/', { scroll: false });

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
      localStorage.setItem(PAGE_STORAGE_KEY, String(currentPage));
    } catch (e) {
      // ignore
    }
  }, [filters, currentPage, hydrated, pathname, router]);

  const setFilter = useCallback(
    <K extends keyof DashboardFilters>(key: K, value: DashboardFilters[K]) => {
      setFiltersState((prev) => ({ ...prev, [key]: value }));
      if (key !== 'search') setCurrentPageState(1);
    },
    []
  );

  const setFilters = useCallback((newFilters: DashboardFilters) => {
    setFiltersState(newFilters);
    setCurrentPageState(1);
  }, []);

  const setCurrentPage = useCallback((page: number) => {
    setCurrentPageState(Math.max(1, page));
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
    setCurrentPageState(1);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(PAGE_STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  }, []);

  const resetToDefaults = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
    setCurrentPageState(1);
  }, []);

  return (
    <FiltersContext.Provider
      value={{
        filters,
        currentPage,
        setFilter,
        setFilters,
        setCurrentPage,
        clearFilters,
        resetToDefaults,
      }}
    >
      {children}
    </FiltersContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FiltersContext);
  if (!context) {
    throw new Error('useFilters must be used within FiltersProvider');
  }
  return context;
}