'use client';

import { useState, useEffect, useCallback } from 'react';
import { useStocks } from '@/contexts/StocksContext';
import { StockResearch, InvestmentDecision } from '@/lib/types';

interface ResearchFormProps {
  stockId: number;
  initialResearch: StockResearch | null;
  onSave: (research: StockResearch) => void;
}

interface FormData {
  status: 'not_researched' | 'in_progress' | 'completed';
  bull_thesis: string;
  base_case: string;
  bear_case: string;
  break_conditions: string;
  investment_decision: string;
  confidence_score: string;
  research_date: string;
  notes: string;
}

const decisionOptions: { value: InvestmentDecision; label: string }[] = [
  { value: 'buy', label: 'Buy' },
  { value: 'watchlist', label: 'Watchlist' },
  { value: 'pass', label: 'Pass' },
];

const initialFormData: FormData = {
  status: 'in_progress',
  bull_thesis: '',
  base_case: '',
  bear_case: '',
  break_conditions: '',
  investment_decision: '',
  confidence_score: '',
  research_date: new Date().toISOString().split('T')[0],
  notes: '',
};

export default function ResearchForm({ stockId, initialResearch, onSave }: ResearchFormProps) {
  const { upsertResearch } = useStocks();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveTimer, setAutoSaveTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (initialResearch) {
      setFormData({
        status: initialResearch.status,
        bull_thesis: initialResearch.bull_thesis || '',
        base_case: initialResearch.base_case || '',
        bear_case: initialResearch.bear_case || '',
        break_conditions: initialResearch.break_conditions || '',
        investment_decision: initialResearch.investment_decision || '',
        confidence_score: initialResearch.confidence_score ? String(initialResearch.confidence_score) : '',
        research_date:
          initialResearch.research_date || new Date().toISOString().split('T')[0],
        notes: initialResearch.notes || '',
      });
    }
  }, [initialResearch]);

  const handleChange = useCallback((field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleBlur = useCallback((field: keyof FormData) => {
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    const timer = setTimeout(() => {
      saveResearch(true);
    }, 2000);
    setAutoSaveTimer(timer);
  }, [autoSaveTimer]);

  const saveResearch = async (isAutoSave = false) => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      const savedResearch = await upsertResearch(stockId, {
        stock_id: stockId,
        status: formData.status,
        bull_thesis: formData.bull_thesis || null,
        base_case: formData.base_case || null,
        bear_case: formData.bear_case || null,
        break_conditions: formData.break_conditions || null,
        investment_decision: (formData.investment_decision || null) as InvestmentDecision | null,
        confidence_score: formData.confidence_score ? parseInt(formData.confidence_score) : null,
        research_date: formData.research_date || new Date().toISOString().split('T')[0],
        notes: formData.notes || null,
      });

      if (savedResearch) {
        setLastSaved(new Date());
        onSave(savedResearch);
      }
    } catch (err) {
      console.error('Save failed:', err);
      if (!isAutoSave) alert('Failed to save research. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveResearch(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Research Template</h2>
        <div className="flex items-center gap-3">
          {lastSaved && (
            <span className="text-xs text-muted">
              {isSaving ? 'Saving...' : `Saved ${lastSaved.toLocaleTimeString()}`}
            </span>
          )}
          <select
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value as FormData['status'])}
            onBlur={() => handleBlur('status')}
            className="px-2 py-1 text-sm rounded-md border border-app bg-card text-foreground"
          >
            <option value="not_researched">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
            Bull Thesis
          </label>
          <textarea
            value={formData.bull_thesis}
            onChange={(e) => handleChange('bull_thesis', e.target.value)}
            onBlur={() => handleBlur('bull_thesis')}
            rows={4}
            className="w-full px-3 py-2 text-sm rounded-md border border-app bg-card text-foreground placeholder-muted focus:outline-none focus:border-primary resize-y"
            placeholder="Why this is a great investment. Moat, management, market opportunity..."
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
            Base Case
          </label>
          <textarea
            value={formData.base_case}
            onChange={(e) => handleChange('base_case', e.target.value)}
            onBlur={() => handleBlur('base_case')}
            rows={3}
            className="w-full px-3 py-2 text-sm rounded-md border border-app bg-card text-foreground placeholder-muted focus:outline-none focus:border-primary resize-y"
            placeholder="Most likely scenario. Expected growth, valuation, assumptions..."
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
            Bear Case
          </label>
          <textarea
            value={formData.bear_case}
            onChange={(e) => handleChange('bear_case', e.target.value)}
            onBlur={() => handleBlur('bear_case')}
            rows={3}
            className="w-full px-3 py-2 text-sm rounded-md border border-app bg-card text-foreground placeholder-muted focus:outline-none focus:border-primary resize-y"
            placeholder="What could go wrong. Competition, regulation, execution risk..."
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
            Break Conditions
          </label>
          <textarea
            value={formData.break_conditions}
            onChange={(e) => handleChange('break_conditions', e.target.value)}
            onBlur={() => handleBlur('break_conditions')}
            rows={3}
            className="w-full px-3 py-2 text-sm rounded-md border border-app bg-card text-foreground placeholder-muted focus:outline-none focus:border-primary resize-y"
            placeholder="When to sell/exit. Specific triggers to exit the position..."
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
            Investment Decision
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {decisionOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  handleChange(
                    'investment_decision',
                    formData.investment_decision === opt.value ? '' : opt.value
                  )
                }
                className={`px-2 py-1.5 text-sm rounded-md border transition-colors ${formData.investment_decision === opt.value
                    ? opt.value === 'buy'
                      ? 'bg-success/15 border-success text-success'
                      : opt.value === 'watchlist'
                        ? 'bg-warning/15 border-warning text-warning'
                        : 'bg-danger/15 border-danger text-danger'
                    : 'border-app bg-card text-muted hover:text-foreground'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
            Confidence
          </label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() =>
                  handleChange(
                    'confidence_score',
                    formData.confidence_score === String(n) ? '' : String(n)
                  )
                }
                className="text-2xl leading-none transition-colors"
                aria-label={`Set confidence to ${n}`}
              >
                <span
                  className={
                    formData.confidence_score && parseInt(formData.confidence_score) >= n
                      ? 'text-warning'
                      : 'text-muted/30 hover:text-muted'
                  }
                >
                  ★
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
            Research Date
          </label>
          <input
            type="date"
            value={formData.research_date}
            onChange={(e) => handleChange('research_date', e.target.value)}
            onBlur={() => handleBlur('research_date')}
            className="w-full px-3 py-2 text-sm rounded-md border border-app bg-card text-foreground focus:outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
            Auto-save
          </label>
          <p className="text-xs text-muted py-2">Changes save automatically after 2s of inactivity</p>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
          Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          onBlur={() => handleBlur('notes')}
          rows={3}
          className="w-full px-3 py-2 text-sm rounded-md border border-app bg-card text-foreground placeholder-muted focus:outline-none focus:border-primary resize-y"
          placeholder="Any other observations, source links, follow-up items..."
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-3 border-t border-app">
        <button
          type="button"
          onClick={() => setFormData(initialFormData)}
          className="px-3 py-1.5 text-sm text-muted hover:text-foreground"
        >
          Clear form
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="px-4 py-1.5 text-sm rounded-md bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save research'}
        </button>
      </div>
    </form>
  );
}