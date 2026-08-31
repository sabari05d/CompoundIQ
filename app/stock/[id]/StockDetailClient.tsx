'use client';

import { useState } from 'react';
import { Stock, StockResearch, RedFlag } from '@/lib/types';
import { formatCurrency, formatPercentage, formatNumber, getDecisionColor } from '@/lib/utils';
import ResearchForm from '@/components/ResearchForm';
import RedFlagBadge from '@/components/RedFlagBadge';

interface StockDetailClientProps {
  initialStock: Stock;
  initialResearch: StockResearch | null;
  initialRedFlags: RedFlag[];
  priorityScore: number;
}

export default function StockDetailClient({
  initialStock,
  initialResearch,
  initialRedFlags,
  priorityScore,
}: StockDetailClientProps) {
  const [research, setResearch] = useState<StockResearch | null>(initialResearch);
  const [redFlags, setRedFlags] = useState<RedFlag[]>(initialRedFlags);
  const [activeTab, setActiveTab] = useState<'overview' | 'research'>('overview');

  const handleResearchSave = (savedResearch: StockResearch) => {
    setResearch(savedResearch);
  };

  const highFlags = redFlags.filter(f => f.severity === 'high').length;
  const mediumFlags = redFlags.filter(f => f.severity === 'medium').length;
  const lowFlags = redFlags.filter(f => f.severity === 'low').length;
  const hasHighFlags = highFlags > 0;

  const status = research?.status || 'not_researched';
  const decision = research?.investment_decision;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6 flex gap-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('research')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
              activeTab === 'research'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Research
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard
                label="Priority Score"
                value={priorityScore}
                suffix="/100"
                color="indigo"
                description="Higher = more interesting"
              />
              <MetricCard
                label="Red Flags"
                value={highFlags + mediumFlags + lowFlags}
                color={hasHighFlags ? 'red' : mediumFlags > 0 ? 'yellow' : 'green'}
                description={`${highFlags} High, ${mediumFlags} Med, ${lowFlags} Low`}
              />
              <MetricCard
                label="Research Status"
                value={status.replace('_', ' ')}
                color={status === 'completed' ? 'green' : status === 'in_progress' ? 'blue' : 'gray'}
                description={decision ? `Decision: ${decision}` : 'Not yet decided'}
              />
            </div>

            {redFlags.length > 0 && (
              <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="text-red-500">🚩</span> Red Flags Detected
                </h2>
                <RedFlagBadge flags={redFlags} />
              </section>
            )}

            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Price & Valuation</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricItem label="CMP" value={formatCurrency(initialStock.cmp, 2)} />
                <MetricItem label="P/E Ratio" value={formatNumber(initialStock.pe)} />
                <MetricItem label="Market Cap" value={formatCurrency(initialStock.market_cap_cr)} suffix=" Cr" />
                <MetricItem label="Div Yield" value={formatPercentage(initialStock.div_yield)} />
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Metrics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricItem
                  label="ROCE"
                  value={formatPercentage(initialStock.roce)}
                  highlight={initialStock.roce !== null && initialStock.roce < 12}
                />
                <MetricItem
                  label="Profit Growth 3Y"
                  value={formatPercentage(initialStock.profit_var_3yrs)}
                  highlight={initialStock.profit_var_3yrs !== null && initialStock.profit_var_3yrs < 15}
                />
                <MetricItem
                  label="Sales Growth 3Y"
                  value={formatPercentage(initialStock.sales_var_3yrs)}
                  highlight={initialStock.sales_var_3yrs !== null && initialStock.sales_var_3yrs < 15}
                />
                <MetricItem label="Priority Score" value={String(priorityScore)} suffix="/100" />
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quarterly Data</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricItem
                  label="Net Profit (Qtr)"
                  value={formatCurrency(initialStock.np_qtr_cr, 2)}
                  suffix=" Cr"
                />
                <MetricItem
                  label="Qtr Profit Var"
                  value={formatPercentage(initialStock.qtr_profit_var)}
                  highlight={initialStock.qtr_profit_var !== null && initialStock.qtr_profit_var < 0}
                />
                <MetricItem
                  label="Sales (Qtr)"
                  value={formatCurrency(initialStock.sales_qtr_cr, 2)}
                  suffix=" Cr"
                />
                <MetricItem
                  label="Qtr Sales Var"
                  value={formatPercentage(initialStock.qtr_sales_var)}
                  highlight={initialStock.qtr_sales_var !== null && initialStock.qtr_sales_var < 0}
                />
              </div>
            </section>

            {research && (
              <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Research Summary</h2>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Last updated: {new Date(research.last_updated).toLocaleDateString()}
                  </span>
                </div>
                <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
                  {research.investment_decision && (
                    <div>
                      <span className="font-medium">Decision:</span>{' '}
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getDecisionColor(research.investment_decision)}`}>
                        {research.investment_decision.toUpperCase()}
                      </span>
                    </div>
                  )}
                  {research.confidence_score && (
                    <div>
                      <span className="font-medium">Confidence:</span>{' '}
                      <span className="font-mono">{research.confidence_score}/5</span>
                    </div>
                  )}
                  {research.bull_thesis && (
                    <div>
                      <span className="font-medium text-green-600 dark:text-green-400">Bull Thesis:</span>
                      <p className="mt-1">{research.bull_thesis}</p>
                    </div>
                  )}
                  {research.bear_case && (
                    <div>
                      <span className="font-medium text-red-600 dark:text-red-400">Bear Case:</span>
                      <p className="mt-1">{research.bear_case}</p>
                    </div>
                  )}
                  {research.break_conditions && (
                    <div>
                      <span className="font-medium text-orange-600 dark:text-orange-400">Break Conditions:</span>
                      <p className="mt-1">{research.break_conditions}</p>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        )}

        {activeTab === 'research' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <ResearchForm
              stockId={initialStock.id}
              initialResearch={research}
              onSave={handleResearchSave}
            />
          </div>
        )}
      </main>
    </div>
  );
}

function MetricCard({
  label,
  value,
  suffix = '',
  color = 'gray',
  description,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  color?: 'indigo' | 'red' | 'yellow' | 'green' | 'blue' | 'gray';
  description?: string;
}) {
  const colorClasses = {
    indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    gray: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">{value}</span>
        {suffix && <span className="text-gray-500 dark:text-gray-400">{suffix}</span>}
      </div>
      {description && (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{description}</p>
      )}
    </div>
  );
}

function MetricItem({
  label,
  value,
  suffix = '',
  highlight = false,
}: {
  label: string;
  value: string;
  suffix?: string;
  highlight?: boolean;
}) {
  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className={`font-mono text-lg font-semibold ${highlight ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
        {value}{suffix}
      </p>
    </div>
  );
}