'use client';

import { useMemo } from 'react';
import { useStocks } from '@/contexts/StocksContext';
import { calculatePriorityScore, formatPercentage } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';

export default function AnalyticsPage() {
  const { stocks, researchMap, watchlistSet, redFlagsMap, loading } = useStocks();

  const stats = useMemo(() => {
    const total = stocks.length;
    const researches = Array.from(researchMap.values());
    const completed = researches.filter((r) => r.status === 'completed').length;
    const inProgress = researches.filter((r) => r.status === 'in_progress').length;
    const buyCount = researches.filter((r) => r.investment_decision === 'buy').length;
    const watchlistCount = researches.filter((r) => r.investment_decision === 'watchlist').length;
    const passCount = researches.filter((r) => r.investment_decision === 'pass').length;
    const withConfidence = researches.filter((r) => r.confidence_score !== null).length;
    const avgConfidence =
      withConfidence > 0
        ? researches
            .filter((r) => r.confidence_score !== null)
            .reduce((sum, r) => sum + (r.confidence_score || 0), 0) / withConfidence
        : 0;

    return {
      total,
      completed,
      inProgress,
      notStarted: total - completed - inProgress,
      completionPct: total > 0 ? (completed / total) * 100 : 0,
      buyCount,
      watchlistCount,
      passCount,
      avgConfidence,
      watchlistSize: watchlistSet.size,
    };
  }, [stocks, researchMap, watchlistSet]);

  const topStocks = useMemo(() => {
    return [...stocks]
      .map((s) => ({ stock: s, score: calculatePriorityScore(s) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }, [stocks]);

  const mostFlagged = useMemo(() => {
    const arr = Array.from(redFlagsMap.entries())
      .map(([id, flags]) => ({
        stock: stocks.find((s) => s.id === id),
        count: flags.length,
        high: flags.filter((f) => f.severity === 'high').length,
      }))
      .filter((x) => x.stock && x.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    return arr;
  }, [redFlagsMap, stocks]);

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading analytics..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted mt-1">Research progress and trends.</p>
      </div>

      {/* Progress stats */}
      <section className="rounded-lg border border-app bg-card p-4">
        <h2 className="text-sm font-semibold text-foreground mb-3">Research Progress</h2>
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-muted">Completion</span>
            <span className="font-medium text-primary">
              {stats.completed} / {stats.total} ({stats.completionPct.toFixed(1)}%)
            </span>
          </div>
          <div className="h-2 bg-background rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${stats.completionPct}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
          <Stat label="Completed" value={stats.completed} tone="success" />
          <Stat label="In Progress" value={stats.inProgress} tone="warning" />
          <Stat label="Not Started" value={stats.notStarted} tone="neutral" />
          <Stat label="Watchlist" value={stats.watchlistSize} tone="primary" />
        </div>
      </section>

      {/* Decisions */}
      <section className="rounded-lg border border-app bg-card p-4">
        <h2 className="text-sm font-semibold text-foreground mb-3">Investment Decisions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
          <Stat label="Buy" value={stats.buyCount} tone="success" />
          <Stat label="Watchlist" value={stats.watchlistCount} tone="warning" />
          <Stat label="Pass" value={stats.passCount} tone="danger" />
          <Stat
            label="Avg Confidence"
            value={stats.avgConfidence > 0 ? `${stats.avgConfidence.toFixed(1)}/5` : '—'}
            tone="primary"
          />
        </div>
      </section>

      {/* Top by priority score */}
      <section className="rounded-lg border border-app bg-card p-4">
        <h2 className="text-sm font-semibold text-foreground mb-3">Top 10 by Priority Score</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-app">
                <th className="px-2 py-2 text-left text-xs text-muted w-10">#</th>
                <th className="px-2 py-2 text-left text-xs text-muted">Company</th>
                <th className="px-2 py-2 text-right text-xs text-muted">Score</th>
                <th className="px-2 py-2 text-right text-xs text-muted">ROCE</th>
                <th className="px-2 py-2 text-right text-xs text-muted">Profit 3Y</th>
              </tr>
            </thead>
            <tbody>
              {topStocks.map(({ stock, score }, idx) => (
                <tr key={stock.id} className="border-b border-app/50 last:border-0">
                  <td className="px-2 py-1.5 text-muted font-mono text-xs">{idx + 1}</td>
                  <td className="px-2 py-1.5">
                    <Link
                      href={`/stock/${stock.id}`}
                      className="text-foreground hover:text-primary"
                    >
                      {stock.name}
                    </Link>
                  </td>
                  <td className="px-2 py-1.5 text-right font-mono font-semibold text-primary">
                    {score}
                  </td>
                  <td className="px-2 py-1.5 text-right font-mono text-foreground">
                    {formatPercentage(stock.roce)}
                  </td>
                  <td className="px-2 py-1.5 text-right font-mono text-foreground">
                    {formatPercentage(stock.profit_var_3yrs)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Most flagged */}
      {mostFlagged.length > 0 && (
        <section className="rounded-lg border border-app bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground mb-3">Most Red-Flagged Stocks</h2>
          <div className="space-y-1">
            {mostFlagged.map((m) => (
              <Link
                key={m.stock!.id}
                href={`/stock/${m.stock!.id}`}
                className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-card-hover/50"
              >
                <span className="text-sm text-foreground">{m.stock!.name}</span>
                <div className="flex items-center gap-2">
                  {m.high > 0 && (
                    <span className="px-1.5 py-0.5 text-xs rounded bg-danger/15 text-danger font-medium">
                      {m.high} high
                    </span>
                  )}
                  <span className="px-1.5 py-0.5 text-xs rounded bg-warning/15 text-warning font-medium">
                    {m.count} total
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone: 'success' | 'warning' | 'danger' | 'primary' | 'neutral';
}) {
  const toneClasses = {
    success: 'text-success bg-success/10',
    warning: 'text-warning bg-warning/10',
    danger: 'text-danger bg-danger/10',
    primary: 'text-primary bg-primary/10',
    neutral: 'text-foreground bg-card-hover/30',
  };
  return (
    <div className={`rounded-md p-2 ${toneClasses[tone]}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs opacity-80">{label}</p>
    </div>
  );
}