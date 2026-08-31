import { Stock, RedFlag, StockResearch } from './types';

export function calculatePriorityScore(stock: Stock): number {
  const profitVar3Yrs = stock.profit_var_3yrs || 0;
  const roce = stock.roce || 0;
  const pe = stock.pe || 30;
  const salesVar3Yrs = stock.sales_var_3yrs || 0;

  const profitComponent = Math.max(0, Math.min(1, profitVar3Yrs / 100)) * 0.4;
  const roceComponent = Math.max(0, Math.min(1, roce / 20)) * 0.3;
  const peComponent = Math.max(0, Math.min(1, (30 - pe) / 30)) * 0.2;
  const salesComponent = Math.max(0, Math.min(1, salesVar3Yrs / 100)) * 0.1;

  return Math.round((profitComponent + roceComponent + peComponent + salesComponent) * 100);
}

export function detectRedFlags(stock: Stock): RedFlag[] {
  const flags: RedFlag[] = [];
  const now = new Date().toISOString();

  if (stock.pe && stock.pe > 30) {
    flags.push({
      id: 0,
      stock_id: stock.id,
      flag_type: 'high_valuation',
      severity: 'high',
      description: `P/E ratio of ${stock.pe} exceeds 30x - potentially overvalued`,
      detected_at: now,
    });
  }

  if (stock.roce !== null && stock.roce < 12) {
    flags.push({
      id: 0,
      stock_id: stock.id,
      flag_type: 'low_roce',
      severity: 'high',
      description: `ROCE of ${stock.roce}% is below 12% - low capital efficiency`,
      detected_at: now,
    });
  }

  if (stock.qtr_profit_var !== null && stock.qtr_profit_var < 0) {
    flags.push({
      id: 0,
      stock_id: stock.id,
      flag_type: 'declining_quarterly_profit',
      severity: 'high',
      description: `Quarterly profit declined by ${Math.abs(stock.qtr_profit_var)}%`,
      detected_at: now,
    });
  }

  if (stock.qtr_sales_var !== null && stock.qtr_sales_var < 0) {
    flags.push({
      id: 0,
      stock_id: stock.id,
      flag_type: 'declining_quarterly_sales',
      severity: 'medium',
      description: `Quarterly sales declined by ${Math.abs(stock.qtr_sales_var)}%`,
      detected_at: now,
    });
  }

  if (stock.pe && stock.profit_var_3yrs && stock.pe > 2 * stock.profit_var_3yrs) {
    flags.push({
      id: 0,
      stock_id: stock.id,
      flag_type: 'high_peg_ratio',
      severity: 'medium',
      description: `P/E (${stock.pe}) > 2x Profit Growth 3Y (${stock.profit_var_3yrs}%) - overvalued for growth`,
      detected_at: now,
    });
  }

  if (stock.market_cap_cr !== null && stock.market_cap_cr < 500) {
    flags.push({
      id: 0,
      stock_id: stock.id,
      flag_type: 'small_market_cap',
      severity: 'medium',
      description: `Market cap of ₹${stock.market_cap_cr} Cr is below ₹500 Cr - higher risk`,
      detected_at: now,
    });
  }

  if (stock.sales_var_3yrs !== null && stock.sales_var_3yrs < 15) {
    flags.push({
      id: 0,
      stock_id: stock.id,
      flag_type: 'slow_sales_growth',
      severity: 'low',
      description: `Sales growth of ${stock.sales_var_3yrs}% over 3 years is below 15%`,
      detected_at: now,
    });
  }

  return flags;
}

export function getResearchStatus(research: StockResearch | null): 'not_researched' | 'in_progress' | 'completed' {
  if (!research) return 'not_researched';
  return research.status as 'not_researched' | 'in_progress' | 'completed';
}

export function formatCurrency(value: number | null, decimals = 0): string {
  if (value === null || value === undefined) return 'N/A';
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercentage(value: number | null, decimals = 1): string {
  if (value === null || value === undefined) return 'N/A';
  return `${value.toFixed(decimals)}%`;
}

export function formatNumber(value: number | null): string {
  if (value === null || value === undefined) return 'N/A';
  return new Intl.NumberFormat('en-IN').format(value);
}

export function parseCSVValue(value: string): number | null {
  if (!value || value.trim() === '' || value.trim() === '-') return null;
  const cleaned = value.replace(/,/g, '').replace('%', '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

export function mapCSVRowToStock(row: Record<string, string>): Omit<Stock, 'id' | 'created_at'> {
  return {
    s_no: parseInt(row['S.No'] || row['S.No.'] || '0', 10),
    name: row['Name'] || row['Company Name'] || '',
    ticker: row['Ticker'] || row['Symbol'] || null,
    cmp: parseCSVValue(row['CMP'] || row['Current Price'] || ''),
    pe: parseCSVValue(row['P/E'] || row['PE Ratio'] || ''),
    market_cap_cr: parseCSVValue(row['Market Cap (Cr)'] || row['Market Cap Cr'] || ''),
    div_yield: parseCSVValue(row['Div Yield (%)'] || row['Div Yield'] || ''),
    np_qtr_cr: parseCSVValue(row['NP Qtr (Cr)'] || row['Net Profit Qtr'] || ''),
    qtr_profit_var: parseCSVValue(row['Qtr Profit Var (%)'] || row['Qtr Profit Var'] || ''),
    sales_qtr_cr: parseCSVValue(row['Sales Qtr (Cr)'] || row['Sales Qtr'] || ''),
    qtr_sales_var: parseCSVValue(row['Qtr Sales Var (%)'] || row['Qtr Sales Var'] || ''),
    roce: parseCSVValue(row['ROCE (%)'] || row['ROCE'] || ''),
    sales_var_3yrs: parseCSVValue(row['Sales Var 3Yrs (%)'] || row['Sales Growth 3Y'] || ''),
    profit_var_3yrs: parseCSVValue(row['Profit Var 3Yrs (%)'] || row['Profit Growth 3Y'] || ''),
  };
}

export function getSeverityColor(severity: 'high' | 'medium' | 'low'): string {
  switch (severity) {
    case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
    case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800';
  }
}

export function getStatusColor(status: 'not_researched' | 'in_progress' | 'completed'): string {
  switch (status) {
    case 'not_researched': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
  }
}

export function getDecisionColor(decision: 'buy' | 'watchlist' | 'pass' | null): string {
  switch (decision) {
    case 'buy': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    case 'watchlist': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    case 'pass': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  }
}