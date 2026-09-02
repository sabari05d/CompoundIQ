'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Stock, StockResearch, RedFlag, WatchlistItem } from '@/lib/types';

interface StocksContextValue {
  stocks: Stock[];
  researchMap: Map<number, StockResearch>;
  redFlagsMap: Map<number, RedFlag[]>;
  watchlistSet: Set<number>;
  loading: boolean;
  error: string | null;
  lastFetched: Date | null;
  refresh: () => Promise<void>;
  // Helpers
  getStock: (id: number) => Stock | undefined;
  getResearch: (id: number) => StockResearch | null;
  getRedFlags: (id: number) => RedFlag[];
  isInWatchlist: (id: number) => boolean;
  // Watchlist actions
  addToWatchlist: (id: number) => Promise<void>;
  removeFromWatchlist: (id: number) => Promise<void>;
  // Research actions
  upsertResearch: (stockId: number, data: Partial<StockResearch>) => Promise<StockResearch | null>;
}

const StocksContext = createContext<StocksContextValue | null>(null);

export function StocksProvider({ children }: { children: ReactNode }) {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [researchMap, setResearchMap] = useState<Map<number, StockResearch>>(new Map());
  const [redFlagsMap, setRedFlagsMap] = useState<Map<number, RedFlag[]>>(new Map());
  const [watchlistSet, setWatchlistSet] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [stocksRes, researchRes, flagsRes, watchRes] = await Promise.all([
        supabase.from('stocks').select('*').order('s_no', { ascending: true }),
        supabase.from('stock_research').select('*'),
        supabase.from('red_flags').select('*'),
        supabase.from('watchlist').select('stock_id'),
      ]);

      if (stocksRes.error) throw stocksRes.error;
      if (researchRes.error) throw researchRes.error;
      if (flagsRes.error) throw flagsRes.error;
      if (watchRes.error) throw watchRes.error;

      setStocks(stocksRes.data || []);

      const rMap = new Map<number, StockResearch>();
      researchRes.data?.forEach((r) => rMap.set(r.stock_id, r));
      setResearchMap(rMap);

      const fMap = new Map<number, RedFlag[]>();
      flagsRes.data?.forEach((f) => {
        const existing = fMap.get(f.stock_id) || [];
        existing.push(f);
        fMap.set(f.stock_id, existing);
      });
      setRedFlagsMap(fMap);

      const wSet = new Set<number>(watchRes.data?.map((w) => w.stock_id) || []);
      setWatchlistSet(wSet);
      setLastFetched(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stocks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const getStock = useCallback((id: number) => stocks.find((s) => s.id === id), [stocks]);
  const getResearch = useCallback(
    (id: number) => researchMap.get(id) || null,
    [researchMap]
  );
  const getRedFlags = useCallback(
    (id: number) => redFlagsMap.get(id) || [],
    [redFlagsMap]
  );
  const isInWatchlist = useCallback((id: number) => watchlistSet.has(id), [watchlistSet]);

  const addToWatchlist = useCallback(async (stockId: number) => {
    const { error } = await supabase.from('watchlist').insert({ stock_id: stockId });
    if (error) throw error;
    setWatchlistSet((prev) => new Set(prev).add(stockId));
  }, []);

  const removeFromWatchlist = useCallback(async (stockId: number) => {
    const { error } = await supabase.from('watchlist').delete().eq('stock_id', stockId);
    if (error) throw error;
    setWatchlistSet((prev) => {
      const next = new Set(prev);
      next.delete(stockId);
      return next;
    });
  }, []);

  const upsertResearch = useCallback(
    async (stockId: number, data: Partial<StockResearch>) => {
      const payload = { stock_id: stockId, ...data };
      const { data: result, error } = await supabase
        .from('stock_research')
        .upsert(payload, { onConflict: 'stock_id' })
        .select()
        .single();
      if (error) throw error;
      const saved = result as StockResearch;
      setResearchMap((prev) => new Map(prev).set(stockId, saved));
      return saved;
    },
    []
  );

  return (
    <StocksContext.Provider
      value={{
        stocks,
        researchMap,
        redFlagsMap,
        watchlistSet,
        loading,
        error,
        lastFetched,
        refresh: fetchAll,
        getStock,
        getResearch,
        getRedFlags,
        isInWatchlist,
        addToWatchlist,
        removeFromWatchlist,
        upsertResearch,
      }}
    >
      {children}
    </StocksContext.Provider>
  );
}

export function useStocks() {
  const context = useContext(StocksContext);
  if (!context) {
    throw new Error('useStocks must be used within StocksProvider');
  }
  return context;
}