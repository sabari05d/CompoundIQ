'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useStocks } from '@/contexts/StocksContext';
import { formatCurrency, formatPercentage, formatNumber, calculatePriorityScore, getDecisionColor } from '@/lib/utils';
import ResearchForm from '@/components/ResearchForm';
import RedFlagBadge from '@/components/RedFlagBadge';
import WatchlistButton from '@/components/WatchlistButton';
import PriceChart from '@/components/PriceChart';
import HistoryTable from '@/components/HistoryTable';
import AutoResearchButton from '@/components/AutoResearchButton';
import AbbreviationTooltip from '@/components/AbbreviationTooltip';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function StockDetailClient() {
  const params = useParams<{ id: string }>();
  const stockId = parseInt(params.id, 10);
  const { getStock, getResearch, getRedFlags, loading, error, isInWatchlist } = useStocks();
  const [activeTab, setActiveTab] = useState<'overview' | 'research'>('overview');
  const [research, setResearch] = useState(getResearch(stockId));

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading stock..." />;
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto p-6 mt-12">
        <div className="rounded-lg border border-danger/30 bg-danger/10 p-4">
          <h2 className="text-sm font-semibold text-danger">Error</h2>
          <p className="text-sm text-muted mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const stock = getStock(stockId);
  if (!stock) {
    return (
      <div className="max-w-md mx-auto p-6 mt-12">
        <div className="rounded-lg border border-app bg-card p-4 text-center">
          <p className="text-sm text-muted">Stock not found.</p>
          <Link href="/" className="text-sm text-primary hover:underline mt-2 inline-block">
            ← Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const redFlags = getRedFlags(stockId);
  const inWatchlist = isInWatchlist(stockId);
  const status = research?.status || 'not_researched';
  const decision = research?.investment_decision;
  const highFlags = redFlags.filter((f) => f.severity === 'high').length;
  const mediumFlags = redFlags.filter((f) => f.severity === 'medium').length;
  const lowFlags = redFlags.filter((f) => f.severity === 'low').length;
  const hasHighFlags = highFlags > 0;
  const priorityScore = calculatePriorityScore(stock);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground mb-3"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to dashboard
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-muted">#{stock.s_no}</span>
              {stock.ticker && (
                <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-card text-muted">
                  {stock.ticker}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-foreground">{stock.name}</h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-2.5 py-1 text-xs font-medium rounded ${
                status === 'completed'
                  ? 'bg-success/15 text-success'
                  : status === 'in_progress'
                  ? 'bg-warning/15 text-warning'
                  : 'bg-card text-muted border border-app'
              }`}
            >
              {status === 'not_researched' ? 'Not Researched' : status === 'in_progress' ? 'In Progress' : 'Completed'}
            </span>
            {decision && (
              <span className={`px-2.5 py-1 text-xs font-medium rounded ${getDecisionColor(decision)}`}>
                {decision.toUpperCase()}
              </span>
            )}
            <WatchlistButton
              stockId={stock.id}
              initialInWatchlist={inWatchlist}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-1 border-b border-app overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted hover:text-foreground'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('research')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
            activeTab === 'research'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted hover:text-foreground'
          }`}
        >
          Research
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Auto-research row */}
          <div className="rounded-lg border border-app bg-card p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">Need help analyzing this stock?</p>
              <p className="text-xs text-muted mt-0.5">
                AI will analyze the metrics and generate bull/base/bear cases.
              </p>
            </div>
            <AutoResearchButton stockId={stock.id} />
          </div>

          {/* Top stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              label="Priority Score"
              value={priorityScore}
              suffix="/100"
              tone="primary"
            />
            <StatCard
              label="Red Flags"
              value={highFlags + mediumFlags + lowFlags}
              tone={hasHighFlags ? 'danger' : mediumFlags > 0 ? 'warning' : 'success'}
              sublabel={`${highFlags}H · ${mediumFlags}M · ${lowFlags}L`}
            />
            <StatCard
              label="Research"
              value={status === 'not_researched' ? 'None' : status === 'in_progress' ? 'In Progress' : 'Done'}
              tone={status === 'completed' ? 'success' : status === 'in_progress' ? 'warning' : 'neutral'}
            />
            <StatCard
              label="Confidence"
              value={research?.confidence_score ? `${research.confidence_score}/5` : '—'}
              tone="neutral"
            />
          </div>

          {/* Red flags */}
          {redFlags.length > 0 && (
            <div className="rounded-lg border border-app bg-card p-4">
              <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <span>🚩</span> Red Flags
              </h2>
              <RedFlagBadge flags={redFlags} />
            </div>
          )}

          {/* Metric cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <MetricCard
              title="Price & Valuation"
              items={[
                { label: 'CMP', abbrev: 'CMP', value: formatCurrency(stock.cmp, 2) },
                { label: 'P/E', abbrev: 'PE', value: formatNumber(stock.pe) },
                { label: 'Market Cap', abbrev: 'MKT_CAP', value: formatCurrency(stock.market_cap_cr, 0), suffix: 'Cr' },
                { label: 'Div Yield', abbrev: 'DIV_YIELD', value: formatPercentage(stock.div_yield) },
              ]}
            />
            <MetricCard
              title="Performance"
              items={[
                { label: 'ROCE', abbrev: 'ROCE', value: formatPercentage(stock.roce), warning: stock.roce !== null && stock.roce < 12 },
                { label: 'Profit 3Y', abbrev: 'PROFIT_VAR_3Y', value: formatPercentage(stock.profit_var_3yrs), warning: stock.profit_var_3yrs !== null && stock.profit_var_3yrs < 15 },
                { label: 'Sales 3Y', abbrev: 'SALES_VAR_3Y', value: formatPercentage(stock.sales_var_3yrs), warning: stock.sales_var_3yrs !== null && stock.sales_var_3yrs < 15 },
                { label: 'Score', value: `${priorityScore}/100` },
              ]}
            />
            <MetricCard
              title="Quarterly Data"
              items={[
                { label: 'NP (Qtr)', abbrev: 'NP_QTR', value: formatCurrency(stock.np_qtr_cr, 2), suffix: 'Cr' },
                { label: 'Qtr Profit Var', abbrev: 'QTR_PROFIT_VAR', value: formatPercentage(stock.qtr_profit_var), warning: stock.qtr_profit_var !== null && stock.qtr_profit_var < 0 },
                { label: 'Sales (Qtr)', abbrev: 'SALES_QTR', value: formatCurrency(stock.sales_qtr_cr, 2), suffix: 'Cr' },
                { label: 'Qtr Sales Var', abbrev: 'QTR_SALES_VAR', value: formatPercentage(stock.qtr_sales_var), warning: stock.qtr_sales_var !== null && stock.qtr_sales_var < 0 },
              ]}
            />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <PriceChart stockId={stock.id} hasTicker={!!stock.ticker} />
            <HistoryTable stockId={stock.id} hasTicker={!!stock.ticker} />
          </div>

          {/* Research summary */}
          {research && (
            <div className="rounded-lg border border-app bg-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-foreground">Research Summary</h2>
                {research.last_updated && (
                  <span className="text-xs text-muted">
                    Last updated: {new Date(research.last_updated).toLocaleDateString()}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {research.bull_thesis && (
                  <div>
                    <p className="text-xs font-semibold uppercase text-success mb-1">Bull Thesis</p>
                    <p className="text-muted leading-relaxed">{research.bull_thesis}</p>
                  </div>
                )}
                {research.bear_case && (
                  <div>
                    <p className="text-xs font-semibold uppercase text-danger mb-1">Bear Case</p>
                    <p className="text-muted leading-relaxed">{research.bear_case}</p>
                  </div>
                )}
                {research.base_case && (
                  <div>
                    <p className="text-xs font-semibold uppercase text-primary mb-1">Base Case</p>
                    <p className="text-muted leading-relaxed">{research.base_case}</p>
                  </div>
                )}
                {research.break_conditions && (
                  <div>
                    <p className="text-xs font-semibold uppercase text-warning mb-1">Break Conditions</p>
                    <p className="text-muted leading-relaxed">{research.break_conditions}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'research' && (
        <div className="rounded-lg border border-app bg-card p-5">
          <ResearchForm
            stockId={stock.id}
            initialResearch={research}
            onSave={setResearch}
          />
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  suffix,
  sublabel,
  tone = 'neutral',
}: {
  label: string;
  value: string | number;
  suffix?: string;
  sublabel?: string;
  tone?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
}) {
  const toneClasses = {
    primary: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger',
    neutral: 'text-foreground',
  };
  return (
    <div className="rounded-lg border border-app bg-card p-3">
      <p className="text-xs text-muted uppercase tracking-wide">{label}</p>
      <div className="flex items-baseline gap-1 mt-1">
        <span className={`text-xl font-semibold ${toneClasses[tone]}`}>{value}</span>
        {suffix && <span className="text-sm text-muted">{suffix}</span>}
      </div>
      {sublabel && <p className="text-xs text-muted mt-1">{sublabel}</p>}
    </div>
  );
}

function MetricCard({
  title,
  items,
}: {
  title: string;
  items: { label: string; abbrev?: string; value: string; suffix?: string; warning?: boolean }[];
}) {
  return (
    <div className="rounded-lg border border-app bg-card p-4">
      <h2 className="text-sm font-semibold text-foreground mb-3">{title}</h2>
      <div className="space-y-2.5">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <span className="text-xs text-muted">
              {item.abbrev ? <AbbreviationTooltip term={item.abbrev} showIcon={false} /> : item.label}
            </span>
            <span
              className={`text-sm font-mono font-medium ${
                item.warning ? 'text-danger' : 'text-foreground'
              }`}
            >
              {item.value}
              {item.suffix && <span className="text-muted ml-0.5">{item.suffix}</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}