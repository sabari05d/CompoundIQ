'use client';

import { ReactNode } from 'react';
import { StocksProvider } from './StocksContext';
import { FiltersProvider } from './FiltersContext';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <StocksProvider>
      <FiltersProvider>{children}</FiltersProvider>
    </StocksProvider>
  );
}