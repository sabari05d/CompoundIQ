import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface ChartPoint {
  date: string;
  close: number;
  high: number;
  low: number;
  volume: number;
}

const RANGE_MAP: Record<string, { range: string; interval: string }> = {
  '1M': { range: '1mo', interval: '1d' },
  '3M': { range: '3mo', interval: '1d' },
  '6M': { range: '6mo', interval: '1d' },
  '1Y': { range: '1y', interval: '1d' },
  '3Y': { range: '3y', interval: '1wk' },
  '5Y': { range: '5y', interval: '1wk' },
  '10Y': { range: '10y', interval: '1mo' },
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const timeframe = searchParams.get('timeframe') || '1Y';

    if (!id || isNaN(parseInt(id, 10))) {
      return NextResponse.json({ error: 'Invalid stock ID' }, { status: 400 });
    }

    const { data: stock, error: stockError } = await supabase
      .from('stocks')
      .select('id, name, ticker')
      .eq('id', id)
      .single();

    if (stockError || !stock) {
      return NextResponse.json({ error: 'Stock not found' }, { status: 404 });
    }

    if (!stock.ticker) {
      return NextResponse.json({
        stock: { id: stock.id, name: stock.name, ticker: null },
        data: [],
        message: 'No ticker available.',
      });
    }

    const config = RANGE_MAP[timeframe] || RANGE_MAP['1Y'];
    const ticker = stock.ticker.endsWith('.NS') ? stock.ticker : `${stock.ticker}.NS`;
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
      ticker
    )}?range=${config.range}&interval=${config.interval}`;

    let data: ChartPoint[] = [];
    try {
      const response = await fetch(yahooUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        next: { revalidate: 1800 }, // cache 30 mins
      });
      if (response.ok) {
        const json = await response.json();
        const result = json.chart?.result?.[0];
        if (result) {
          const timestamps: number[] = result.timestamp || [];
          const closes: number[] = result.indicators?.quote?.[0]?.close || [];
          const highs: number[] = result.indicators?.quote?.[0]?.high || [];
          const lows: number[] = result.indicators?.quote?.[0]?.low || [];
          const volumes: number[] = result.indicators?.quote?.[0]?.volume || [];

          for (let i = 0; i < timestamps.length; i++) {
            if (closes[i] == null) continue;
            const date = new Date(timestamps[i] * 1000);
            data.push({
              date: date.toISOString().split('T')[0],
              close: parseFloat(closes[i].toFixed(2)),
              high: parseFloat((highs[i] || closes[i]).toFixed(2)),
              low: parseFloat((lows[i] || closes[i]).toFixed(2)),
              volume: volumes[i] || 0,
            });
          }
        }
      }
    } catch (err) {
      // Yahoo fetch failed
    }

    return NextResponse.json({
      stock: { id: stock.id, name: stock.name, ticker: stock.ticker },
      timeframe,
      data,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}