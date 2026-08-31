'use client';

import { Stock, StockResearch, RedFlag } from '@/lib/types';
import { formatCurrency, formatPercentage, formatNumber, calculatePriorityScore, getStatusColor, getDecisionColor } from '@/lib/utils';
import RedFlagBadge from './RedFlagBadge';

interface StockTableProps {
  stocks: (Stock & { research?: StockResearch | null; red_flags?: RedFlag[]; priority_score?: number })[];
  onSort: (key: string) => void;
  sortKey: string;
  sortDirection: 'asc' | 'desc';
  showPriorityScore?: boolean;
}

const columns = [
  { key: 's_no', label: 'S.No', width: 'w-16' },
  { key: 'name', label: 'Company', width: 'w-48 min-w-[180px]' },
  { key: 'cmp', label: 'CMP', width: 'w-20', align: 'right' },
  { key: 'pe', label: 'P/E', width: 'w-16', align: 'right' },
  { key: 'roce', label: 'ROCE', width: 'w-20', align: 'right' },
  { key: 'profit_var_3yrs', label: 'Profit 3Y', width: 'w-24', align: 'right' },
  { key: 'sales_var_3yrs', label: 'Sales 3Y', width: 'w-24', align: 'right' },
  { key: 'market_cap_cr', label: 'Mkt Cap (Cr)', width: 'w-28', align: 'right' },
  { key: 'status', label: 'Status', width: 'w-28' },
];

export default function StockTable({
  stocks,
  onSort,
  sortKey,
  sortDirection,
  showPriorityScore = true,
}: StockTableProps) {
  const SortIcon = ({ sortField }: { sortField: string }) => {
    if (sortKey !== sortField) return (
      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    );
    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-3 py-2.5 text-left font-medium text-gray-500 dark:text-gray-400 ${col.width} ${col.align ? 'text-right' : ''} cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none`}
                onClick={() => onSort(col.key)}
              >
                <div className="flex items-center gap-1">
                  <span>{col.label}</span>
                  <SortIcon sortField={col.key} />
                </div>
              </th>
            ))}
            {showPriorityScore && (
              <th className="px-3 py-2.5 text-left font-medium text-gray-500 dark:text-gray-400 w-24 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none"
                onClick={() => onSort('priority_score')}>
                <div className="flex items-center gap-1">
                  <span>Score</span>
                  <SortIcon sortField="priority_score" />
                </div>
              </th>
            )}
            <th className="px-3 py-2.5 text-left font-medium text-gray-500 dark:text-gray-400 w-12">
              <span>Flags</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {stocks.map((stock) => {
            const research = stock.research;
            const status = research?.status || 'not_researched';
            const decision = research?.investment_decision;
            const flags = stock.red_flags || [];
            const highFlags = flags.filter(f => f.severity === 'high').length;

            return (
              <tr key={stock.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="px-3 py-2.5 text-gray-500 dark:text-gray-400 font-mono">{stock.s_no}</td>
                <td className="px-3 py-2.5">
                  <a
                    href={`/stock/${stock.id}`}
                    className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline truncate block max-w-[200px]"
                  >
                    {stock.name}
                  </a>
                  {stock.ticker && (
                    <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                      ({stock.ticker})
                    </span>
                  )}
                </td>
                <td className="px-3 py-2.5 text-right font-mono text-gray-900 dark:text-white">
                  {formatCurrency(stock.cmp, 2)}
                </td>
                <td className="px-3 py-2.5 text-right font-mono text-gray-900 dark:text-white">
                  {formatNumber(stock.pe)}
                </td>
                <td className="px-3 py-2.5 text-right font-mono text-gray-900 dark:text-white">
                  {formatPercentage(stock.roce)}
                </td>
                <td className="px-3 py-2.5 text-right font-mono">
                  <span className={stock.profit_var_3yrs !== null && stock.profit_var_3yrs < 0 ? 'text-red-600 dark:text-red-400' : ''}>
                    {formatPercentage(stock.profit_var_3yrs)}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right font-mono">
                  <span className={stock.sales_var_3yrs !== null && stock.sales_var_3yrs < 0 ? 'text-red-600 dark:text-red-400' : ''}>
                    {formatPercentage(stock.sales_var_3yrs)}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right font-mono text-gray-900 dark:text-white">
                  {formatCurrency(stock.market_cap_cr)}
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(status as any)}`}
                    >
                      {status.replace('_', ' ')}
                    </span>
                    {decision && (
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${getDecisionColor(decision)}`}
                      >
                        {decision}
                      </span>
                    )}
                  </div>
                </td>
                {showPriorityScore && (
                  <td className="px-3 py-2.5 text-right font-mono font-medium text-indigo-600 dark:text-indigo-400">
                    {stock.priority_score !== undefined ? stock.priority_score : calculatePriorityScore(stock)}
                  </td>
                )}
                <td className="px-3 py-2.5">
                  <RedFlagBadge flags={flags} compact />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {stocks.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No stocks found matching your filters.
        </div>
      )}
    </div>
  );
}