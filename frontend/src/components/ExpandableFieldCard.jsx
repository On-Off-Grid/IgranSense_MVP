import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from './shared';
import FieldSchematic from './FieldSchematic';
import { getStatusColors } from '../styles/tokens';

/**
 * Moisture progress bar with optimal zone indicator
 */
function MoistureProgressBar({ value }) {
  const getColor = (val) => {
    if (val < 20) return '#ef4444';
    if (val < 35) return '#f97316';
    if (val <= 65) return '#22c55e';
    if (val <= 80) return '#f97316';
    return '#ef4444';
  };

  const clampedValue = Math.min(100, Math.max(0, value || 0));

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-slate-700 rounded-full relative overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-300"
          style={{ 
            width: `${clampedValue}%`,
            backgroundColor: getColor(value)
          }} 
        />
        {/* Optimal zone indicator */}
        <div 
          className="absolute top-[-2px] h-[12px] border border-dashed border-green-500 rounded-sm opacity-50"
          style={{ left: '35%', width: '30%' }} 
        />
      </div>
      <span className="text-sm font-semibold text-white min-w-[50px] text-right">
        {value?.toFixed(1)}%
      </span>
    </div>
  );
}

/**
 * Expandable field card showing summary and 2D schematic
 * @param {Object} props
 * @param {Object} props.field - Field data object
 * @param {number} props.alertCount - Number of active alerts for this field
 */
export default function ExpandableFieldCard({ field, alertCount = 0 }) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  
  const statusKey = field.status || 'ok';
  const statusColors = getStatusColors(statusKey);
  
  const handleSensorClick = (sensor) => {
    console.log('Sensor clicked:', sensor);
    // Could open a modal or navigate to sensor detail
  };
  
  const goToDetail = (e) => {
    e.stopPropagation();
    navigate(`/field/${field.id}`);
  };

  return (
    <div 
      className="bg-slate-800 border-2 rounded-xl overflow-hidden transition-all duration-200 hover:shadow-lg"
      style={{ borderColor: statusColors.hex }}
    >
      {/* Collapsed header - always visible */}
      <div 
        className="flex justify-between items-center px-5 py-4 cursor-pointer bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <span 
            className={`text-slate-400 text-xs transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
          >
            ▶
          </span>
          <h3 className="text-white font-semibold text-base m-0">{field.name}</h3>
          <StatusBadge status={field.status} />
          {alertCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
              {alertCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col gap-1 min-w-[140px]">
            <span className="text-[11px] text-slate-500 uppercase">Moisture</span>
            <MoistureProgressBar value={field.soil_moisture_pct} />
          </div>
          <div className="flex flex-col items-center gap-1 min-w-[60px]">
            <span className="text-[11px] text-slate-500 uppercase">NDVI</span>
            <span className="text-lg font-bold text-white">
              {field.ndvi?.toFixed(2) || '—'}
            </span>
          </div>
          <button 
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            onClick={goToDetail}
          >
            Details →
          </button>
        </div>
      </div>
      
      {/* Expanded content */}
      {expanded && (
        <div className="p-5 border-t border-slate-700">
          <div className="flex gap-6 items-start">
            <FieldSchematic 
              field={field}
              sensors={field.sensors || []}
              onSensorClick={handleSensorClick}
            />
            <div className="flex-1 flex flex-col gap-3">
              <p className="text-slate-300 text-sm m-0">
                <span className="text-slate-500">Area:</span> {field.area_ha} ha
              </p>
              <p className="text-slate-300 text-sm m-0">
                <span className="text-slate-500">Grid:</span> {field.grid_rows} × {field.grid_cols}
              </p>
              <p className="text-slate-300 text-sm m-0">
                <span className="text-slate-500">Sensors:</span> {field.sensors?.length || 0} deployed
              </p>
              {field.recommendation && (
                <div className="bg-amber-900/30 border-l-4 border-amber-500 px-3 py-2 rounded-r text-sm">
                  <span className="text-amber-400 font-medium">Recommendation:</span>
                  <span className="text-slate-300 ml-2">{field.recommendation}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Sensor legend */}
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-slate-700 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-500" /> Soil Moisture
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500" /> Temperature
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-purple-500" /> Humidity
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Online
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Battery Low
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Offline
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
