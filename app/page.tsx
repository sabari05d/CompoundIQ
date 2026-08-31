'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Stock, StockResearch, RedFlag, DashboardFilters, SortOption } from '@/lib/types';
import { calculatePriorityScore, detectRedFlags, formatNumber } from '@/lib/utils';
import StockTable from '@/components/StockTable';
import FilterSidebar from '@/components/FilterSidebar';

export default function DashboardPage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [researchMap, setResearchMap] = useState<Map<number, StockResearch>>(new Map());
  const [redFlagsMap, setRedFlagsMap] = useState<Map<number, RedFlag[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DashboardFilters>({
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
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [stocksRes, researchRes, flagsRes] = await Promise.all([
        supabase.from('stocks').select('*').order('s_no', { ascending: true }),
        supabase.from('stock_research').select('*'),
        supabase.from('red_flags').select('*'),
      ]);

      if (stocksRes.error) throw stocksRes.error;
      if (researchRes.error) throw researchRes.error;
      if (flagsRes.error) throw flagsRes.error;

      setStocks(stocksRes.data || []);
      
      const researchMap = new Map<number, StockResearch>();
      researchRes.data?.forEach(r => researchMap.set(r.stock_id, r));
      setResearchMap(researchMap);

      const flagsMap = new Map<number, RedFlag[]>();
      flagsRes.data?.forEach(f => {
        const existing = flagsMap.get(f.stock_id) || [];
        existing.push(f);
        flagsMap.set(f.stock_id, existing);
      });
      setRedFlagsMap(flagsMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const peValues = stocks.map(s => s.pe).filter((v): v is number => v !== null);
  const roceValues = stocks.map(s => s.roce).filter((v): v is number => v !== null);
  const profitVarValues = stocks.map(s => s.profit_var_3yrs).filter((v): v is number => v !== null);

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
    return stocks.map(stock => {
      const research = researchMap.get(stock.id) || null;
      const redFlags = redFlagsMap.get(stock.id) || [];
      const priorityScore = calculatePriorityScore(stock);
      return { ...stock, research, red_flags: redFlags, priority_score: priorityScore };
    });
  }, [stocks, researchMap, redFlagsMap]);

  const filteredStocks = useMemo(() => {
    let result = [...enrichedStocks];

    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(s => s.name.toLowerCase().includes(search));
    }

    if (filters.pe_min !== null) {
      result = result.filter(s => s.pe !== null && s.pe >= filters.pe_min!);
    }
    if (filters.pe_max !== null) {
      result = result.filter(s => s.pe !== null && s.pe <= filters.pe_max!);
    }
    if (filters.roce_min !== null) {
      result = result.filter(s => s.roce !== null && s.roce >= filters.roce_min!);
    }
    if (filters.roce_max !== null) {
      result = result.filter(s => s.roce !== null && s.roce <= filters.roce_max!);
    }
    if (filters.profit_var_3yrs_min !== null) {
      result = result.filter(s => s.profit_var_3yrs !== null && s.profit_var_3yrs >= filters.profit_var_3yrs_min!);
    }
    if (filters.profit_var_3yrs_max !== null) {
      result = result.filter(s => s.profit_var_3yrs !== null && s.profit_var_3yrs <= filters.profit_var_3yrs_max!);
    }

    if (filters.show_unresearched_only) {
      result = result.filter(s => !s.research || s.research.status === 'not_researched');
    }

    if (filters.show_red_flags_only) {
      result = result.filter(s => (s.red_flags || []).some(f => f.severity === 'high'));
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

  const researchedCount = Array.from(researchMap.values()).filter(r => r.status !== 'not_researched').length;
  const watchlistCount = Array.from(researchMap.values()).filter(r => r.investment_decision === 'watchlist' || r.investment_decision === 'buy').length;

  const handleSort = (key: string) => {
    const sortMap: Record<string, SortOption> = {
      's_no': 's_no_asc',
      'roce': 'roce_desc',
      'profit_var_3yrs': 'profit_growth_desc',
      'priority_score': 'priority_score_desc',
      'pe': 'pe_asc',
    };
    if (sortMap[key]) {
      setFilters(prev => ({ ...prev, sort_by: sortMap[key] }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <svg className="mx-auto h-16 w-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h1 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">Error Loading Data</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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

      <div className="lg:ml-0">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Stocks ({filteredStocks.length} of {stocks.length})
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>Sort: </span>
            <select
              value={filters.sort_by}
              onChange={(e) => setFilters(prev => ({ ...prev, sort_by: e.target.value as SortOption }))}
              className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
            >
              <option value="priority_score_desc">Priority Score ↓</option>
              <option value="roce_desc">ROCE ↓</option>
              <option value="profit_growth_desc">Profit Growth 3Y ↓</option>
              <option value="pe_asc">P/E ↑</option>
              <option value="recently_researched">Recently Researched</option>
              <option value="s_no_asc">S.No ↑</option>
            </select>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <StockTable
            stocks={filteredStocks}
            onSort={handleSort}
            sortKey={filters.sort_by}
            sortDirection={filters.sort_by.endsWith('_desc') ? 'desc' : 'asc'}
            showPriorityScore={true}
          />
        </div>
      </div>
    </main>
  );
}