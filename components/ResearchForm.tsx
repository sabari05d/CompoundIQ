'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { StockResearch, InvestmentDecision } from '@/lib/types';
import { getDecisionColor } from '@/lib/utils';

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
        research_date: initialResearch.research_date || new Date().toISOString().split('T')[0],
        notes: initialResearch.notes || '',
      });
    }
  }, [initialResearch]);

  const handleChange = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
      const payload = {
        stock_id: stockId,
        status: formData.status,
        bull_thesis: formData.bull_thesis || null,
        base_case: formData.base_case || null,
        bear_case: formData.bear_case || null,
        break_conditions: formData.break_conditions || null,
        investment_decision: formData.investment_decision || null,
        confidence_score: formData.confidence_score ? parseInt(formData.confidence_score) : null,
        research_date: formData.research_date || new Date().toISOString().split('T')[0],
        notes: formData.notes || null,
      };

      const { data, error } = await supabase
        .from('stock_research')
        .upsert(payload, { onConflict: 'stock_id' })
        .select()
        .single();

      if (error) throw error;

      const savedResearch = data as StockResearch;
      setLastSaved(new Date());
      onSave(savedResearch);
      
      if (!isAutoSave) {
        alert('Research saved successfully!');
      }
    } catch (err) {
      console.error('Save failed:', err);
      if (!isAutoSave) {
        alert('Failed to save research. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveResearch(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Research Template</h2>
        <div className="flex items-center gap-3">
          {lastSaved && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Auto-saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
          <select
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value as FormData['status'])}
            onBlur={() => handleBlur('status')}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="not_researched">Not Researched</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Bull Thesis <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.bull_thesis}
            onChange={(e) => handleChange('bull_thesis', e.target.value)}
            onBlur={() => handleBlur('bull_thesis')}
            rows={4}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
            placeholder="Why is this a great investment? Key drivers, moat, management quality, market opportunity..."
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Base Case
          </label>
          <textarea
            value={formData.base_case}
            onChange={(e) => handleChange('base_case', e.target.value)}
            onBlur={() => handleBlur('base_case')}
            rows={3}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
            placeholder="Most likely scenario. Expected revenue/profit growth, valuation trajectory, key assumptions..."
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Bear Case
          </label>
          <textarea
            value={formData.bear_case}
            onChange={(e) => handleChange('bear_case', e.target.value)}
            onBlur={() => handleBlur('bear_case')}
            rows={3}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
            placeholder="What could go wrong? Competition, regulation, execution risk, margin compression, macro risks..."
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Break Conditions (When to Sell/Exit)
          </label>
          <textarea
            value={formData.break_conditions}
            onChange={(e) => handleChange('break_conditions', e.target.value)}
            onBlur={() => handleBlur('break_conditions')}
            rows={3}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
            placeholder="Specific triggers to exit: fundamentals deteriorate, thesis broken, better opportunity, valuation extreme..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Investment Decision
          </label>
          <select
            value={formData.investment_decision}
            onChange={(e) => handleChange('investment_decision', e.target.value)}
            onBlur={() => handleBlur('investment_decision')}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select decision</option>
            {decisionOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Confidence Score (1-5)
          </label>
          <select
            value={formData.confidence_score}
            onChange={(e) => handleChange('confidence_score', e.target.value)}
            onBlur={() => handleBlur('confidence_score')}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select score</option>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={String(n)}>{n} - {'★'.repeat(n)}{'☆'.repeat(5 - n)}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Research Date
          </label>
          <input
            type="date"
            value={formData.research_date}
            onChange={(e) => handleChange('research_date', e.target.value)}
            onBlur={() => handleBlur('research_date')}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Additional Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          onBlur={() => handleBlur('notes')}
          rows={3}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
          placeholder="Any other observations, source links, follow-up items..."
        />
      </div>

      <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={() => setFormData(initialFormData)}
          className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          Clear Form
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSaving ? 'Saving...' : 'Save Research'}
        </button>
      </div>
    </form>
  );
}