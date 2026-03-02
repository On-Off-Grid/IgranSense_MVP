import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStatusColors } from '../styles/tokens';

/**
 * SensorHealthBar - GitHub-style segmented bar for sensor status
 * 
 * @param {object} props
 * @param {number} props.total - Total sensors
 * @param {number} props.online - Online sensors
 * @param {number} props.offline - Offline sensors
 * @param {number} props.batteryLow - Battery low sensors
 * @param {number} [props.stale] - Stale/unknown sensors
 */
export default function SensorHealthBar({ 
  total, 
  online, 
  offline, 
  batteryLow, 
  stale = 0 
}) {
  const navigate = useNavigate();
  const [activeTooltip, setActiveTooltip] = useState(null);

  // Calculate percentages
  const getPercent = (count) => total > 0 ? (count / total) * 100 : 0;

  const segments = [
    { 
      key: 'online', 
      count: online, 
      percent: getPercent(online),
      label: 'Online',
      status: 'ok',
    },
    { 
      key: 'battery_low', 
      count: batteryLow, 
      percent: getPercent(batteryLow),
      label: 'Battery Low',
      status: 'warning',
    },
    { 
      key: 'offline', 
      count: offline, 
      percent: getPercent(offline),
      label: 'Offline',
      status: 'critical',
    },
    { 
      key: 'stale', 
      count: stale, 
      percent: getPercent(stale),
      label: 'Stale',
      status: 'offline',
    },
  ].filter(s => s.count > 0);

  const handleSegmentClick = (status) => {
    navigate(`/sensors?status=${status}`);
  };

  return (
    <div className="space-y-2">
      {/* Segmented Bar */}
      <div className="h-3 bg-slate-700 rounded-full overflow-hidden flex">
        {segments.map((segment, index) => {
          const colors = getStatusColors(segment.status);
          return (
            <div
              key={segment.key}
              className={`
                h-full ${colors.bg} cursor-pointer 
                hover:opacity-80 transition-opacity relative
                ${index === 0 ? 'rounded-l-full' : ''}
                ${index === segments.length - 1 ? 'rounded-r-full' : ''}
              `}
              style={{ width: `${segment.percent}%`, minWidth: segment.count > 0 ? '4px' : '0' }}
              onClick={() => handleSegmentClick(segment.key)}
              onMouseEnter={() => setActiveTooltip(segment.key)}
              onMouseLeave={() => setActiveTooltip(null)}
            >
              {/* Tooltip */}
              {activeTooltip === segment.key && (
                <div 
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 
                             bg-slate-900 border border-slate-700 rounded px-2 py-1 
                             text-xs text-white whitespace-nowrap z-10 shadow-lg"
                >
                  {segment.label}: {segment.count} ({segment.percent.toFixed(1)}%)
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        {segments.map(segment => {
          const colors = getStatusColors(segment.status);
          return (
            <button
              key={segment.key}
              onClick={() => handleSegmentClick(segment.key)}
              className="flex items-center gap-1.5 hover:opacity-70 transition-opacity"
            >
              <span className={`w-2.5 h-2.5 rounded-full ${colors.bg}`} />
              <span className="text-slate-400">{segment.label}</span>
              <span className={`font-semibold ${colors.text}`}>{segment.count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
