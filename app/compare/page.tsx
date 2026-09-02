'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useStocks } from '@/contexts/StocksContext';
import { formatCurrency, formatPercentage, formatNumber, calculatePriorityScore } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function ComparePage() {
  const { stocks, researchMap, loading } = useStocks();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<number[]>([]);

  const filtered = useMemo(() => {
    if (!search) return [];
    const s = search.toLowerCase();
    return stocks
      .filter(
        (st) =>
          st.name.toLowerCase().includes(s) ||
          (st.ticker && st.ticker.toLowerCase().includes(s))
      )
      .slice(0, 8);
  }, [stocks, search]);

  const compareStocks = useMemo(() => {
    return selected
      .map((id) => stocks.find((s) => s.id === id))
      .filter((s): s is NonNullable<typeof s> => s !== undefined);
  }, [selected, stocks]);

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 4) {
        alert('Maximum 4 stocks can be compared at once');
        return prev;
      }
      return [...prev, id];
    });
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading stocks..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Compare Stocks</h1>
        <p className="text-sm text-muted mt-1">
          Select up to 4 stocks to compare side-by-side.
        </p>
      </div>

      {/* Search */}
      <div className="rounded-lg border border-app bg-card p-4 mb-4">
        <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">
          Search stocks to add
        </label>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Type company name or ticker..."
          className="w-full px-3 py-2 text-sm rounded-md border border-app bg-background text-foreground placeholder-muted focus:outline-none focus:border-primary"
        />
        {search && (
          <div className="mt-2 max-h-64 overflow-y-auto space-y-1">
            {filtered.length === 0 ? (
              <p className="text-sm text-muted py-2">No matches</p>
            ) : (
              filtered.map((s) => {
                const isSelected = selected.includes(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleSelect(s.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm border transition-colors ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-app hover:bg-card-hover text-foreground'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted">#{s.s_no}</span>
                      <span className="font-medium">{s.name}</span>
                      {s.ticker && (
                        <span className="text-xs text-muted font-mono">({s.ticker})</span>
                      )}
                    </span>
                    {isSelected && <span className="text-xs font-medium">✓ Added</span>}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Comparison */}
      {compareStocks.length === 0 ? (
        <div className="rounded-lg border border-app bg-card p-12 text-center">
          <p className="text-sm text-muted">Search and add stocks above to start comparing.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-app bg-card overflow-hidden">
          <div className="p-4 border-b border-app flex items-center justify-between">
            <p className="text-sm text-foreground">
              Comparing <span className="font-semibold">{compareStocks.length}</span> stock(s)
            </p>
            <button
              onClick={() => setSelected([])}
              className="text-xs text-danger hover:underline"
            >
              Clear all
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-app bg-card/50">
                <tr>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-muted w-32">Metric</th>
                  {compareStocks.map((s) => (
                    <th key={s.id} className="px-3 py-2.5 text-left min-w-[180px]">
                      <div className="flex items-center justify-between">
                        <div>
                          <Link
                            href={`/stock/${s.id}`}
                            className="text-sm font-medium text-foreground hover:text-primary"
                          >
                            {s.name}
                          </Link>
                          <p className="text-xs text-muted font-mono">
                            #{s.s_no}
                            {s.ticker ? ` · ${s.ticker}` : ''}
                          </p>
                        </div>
                        <button
                          onClick={() => toggleSelect(s.id)}
                          className="text-xs text-danger hover:underline ml-2"
                        >
                          ✕
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-app/50">
                <CompareRow label="CMP" stocks={compareStocks} getValue={(s) => formatCurrency(s.cmp, 2)} />
                <CompareRow label="P/E" stocks={compareStocks} getValue={(s) => formatNumber(s.pe)} />
                <CompareRow
                  label="Market Cap (Cr)"
                  stocks={compareStocks}
                  getValue={(s) => formatCurrency(s.market_cap_cr)}
                />
                <CompareRow
                  label="ROCE"
                  stocks={compareStocks}
                  getValue={(s) => formatPercentage(s.roce)}
                  bad={(s) => s.roce !== null && s.roce < 12}
                />
                <CompareRow
                  label="Sales 3Y"
                  stocks={compareStocks}
                  getValue={(s) => formatPercentage(s.sales_var_3yrs)}
                  bad={(s) => s.sales_var_3yrs !== null && s.sales_var_3yrs < 10}
                />
                <CompareRow
                  label="Profit 3Y"
                  stocks={compareStocks}
                  getValue={(s) => formatPercentage(s.profit_var_3yrs)}
                  bad={(s) => s.profit_var_3yrs !== null && s.profit_var_3yrs < 10}
                />
                <CompareRow
                  label="Qtr Sales Var"
                  stocks={compareStocks}
                  getValue={(s) => formatPercentage(s.qtr_sales_var)}
                  bad={(s) => s.qtr_sales_var !== null && s.qtr_sales_var < 0}
                />
                <CompareRow
                  label="Qtr Profit Var"
                  stocks={compareStocks}
                  getValue={(s) => formatPercentage(s.qtr_profit_var)}
                  bad={(s) => s.qtr_profit_var !== null && s.qtr_profit_var < 0}
                />
                <CompareRow
                  label="Div Yield"
                  stocks={compareStocks}
                  getValue={(s) => formatPercentage(s.div_yield)}
                />
                <CompareRow
                  label="Priority Score"
                  stocks={compareStocks}
                  getValue={(s) => `${calculatePriorityScore(s)}/100`}
                  highlight
                />
                <CompareRow
                  label="Research Status"
                  stocks={compareStocks}
                  getValue={(s) => {
                    const r = researchMap.get(s.id);
                    return r ? r.status.replace('_', ' ') : 'Not Started';
                  }}
                />
                <CompareRow
                  label="Decision"
                  stocks={compareStocks}
                  getValue={(s) => {
                    const r = researchMap.get(s.id);
                    return r?.investment_decision || '—';
                  }}
                />
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function CompareRow({
  label,
  stocks,
  getValue,
  bad,
  highlight,
}: {
  label: string;
  stocks: any[];
  getValue: (s: any) => string;
  bad?: (s: any) => boolean;
  highlight?: boolean;
}) {
  return (
    <tr>
      <td className="px-3 py-2.5 text-xs text-muted">{label}</td>
      {stocks.map((s) => {
        const isBad = bad ? bad(s) : false;
        return (
          <td
            key={s.id}
            className={`px-3 py-2.5 text-sm font-mono ${
              isBad ? 'text-danger' : highlight ? 'text-primary font-semibold' : 'text-foreground'
            }`}
          >
            {getValue(s)}
          </td>
        );
      })}
    </tr>
  );
}