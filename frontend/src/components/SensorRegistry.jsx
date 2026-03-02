import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getSensors } from '../api/client';
import { getStatusColors, SURFACE } from '../styles/tokens';
import Card from './shared/Card';
import LoadingSpinner from './shared/LoadingSpinner';
import ErrorBanner from './shared/ErrorBanner';
import StatusBadge from './shared/StatusBadge';
import SensorDetailPanel from './SensorDetailPanel';
import { useFarm } from '../context/FarmContext';

/**
 * Sensor type display config
 */
const SENSOR_TYPES = {
  soil_moisture: { label: 'Soil Moisture', icon: '💧', unit: '%' },
  temperature: { label: 'Temperature', icon: '🌡️', unit: '°C' },
  humidity: { label: 'Humidity', icon: '💨', unit: '%' },
};

/**
 * SensorRegistry - device inventory page with filters and detail panel
 */
export default function SensorRegistry() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedFarm } = useFarm();

  // Data state
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [fieldFilter, setFieldFilter] = useState(searchParams.get('field') || 'all');
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || 'all');
  const [search, setSearch] = useState(searchParams.get('search') || '');

  // Detail panel state
  const [selectedSensorId, setSelectedSensorId] = useState(null);

  // Fetch sensors on mount and filter change
  useEffect(() => {
    async function fetchSensors() {
      try {
        setLoading(true);
        const filters = {};
        if (selectedFarm?.id) filters.farm_id = selectedFarm.id;
        if (statusFilter !== 'all') filters.status = statusFilter;
        if (fieldFilter !== 'all') filters.field_id = fieldFilter;
        if (typeFilter !== 'all') filters.type = typeFilter;

        const data = await getSensors(filters);
        setSensors(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchSensors();
  }, [selectedFarm, statusFilter, fieldFilter, typeFilter]);

  // Sync URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (fieldFilter !== 'all') params.set('field', fieldFilter);
    if (typeFilter !== 'all') params.set('type', typeFilter);
    setSearchParams(params, { replace: true });
  }, [search, statusFilter, fieldFilter, typeFilter, setSearchParams]);

  // Client-side search filter
  const filteredSensors = sensors.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.sensor_id.toLowerCase().includes(q) ||
      s.field_name?.toLowerCase().includes(q) ||
      s.type.toLowerCase().includes(q)
    );
  });

  // Extract unique values for filter dropdowns
  const uniqueFields = [...new Set(sensors.map((s) => s.field_id))];
  const uniqueTypes = [...new Set(sensors.map((s) => s.type))];

  // Status counts for chips
  const statusCounts = sensors.reduce(
    (acc, s) => {
      acc[s.status] = (acc[s.status] || 0) + 1;
      return acc;
    },
    { online: 0, offline: 0, battery_low: 0 }
  );

  const statuses = ['all', 'online', 'battery_low', 'offline'];

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className={`flex-1 p-6 overflow-auto ${selectedSensorId ? 'pr-96' : ''}`}>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Sensor Registry</h1>
              <p className="text-slate-400 text-sm mt-1">
                {sensors.length} sensor{sensors.length !== 1 ? 's' : ''} deployed
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search sensors..."
                className={`w-full ${SURFACE.card} border border-slate-700 text-white rounded-lg 
                           pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 
                           focus:border-blue-500 placeholder-slate-500`}
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Status Chips */}
            <div className="flex gap-1">
              {statuses.map((status) => {
                const isActive = statusFilter === status;
                const colors = status === 'all' ? null : getStatusColors(status);
                const count = status === 'all' ? sensors.length : statusCounts[status] || 0;

                return (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`
                      px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5
                      ${
                        isActive
                          ? status === 'all'
                            ? 'bg-blue-600 text-white'
                            : `${colors?.bg} text-white`
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700'
                      }
                    `}
                  >
                    <span className="capitalize">
                      {status === 'all' ? 'All' : status.replace('_', ' ')}
                    </span>
                    <span
                      className={`
                      text-[10px] px-1.5 py-0.5 rounded-full
                      ${isActive ? 'bg-white/20' : 'bg-slate-700'}
                    `}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Field Dropdown */}
            <select
              value={fieldFilter}
              onChange={(e) => setFieldFilter(e.target.value)}
              className={`${SURFACE.card} border border-slate-700 text-white rounded-lg px-3 py-2 text-sm`}
            >
              <option value="all">All Fields</option>
              {uniqueFields.map((fid) => (
                <option key={fid} value={fid}>
                  {sensors.find((s) => s.field_id === fid)?.field_name || fid}
                </option>
              ))}
            </select>

            {/* Type Dropdown */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className={`${SURFACE.card} border border-slate-700 text-white rounded-lg px-3 py-2 text-sm`}
            >
              <option value="all">All Types</option>
              {uniqueTypes.map((type) => (
                <option key={type} value={type}>
                  {SENSOR_TYPES[type]?.label || type}
                </option>
              ))}
            </select>
          </div>

          {/* Content */}
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <ErrorBanner message={error} />
          ) : filteredSensors.length === 0 ? (
            <Card className="text-center py-12">
              <p className="text-slate-400">No sensors found matching your filters.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSensors.map((sensor) => (
                <SensorCard
                  key={sensor.sensor_id}
                  sensor={sensor}
                  isSelected={selectedSensorId === sensor.sensor_id}
                  onClick={() => setSelectedSensorId(sensor.sensor_id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Panel */}
      {selectedSensorId && (
        <SensorDetailPanel
          sensorId={selectedSensorId}
          onClose={() => setSelectedSensorId(null)}
        />
      )}
    </div>
  );
}

/**
 * SensorCard - individual sensor card in the grid
 */
function SensorCard({ sensor, isSelected, onClick }) {
  const typeConfig = SENSOR_TYPES[sensor.type] || { label: sensor.type, icon: '📡', unit: '' };
  const lastSeen = sensor.last_seen_at
    ? formatTimeAgo(new Date(sensor.last_seen_at))
    : 'Unknown';

  return (
    <Card
      onClick={onClick}
      className={`cursor-pointer transition-all hover:border-blue-500/50 ${
        isSelected ? 'ring-2 ring-blue-500 border-blue-500' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{typeConfig.icon}</span>
          <div>
            <p className="font-medium text-white">{sensor.sensor_id}</p>
            <p className="text-xs text-slate-400">{typeConfig.label}</p>
          </div>
        </div>
        <StatusBadge status={sensor.status} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-slate-500 text-xs">Field</p>
          <p className="text-slate-300">{sensor.field_name || sensor.field_id}</p>
        </div>
        <div>
          <p className="text-slate-500 text-xs">Last Seen</p>
          <p className="text-slate-300">{lastSeen}</p>
        </div>
        {sensor.battery_pct !== null && (
          <div>
            <p className="text-slate-500 text-xs">Battery</p>
            <div className="flex items-center gap-1.5">
              <div className="w-12 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    sensor.battery_pct > 50
                      ? 'bg-green-500'
                      : sensor.battery_pct > 20
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                  }`}
                  style={{ width: `${sensor.battery_pct}%` }}
                />
              </div>
              <span className="text-slate-300 text-xs">{Math.round(sensor.battery_pct)}%</span>
            </div>
          </div>
        )}
        {sensor.firmware_version && (
          <div>
            <p className="text-slate-500 text-xs">Firmware</p>
            <p className="text-slate-300">v{sensor.firmware_version}</p>
          </div>
        )}
      </div>
    </Card>
  );
}

/**
 * Format timestamp to relative time
 */
function formatTimeAgo(date) {
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
