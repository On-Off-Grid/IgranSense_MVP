import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getStatusColors } from '../styles/tokens';
import { StatusBadge } from './shared';

/**
 * AlertCard - individual alert with actions
 * 
 * @param {object} props
 * @param {object} props.alert - Alert data
 * @param {function} props.onAcknowledge - Callback when acknowledged
 * @param {function} props.onSnooze - Callback when snoozed
 * @param {function} props.onDismiss - Callback when dismissed
 */
export default function AlertCard({ 
  alert, 
  onAcknowledge, 
  onSnooze, 
  onDismiss 
}) {
  const [expanded, setExpanded] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const colors = getStatusColors(alert.severity);

  const handleAction = async (action, callback) => {
    if (!callback) return;
    setActionLoading(action);
    try {
      await callback(alert);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const fieldName = alert.field_id
    .replace('_', ' ')
    .replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div 
      className={`
        rounded-lg border transition-all
        ${colors.bgSubtle} ${colors.borderSubtle}
        hover:border-slate-500
      `}
    >
      {/* Main Row - always visible */}
      <div 
        className="p-3 flex items-center gap-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Severity Dot */}
        <div className={`w-2.5 h-2.5 rounded-full ${colors.bg} shrink-0`} />
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-medium ${colors.text} truncate`}>
              {fieldName}
            </span>
            <span className="text-xs text-slate-500">
              {formatDate(alert.timestamp)}
            </span>
          </div>
          <p className="text-sm text-slate-300 truncate mt-0.5">
            {alert.message}
          </p>
        </div>

        {/* Expand Icon */}
        <svg 
          className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-3 pb-3 border-t border-slate-700/50 pt-3">
          {/* Full Message */}
          <p className="text-sm text-slate-300 mb-3">{alert.message}</p>
          
          {/* Trigger Values */}
          {alert.trigger_values && Object.keys(alert.trigger_values).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {Object.entries(alert.trigger_values).map(([key, value]) => (
                <span 
                  key={key}
                  className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded"
                >
                  {key}: {typeof value === 'number' ? value.toFixed(2) : value}
                </span>
              ))}
            </div>
          )}

          {/* Actions Row */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* View Field */}
            <Link
              to={`/field/${alert.field_id}`}
              className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded 
                         hover:bg-blue-700 transition-colors min-h-[44px] flex items-center"
              onClick={(e) => e.stopPropagation()}
            >
              View Field →
            </Link>

            {/* Acknowledge */}
            {onAcknowledge && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction('acknowledge', onAcknowledge);
                }}
                disabled={actionLoading === 'acknowledge'}
                className="px-3 py-1.5 text-xs font-medium bg-green-600/20 text-green-400 
                           border border-green-600/30 rounded hover:bg-green-600/30 
                           transition-colors disabled:opacity-50 min-h-[44px] flex items-center gap-1"
              >
                {actionLoading === 'acknowledge' ? '...' : '✓'} Acknowledge
              </button>
            )}

            {/* Snooze */}
            {onSnooze && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction('snooze', onSnooze);
                }}
                disabled={actionLoading === 'snooze'}
                className="px-3 py-1.5 text-xs font-medium bg-orange-600/20 text-orange-400 
                           border border-orange-600/30 rounded hover:bg-orange-600/30 
                           transition-colors disabled:opacity-50 min-h-[44px] flex items-center gap-1"
              >
                {actionLoading === 'snooze' ? '...' : '⏰'} Snooze
              </button>
            )}

            {/* Dismiss */}
            {onDismiss && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction('dismiss', onDismiss);
                }}
                disabled={actionLoading === 'dismiss'}
                className="px-3 py-1.5 text-xs font-medium bg-slate-600/20 text-slate-400 
                           border border-slate-600/30 rounded hover:bg-slate-600/30 
                           transition-colors disabled:opacity-50 min-h-[44px] flex items-center gap-1"
              >
                {actionLoading === 'dismiss' ? '...' : '✕'} Dismiss
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
