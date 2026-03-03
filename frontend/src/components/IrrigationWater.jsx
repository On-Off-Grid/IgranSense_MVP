import { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { getWaterDashboard } from '../api/client';
import { LoadingSpinner, ErrorBanner, MetricCard } from './shared';
import { useFarm } from '../context/FarmContext';

/**
 * Colour palette for stacked bar series (one colour per field).
 */
const FIELD_COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#06b6d4', // cyan-500
  '#ec4899', // pink-500
  '#14b8a6', // teal-500
  '#f97316', // orange-500
  '#6366f1', // indigo-500
];

const RANGE_OPTIONS = [
  { label: 'Today', value: 'today' },
  { label: '7 D', value: '7d' },
  { label: '30 D', value: '30d' },
  { label: 'Season', value: 'season' },
];

/**
 * StatusBadge for moisture classification
 */
function MoistureBar({ dryPct, optimalPct, wetPct }) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-slate-300">Moisture Zone Distribution</h3>
      <div className="flex h-6 rounded-full overflow-hidden border border-slate-700">
        {dryPct > 0 && (
          <div
            className="bg-amber-500 flex items-center justify-center text-xs font-bold text-white"
            style={{ width: `${dryPct}%` }}
            title={`Dry: ${dryPct}%`}
          >
            {dryPct >= 10 && `${dryPct}%`}
          </div>
        )}
        {optimalPct > 0 && (
          <div
            className="bg-emerald-500 flex items-center justify-center text-xs font-bold text-white"
            style={{ width: `${optimalPct}%` }}
            title={`Optimal: ${optimalPct}%`}
          >
            {optimalPct >= 10 && `${optimalPct}%`}
          </div>
        )}
        {wetPct > 0 && (
          <div
            className="bg-blue-500 flex items-center justify-center text-xs font-bold text-white"
            style={{ width: `${wetPct}%` }}
            title={`Wet: ${wetPct}%`}
          >
            {wetPct >= 10 && `${wetPct}%`}
          </div>
        )}
      </div>
      <div className="flex gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-amber-500" /> Dry {dryPct}%</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-emerald-500" /> Optimal {optimalPct}%</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-blue-500" /> Wet {wetPct}%</span>
      </div>
    </div>
  );
}

/**
 * IrrigationWater — Priority-A page for v2.1
 *
 * Displays: KPI metrics, a stacked bar chart of daily irrigation volumes
 * per field, and a horizontal moisture-zone distribution bar.
 */
export default function IrrigationWater() {
  const { selectedFarm } = useFarm();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');

  // Fetch water dashboard when farm or timeRange changes
  useEffect(() => {
    const farmId = selectedFarm?.id;
    if (!farmId) return;

    setLoading(true);
    setError(null);

    getWaterDashboard(farmId, timeRange)
      .then(result => {
        setData(result);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [selectedFarm, timeRange]);

  // Build chart data: pivot irrigation_series → [{date, field_1: vol, field_2: vol, …}]
  const { chartData, fieldIds } = useMemo(() => {
    if (!data?.irrigation_series?.length) return { chartData: [], fieldIds: [] };

    const dateMap = {};  // date → { date, field_x: volume }
    const ids = [];

    data.irrigation_series.forEach(series => {
      ids.push(series.field_id);
      (series.events || []).forEach(evt => {
        if (!dateMap[evt.date]) dateMap[evt.date] = { date: evt.date };
        dateMap[evt.date][series.field_id] = evt.volume_liters;
      });
    });

    const sorted = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));
    return { chartData: sorted, fieldIds: ids };
  }, [data]);

  // ---------- Render ----------

  if (loading) {
    return <LoadingSpinner text="Loading irrigation data…" fullHeight />;
  }

  if (error) {
    return <ErrorBanner message={error} />;
  }

  if (!data) {
    return <p className="text-slate-400 p-6">No irrigation data available.</p>;
  }

  const { kpis, moisture_zones } = data;

  return (
    <div className="space-y-6" data-testid="irrigation-water-page">
      {/* ---- Header + time-range toggle ---- */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Irrigation &amp; Water</h1>
        <div className="inline-flex rounded-lg border border-slate-700 overflow-hidden">
          {RANGE_OPTIONS.map((opt, i) => (
            <button
              key={opt.value}
              onClick={() => setTimeRange(opt.value)}
              className={`
                px-4 py-1.5 text-sm font-medium transition-colors
                ${timeRange === opt.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                }
                ${i > 0 ? 'border-l border-slate-700' : ''}
              `}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ---- KPI Metrics ---- */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard
          icon="💧"
          label="Total Volume"
          value={kpis.total_volume_liters.toLocaleString()}
          unit="L"
        />
        <MetricCard
          icon="📐"
          label="Per Hectare"
          value={kpis.volume_per_hectare.toFixed(0)}
          unit="L/ha"
        />
        <MetricCard
          icon="✅"
          label="Efficiency Proxy"
          value={`${(kpis.efficiency_proxy * 100).toFixed(0)}`}
          unit="%"
          status={kpis.efficiency_proxy >= 0.5 ? 'ok' : 'warning'}
        />
        <MetricCard
          icon="🔻"
          label="Under-irrigated"
          value={`${kpis.pct_under_irrigated.toFixed(0)}`}
          unit="%"
          status={kpis.pct_under_irrigated > 30 ? 'critical' : 'ok'}
        />
        <MetricCard
          icon="🔺"
          label="Over-irrigated"
          value={`${kpis.pct_over_irrigated.toFixed(0)}`}
          unit="%"
          status={kpis.pct_over_irrigated > 30 ? 'warning' : 'ok'}
        />
        <MetricCard
          icon="🎯"
          label="Optimal"
          value={`${kpis.pct_optimal.toFixed(0)}`}
          unit="%"
          status="ok"
        />
      </div>

      {/* ---- Stacked Bar Chart ---- */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-slate-300 mb-3">
          Daily Irrigation Volume by Field
        </h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                tickFormatter={d => d.slice(5)}
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                label={{ value: 'Litres', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                labelStyle={{ color: '#f8fafc' }}
              />
              <Legend />
              {fieldIds.map((fid, idx) => (
                <Bar
                  key={fid}
                  dataKey={fid}
                  stackId="irrigation"
                  fill={FIELD_COLORS[idx % FIELD_COLORS.length]}
                  name={data.irrigation_series[idx]?.field_name ?? fid}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-slate-500 text-sm">No irrigation events in this period.</p>
        )}
      </div>

      {/* ---- Moisture Zone Bar ---- */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <MoistureBar
          dryPct={moisture_zones.dry_pct}
          optimalPct={moisture_zones.optimal_pct}
          wetPct={moisture_zones.wet_pct}
        />
      </div>
    </div>
  );
}
