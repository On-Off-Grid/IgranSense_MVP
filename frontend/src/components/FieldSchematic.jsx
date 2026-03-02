import { useState } from 'react';
import SensorIcon from './SensorIcon';
import { getStatusColors } from '../styles/tokens';

/**
 * 2D field schematic with polygon boundary and sensor positions
 * @param {Object} props
 * @param {Object} props.field - Field data with polygon, grid_rows, grid_cols
 * @param {Array} props.sensors - Array of sensor objects with grid positions
 * @param {Function} props.onSensorClick - Callback when sensor is clicked
 */
export default function FieldSchematic({ field, sensors = [], onSensorClick }) {
  const [hoveredSensor, setHoveredSensor] = useState(null);
  
  // SVG dimensions
  const width = 300;
  const height = 200;
  const padding = 20;
  
  // Convert polygon from 0-100 normalized coords to SVG coords
  const polygonPoints = (field.polygon || [[0,0], [100,0], [100,100], [0,100]])
    .map(([x, y]) => {
      const svgX = padding + (x / 100) * (width - 2 * padding);
      const svgY = padding + (y / 100) * (height - 2 * padding);
      return `${svgX},${svgY}`;
    })
    .join(' ');
  
  // Calculate sensor positions based on grid
  const getSensorPosition = (sensor) => {
    const gridWidth = width - 2 * padding;
    const gridHeight = height - 2 * padding;
    const cellWidth = gridWidth / (field.grid_cols || 3);
    const cellHeight = gridHeight / (field.grid_rows || 3);
    
    // Center sensor in its grid cell
    const x = padding + (sensor.grid_col - 0.5) * cellWidth;
    const y = padding + (sensor.grid_row - 0.5) * cellHeight;
    
    return { x, y };
  };
  
  // Map field status to token key
  const statusKey = field.status === 'ok' ? 'ok'
    : field.status === 'warning' ? 'warning'
    : field.status === 'critical' ? 'critical'
    : 'offline';
  const statusColors = getStatusColors(statusKey);
  
  return (
    <div className="field-schematic relative">
      <svg 
        width={width} 
        height={height} 
        viewBox={`0 0 ${width} ${height}`}
        className="bg-slate-800 rounded-lg"
      >
        {/* Field boundary polygon */}
        <polygon
          points={polygonPoints}
          fill={statusColors.hex}
          fillOpacity="0.15"
          stroke={statusColors.hex}
          strokeWidth="2"
        />
        
        {/* Grid lines (subtle) */}
        {Array.from({ length: (field.grid_rows || 3) + 1 }).map((_, i) => {
          const y = padding + (i / (field.grid_rows || 3)) * (height - 2 * padding);
          return (
            <line
              key={`h-${i}`}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="#475569"
              strokeWidth="1"
              strokeDasharray="4,4"
              opacity="0.5"
            />
          );
        })}
        {Array.from({ length: (field.grid_cols || 3) + 1 }).map((_, i) => {
          const x = padding + (i / (field.grid_cols || 3)) * (width - 2 * padding);
          return (
            <line
              key={`v-${i}`}
              x1={x}
              y1={padding}
              x2={x}
              y2={height - padding}
              stroke="#475569"
              strokeWidth="1"
              strokeDasharray="4,4"
              opacity="0.5"
            />
          );
        })}
        
        {/* Sensors */}
        {sensors.map((sensor) => {
          const pos = getSensorPosition(sensor);
          return (
            <g
              key={sensor.sensor_id}
              transform={`translate(${pos.x}, ${pos.y})`}
              onMouseEnter={() => setHoveredSensor(sensor)}
              onMouseLeave={() => setHoveredSensor(null)}
            >
              <SensorIcon
                sensor={sensor}
                size={28}
                onClick={onSensorClick}
              />
            </g>
          );
        })}
      </svg>
      
      {/* Sensor hover tooltip */}
      {hoveredSensor && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10
                        bg-slate-900 text-white px-3 py-2 rounded-lg shadow-lg
                        text-xs whitespace-nowrap border border-slate-700">
          <div className="font-semibold">{hoveredSensor.sensor_id}</div>
          <div className="text-slate-400">Type: {hoveredSensor.type}</div>
          <div className="text-slate-400">Status: {hoveredSensor.status}</div>
          <div className="text-slate-400">
            Position: Row {hoveredSensor.grid_row}, Col {hoveredSensor.grid_col}
          </div>
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 
                          border-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </div>
  );
}
