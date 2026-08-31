'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Stock, StockResearch, RedFlag, WatchlistItem } from '@/lib/types';
import { formatCurrency, formatPercentage, formatNumber, calculatePriorityScore, getDecisionColor, getStatusColor } from '@/lib/utils';
import RedFlagBadge from '@/components/RedFlagBadge';

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<(WatchlistItem & { stock: Stock; research: StockResearch | null; red_flags: RedFlag[]; priority_score: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const fetchWatchlist = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: watchlistData, error: wlError } = await supabase
        .from('watchlist')
        .select('*')
        .order('added_at', { ascending: false });

      if (wlError) throw wlError;

      if (!watchlistData || watchlistData.length === 0) {
        setWatchlist([]);
        setLoading(false);
        return;
      }

      const stockIds = watchlistData.map(w => w.stock_id);
      
      const [stocksRes, researchRes, flagsRes] = await Promise.all([
        supabase.from('stocks').select('*').in('id', stockIds),
        supabase.from('stock_research').select('*').in('stock_id', stockIds),
        supabase.from('red_flags').select('*').in('stock_id', stockIds),
      ]);

      if (stocksRes.error) throw stocksRes.error;
      if (researchRes.error) throw researchRes.error;
      if (flagsRes.error) throw flagsRes.error;

      const stocksMap = new Map(stocksRes.data?.map(s => [s.id, s]) || []);
      const researchMap = new Map(researchRes.data?.map(r => [r.stock_id, r]) || []);
      const flagsMap = new Map<number, RedFlag[]>();
      flagsRes.data?.forEach(f => {
        const existing = flagsMap.get(f.stock_id) || [];
        existing.push(f);
        flagsMap.set(f.stock_id, existing);
      });

      const enriched = watchlistData.map(w => {
        const stock = stocksMap.get(w.stock_id);
        const research = researchMap.get(w.stock_id) || null;
        const redFlags = flagsMap.get(w.stock_id) || [];
        return {
          ...w,
          stock: stock!,
          research,
          red_flags: redFlags,
          priority_score: stock ? calculatePriorityScore(stock) : 0,
        };
      }).filter(w => w.stock);

      setWatchlist(enriched);
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
    if (!confirm('Remove from watchlist?')) return;
    
    try {
      const { error } = await supabase.from('watchlist').delete().eq('id', watchlistId);
      if (error) throw error;
      setWatchlist(prev => prev.filter(w => w.id !== watchlistId));
    } catch (err) {
      alert('Failed to remove from watchlist');
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const headers = [
        'S.No', 'Name', 'Ticker', 'CMP', 'P/E', 'ROCE', 'Profit Var 3Y', 'Sales Var 3Y',
        'Market Cap (Cr)', 'Decision', 'Confidence', 'Research Date', 'Added Date', 'Notes'
      ];

      const rows = watchlist.map(w => [
        w.stock.s_no,
        w.stock.name,
        w.stock.ticker || '',
        w.stock.cmp || '',
        w.stock.pe || '',
        w.stock.roce || '',
        w.stock.profit_var_3yrs || '',
        w.stock.sales_var_3yrs || '',
        w.stock.market_cap_cr || '',
        w.research?.investment_decision || '',
        w.research?.confidence_score || '',
        w.research?.research_date || '',
        new Date(w.added_at).toLocaleDateString(),
        (w.notes || '').replace(/"/g, '""'),
      ]);

      const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                aria-label="Back to dashboard"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Watchlist</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                {watchlist.length} stocks in watchlist
              </span>
              <button
                onClick={handleExport}
                disabled={exporting || watchlist.length === 0}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-50"
              >
                {exporting ? 'Exporting...' : 'Export CSV'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-300">
            {error}
          </div>
        )}

        {watchlist.length === 0 ? (
          <div className="text-center py-16">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
            <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">Watchlist is Empty</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Add stocks to your watchlist from the research page by selecting "Watchlist" or "Buy" as investment decision.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700"
            >
              <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Browse Stocks
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500 dark:text-gray-400 w-16">S.No</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500 dark:text-gray-400 w-48">Company</th>
                  <th className="px-3 py-2.5 text-right font-medium text-gray-500 dark:text-gray-400 w-20">CMP</th>
                  <th className="px-3 py-2.5 text-right font-medium text-gray-500 dark:text-gray-400 w-16">P/E</th>
                  <th className="px-3 py-2.5 text-right font-medium text-gray-500 dark:text-gray-400 w-20">ROCE</th>
                  <th className="px-3 py-2.5 text-right font-medium text-gray-500 dark:text-gray-400 w-24">Profit 3Y</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500 dark:text-gray-400 w-28">Decision</th>
                  <th className="px-3 py-2.5 text-right font-medium text-gray-500 dark:text-gray-400 w-20">Score</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500 dark:text-gray-400 w-12">Flags</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500 dark:text-gray-400 w-16">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {watchlist.map((item) => {
                  const stock = item.stock;
                  const research = item.research;
                  const status = research?.status || 'not_researched';
                  const decision = research?.investment_decision;
                  const flags = item.red_flags;
                  const highFlags = flags.filter(f => f.severity === 'high').length;

                  return (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-3 py-2.5 text-gray-500 dark:text-gray-400 font-mono">{stock.s_no}</td>
                      <td className="px-3 py-2.5">
                        <Link
                          href={`/stock/${stock.id}`}
                          className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline truncate block max-w-[200px]"
                        >
                          {stock.name}
                        </Link>
                        {stock.ticker && (
                          <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">({stock.ticker})</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-gray-900 dark:text-white">{formatCurrency(stock.cmp, 2)}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-gray-900 dark:text-white">{formatNumber(stock.pe)}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-gray-900 dark:text-white">{formatPercentage(stock.roce)}</td>
                      <td className="px-3 py-2.5 text-right font-mono">
                        <span className={stock.profit_var_3yrs !== null && stock.profit_var_3yrs < 0 ? 'text-red-600 dark:text-red-400' : ''}>
                          {formatPercentage(stock.profit_var_3yrs)}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          {decision && (
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getDecisionColor(decision)}`}>
                              {decision}
                            </span>
                          )}
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(status as any)}`}>
                            {status.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono font-medium text-indigo-600 dark:text-indigo-400">
                        {item.priority_score}
                      </td>
                      <td className="px-3 py-2.5">
                        <RedFlagBadge flags={flags} compact />
                      </td>
                      <td className="px-3 py-2.5">
                        <button
                          onClick={() => handleRemove(item.id)}
                          className="text-red-600 dark:text-red-400 hover:underline text-sm"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}