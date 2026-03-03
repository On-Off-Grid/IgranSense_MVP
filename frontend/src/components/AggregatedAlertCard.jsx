import { useState } from 'react';
import { getStatusColors } from '../styles/tokens';
import AlertCard from './AlertCard';

/**
 * AggregatedAlertCard – collapsible card that summarises a bucket
 * of similar alerts (same type + severity) and expands to show individuals.
 *
 * @param {{ bucket: { type: string, severity: string, alerts: object[] },
 *           onAcknowledge: Function|null, onSnooze: Function|null, onDismiss: Function|null }} props
 */
export default function AggregatedAlertCard({
  bucket,
  onAcknowledge,
  onSnooze,
  onDismiss,
}) {
  const [expanded, setExpanded] = useState(false);
  const colors = getStatusColors(bucket.severity);
  const count = bucket.alerts.length;

  // Friendly type label
  const typeLabel = bucket.type.replace(/_/g, ' ');

  // If only one alert in the bucket, just render a regular card
  if (count === 1) {
    return (
      <AlertCard
        alert={bucket.alerts[0]}
        onAcknowledge={onAcknowledge}
        onSnooze={onSnooze}
        onDismiss={onDismiss}
      />
    );
  }

  return (
    <div
      data-testid="aggregated-alert-card"
      className={`rounded-lg border transition-all ${colors.bgSubtle} ${colors.borderSubtle} hover:border-slate-500`}
    >
      {/* Summary row */}
      <button
        className="w-full p-3 flex items-center gap-3 text-left"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className={`w-2.5 h-2.5 rounded-full ${colors.bg} shrink-0`} />
        <div className="flex-1 min-w-0">
          <span className={`font-medium ${colors.text}`}>
            {count} fields with {typeLabel}
          </span>
          <p className="text-xs text-slate-400 mt-0.5 truncate">
            {bucket.alerts.map((a) => a.field_id.replace('_', ' ')).join(', ')}
          </p>
        </div>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded: show individual cards */}
      {expanded && (
        <div className="px-3 pb-3 space-y-2 border-t border-slate-700/50 pt-2">
          {bucket.alerts.map((alert, idx) => (
            <AlertCard
              key={`${alert.field_id}-${alert.type}-${idx}`}
              alert={alert}
              onAcknowledge={onAcknowledge}
              onSnooze={onSnooze}
              onDismiss={onDismiss}
            />
          ))}
        </div>
      )}
    </div>
  );
}
