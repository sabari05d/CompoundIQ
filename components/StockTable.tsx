'use client';

import { Stock, StockResearch, RedFlag } from '@/lib/types';
import { formatCurrency, formatPercentage, formatNumber, calculatePriorityScore, getStatusColor, getDecisionColor } from '@/lib/utils';
import RedFlagBadge from './RedFlagBadge';
import Link from 'next/link';

interface StockTableProps {
  stocks: (Stock & { research?: StockResearch | null; red_flags?: RedFlag[]; priority_score?: number; in_watchlist?: boolean })[];
  onSort: (key: string) => void;
  sortKey: string;
  sortDirection: 'asc' | 'desc';
  showPriorityScore?: boolean;
}

const columns = [
  { key: 's_no', label: '#', align: 'left' as const, className: 'w-12' },
  { key: 'name', label: 'Company', align: 'left' as const, className: 'min-w-[180px]' },
  { key: 'cmp', label: 'CMP', align: 'right' as const, className: 'w-20' },
  { key: 'pe', label: 'P/E', align: 'right' as const, className: 'w-16' },
  { key: 'roce', label: 'ROCE', align: 'right' as const, className: 'w-20' },
  { key: 'profit_var_3yrs', label: 'Profit 3Y', align: 'right' as const, className: 'w-24' },
  { key: 'sales_var_3yrs', label: 'Sales 3Y', align: 'right' as const, className: 'w-24' },
  { key: 'market_cap_cr', label: 'Mkt Cap (Cr)', align: 'right' as const, className: 'w-28' },
  { key: 'status', label: 'Status', align: 'left' as const, className: 'w-32' },
];

export default function StockTable({
  stocks,
  onSort,
  sortKey,
  sortDirection,
  showPriorityScore = true,
}: StockTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-app bg-card/50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => onSort(col.key)}
                className={`${col.className} ${col.align === 'right' ? 'text-right' : 'text-left'} px-3 py-2.5 text-xs font-medium text-muted cursor-pointer hover:text-foreground select-none`}
              >
                <div className={`flex items-center gap-1 ${col.align === 'right' ? 'justify-end' : 'justify-start'}`}>
                  <span>{col.label}</span>
                  {sortKey === col.key && (
                    <span className="text-primary">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
            ))}
            {showPriorityScore && (
              <th
                onClick={() => onSort('priority_score')}
                className="w-20 px-3 py-2.5 text-xs font-medium text-muted cursor-pointer hover:text-foreground select-none text-right"
              >
                <div className="flex items-center gap-1 justify-end">
                  <span>Score</span>
                  {sortKey === 'priority_score' && (
                    <span className="text-primary">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
            )}
            <th className="w-20 px-3 py-2.5 text-xs font-medium text-muted text-left">
              Flags
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-app/50">
          {stocks.map((stock) => {
            const research = stock.research;
            const status = research?.status || 'not_researched';
            const decision = research?.investment_decision;
            const flags = stock.red_flags || [];
            const highFlags = flags.filter((f) => f.severity === 'high').length;

            return (
              <tr
                key={stock.id}
                className="hover:bg-card/50 transition-colors group"
              >
                <td className="px-3 py-3 text-muted font-mono text-xs">
                  {stock.s_no}
                </td>
                <td className="px-3 py-3">
                  <Link
                    href={`/stock/${stock.id}`}
                    className="block"
                  >
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-foreground group-hover:text-primary truncate max-w-[180px]">
                        {stock.name}
                      </div>
                      {stock.in_watchlist && (
                        <svg
                          className="w-3.5 h-3.5 text-success flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                      )}
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
                <td
                  className={`px-3 py-3 text-right font-mono ${
                    stock.roce !== null && stock.roce < 12
                      ? 'text-danger'
                      : 'text-foreground'
                  }`}
                >
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
                <td
                  className={`px-3 py-3 text-right font-mono ${
                    stock.sales_var_3yrs !== null && stock.sales_var_3yrs < 0
                      ? 'text-danger'
                      : 'text-foreground'
                  }`}
                >
                  {formatPercentage(stock.sales_var_3yrs)}
                </td>
                <td className="px-3 py-3 text-right font-mono text-foreground">
                  {formatCurrency(stock.market_cap_cr)}
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded ${getStatusColor(status)}`}
                    >
                      {status === 'not_researched' ? 'Not Started' : status === 'in_progress' ? 'In Progress' : 'Completed'}
                    </span>
                    {decision && (
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded ${getDecisionColor(decision)}`}
                      >
                        {decision}
                      </span>
                    )}
                  </div>
                </td>
                {showPriorityScore && (
                  <td className="px-3 py-3 text-right font-mono font-semibold text-primary">
                    {stock.priority_score !== undefined
                      ? stock.priority_score
                      : calculatePriorityScore(stock)}
                  </td>
                )}
                <td className="px-3 py-3">
                  {highFlags > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded bg-danger/15 text-danger">
                      🚩 {highFlags}
                    </span>
                  ) : flags.length > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded bg-warning/15 text-warning">
                      🟡 {flags.length}
                    </span>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}