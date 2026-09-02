import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface HistoryRecord {
  year: number;
  revenue_cr: number | null;
  profit_cr: number | null;
  roce: number | null;
  yoy_growth: number | null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const years = parseInt(searchParams.get('years') || '5', 10);

    if (!id || isNaN(parseInt(id, 10))) {
      return NextResponse.json({ error: 'Invalid stock ID' }, { status: 400 });
    }

    // Look up stock for ticker
    const { data: stock, error: stockError } = await supabase
      .from('stocks')
      .select('id, name, ticker, cmp, roce, profit_var_3yrs, sales_var_3yrs, np_qtr_cr, sales_qtr_cr')
      .eq('id', id)
      .single();

    if (stockError || !stock) {
      return NextResponse.json({ error: 'Stock not found' }, { status: 404 });
    }

    // If no ticker, we cannot fetch historical data — return graceful empty result
    if (!stock.ticker) {
      return NextResponse.json({
        stock: { id: stock.id, name: stock.name, ticker: null },
        years: years,
        data: [],
        message: 'No ticker available. Add a ticker to fetch historical data.',
      });
    }

    // Try to fetch from Yahoo Finance
    // Yahoo Finance v8 chart API (no auth, free)
    const ticker = stock.ticker.endsWith('.NS') ? stock.ticker : `${stock.ticker}.NS`;
    const range = years <= 1 ? '1y' : years <= 3 ? '3y' : years <= 5 ? '5y' : '10y';
    const interval = years <= 1 ? '1mo' : years <= 3 ? '3mo' : '1y';

    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
      ticker
    )}?range=${range}&interval=${interval}`;

    let yahooData: any = null;
    try {
      const response = await fetch(yahooUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        next: { revalidate: 3600 }, // cache 1 hour
      });
      if (response.ok) {
        yahooData = await response.json();
      }
    } catch (err) {
      // Yahoo fetch failed, will fall back to derived data
    }

    // Derive historical data points from Yahoo's price history (we have prices, not fundamentals)
    // For fundamental history we'd need an additional API — instead, we synthesize
    // a meaningful history using current metrics + reverse-engineered prior years from the
    // 3-year CAGR available in the database.
    const result: HistoryRecord[] = [];

    if (yahooData?.chart?.result?.[0]) {
      const chart = yahooData.chart.result[0];
      const timestamps: number[] = chart.timestamp || [];
      const closes: number[] = chart.indicators?.quote?.[0]?.close || [];
      const highs: number[] = chart.indicators?.quote?.[0]?.high || [];
      const lows: number[] = chart.indicators?.quote?.[0]?.low || [];
      const volumes: number[] = chart.indicators?.quote?.[0]?.volume || [];

      for (let i = 0; i < timestamps.length; i++) {
        if (closes[i] == null) continue;
        const date = new Date(timestamps[i] * 1000);
        const year = date.getFullYear();
        const prev = i > 0 && closes[i - 1] != null ? closes[i - 1] : closes[i];
        const yoy = prev ? ((closes[i] - prev) / prev) * 100 : 0;
        result.push({
          year,
          revenue_cr: null,
          profit_cr: null,
          roce: null,
          yoy_growth: parseFloat(yoy.toFixed(2)),
        });
      }
    }

    // Group by year (last data point per year)
    const byYear = new Map<number, HistoryRecord>();
    result.forEach((r) => byYear.set(r.year, r));

    // Add current metrics as latest year
    const currentYear = new Date().getFullYear();
    if (stock.np_qtr_cr !== null) {
      const annualizedProfit = stock.np_qtr_cr * 4;
      byYear.set(currentYear, {
        year: currentYear,
        revenue_cr: stock.sales_qtr_cr ? stock.sales_qtr_cr * 4 : null,
        profit_cr: annualizedProfit,
        roce: stock.roce,
        yoy_growth: stock.profit_var_3yrs ? stock.profit_var_3yrs / 3 : null,
      });
    }

    // If we have a 3-year CAGR, we can synthesize prior years' estimates
    if (stock.profit_var_3yrs !== null) {
      const cagr3y = stock.profit_var_3yrs / 100;
      const currentProfit = stock.np_qtr_cr ? stock.np_qtr_cr * 4 : 100;
      for (let back = 1; back <= 3; back++) {
        const yr = currentYear - back;
        if (!byYear.has(yr)) {
          const priorProfit = currentProfit / Math.pow(1 + cagr3y, back);
          byYear.set(yr, {
            year: yr,
            revenue_cr: null,
            profit_cr: parseFloat(priorProfit.toFixed(2)),
            roce: null,
            yoy_growth: parseFloat((cagr3y * 100).toFixed(2)),
          });
        }
      }
    }

    const sorted = Array.from(byYear.values()).sort((a, b) => a.year - b.year);
    const lastN = sorted.slice(-Math.min(years, sorted.length));

    return NextResponse.json({
      stock: { id: stock.id, name: stock.name, ticker: stock.ticker },
      years: years,
      data: lastN,
      note: 'Historical revenue/profit figures are estimated from quarterly data and 3-year CAGR. For precise fundamentals, use a paid data source.',
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}