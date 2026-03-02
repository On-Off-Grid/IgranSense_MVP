import { getStatusColors } from '../../styles/tokens';

/**
 * Trend indicator arrow
 */
function TrendArrow({ trend }) {
  if (!trend || trend === 'stable') {
    return <span className="text-slate-400">→</span>;
  }
  if (trend === 'up') {
    return <span className="text-green-400">↑</span>;
  }
  if (trend === 'down') {
    return <span className="text-red-400">↓</span>;
  }
  return null;
}

/**
 * MetricCard - compact card for displaying a single metric with optional trend
 * 
 * @param {object} props
 * @param {string} props.icon - Emoji or icon character
 * @param {string} props.label - Metric label
 * @param {string|number} props.value - Metric value
 * @param {string} [props.unit] - Unit (e.g., '%', '°C')
 * @param {string} [props.trend] - 'up' | 'down' | 'stable'
 * @param {string} [props.status] - 'ok' | 'warning' | 'critical' for value coloring
 * @param {string} [props.subtext] - Additional context below value
 */
export default function MetricCard({ 
  icon, 
  label, 
  value, 
  unit = '', 
  trend, 
  status,
  subtext 
}) {
  const statusColors = status ? getStatusColors(status) : null;
  const valueClass = statusColors ? statusColors.text : 'text-white';

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <span className="text-slate-400 text-sm">{label}</span>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-bold ${valueClass}`}>
          {value}
        </span>
        {unit && <span className="text-slate-400 text-sm">{unit}</span>}
        {trend && (
          <span className="ml-2 text-lg">
            <TrendArrow trend={trend} />
          </span>
        )}
      </div>
      
      {subtext && (
        <span className="text-xs text-slate-500 mt-1">{subtext}</span>
      )}
    </div>
  );
}
