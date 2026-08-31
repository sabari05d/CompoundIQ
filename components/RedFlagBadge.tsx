'use client';

import { RedFlag } from '@/lib/types';
import { getSeverityColor } from '@/lib/utils';

interface RedFlagBadgeProps {
  flags: RedFlag[];
  compact?: boolean;
}

export default function RedFlagBadge({ flags, compact = false }: RedFlagBadgeProps) {
  if (flags.length === 0) return null;

  const highFlags = flags.filter(f => f.severity === 'high').length;
  const mediumFlags = flags.filter(f => f.severity === 'medium').length;
  const lowFlags = flags.filter(f => f.severity === 'low').length;

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        {highFlags > 0 && (
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getSeverityColor('high')}`}>
            🚩 {highFlags} High
          </span>
        )}
        {mediumFlags > 0 && (
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getSeverityColor('medium')}`}>
            🟡 {mediumFlags} Med
          </span>
        )}
        {lowFlags > 0 && (
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getSeverityColor('low')}`}>
            🔵 {lowFlags} Low
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {flags.map((flag) => (
        <div
          key={flag.id}
          className={`flex items-start gap-3 p-3 rounded-lg border ${getSeverityColor(flag.severity)}`}
        >
          <span className="text-lg flex-shrink-0 mt-0.5">
            {flag.severity === 'high' ? '🚩' : flag.severity === 'medium' ? '🟡' : '🔵'}
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">{flag.flag_type.replace(/_/g, ' ')}</p>
            <p className="text-sm mt-0.5 opacity-90">{flag.description}</p>
          </div>
          <span className="text-xs font-medium uppercase tracking-wide flex-shrink-0">
            {flag.severity}
          </span>
        </div>
      ))}
    </div>
  );
}