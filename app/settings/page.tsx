'use client';

import { useState } from 'react';
import { useStocks } from '@/contexts/StocksContext';
import { getAllTickers } from '@/lib/ticker-matcher';

interface SyncResult {
  total: number;
  already_had_ticker: number;
  newly_matched: number;
  unmatched_count: number;
  unmatched: { id: number; s_no: number; name: string }[];
  ticker_list_size: number;
}

export default function SettingsPage() {
  const { refresh, lastFetched } = useStocks();
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/sync-symbols', { method: 'POST' });
      if (!res.ok) throw new Error('Sync failed');
      const data = await res.json();
      setSyncResult(data);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleClearSession = () => {
    if (!confirm('Clear all saved filters and session data?')) return;
    try {
      localStorage.removeItem('multibagger_filters');
      localStorage.removeItem('multibagger_page');
      localStorage.removeItem('theme');
      alert('Session cleared. Reloading...');
      window.location.href = '/';
    } catch (err) {
      // ignore
    }
  };

  const tickerListSize = getAllTickers().length;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted mt-1">Manage your data, tickers, and session.</p>
      </div>

      {/* Symbol sync */}
      <section className="rounded-lg border border-app bg-card p-4">
        <h2 className="text-sm font-semibold text-foreground mb-1">Symbol/Ticker Management</h2>
        <p className="text-xs text-muted mb-3">
          Auto-match company names from your CSV against the NSE ticker list ({tickerListSize} tickers).
        </p>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="px-4 py-2 text-sm rounded-md bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50"
        >
          {syncing ? 'Syncing...' : '📡 Sync All Symbols'}
        </button>

        {syncResult && (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
              <div className="rounded-md bg-card-hover/30 p-2">
                <p className="text-2xl font-bold text-foreground">{syncResult.total}</p>
                <p className="text-xs text-muted">Total</p>
              </div>
              <div className="rounded-md bg-success/15 p-2">
                <p className="text-2xl font-bold text-success">{syncResult.newly_matched}</p>
                <p className="text-xs text-muted">Newly Matched</p>
              </div>
              <div className="rounded-md bg-primary/15 p-2">
                <p className="text-2xl font-bold text-primary">{syncResult.already_had_ticker}</p>
                <p className="text-xs text-muted">Already Had Ticker</p>
              </div>
              <div className="rounded-md bg-warning/15 p-2">
                <p className="text-2xl font-bold text-warning">{syncResult.unmatched_count}</p>
                <p className="text-xs text-muted">Need Manual</p>
              </div>
            </div>
            {syncResult.unmatched_count > 0 && (
              <div className="rounded-md border border-app p-3 max-h-64 overflow-y-auto">
                <p className="text-xs font-semibold text-muted uppercase mb-2">
                  Unmatched stocks (first {Math.min(50, syncResult.unmatched.length)})
                </p>
                <div className="space-y-1">
                  {syncResult.unmatched.map((s) => (
                    <div key={s.id} className="flex items-center gap-2 text-sm">
                      <span className="text-muted font-mono text-xs w-10">#{s.s_no}</span>
                      <span className="text-foreground flex-1 truncate">{s.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <p className="text-sm text-danger mt-3">{error}</p>
        )}
      </section>

      {/* Data refresh */}
      <section className="rounded-lg border border-app bg-card p-4">
        <h2 className="text-sm font-semibold text-foreground mb-1">Data</h2>
        <p className="text-xs text-muted mb-3">
          Last fetched: {lastFetched ? lastFetched.toLocaleString() : 'Never'}
        </p>
        <button
          onClick={refresh}
          className="px-4 py-2 text-sm rounded-md border border-app bg-card text-foreground hover:bg-card-hover"
        >
          🔄 Refresh All Data
        </button>
      </section>

      {/* Session */}
      <section className="rounded-lg border border-app bg-card p-4">
        <h2 className="text-sm font-semibold text-foreground mb-1">Session</h2>
        <p className="text-xs text-muted mb-3">
          Clear all saved filters, sort, and pagination state from local storage.
        </p>
        <button
          onClick={handleClearSession}
          className="px-4 py-2 text-sm rounded-md border border-danger/30 text-danger hover:bg-danger/10"
        >
          🗑️ Clear Session Data
        </button>
      </section>

      {/* API keys info */}
      <section className="rounded-lg border border-app bg-card p-4">
        <h2 className="text-sm font-semibold text-foreground mb-1">API Keys (Optional)</h2>
        <p className="text-xs text-muted mb-3">
          For AI-powered auto-research, set one of these environment variables:
        </p>
        <ul className="text-xs text-muted space-y-1 font-mono">
          <li>• <span className="text-foreground">ANTHROPIC_API_KEY</span> — for Claude (recommended)</li>
          <li>• <span className="text-foreground">OPENAI_API_KEY</span> — for OpenAI fallback</li>
        </ul>
        <p className="text-xs text-muted mt-2">
          Without an API key, the system uses rule-based analysis from available metrics.
        </p>
      </section>
    </div>
  );
}