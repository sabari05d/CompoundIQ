'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStocks } from '@/contexts/StocksContext';

interface WatchlistButtonProps {
  stockId: number;
  initialInWatchlist: boolean;
  variant?: 'primary' | 'secondary';
  onUpdate?: (inWatchlist: boolean) => void;
}

export default function WatchlistButton({
  stockId,
  initialInWatchlist,
  variant = 'primary',
  onUpdate,
}: WatchlistButtonProps) {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useStocks();
  const inWatchlist = isInWatchlist(stockId);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const toggle = async () => {
    setLoading(true);
    try {
      if (inWatchlist) {
        await removeFromWatchlist(stockId);
        onUpdate?.(false);
      } else {
        await addToWatchlist(stockId);
        onUpdate?.(true);
      }
      router.refresh();
    } catch (err) {
      console.error('Failed to update watchlist:', err);
      alert('Failed to update watchlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const baseClasses =
    'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const variantClasses = inWatchlist
    ? 'bg-card border border-border text-foreground hover:bg-card-hover'
    : variant === 'primary'
    ? 'bg-primary text-white hover:bg-primary/90'
    : 'bg-card border border-border text-foreground hover:bg-card-hover';

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`${baseClasses} ${variantClasses}`}
      aria-label={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
    >
      {loading ? (
        <span className="inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : inWatchlist ? (
        <>
          <svg
            className="w-4 h-4 text-success"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          In Watchlist
        </>
      ) : (
        <>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          Add to Watchlist
        </>
      )}
    </button>
  );
}