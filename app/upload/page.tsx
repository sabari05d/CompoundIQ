'use client';

import { useState, useRef, useCallback } from 'react';
import Papa from 'papaparse';
import { supabase } from '@/lib/supabase';
import { mapCSVRowToStock } from '@/lib/utils';
import { CSVRow, Stock, UploadProgress } from '@/lib/types';

type StockInsert = Omit<Stock, 'id' | 'created_at'>;

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
  const abortRef = useRef<AbortController | null>(null);

  const checkExistingStocks = useCallback(async (): Promise<Set<number>> => {
    const { data, error } = await supabase
      .from('stocks')
      .select('s_no');
    
    if (error) throw error;
    return new Set(data?.map(s => s.s_no) || []);
  }, []);

  const uploadStocks = async (stocks: StockInsert[]) => {
    abortRef.current = new AbortController();
    const existingSnos = await checkExistingStocks();
    const newStocks = stocks.filter(s => !existingSnos.has(s.s_no));
    
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
        setProgress((prev: UploadProgress) => ({
          ...prev,
          processed: prev.processed + batch.length,
          errors: prev.errors + batch.length,
        }));
      } else {
        setProgress((prev: UploadProgress) => ({
          ...prev,
          processed: prev.processed + batch.length,
          successful: prev.successful + batch.length,
          current_stock: batch[batch.length - 1].name,
        }));
      }
    }

    const duplicates = stocks.length - newStocks.length;
    setProgress((prev: UploadProgress) => ({
      ...prev,
      is_complete: true,
      current_stock: '',
    }));

    if (duplicates > 0) {
      setError(`Upload complete! ${duplicates} duplicate(s) skipped (already in database).`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a CSV file first');
      return;
    }

    if (!file.name.endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const text = await file.text();
      const result = Papa.parse<CSVRow>(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => header.trim(),
      });

      if (result.errors.length > 0) {
        console.warn('CSV Parse warnings:', result.errors);
      }

      const stocks = result.data
        .filter((row: CSVRow) => row['S.No'] && row['Name'])
        .map((row: CSVRow) => mapCSVRowToStock(row as unknown as Record<string, string>));

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
    const input = document.getElementById('csv-file') as HTMLInputElement;
    if (input) input.value = '';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Upload Stock Data
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Upload your pre-screened stocks CSV (451 stocks) to populate the database
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          {!progress.is_complete ? (
            <>
              <div className="mb-6">
                <label htmlFor="csv-file" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select CSV File
                </label>
                <input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  disabled={isUploading}
                  className="w-full text-sm text-gray-500 dark:text-gray-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-medium
                    file:bg-indigo-50 file:text-indigo-700
                    hover:file:bg-indigo-100
                    dark:file:bg-indigo-900/30 dark:file:text-indigo-300"
                />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Expected columns: S.No, Name, Ticker, CMP, P/E, Market Cap (Cr), Div Yield (%), 
                  NP Qtr (Cr), Qtr Profit Var (%), Sales Qtr (Cr), Qtr Sales Var (%), ROCE (%), 
                  Sales Var 3Yrs (%), Profit Var 3Yrs (%)
                </p>
              </div>

              {file && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </p>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={handleUpload}
                  disabled={isUploading || !file}
                  className="flex-1 py-3 px-6 bg-indigo-600 text-white font-medium rounded-lg
                    hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors"
                >
                  {isUploading ? 'Uploading...' : 'Upload to Database'}
                </button>
                <button
                  onClick={handleReset}
                  disabled={isUploading}
                  className="px-6 py-3 text-gray-700 dark:text-gray-300 font-medium rounded-lg
                    border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700
                    transition-colors"
                >
                  Reset
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto mb-4 w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Upload Complete!
              </h2>
              <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {progress.successful}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Inserted</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                    {progress.errors}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Errors</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                    {progress.total}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                </div>
              </div>
              <a
                href="/"
                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg
                  hover:bg-indigo-700 transition-colors"
              >
                Go to Dashboard
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          {progress.total > 0 && !progress.is_complete && (
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">
                  Progress: {progress.processed} / {progress.total}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  Current: {progress.current_stock}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(progress.processed / progress.total) * 100}%` }}
                ></div>
              </div>
              {isUploading && (
                <button
                  onClick={handleCancel}
                  className="mt-3 text-sm text-red-600 dark:text-red-400 hover:underline"
                >
                  Cancel Upload
                </button>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Already uploaded? <a href="/" className="text-indigo-600 dark:text-indigo-400 hover:underline">View Dashboard</a></p>
        </div>
      </div>
    </div>
  );
}