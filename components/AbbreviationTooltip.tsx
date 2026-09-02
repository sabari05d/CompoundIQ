'use client';

import { useState, ReactNode } from 'react';
import { getAbbreviation, Abbreviation } from '@/lib/abbreviations';

interface AbbreviationTooltipProps {
  term: string;
  children?: ReactNode;
  className?: string;
  showIcon?: boolean;
}

export default function AbbreviationTooltip({
  term,
  children,
  className = '',
  showIcon = true,
}: AbbreviationTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const info: Abbreviation | null = getAbbreviation(term);

  if (!info) {
    return <span className={className}>{children || term}</span>;
  }

  return (
    <span className={`relative inline-flex items-center gap-1 ${className}`}>
      <span
        className="cursor-help border-b border-dotted border-muted hover:text-primary hover:border-primary transition-colors"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
      >
        {children || info.short}
      </span>
      {showIcon && (
        <span className="text-muted hover:text-primary cursor-help text-xs" title={info.full}>
          ?
        </span>
      )}

      {isOpen && (
        <div
          className="absolute z-50 left-0 top-full mt-1 w-72 rounded-lg border border-app bg-card p-3 shadow-lg text-left"
          role="tooltip"
        >
          <p className="text-xs font-semibold text-primary uppercase tracking-wide">
            {info.full}
          </p>
          <p className="text-sm text-foreground mt-1.5 leading-relaxed">{info.definition}</p>
          {info.example && (
            <p className="text-xs text-muted mt-2 italic">{info.example}</p>
          )}
          {info.goodRange && (
            <p className="text-xs text-success mt-2">
              <span className="font-semibold">Good range:</span> {info.goodRange}
            </p>
          )}
        </div>
      )}
    </span>
  );
}