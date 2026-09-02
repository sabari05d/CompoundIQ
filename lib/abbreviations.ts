export interface Abbreviation {
  short: string;
  full: string;
  definition: string;
  example?: string;
  goodRange?: string;
  category: 'valuation' | 'performance' | 'quarterly' | 'general';
}

export const ABBREVIATIONS: Record<string, Abbreviation> = {
  CMP: {
    short: 'CMP',
    full: 'Current Market Price',
    definition: 'The latest trading price of the stock in the market.',
    example: 'CMP of ₹201 means you pay ₹201 to buy one share.',
    category: 'valuation',
  },
  PE: {
    short: 'P/E',
    full: 'Price-to-Earnings Ratio',
    definition: 'How many years of current earnings you are paying for the stock.',
    example: 'P/E of 20x means investors pay ₹20 for every ₹1 of annual profit.',
    goodRange: 'Generally 15-25 is reasonable; >30 may be expensive, <10 may be cheap.',
    category: 'valuation',
  },
  ROCE: {
    short: 'ROCE',
    full: 'Return on Capital Employed',
    definition: 'How efficiently a company generates profit from its capital.',
    example: 'ROCE 20% means every ₹100 of capital employed produces ₹20 of profit annually.',
    goodRange: 'Higher is better. >15% is good, >20% is excellent.',
    category: 'performance',
  },
  ROE: {
    short: 'ROE',
    full: 'Return on Equity',
    definition: 'Net income returned as a percentage of shareholder equity.',
    example: 'ROE 18% means the company generates ₹0.18 profit for every ₹1 of equity.',
    goodRange: '>15% is good, >20% is excellent.',
    category: 'performance',
  },
  MKT_CAP: {
    short: 'Market Cap',
    full: 'Market Capitalization',
    definition: 'Total market value of a company\'s outstanding shares.',
    example: 'Market cap of ₹10,000 Cr means the company is worth ₹10,000 crore at current prices.',
    goodRange: 'Large cap (>₹20,000 Cr) is generally safer than small cap (<₹5,000 Cr).',
    category: 'valuation',
  },
  DIV_YIELD: {
    short: 'Div Yield',
    full: 'Dividend Yield',
    definition: 'Annual dividend as a percentage of the stock price.',
    example: 'Div yield 2% on CMP ₹100 means you receive ₹2 per share annually.',
    category: 'valuation',
  },
  NP_QTR: {
    short: 'NP (Qtr)',
    full: 'Net Profit for the Quarter',
    definition: 'Profit earned by the company in the most recent quarter after all expenses and taxes.',
    category: 'quarterly',
  },
  QTR_PROFIT_VAR: {
    short: 'Qtr Profit Var',
    full: 'Quarterly Profit Variation',
    definition: 'Percentage change in quarterly profit compared to the same quarter last year.',
    example: 'Qtr profit var +20% means profit grew 20% YoY for the quarter.',
    goodRange: 'Positive is good. Avoid stocks with multiple quarters of decline.',
    category: 'quarterly',
  },
  SALES_QTR: {
    short: 'Sales (Qtr)',
    full: 'Quarterly Revenue/Sales',
    definition: 'Total revenue earned by the company in the most recent quarter.',
    category: 'quarterly',
  },
  QTR_SALES_VAR: {
    short: 'Qtr Sales Var',
    full: 'Quarterly Sales Variation',
    definition: 'Percentage change in quarterly sales compared to the same quarter last year.',
    goodRange: 'Positive is good. Indicates business growth.',
    category: 'quarterly',
  },
  SALES_VAR_3Y: {
    short: 'Sales 3Y',
    full: '3-Year Sales Growth (CAGR)',
    definition: 'Compound annual growth rate of sales over the last 3 years.',
    example: 'Sales 3Y of 15% means sales grew at 15% per year on average.',
    goodRange: '>15% is good. >20% is excellent.',
    category: 'performance',
  },
  PROFIT_VAR_3Y: {
    short: 'Profit 3Y',
    full: '3-Year Profit Growth (CAGR)',
    definition: 'Compound annual growth rate of profit over the last 3 years.',
    goodRange: '>15% is good. >25% is excellent. Watch for consistent growth.',
    category: 'performance',
  },
  PEG: {
    short: 'PEG',
    full: 'Price/Earnings to Growth Ratio',
    definition: 'P/E ratio divided by earnings growth rate. Used to value growth stocks.',
    example: 'PEG 1.0 means the P/E equals the growth rate (fairly valued for growth).',
    goodRange: '<1 is potentially undervalued, >2 may be overvalued.',
    category: 'valuation',
  },
  CAGR: {
    short: 'CAGR',
    full: 'Compound Annual Growth Rate',
    definition: 'Mean annual growth rate over a specified period longer than one year.',
    example: 'Sales grew from ₹100 to ₹200 in 5 years = CAGR of ~14.9%.',
    category: 'general',
  },
  EPS: {
    short: 'EPS',
    full: 'Earnings Per Share',
    definition: 'Net profit divided by number of outstanding shares.',
    example: 'EPS of ₹10 means each share represents ₹10 of profit.',
    category: 'valuation',
  },
  TAM: {
    short: 'TAM',
    full: 'Total Addressable Market',
    definition: 'Total revenue opportunity available for a product or service.',
    category: 'general',
  },
  EBITDA: {
    short: 'EBITDA',
    full: 'Earnings Before Interest, Taxes, Depreciation & Amortization',
    definition: 'A measure of operating profitability before non-operating expenses.',
    category: 'performance',
  },
};

export function getAbbreviation(key: string): Abbreviation | null {
  return ABBREVIATIONS[key] || null;
}