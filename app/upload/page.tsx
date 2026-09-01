'use client';

import { useState, useRef, useCallback, DragEvent } from 'react';
import Link from 'next/link';
import Papa from 'papaparse';
import { supabase } from '@/lib/supabase';
import { mapCSVRowToStock } from '@/lib/utils';
import { CSVRow, Stock, UploadProgress } from '@/lib/types';
import { matchTicker, TICKER_MATCH_CONFIDENCE_THRESHOLD } from '@/lib/ticker-matcher';

type StockInsert = Omit<Stock, 'id' | 'created_at'>;

interface UnmatchedStock {
  s_no: number;
  name: string;
  ticker: string;
}

export default function UploadPage() {
  const [progress, setProgress] = useState<UploadProgress>({
    total: 0,
    processed: 0,
    successful: 0,
    errors: 0,
    current_stock: '',
    is_complete: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [unmatchedStocks, setUnmatchedStocks] = useState<UnmatchedStock[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const checkExistingStocks = useCallback(async (): Promise<Set<number>> => {
    const { data, error } = await supabase.from('stocks').select('s_no');
    if (error) throw error;
    return new Set(data?.map((s) => s.s_no) || []);
  }, []);

  const uploadStocks = async (stocks: StockInsert[]) => {
    abortRef.current = new AbortController();
    const existingSnos = await checkExistingStocks();
    const newStocks = stocks.filter((s) => !existingSnos.has(s.s_no));
    const duplicates = stocks.length - newStocks.length;

    setProgress({
      total: newStocks.length,
      processed: 0,
      successful: 0,
      errors: 0,
      current_stock: '',
      is_complete: false,
    });

    const batchSize = 50;
    for (let i = 0; i < newStocks.length; i += batchSize) {
      if (abortRef.current?.signal.aborted) break;
      const batch = newStocks.slice(i, i + batchSize);
      const { error: batchError } = await supabase.from('stocks').insert(batch);

      if (batchError) {
        setProgress((prev) => ({
          ...prev,
          processed: prev.processed + batch.length,
          errors: prev.errors + batch.length,
        }));
      } else {
        setProgress((prev) => ({
          ...prev,
          processed: prev.processed + batch.length,
          successful: prev.successful + batch.length,
          current_stock: batch[batch.length - 1].name,
        }));
      }
    }

    setProgress((prev) => ({
      ...prev,
      is_complete: true,
      current_stock: '',
    }));

    if (duplicates > 0) {
      setError(`Upload complete! ${duplicates} duplicate(s) skipped (already in database).`);
    }
  };

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const selectedFile = files[0];
    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }
    setFile(selectedFile);
    setError(null);
  }, []);

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a CSV file first');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUnmatchedStocks([]);

    try {
      const text = await file.text();
      const result = Papa.parse<CSVRow>(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h: string) => h.trim(),
      });

      if (result.errors.length > 0) {
        console.warn('CSV parse warnings:', result.errors);
      }

      const unmatched: UnmatchedStock[] = [];
      const stocks: StockInsert[] = result.data
        .filter((row: CSVRow) => row['S.No'] && row['Name'])
        .map((row: CSVRow) => {
          const stock = mapCSVRowToStock(row as unknown as Record<string, string>);

          // Try to match ticker
          const match = matchTicker(stock.name);
          if (match.ticker && match.confidence >= TICKER_MATCH_CONFIDENCE_THRESHOLD) {
            stock.ticker = match.ticker.symbol;
          } else if (!stock.ticker) {
            // Track for manual review
            const sNo = parseInt(row['S.No'] || '0', 10);
            unmatched.push({
              s_no: sNo,
              name: stock.name,
              ticker: '',
            });
          }

          return stock;
        });

      setUnmatchedStocks(unmatched);

      if (stocks.length === 0) {
        setError('No valid stock data found in CSV');
        setIsUploading(false);
        return;
      }

      await uploadStocks(stocks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    abortRef.current?.abort();
    setIsUploading(false);
  };

  const handleReset = () => {
    setFile(null);
    setProgress({
      total: 0,
      processed: 0,
      successful: 0,
      errors: 0,
      current_stock: '',
      is_complete: false,
    });
    setError(null);
    setUnmatchedStocks([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const updateUnmatchedTicker = (sNo: number, ticker: string) => {
    setUnmatchedStocks((prev) =>
      prev.map((s) => (s.s_no === sNo ? { ...s, ticker: ticker.toUpperCase() } : s))
    );
  };

  const saveUnmatchedTickers = async () => {
    const toUpdate = unmatchedStocks.filter((s) => s.ticker.trim() !== '');
    if (toUpdate.length === 0) return;

    try {
      for (const stock of toUpdate) {
        await supabase
          .from('stocks')
          .update({ ticker: stock.ticker })
          .eq('s_no', stock.s_no);
      }
      setUnmatchedStocks((prev) => prev.filter((s) => s.ticker.trim() === ''));
    } catch (err) {
      setError('Failed to update tickers');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Upload CSV</h1>
        <p className="text-sm text-muted mt-1">
          Import your pre-screened stocks into the database.
        </p>
      </div>

      {!progress.is_complete ? (
        <div className="space-y-4">
          {/* Drop zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative rounded-lg border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-app bg-card hover:border-primary/50'
            }`}
          >
            <input
              ref={fileInputRef}
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={(e) => handleFiles(e.target.files)}
              disabled={isUploading}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {file ? file.name : 'Drop your CSV here, or click to browse'}
                </p>
                {file ? (
                  <p className="text-xs text-muted mt-1">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                ) : (
                  <p className="text-xs text-muted mt-1">CSV files only</p>
                )}
              </div>
            </div>
          </div>

          {/* Expected columns */}
          <details className="text-xs text-muted">
            <summary className="cursor-pointer hover:text-foreground">Expected CSV columns</summary>
            <div className="mt-2 p-3 rounded bg-card border border-app font-mono">
              S.No, Name, Ticker, CMP, P/E, Market Cap (Cr), Div Yield (%),
              <br />
              NP Qtr (Cr), Qtr Profit Var (%), Sales Qtr (Cr), Qtr Sales Var (%),
              <br />
              ROCE (%), Sales Var 3Yrs (%), Profit Var 3Yrs (%)
            </div>
          </details>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleUpload}
              disabled={isUploading || !file}
              className="flex-1 px-4 py-2.5 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Uploading...' : 'Upload to Database'}
            </button>
            <button
              onClick={handleReset}
              disabled={isUploading}
              className="px-4 py-2.5 rounded-md border border-app bg-card text-foreground text-sm font-medium hover:bg-card-hover disabled:opacity-50"
            >
              Reset
            </button>
          </div>

          {/* Progress */}
          {progress.total > 0 && (
            <div className="rounded-lg border border-app bg-card p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-foreground">
                  Uploading {progress.processed} / {progress.total}
                </span>
                <span className="text-muted">
                  {Math.round((progress.processed / progress.total) * 100)}%
                </span>
              </div>
              <div className="h-2 bg-background rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${(progress.processed / progress.total) * 100}%` }}
                />
              </div>
              {progress.current_stock && (
                <p className="text-xs text-muted mt-2 truncate">
                  Current: {progress.current_stock}
                </p>
              )}
              {isUploading && (
                <button
                  onClick={handleCancel}
                  className="text-xs text-danger hover:underline mt-2"
                >
                  Cancel
                </button>
              )}
            </div>
          )}

          {error && (
            <div className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Success card */}
          <div className="rounded-lg border border-success/30 bg-success/10 p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-success"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-base font-semibold text-foreground">Upload complete!</h2>
                <p className="text-sm text-muted mt-0.5">
                  Inserted {progress.successful} stocks
                  {progress.errors > 0 && ` · ${progress.errors} errors`}
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-primary hover:underline"
                >
                  View dashboard
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-warning">
              {error}
            </div>
          )}

          {/* Unmatched tickers review */}
          {unmatchedStocks.length > 0 && (
            <div className="rounded-lg border border-app bg-card p-4">
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-foreground">
                  {unmatchedStocks.length} stock(s) need ticker
                </h3>
                <p className="text-xs text-muted mt-1">
                  We couldn't auto-match these. Enter the NSE ticker symbol manually.
                </p>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {unmatchedStocks.map((s) => (
                  <div
                    key={s.s_no}
                    className="flex items-center gap-2 px-2 py-1.5 rounded border border-app"
                  >
                    <span className="text-xs text-muted font-mono w-10">#{s.s_no}</span>
                    <span className="text-sm text-foreground flex-1 truncate">{s.name}</span>
                    <input
                      type="text"
                      value={s.ticker}
                      onChange={(e) => updateUnmatchedTicker(s.s_no, e.target.value)}
                      placeholder="SYMBOL"
                      maxLength={20}
                      className="w-28 px-2 py-1 text-sm font-mono uppercase rounded border border-app bg-background text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={saveUnmatchedTickers}
                  disabled={unmatchedStocks.every((s) => !s.ticker.trim())}
                  className="px-3 py-1.5 text-sm rounded-md bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
                >
                  Save tickers
                </button>
                <button
                  onClick={() => setUnmatchedStocks([])}
                  className="px-3 py-1.5 text-sm rounded-md border border-app bg-card text-foreground hover:bg-card-hover"
                >
                  Skip
                </button>
              </div>
            </div>
          )}

          <button
            onClick={handleReset}
            className="text-sm text-muted hover:text-foreground"
          >
            ← Upload another file
          </button>
        </div>
      )}
    </div>
  );
}