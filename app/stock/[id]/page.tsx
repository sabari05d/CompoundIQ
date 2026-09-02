import { Metadata } from 'next';
import StockDetailClient from './StockDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Stock Detail - Multibagger Hunter`,
    description: `Research and analysis for stock #${id}`,
  };
}

export default function StockDetailPage({ params }: PageProps) {
  return <StockDetailClient />;
}