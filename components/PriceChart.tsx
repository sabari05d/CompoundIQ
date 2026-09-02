'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import LoadingSpinner from './LoadingSpinner';

interface ChartPoint {
  date: string;
  close: number;
  high: number;
  low: number;
  volume: number;
}

const TIMEFRAMES = ['1M', '3M', '6M', '1Y', '3Y', '5Y', '10Y'] as const;
type Timeframe = (typeof TIMEFRAMES)[number];

interface PriceChartProps {
  stockId: number;
  hasTicker: boolean;
}

export default function PriceChart({ stockId, hasTicker }: PriceChartProps) {
  const [data, setData] = useState<ChartPoint[]>([]);
  const [timeframe, setTimeframe] = useState<Timeframe>('1Y');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);

  const fetchChart = useCallback(
    async (tf: Timeframe) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/stock/${stockId}/chart?timeframe=${tf}`);
        if (!res.ok) throw new Error('Failed to load chart');
        const json = await res.json();
        setData(json.data || []);
        setFetched(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load chart');
      } finally {
        setLoading(false);
      }
    },
    [stockId]
  );

  if (!hasTicker) {
    return (
      <div className="rounded-lg border border-app bg-card p-4 text-center">
        <p className="text-sm text-muted">No ticker symbol available for this stock.</p>
        <p className="text-xs text-muted mt-1">Add a ticker to view price history.</p>
      </div>
    );
  }

  if (!fetched) {
    return (
      <div className="rounded-lg border border-app bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Price Chart</h3>
        </div>
        <button
          onClick={() => fetchChart(timeframe)}
          disabled={loading}
          className="w-full py-8 rounded-md border-2 border-dashed border-app text-sm text-muted hover:text-foreground hover:border-primary/50 transition-colors"
        >
          {loading ? 'Loading...' : '📈 Load Price Chart'}
        </button>
        {error && <p className="text-xs text-danger mt-2">{error}</p>}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-app bg-card p-4">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h3 className="text-sm font-semibold text-foreground">Price Chart</h3>
        <div className="flex gap-1 flex-wrap">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              onClick={() => {
                setTimeframe(tf);
                fetchChart(tf);
              }}
              className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                timeframe === tf
                  ? 'bg-primary text-white'
                  : 'text-muted hover:text-foreground hover:bg-card-hover'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <LoadingSpinner message="Loading chart..." />
        </div>
      ) : error ? (
        <p className="text-sm text-danger py-8 text-center">{error}</p>
      ) : data.length === 0 ? (
        <p className="text-sm text-muted py-8 text-center">No data available.</p>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid stroke="rgba(148, 163, 184, 0.1)" strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickFormatter={(v) => {
                  const d = new Date(v);
                  return d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
                }}
                minTickGap={40}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickFormatter={(v) => `₹${v.toFixed(0)}`}
                domain={['dataMin', 'dataMax']}
                width={50}
              />
              <Tooltip
                contentStyle={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: 6,
                  fontSize: 12,
                }}
                labelStyle={{ color: '#94a3b8' }}
                formatter={(value) => [`₹${Number(value).toFixed(2)}`, 'Price']}
              />
              <Line
                type="monotone"
                dataKey="close"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}