import { getStatusColors } from '../styles/tokens';

const SENSOR_TYPE_ICONS = {
  soil_moisture: '💧',
  temperature: '🌡️',
  humidity: '💨',
};

const SENSOR_TYPE_COLORS = {
  soil_moisture: '#3b82f6',
  temperature: '#ef4444',
  humidity: '#8b5cf6',
};

/**
 * SVG sensor icon component for field schematic
 * @param {Object} props
 * @param {Object} props.sensor - Sensor data object
 * @param {number} props.size - Icon size in pixels (default: 32)
 * @param {Function} props.onClick - Click handler
 */
export default function SensorIcon({ sensor, size = 32, onClick }) {
  // Map sensor status to our status tokens
  const statusKey = sensor.status === 'online' ? 'ok' 
    : sensor.status === 'battery_low' ? 'warning' 
    : 'critical';
  const statusColors = getStatusColors(statusKey);
  const typeColor = SENSOR_TYPE_COLORS[sensor.type] || '#6b7280';
  
  return (
    <g
      className="sensor-icon"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(sensor);
      }}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {/* Outer status ring */}
      <circle
        r={size / 2}
        fill={statusColors.hex}
        fillOpacity="0.2"
        stroke={statusColors.hex}
        strokeWidth="2"
      />
      {/* Inner type indicator */}
      <circle
        r={size / 2 - 6}
        fill={typeColor}
        fillOpacity="0.8"
      />
      {/* Icon text */}
      <text
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={size * 0.4}
        style={{ pointerEvents: 'none' }}
      >
        {SENSOR_TYPE_ICONS[sensor.type] || '📡'}
      </text>
      {/* SVG tooltip */}
      <title>
        {sensor.sensor_id} ({sensor.type}) - {sensor.status}
      </title>
    </g>
  );
}
