'use client';

import { RedFlag } from '@/lib/types';
import { getSeverityColor } from '@/lib/utils';

interface RedFlagBadgeProps {
  flags: RedFlag[];
  compact?: boolean;
}

export default function RedFlagBadge({ flags, compact = false }: RedFlagBadgeProps) {
  if (flags.length === 0) return null;

  const highFlags = flags.filter((f) => f.severity === 'high').length;
  const mediumFlags = flags.filter((f) => f.severity === 'medium').length;
  const lowFlags = flags.filter((f) => f.severity === 'low').length;

  if (compact) {
    return (
      <div className="flex items-center gap-1 flex-wrap">
        {highFlags > 0 && (
          <span
            className={`px-1.5 py-0.5 text-xs font-medium rounded ${getSeverityColor('high')}`}
            title={`${highFlags} high severity flag(s)`}
          >
            🚩 {highFlags}
          </span>
        )}
        {mediumFlags > 0 && (
          <span
            className={`px-1.5 py-0.5 text-xs font-medium rounded ${getSeverityColor('medium')}`}
            title={`${mediumFlags} medium severity flag(s)`}
          >
            🟡 {mediumFlags}
          </span>
        )}
        {lowFlags > 0 && (
          <span
            className={`px-1.5 py-0.5 text-xs font-medium rounded ${getSeverityColor('low')}`}
            title={`${lowFlags} low severity flag(s)`}
          >
            🔵 {lowFlags}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {flags.map((flag) => (
        <div
          key={flag.flag_type}
          className={`flex items-start gap-2.5 p-2.5 rounded-md border ${getSeverityColor(flag.severity)}`}
        >
          <span className="text-base flex-shrink-0 mt-0.5">
            {flag.severity === 'high' ? '🚩' : flag.severity === 'medium' ? '🟡' : '🔵'}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide">
              {flag.flag_type.replace(/_/g, ' ')}
            </p>
            <p className="text-sm mt-0.5 opacity-90">{flag.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}