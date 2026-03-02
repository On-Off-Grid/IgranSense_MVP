import { useNavigate } from 'react-router-dom';
import { getStatusColors, cardHoverClasses } from '../styles/tokens';
import { StatusBadge } from './shared';

// Moisture thresholds for the progress bar zones
const MOISTURE_THRESHOLDS = {
  critical: 18,  // Below this = critical
  warning: 25,   // Below this = warning, above = ok
  max: 40,       // Visual max for the bar
};

/**
 * Get the triggered rule name based on status and moisture level
 */
function getTriggeredRule(status, moisturePct) {
  if (status === 'critical') {
    return moisturePct < MOISTURE_THRESHOLDS.critical 
      ? 'Low Moisture Alert' 
      : 'Critical NDVI Alert';
  }
  if (status === 'warning') {
    return moisturePct < MOISTURE_THRESHOLDS.warning 
      ? 'Irrigation Needed' 
      : 'NDVI Trend Alert';
  }
  return null;
}

/**
 * Moisture progress bar with threshold zones
 */
function MoistureProgressBar({ value, status }) {
  const { critical, warning, max } = MOISTURE_THRESHOLDS;
  const percentage = Math.min((value / max) * 100, 100);
  
  // Calculate zone widths as percentages
  const criticalWidth = (critical / max) * 100;
  const warningWidth = ((warning - critical) / max) * 100;
  const okWidth = 100 - criticalWidth - warningWidth;

  const statusColors = getStatusColors(status);

  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs text-slate-500 mb-1">
        <span>Soil Moisture</span>
        <span className={statusColors.text}>{value}%</span>
      </div>
      
      {/* Background zones */}
      <div className="relative h-2 rounded-full overflow-hidden bg-slate-700 flex">
        <div 
          className="h-full bg-red-900/50" 
          style={{ width: `${criticalWidth}%` }}
        />
        <div 
          className="h-full bg-orange-900/50" 
          style={{ width: `${warningWidth}%` }}
        />
        <div 
          className="h-full bg-green-900/50" 
          style={{ width: `${okWidth}%` }}
        />
        
        {/* Value indicator */}
        <div 
          className={`absolute top-0 left-0 h-full rounded-full ${statusColors.bg} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {/* Threshold markers */}
      <div className="relative h-3 mt-0.5">
        <div 
          className="absolute text-[10px] text-slate-500"
          style={{ left: `${criticalWidth}%`, transform: 'translateX(-50%)' }}
        >
          {critical}%
        </div>
        <div 
          className="absolute text-[10px] text-slate-500"
          style={{ left: `${criticalWidth + warningWidth}%`, transform: 'translateX(-50%)' }}
        >
          {warning}%
        </div>
      </div>
    </div>
  );
}

/**
 * FieldCard - displays field status with actionable details
 * 
 * @param {object} props
 * @param {object} props.field - Field data object
 * @param {number} [props.alertCount] - Number of active alerts for this field
 */
export default function FieldCard({ field, alertCount = 0 }) {
  const navigate = useNavigate();
  const triggeredRule = getTriggeredRule(field.status, field.soil_moisture_pct);

  return (
    <div
      onClick={() => navigate(`/field/${field.id}`)}
      className={`${cardHoverClasses} p-4`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-white">{field.name}</h3>
        <div className="flex items-center gap-2">
          {alertCount > 0 && (
            <span 
              className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-500/20 text-red-400 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/alerts?field=${field.id}`);
              }}
              title="View alerts"
            >
              {alertCount} alert{alertCount > 1 ? 's' : ''}
            </span>
          )}
          <StatusBadge status={field.status} variant="dot" size="md" />
        </div>
      </div>
      
      {/* Triggered Rule */}
      {triggeredRule && (
        <div className="text-xs text-slate-500 mb-2">
          Triggered by: <span className="text-slate-400">{triggeredRule}</span>
        </div>
      )}

      {/* Metrics */}
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-400">NDVI</span>
          <span className="text-white">{field.ndvi.toFixed(2)}</span>
        </div>
      </div>

      {/* Moisture Progress Bar */}
      <MoistureProgressBar value={field.soil_moisture_pct} status={field.status} />
      
      {/* Recommendation */}
      <p className="text-xs text-slate-500 mt-3 line-clamp-2">{field.recommendation}</p>
    </div>
  );
}
