import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Stock, StockResearch, RedFlag } from '@/lib/types';
import { calculatePriorityScore, detectRedFlags } from '@/lib/utils';
import StockDetailClient from './StockDetailClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const { data: stock } = await supabase
    .from('stocks')
    .select('name, ticker')
    .eq('id', id)
    .single();

  return {
    title: stock ? `${stock.name} (${stock.ticker || 'N/A'})` : 'Stock Detail',
    description: stock ? `Research and analysis for ${stock.name}` : 'Stock detail',
  };
}

async function getStockData(id: string) {
  const [stockRes, researchRes, flagsRes, watchRes] = await Promise.all([
    supabase.from('stocks').select('*').eq('id', id).single(),
    supabase.from('stock_research').select('*').eq('stock_id', id).maybeSingle(),
    supabase.from('red_flags').select('*').eq('stock_id', id),
    supabase.from('watchlist').select('*').eq('stock_id', id).maybeSingle(),
  ]);

  if (stockRes.error || !stockRes.data) {
    return { stock: null, research: null, redFlags: [], inWatchlist: false, watchlistId: null };
  }

  return {
    stock: stockRes.data as Stock,
    research: (researchRes.data as StockResearch) || null,
    redFlags: (flagsRes.data || []) as RedFlag[],
    inWatchlist: !!watchRes.data,
    watchlistId: watchRes.data?.id || null,
  };
}

export default async function StockDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { stock, research, redFlags, inWatchlist } = await getStockData(id);

  if (!stock) {
    notFound();
  }

  const autoFlags = detectRedFlags(stock);
  const allFlags = [...redFlags, ...autoFlags];
  const priorityScore = calculatePriorityScore(stock);

  return (
    <StockDetailClient
      initialStock={stock}
      initialResearch={research}
      initialRedFlags={allFlags}
      priorityScore={priorityScore}
      initialInWatchlist={inWatchlist}
    />
  );
}