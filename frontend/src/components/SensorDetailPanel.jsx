import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getSensorDetail } from '../api/client';
import { CHART_CONFIG, SURFACE } from '../styles/tokens';
import StatusBadge from './shared/StatusBadge';
import LoadingSpinner from './shared/LoadingSpinner';

/**
 * Sensor type display config
 */
const SENSOR_TYPES = {
  soil_moisture: { label: 'Soil Moisture', icon: '💧', unit: '%', color: '#3B82F6' },
  temperature: { label: 'Temperature', icon: '🌡️', unit: '°C', color: '#F59E0B' },
  humidity: { label: 'Humidity', icon: '💨', unit: '%', color: '#10B981' },
};

/**
 * SensorDetailPanel - slide-out detail panel for a sensor
 *
 * @param {object} props
 * @param {string} props.sensorId - The sensor ID to display
 * @param {function} props.onClose - Callback to close the panel
 */
export default function SensorDetailPanel({ sensorId, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDetail() {
      try {
        setLoading(true);
        setError(null);
        const data = await getSensorDetail(sensorId);
        setDetail(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [sensorId]);

  if (loading) {
    return (
      <div className={`fixed right-0 top-0 h-full w-96 ${SURFACE.panel} border-l border-slate-700 shadow-xl z-50`}>
        <div className="flex items-center justify-center h-full">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`fixed right-0 top-0 h-full w-96 ${SURFACE.panel} border-l border-slate-700 shadow-xl z-50 p-4`}>
        <PanelHeader onClose={onClose} />
        <div className="mt-6 text-center text-red-400">
          <p>Error loading sensor: {error}</p>
        </div>
      </div>
    );
  }

  const sensor = detail?.sensor;
  const typeConfig = SENSOR_TYPES[sensor?.type] || { label: sensor?.type, icon: '📡', unit: '', color: '#6366F1' };

  // Format readings for chart
  const chartData = (detail?.recent_readings || [])
    .slice()
    .reverse()
    .map((r) => ({
      time: new Date(r.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      value: r.value,
    }));

  return (
    <div className={`fixed right-0 top-0 h-full w-96 ${SURFACE.panel} border-l border-slate-700 shadow-xl z-50 overflow-auto`}>
      <div className="p-4">
        <PanelHeader onClose={onClose} />

        {/* Sensor Info */}
        <div className="mt-4 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center text-2xl">
              {typeConfig.icon}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-white">{sensor.sensor_id}</h2>
              <p className="text-sm text-slate-400">{typeConfig.label}</p>
            </div>
            <StatusBadge status={sensor.status} />
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            <InfoItem label="Field" value={sensor.field_name || sensor.field_id} />
            <InfoItem
              label="Last Seen"
              value={
                sensor.last_seen_at
                  ? new Date(sensor.last_seen_at).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'N/A'
              }
            />
            <InfoItem
              label="Battery"
              value={
                sensor.battery_pct !== null ? (
                  <BatteryIndicator pct={sensor.battery_pct} />
                ) : (
                  'N/A'
                )
              }
            />
            <InfoItem label="Firmware" value={sensor.firmware_version ? `v${sensor.firmware_version}` : 'N/A'} />
            <InfoItem label="Latitude" value={sensor.lat?.toFixed(4)} />
            <InfoItem label="Longitude" value={sensor.lng?.toFixed(4)} />
          </div>
        </div>

        {/* 24h Stats */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-slate-400 mb-3">24-Hour Statistics</h3>
          <div className="grid grid-cols-3 gap-2">
            <StatCard label="Avg" value={detail.avg_value_24h} unit={typeConfig.unit} />
            <StatCard label="Min" value={detail.min_value_24h} unit={typeConfig.unit} />
            <StatCard label="Max" value={detail.max_value_24h} unit={typeConfig.unit} />
          </div>
        </div>

        {/* Readings Chart */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-slate-400 mb-3">Recent Readings</h3>
          {chartData.length > 0 ? (
            <div className="h-40 bg-slate-800/50 rounded-lg p-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 10, fill: CHART_CONFIG.axis.tick }}
                    axisLine={{ stroke: CHART_CONFIG.axis.line }}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: CHART_CONFIG.axis.tick }}
                    axisLine={{ stroke: CHART_CONFIG.axis.line }}
                    tickLine={false}
                    width={35}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: CHART_CONFIG.tooltip.bg,
                      border: `1px solid ${CHART_CONFIG.tooltip.border}`,
                      borderRadius: '6px',
                      fontSize: '12px',
                    }}
                    labelStyle={{ color: '#94a3b8' }}
                    formatter={(value) => [`${value}${typeConfig.unit}`, 'Value']}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={typeConfig.color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-40 bg-slate-800/50 rounded-lg flex items-center justify-center">
              <p className="text-slate-500 text-sm">No readings available</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
                       text-sm font-medium transition-colors"
          >
            View Full History
          </button>
          <button
            className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg 
                       text-sm font-medium transition-colors"
          >
            Configure Sensor
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Panel header with close button
 */
function PanelHeader({ onClose }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-sm font-medium text-slate-400">Sensor Details</h2>
      <button
        onClick={onClose}
        className="p-1 hover:bg-slate-700 rounded-md transition-colors"
        aria-label="Close panel"
      >
        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

/**
 * Info item for detail grid
 */
function InfoItem({ label, value }) {
  return (
    <div className="bg-slate-800/50 rounded-lg p-2.5">
      <p className="text-xs text-slate-500 mb-0.5">{label}</p>
      <p className="text-sm text-white">{value || 'N/A'}</p>
    </div>
  );
}

/**
 * Stat card for 24h statistics
 */
function StatCard({ label, value, unit }) {
  return (
    <div className="bg-slate-800/50 rounded-lg p-3 text-center">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-lg font-semibold text-white">
        {value != null ? value : '—'}
        {value != null && <span className="text-xs text-slate-400 ml-0.5">{unit}</span>}
      </p>
    </div>
  );
}

/**
 * Battery indicator with progress bar
 */
function BatteryIndicator({ pct }) {
  const color = pct > 50 ? 'bg-green-500' : pct > 20 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="flex items-center gap-1.5">
      <div className="w-12 h-2 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-white text-sm">{Math.round(pct)}%</span>
    </div>
  );
}
