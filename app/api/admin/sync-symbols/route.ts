import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { matchTicker, TICKER_MATCH_CONFIDENCE_THRESHOLD, getAllTickers } from '@/lib/ticker-matcher';

export async function POST(req: NextRequest) {
  try {
    // Fetch all stocks from DB
    const { data: stocks, error } = await supabase
      .from('stocks')
      .select('id, s_no, name, ticker')
      .order('s_no', { ascending: true });

    if (error) throw error;
    if (!stocks) {
      return NextResponse.json({ total: 0, matched: 0, unmatched: [] });
    }

    const unmatched: { id: number; s_no: number; name: string }[] = [];
    const updates: { id: number; ticker: string }[] = [];
    let matched = 0;
    let alreadyHadTicker = 0;

    for (const stock of stocks) {
      if (stock.ticker && stock.ticker.trim() !== '') {
        alreadyHadTicker++;
        continue;
      }

      const match = matchTicker(stock.name);
      if (match.ticker && match.confidence >= TICKER_MATCH_CONFIDENCE_THRESHOLD) {
        updates.push({ id: stock.id, ticker: match.ticker.symbol });
        matched++;
      } else {
        unmatched.push({ id: stock.id, s_no: stock.s_no, name: stock.name });
      }
    }

    // Apply updates in batches
    for (const update of updates) {
      await supabase
        .from('stocks')
        .update({ ticker: update.ticker })
        .eq('id', update.id);
    }

    return NextResponse.json({
      total: stocks.length,
      already_had_ticker: alreadyHadTicker,
      newly_matched: matched,
      unmatched_count: unmatched.length,
      unmatched: unmatched.slice(0, 50), // limit response size
      ticker_list_size: getAllTickers().length,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST to this endpoint to sync tickers',
    ticker_list_size: getAllTickers().length,
  });
}