'use client';

import { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { useStocks } from '@/contexts/StocksContext';

interface AutoResearchResult {
  source: 'llm' | 'rule-based';
  generated_at: string;
  bull_thesis: string;
  base_case: string;
  bear_case: string;
  break_conditions: string;
  confidence_score: number;
  summary: string;
  metrics_used: any;
}

interface AutoResearchButtonProps {
  stockId: number;
}

export default function AutoResearchButton({ stockId }: AutoResearchButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AutoResearchResult | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const { upsertResearch, getResearch, getStock } = useStocks();

  const stock = getStock(stockId);

  const handleResearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/stock/${stockId}/auto-research`, { method: 'POST' });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Research failed');
      }
      const json = await res.json();
      setResult(json);
      setShowModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Research failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    setSaving(true);
    try {
      await upsertResearch(stockId, {
        bull_thesis: result.bull_thesis,
        base_case: result.base_case,
        bear_case: result.bear_case,
        break_conditions: result.break_conditions,
        confidence_score: result.confidence_score,
        status: 'in_progress',
        notes: `[AI-Generated ${result.source === 'llm' ? 'Claude' : 'rule-based'} on ${new Date(result.generated_at).toLocaleString()}] ${result.summary || ''}`,
      });
      setShowModal(false);
    } catch (err) {
      setError('Failed to save research');
    } finally {
      setSaving(false);
    }
  };

  const existing = getResearch(stockId);

  return (
    <>
      <button
        onClick={handleResearch}
        disabled={loading}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 disabled:opacity-50"
      >
        {loading ? (
          <span className="inline-block h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <span>🔍</span>
        )}
        {loading ? 'Analyzing...' : existing ? 'Regenerate AI Research' : 'Auto Research'}
      </button>

      {error && (
        <p className="text-xs text-danger mt-1">{error}</p>
      )}

      {showModal && result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-card border border-app rounded-lg max-w-2xl w-full max-h-[85vh] overflow-y-auto">
            <div className="p-4 border-b border-app flex items-center justify-between sticky top-0 bg-card">
              <div>
                <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                  AI Research
                  <span className="px-1.5 py-0.5 text-xs font-medium rounded bg-primary/15 text-primary">
                    {result.source === 'llm' ? 'AI' : 'Rule-Based'}
                  </span>
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  {stock?.name} · Generated {new Date(result.generated_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded text-muted hover:text-foreground"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 space-y-4 text-sm">
              {result.summary && (
                <div className="rounded-md bg-primary/10 border border-primary/30 p-3">
                  <p className="text-xs font-semibold uppercase text-primary mb-1">Summary</p>
                  <p className="text-foreground">{result.summary}</p>
                </div>
              )}

              <Section color="text-success" label="Bull Thesis" content={result.bull_thesis} />
              <Section color="text-primary" label="Base Case" content={result.base_case} />
              <Section color="text-danger" label="Bear Case" content={result.bear_case} />
              <Section color="text-warning" label="Break Conditions" content={result.break_conditions} />

              <div className="flex items-center justify-between pt-2 border-t border-app">
                <span className="text-xs text-muted">Confidence</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span
                      key={n}
                      className={`text-base ${
                        n <= result.confidence_score ? 'text-warning' : 'text-muted/30'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                  <span className="text-xs text-muted ml-1">
                    {result.confidence_score}/5
                  </span>
                </div>
              </div>

              <p className="text-xs text-muted italic">
                ⚠️ This is AI-generated analysis. Always verify with primary sources before investing.
              </p>
            </div>

            <div className="p-4 border-t border-app flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1.5 text-sm rounded-md border border-app bg-card text-foreground hover:bg-card-hover"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-3 py-1.5 text-sm rounded-md bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save to Research'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Section({ color, label, content }: { color: string; label: string; content: string }) {
  return (
    <div>
      <p className={`text-xs font-semibold uppercase ${color} mb-1`}>{label}</p>
      <p className="text-muted leading-relaxed whitespace-pre-line">{content}</p>
    </div>
  );
}