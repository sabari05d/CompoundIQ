'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Stock, StockResearch, RedFlag } from '@/lib/types';
import { formatCurrency, formatPercentage, formatNumber, calculatePriorityScore, getStatusColor, getDecisionColor } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import RedFlagBadge from '@/components/RedFlagBadge';

type SortKey = 'added_desc' | 'roce_desc' | 'profit_growth_desc' | 'priority_score_desc';

interface EnrichedWatchlistItem {
  watchlistId: number;
  stock: Stock;
  research: StockResearch | null;
  redFlags: RedFlag[];
  priorityScore: number;
  addedAt: string;
}

export default function WatchlistPage() {
  const [items, setItems] = useState<EnrichedWatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('added_desc');
  const [exporting, setExporting] = useState(false);
  const [filter, setFilter] = useState<'all' | 'buy' | 'watch'>('all');

  const fetchWatchlist = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: watchRes, error: wErr } = await supabase
        .from('watchlist')
        .select('*')
        .order('added_at', { ascending: false });
      if (wErr) throw wErr;
      if (!watchRes || watchRes.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }

      const stockIds = watchRes.map((w) => w.stock_id);
      const [stocksRes, researchRes, flagsRes] = await Promise.all([
        supabase.from('stocks').select('*').in('id', stockIds),
        supabase.from('stock_research').select('*').in('stock_id', stockIds),
        supabase.from('red_flags').select('*').in('stock_id', stockIds),
      ]);

      if (stocksRes.error) throw stocksRes.error;
      if (researchRes.error) throw researchRes.error;
      if (flagsRes.error) throw flagsRes.error;

      const stockMap = new Map<number, Stock>(stocksRes.data?.map((s) => [s.id, s]) || []);
      const researchMap = new Map<number, StockResearch>(
        researchRes.data?.map((r) => [r.stock_id, r]) || []
      );
      const flagsMap = new Map<number, RedFlag[]>();
      flagsRes.data?.forEach((f) => {
        const existing = flagsMap.get(f.stock_id) || [];
        existing.push(f);
        flagsMap.set(f.stock_id, existing);
      });

      const enriched: EnrichedWatchlistItem[] = watchRes
        .map((w) => {
          const stock = stockMap.get(w.stock_id);
          if (!stock) return null;
          return {
            watchlistId: w.id,
            stock,
            research: researchMap.get(w.stock_id) || null,
            redFlags: flagsMap.get(w.stock_id) || [],
            priorityScore: calculatePriorityScore(stock),
            addedAt: w.added_at,
          };
        })
        .filter((x): x is EnrichedWatchlistItem => x !== null);

      setItems(enriched);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load watchlist');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  const handleRemove = async (watchlistId: number) => {
    if (!confirm('Remove this stock from your watchlist?')) return;
    try {
      const { error } = await supabase.from('watchlist').delete().eq('id', watchlistId);
      if (error) throw error;
      setItems((prev) => prev.filter((i) => i.watchlistId !== watchlistId));
    } catch (err) {
      alert('Failed to remove from watchlist');
    }
  };

  const handleUpdateDecision = async (stockId: number, decision: 'buy' | 'watchlist' | 'pass' | '') => {
    try {
      const value = decision === '' ? null : decision;
      const { error } = await supabase
        .from('stock_research')
        .upsert(
          { stock_id: stockId, investment_decision: value },
          { onConflict: 'stock_id' }
        );
      if (error) throw error;
      setItems((prev) =>
        prev.map((i) =>
          i.stock.id === stockId
            ? {
                ...i,
                research: i.research
                  ? { ...i.research, investment_decision: value, last_updated: new Date().toISOString() }
                  : {
                      id: 0,
                      stock_id: stockId,
                      status: 'in_progress' as const,
                      investment_decision: value,
                      confidence_score: null,
                      research_date: new Date().toISOString().split('T')[0],
                      last_updated: new Date().toISOString(),
                      bull_thesis: null,
                      base_case: null,
                      bear_case: null,
                      break_conditions: null,
                      notes: null,
                    },
              }
            : i
        )
      );
    } catch (err) {
      alert('Failed to update decision');
    }
  };

  const handleExport = () => {
    setExporting(true);
    try {
      const headers = [
        'S.No',
        'Name',
        'Ticker',
        'CMP',
        'P/E',
        'ROCE',
        'Profit 3Y',
        'Sales 3Y',
        'Market Cap (Cr)',
        'Decision',
        'Confidence',
        'Added Date',
      ];
      const rows = filteredAndSortedItems.map((i) => [
        i.stock.s_no,
        i.stock.name,
        i.stock.ticker || '',
        i.stock.cmp || '',
        i.stock.pe || '',
        i.stock.roce || '',
        i.stock.profit_var_3yrs || '',
        i.stock.sales_var_3yrs || '',
        i.stock.market_cap_cr || '',
        i.research?.investment_decision || '',
        i.research?.confidence_score || '',
        new Date(i.addedAt).toLocaleDateString(),
      ]);
      const csv = [headers.join(','), ...rows.map((r) => r.map((v) => `"${v}"`).join(','))].join(
        '\n'
      );
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `watchlist-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    } catch (err) {
      alert('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const filteredAndSortedItems = items
    .filter((i) => {
      if (filter === 'all') return true;
      if (filter === 'buy') return i.research?.investment_decision === 'buy';
      if (filter === 'watch') return i.research?.investment_decision === 'watchlist';
      return true;
    })
    .sort((a, b) => {
      switch (sortKey) {
        case 'added_desc':
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
        case 'roce_desc':
          return (b.stock.roce || 0) - (a.stock.roce || 0);
        case 'profit_growth_desc':
          return (b.stock.profit_var_3yrs || 0) - (a.stock.profit_var_3yrs || 0);
        case 'priority_score_desc':
          return b.priorityScore - a.priorityScore;
      }
    });

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading watchlist..." />;
  }

  const buyCount = items.filter((i) => i.research?.investment_decision === 'buy').length;
  const watchCount = items.filter((i) => i.research?.investment_decision === 'watchlist').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Watchlist</h1>
          <p className="text-sm text-muted mt-1">
            {items.length} stocks · {buyCount} to buy · {watchCount} monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="px-3 py-1.5 text-sm rounded-md border border-app bg-card text-foreground"
          >
            <option value="added_desc">Recently added</option>
            <option value="priority_score_desc">Priority score</option>
            <option value="roce_desc">ROCE</option>
            <option value="profit_growth_desc">Profit growth</option>
          </select>
          <button
            onClick={handleExport}
            disabled={exporting || filteredAndSortedItems.length === 0}
            className="px-3 py-1.5 text-sm rounded-md border border-app bg-card text-foreground hover:bg-card-hover disabled:opacity-50"
          >
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-4 border-b border-app">
        {[
          { key: 'all', label: 'All', count: items.length },
          { key: 'buy', label: 'Buy', count: buyCount },
          { key: 'watch', label: 'Watch', count: watchCount },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as typeof filter)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              filter === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted hover:text-foreground'
            }`}
          >
            {tab.label} <span className="text-xs">({tab.count})</span>
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </div>
      )}

      {filteredAndSortedItems.length === 0 ? (
        <div className="rounded-lg border border-app bg-card">
          <EmptyState
            icon={
              <svg
                className="w-12 h-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            }
            title={items.length === 0 ? 'Watchlist is empty' : 'No matches'}
            description={
              items.length === 0
                ? 'Add stocks to your watchlist from the dashboard by clicking the heart icon.'
                : 'No stocks match the current filter.'
            }
            action={
              items.length === 0 ? (
                <Link
                  href="/"
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90"
                >
                  Browse stocks
                </Link>
              ) : undefined
            }
          />
        </div>
      ) : (
        <div className="rounded-lg border border-app bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-app bg-card/50">
                <tr>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-muted w-12">#</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-muted">Company</th>
                  <th className="px-3 py-2.5 text-right text-xs font-medium text-muted">CMP</th>
                  <th className="px-3 py-2.5 text-right text-xs font-medium text-muted">P/E</th>
                  <th className="px-3 py-2.5 text-right text-xs font-medium text-muted">ROCE</th>
                  <th className="px-3 py-2.5 text-right text-xs font-medium text-muted">3Y Profit</th>
                  <th className="px-3 py-2.5 text-right text-xs font-medium text-muted">Score</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-muted w-32">Decision</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-muted w-32">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app/50">
                {filteredAndSortedItems.map((i) => {
                  const stock = i.stock;
                  const research = i.research;
                  const decision = research?.investment_decision;
                  const highFlags = i.redFlags.filter((f) => f.severity === 'high').length;

                  return (
                    <tr key={i.watchlistId} className="hover:bg-card-hover/50 group">
                      <td className="px-3 py-3 text-muted font-mono text-xs">{stock.s_no}</td>
                      <td className="px-3 py-3">
                        <Link href={`/stock/${stock.id}`} className="block">
                          <div className="font-medium text-foreground group-hover:text-primary">
                            {stock.name}
                          </div>
                          {stock.ticker && (
                            <div className="text-xs text-muted font-mono">{stock.ticker}</div>
                          )}
                        </Link>
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-foreground">
                        {formatCurrency(stock.cmp, 2)}
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-foreground">
                        {formatNumber(stock.pe)}
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-foreground">
                        {formatPercentage(stock.roce)}
                      </td>
                      <td
                        className={`px-3 py-3 text-right font-mono ${
                          stock.profit_var_3yrs !== null && stock.profit_var_3yrs < 0
                            ? 'text-danger'
                            : 'text-foreground'
                        }`}
                      >
                        {formatPercentage(stock.profit_var_3yrs)}
                      </td>
                      <td className="px-3 py-3 text-right font-mono font-semibold text-primary">
                        {i.priorityScore}
                      </td>
                      <td className="px-3 py-3">
                        <select
                          value={decision || ''}
                          onChange={(e) =>
                            handleUpdateDecision(
                              stock.id,
                              e.target.value as 'buy' | 'watchlist' | 'pass' | ''
                            )
                          }
                          className={`w-full px-2 py-1 text-xs rounded border border-app bg-card ${
                            decision ? getDecisionColor(decision) : 'text-muted'
                          }`}
                        >
                          <option value="">— Set —</option>
                          <option value="buy">Buy</option>
                          <option value="watchlist">Watchlist</option>
                          <option value="pass">Pass</option>
                        </select>
                        {highFlags > 0 && (
                          <div className="mt-1">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs rounded bg-danger/15 text-danger">
                              🚩 {highFlags}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/stock/${stock.id}`}
                            className="text-xs font-medium text-primary hover:underline"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => handleRemove(i.watchlistId)}
                            className="text-xs font-medium text-danger hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}