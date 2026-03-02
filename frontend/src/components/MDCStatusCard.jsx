import { getStatusColors, colors } from '../styles/tokens';

/**
 * MDCStatusCard - detailed status card for the Edge MDC
 * 
 * @param {object} props
 * @param {string} props.status - 'online' | 'offline'
 * @param {string} props.lastSync - Last sync timestamp
 * @param {number} [props.uptime] - Uptime percentage (0-100)
 * @param {string} [props.lastError] - Last error message
 * @param {string} [props.version] - Firmware/software version
 */
export default function MDCStatusCard({ 
  status, 
  lastSync, 
  uptime = null,
  lastError = null,
  version = null 
}) {
  const isOnline = status === 'online';
  const statusColors = getStatusColors(isOnline ? 'ok' : 'critical');

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const formatRelativeTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-5">
      {/* Header with Large Status Indicator */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Edge MDC</h3>
        <div className="flex items-center gap-3">
          <span 
            className={`
              w-6 h-6 rounded-full ${statusColors.bg}
              ${isOnline ? 'animate-pulse' : ''}
              shadow-lg
            `}
            style={{ 
              boxShadow: isOnline 
                ? `0 0 12px ${statusColors.hex}` 
                : 'none' 
            }}
          />
          <span className={`text-xl font-bold uppercase ${statusColors.text}`}>
            {status}
          </span>
        </div>
      </div>

      {/* Status Subsections */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Last Sync */}
        <div className="bg-slate-700/50 rounded-lg p-3">
          <div className="text-xs text-slate-400 mb-1">Last Sync</div>
          <div className="text-sm font-medium text-white">
            {formatRelativeTime(lastSync)}
          </div>
          <div className="text-xs text-slate-500">
            {formatDate(lastSync)}
          </div>
        </div>

        {/* Uptime */}
        {uptime !== null && (
          <div className="bg-slate-700/50 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-1">Uptime</div>
            <div className={`text-sm font-medium ${uptime > 95 ? colors.status.ok.text : uptime > 80 ? colors.status.warning.text : colors.status.critical.text}`}>
              {uptime.toFixed(1)}%
            </div>
            <div className="text-xs text-slate-500">Last 24 hours</div>
          </div>
        )}

        {/* Version */}
        {version && (
          <div className="bg-slate-700/50 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-1">Version</div>
            <div className="text-sm font-medium text-white">{version}</div>
          </div>
        )}
      </div>

      {/* Last Error */}
      {lastError && (
        <div className={`p-3 ${colors.status.critical.bgSubtle} border ${colors.status.critical.borderSubtle} rounded-lg mb-4`}>
          <div className="text-xs text-slate-400 mb-1">Last Error</div>
          <p className={`text-sm ${colors.status.critical.text}`}>{lastError}</p>
        </div>
      )}

      {/* Edge Processing Banner */}
      <div className={`p-3 ${colors.status.ok.bgSubtle} border ${colors.status.ok.borderSubtle} rounded-lg`}>
        <p className={`${colors.status.ok.text} text-sm font-medium flex items-center gap-2`}>
          <span>✓</span>
          <span>Edge processing active — no internet required</span>
        </p>
      </div>
    </div>
  );
}
