export interface Stock {
  id: number;
  s_no: number;
  name: string;
  ticker: string | null;
  cmp: number | null;
  pe: number | null;
  market_cap_cr: number | null;
  div_yield: number | null;
  np_qtr_cr: number | null;
  qtr_profit_var: number | null;
  sales_qtr_cr: number | null;
  qtr_sales_var: number | null;
  roce: number | null;
  sales_var_3yrs: number | null;
  profit_var_3yrs: number | null;
  created_at: string;
}

export interface StockResearch {
  id: number;
  stock_id: number;
  status: ResearchStatus;
  bull_thesis: string | null;
  base_case: string | null;
  bear_case: string | null;
  break_conditions: string | null;
  investment_decision: InvestmentDecision | null;
  confidence_score: number | null;
  research_date: string | null;
  last_updated: string;
  notes: string | null;
}

export interface RedFlag {
  id: number;
  stock_id: number;
  flag_type: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  detected_at: string;
}

export interface WatchlistItem {
  id: number;
  stock_id: number;
  added_at: string;
  notes: string | null;
  stock?: Stock;
  research?: StockResearch;
}

export type ResearchStatus = 'not_researched' | 'in_progress' | 'completed';
export type InvestmentDecision = 'buy' | 'watchlist' | 'pass';

export interface StockWithResearch extends Stock {
  research: StockResearch | null;
  red_flags: RedFlag[];
  watchlist?: WatchlistItem | null;
  priority_score?: number;
}

export interface DashboardFilters {
  pe_min: number | null;
  pe_max: number | null;
  roce_min: number | null;
  roce_max: number | null;
  profit_var_3yrs_min: number | null;
  profit_var_3yrs_max: number | null;
  search: string;
  show_unresearched_only: boolean;
  show_red_flags_only: boolean;
  sort_by: SortOption;
}

export type SortOption = 
  | 'roce_desc'
  | 'profit_growth_desc'
  | 'priority_score_desc'
  | 'pe_asc'
  | 'recently_researched'
  | 's_no_asc';

export interface UploadProgress {
  total: number;
  processed: number;
  successful: number;
  errors: number;
  current_stock: string;
  is_complete: boolean;
  error_message?: string;
}

export interface CSVRow {
  'S.No': string;
  'Name': string;
  'Ticker': string;
  'CMP': string;
  'P/E': string;
  'Market Cap (Cr)': string;
  'Div Yield (%)': string;
  'NP Qtr (Cr)': string;
  'Qtr Profit Var (%)': string;
  'Sales Qtr (Cr)': string;
  'Qtr Sales Var (%)': string;
  'ROCE (%)': string;
  'Sales Var 3Yrs (%)': string;
  'Profit Var 3Yrs (%)': string;
}