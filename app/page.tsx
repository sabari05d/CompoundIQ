'use client';

import { useMemo, useState, useEffect, Suspense } from 'react';
import { useStocks } from '@/contexts/StocksContext';
import { useFilters } from '@/contexts/FiltersContext';
import { calculatePriorityScore } from '@/lib/utils';
import StockTable from '@/components/StockTable';
import FilterSidebar from '@/components/FilterSidebar';
import Pagination from '@/components/Pagination';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import { SortOption } from '@/lib/types';

const PAGE_SIZE = 20;

function DashboardContent() {
  const { stocks, researchMap, redFlagsMap, watchlistSet, loading, error, refresh } = useStocks();
  const { filters, currentPage, setFilters, setCurrentPage, clearFilters } = useFilters();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const peValues = stocks.map((s) => s.pe).filter((v): v is number => v !== null);
  const roceValues = stocks.map((s) => s.roce).filter((v): v is number => v !== null);
  const profitVarValues = stocks.map((s) => s.profit_var_3yrs).filter((v): v is number => v !== null);

  const peRange = {
    min: peValues.length ? Math.min(...peValues) : 0,
    max: peValues.length ? Math.max(...peValues) : 100,
  };
  const roceRange = {
    min: roceValues.length ? Math.min(...roceValues) : 0,
    max: roceValues.length ? Math.max(...roceValues) : 50,
  };
  const profitVarRange = {
    min: profitVarValues.length ? Math.min(...profitVarValues) : -50,
    max: profitVarValues.length ? Math.max(...profitVarValues) : 200,
  };

  const enrichedStocks = useMemo(() => {
    return stocks.map((stock) => {
      const research = researchMap.get(stock.id) || null;
      const redFlags = redFlagsMap.get(stock.id) || [];
      const priorityScore = calculatePriorityScore(stock);
      return {
        ...stock,
        research,
        red_flags: redFlags,
        priority_score: priorityScore,
        in_watchlist: watchlistSet.has(stock.id),
      };
    });
  }, [stocks, researchMap, redFlagsMap, watchlistSet]);

  const filteredStocks = useMemo(() => {
    let result = [...enrichedStocks];

    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(search) ||
          (s.ticker && s.ticker.toLowerCase().includes(search))
      );
    }

    if (filters.pe_min !== null) result = result.filter((s) => s.pe !== null && s.pe >= filters.pe_min!);
    if (filters.pe_max !== null) result = result.filter((s) => s.pe !== null && s.pe <= filters.pe_max!);
    if (filters.roce_min !== null) result = result.filter((s) => s.roce !== null && s.roce >= filters.roce_min!);
    if (filters.roce_max !== null) result = result.filter((s) => s.roce !== null && s.roce <= filters.roce_max!);
    if (filters.profit_var_3yrs_min !== null)
      result = result.filter((s) => s.profit_var_3yrs !== null && s.profit_var_3yrs >= filters.profit_var_3yrs_min!);
    if (filters.profit_var_3yrs_max !== null)
      result = result.filter((s) => s.profit_var_3yrs !== null && s.profit_var_3yrs <= filters.profit_var_3yrs_max!);

    if (filters.show_unresearched_only) {
      result = result.filter((s) => !s.research || s.research.status === 'not_researched');
    }

    if (filters.show_red_flags_only) {
      result = result.filter((s) => (s.red_flags || []).some((f) => f.severity === 'high'));
    }

    switch (filters.sort_by) {
      case 'roce_desc':
        result.sort((a, b) => (b.roce || 0) - (a.roce || 0));
        break;
      case 'profit_growth_desc':
        result.sort((a, b) => (b.profit_var_3yrs || 0) - (a.profit_var_3yrs || 0));
        break;
      case 'priority_score_desc':
        result.sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0));
        break;
      case 'pe_asc':
        result.sort((a, b) => (a.pe || 999) - (b.pe || 999));
        break;
      case 'recently_researched':
        result.sort((a, b) => {
          const aDate = a.research?.last_updated ? new Date(a.research.last_updated).getTime() : 0;
          const bDate = b.research?.last_updated ? new Date(b.research.last_updated).getTime() : 0;
          return bDate - aDate;
        });
        break;
      case 's_no_asc':
      default:
        result.sort((a, b) => a.s_no - b.s_no);
        break;
    }

    return result;
  }, [enrichedStocks, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredStocks.length / PAGE_SIZE));
  const paginatedStocks = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredStocks.slice(start, start + PAGE_SIZE);
  }, [filteredStocks, currentPage]);

  const researchedCount = Array.from(researchMap.values()).filter(
    (r) => r.status !== 'not_researched'
  ).length;
  const watchlistCount = watchlistSet.size;

  const handleSort = (key: string) => {
    const sortMap: Record<string, SortOption> = {
      s_no: 's_no_asc',
      roce: 'roce_desc',
      profit_var_3yrs: 'profit_growth_desc',
      priority_score: 'priority_score_desc',
      pe: 'pe_asc',
    };
    if (sortMap[key]) {
      setFilters({ ...filters, sort_by: sortMap[key] });
    }
  };

  if (loading && stocks.length === 0) {
    return <LoadingSpinner fullScreen message="Loading stocks..." />;
  }

  if (error && stocks.length === 0) {
    return (
      <div className="max-w-md mx-auto p-6 mt-12">
        <div className="rounded-lg border border-danger/30 bg-danger/10 p-4">
          <h2 className="text-sm font-semibold text-danger mb-1">Error loading dashboard</h2>
          <p className="text-sm text-muted mb-3">{error}</p>
          <button
            onClick={refresh}
            className="px-3 py-1.5 text-sm rounded-md bg-primary text-white hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex flex-col md:flex-row gap-6">
        <FilterSidebar
          filters={filters}
          onFiltersChange={setFilters}
          stockCount={stocks.length}
          researchedCount={researchedCount}
          watchlistCount={watchlistCount}
          peRange={peRange}
          roceRange={roceRange}
          profitVarRange={profitVarRange}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h1 className="text-xl font-semibold text-foreground">Stocks</h1>
              <p className="text-xs text-muted">
                {filteredStocks.length} of {stocks.length} stocks
                {(filters.pe_min !== null || filters.pe_max !== null || filters.roce_min !== null ||
                  filters.roce_max !== null || filters.search) && (
                  <button
                    onClick={clearFilters}
                    className="ml-2 text-primary hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border border-app bg-card text-foreground"
                aria-label="Open filters"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-app bg-card overflow-hidden">
            {paginatedStocks.length === 0 ? (
              <EmptyState
                icon={
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                title="No stocks found"
                description="Try adjusting your filters or search query to see more results."
                action={
                  <button
                    onClick={clearFilters}
                    className="px-3 py-1.5 text-sm rounded-md bg-primary text-white hover:bg-primary/90"
                  >
                    Clear filters
                  </button>
                }
              />
            ) : (
              <>
                <StockTable
                  stocks={paginatedStocks}
                  onSort={handleSort}
                  sortKey={filters.sort_by}
                  sortDirection={filters.sort_by.endsWith('_desc') ? 'desc' : 'asc'}
                  showPriorityScore
                />
                <div className="border-t border-app">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={filteredStocks.length}
                    pageSize={PAGE_SIZE}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <DashboardContent />
    </Suspense>
  );
}