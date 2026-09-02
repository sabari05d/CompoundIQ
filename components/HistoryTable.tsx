'use client';

import { useState, useCallback } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface HistoryRecord {
  year: number;
  revenue_cr: number | null;
  profit_cr: number | null;
  roce: number | null;
  yoy_growth: number | null;
}

const TIMEFRAMES = [3, 5, 10] as const;
type Timeframe = (typeof TIMEFRAMES)[number];

interface HistoryTableProps {
  stockId: number;
  hasTicker: boolean;
}

export default function HistoryTable({ stockId, hasTicker }: HistoryTableProps) {
  const [data, setData] = useState<HistoryRecord[]>([]);
  const [years, setYears] = useState<Timeframe>(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const fetchHistory = useCallback(
    async (y: Timeframe) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/stock/${stockId}/history?years=${y}`);
        if (!res.ok) throw new Error('Failed to load history');
        const json = await res.json();
        setData(json.data || []);
        setNote(json.note || null);
        setFetched(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load history');
      } finally {
        setLoading(false);
      }
    },
    [stockId]
  );

  if (!hasTicker) {
    return (
      <div className="rounded-lg border border-app bg-card p-4 text-center">
        <p className="text-sm text-muted">No ticker symbol — historical data unavailable.</p>
      </div>
    );
  }

  if (!fetched) {
    return (
      <div className="rounded-lg border border-app bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Multi-Year History</h3>
        </div>
        <button
          onClick={() => fetchHistory(years)}
          disabled={loading}
          className="w-full py-6 rounded-md border-2 border-dashed border-app text-sm text-muted hover:text-foreground hover:border-primary/50 transition-colors"
        >
          {loading ? 'Loading...' : '📊 Load Financial History'}
        </button>
        {error && <p className="text-xs text-danger mt-2">{error}</p>}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-app bg-card p-4">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h3 className="text-sm font-semibold text-foreground">Multi-Year History</h3>
        <div className="flex gap-1">
          {TIMEFRAMES.map((y) => (
            <button
              key={y}
              onClick={() => {
                setYears(y);
                fetchHistory(y);
              }}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                years === y
                  ? 'bg-primary text-white'
                  : 'text-muted hover:text-foreground hover:bg-card-hover'
              }`}
            >
              {y}Y
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-8 flex items-center justify-center">
          <LoadingSpinner message="Loading history..." />
        </div>
      ) : error ? (
        <p className="text-sm text-danger py-8 text-center">{error}</p>
      ) : data.length === 0 ? (
        <p className="text-sm text-muted py-8 text-center">No data available.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="border-b border-app">
                <tr>
                  <th className="px-2 py-2 text-left font-medium text-muted">Year</th>
                  <th className="px-2 py-2 text-right font-medium text-muted">Revenue (Cr)</th>
                  <th className="px-2 py-2 text-right font-medium text-muted">Profit (Cr)</th>
                  <th className="px-2 py-2 text-right font-medium text-muted">YoY Growth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app/50">
                {data.map((row) => (
                  <tr key={row.year}>
                    <td className="px-2 py-2 font-mono text-foreground">{row.year}</td>
                    <td className="px-2 py-2 text-right font-mono text-foreground">
                      {row.revenue_cr !== null ? row.revenue_cr.toLocaleString('en-IN') : '—'}
                    </td>
                    <td className="px-2 py-2 text-right font-mono text-foreground">
                      {row.profit_cr !== null ? row.profit_cr.toLocaleString('en-IN') : '—'}
                    </td>
                    <td
                      className={`px-2 py-2 text-right font-mono ${
                        row.yoy_growth !== null && row.yoy_growth >= 0
                          ? 'text-success'
                          : row.yoy_growth !== null
                          ? 'text-danger'
                          : 'text-muted'
                      }`}
                    >
                      {row.yoy_growth !== null
                        ? `${row.yoy_growth >= 0 ? '+' : ''}${row.yoy_growth.toFixed(1)}%`
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {note && (
            <p className="text-xs text-muted mt-2 italic">{note}</p>
          )}
        </>
      )}
    </div>
  );
}