import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { getWeather } from '../api/client';
import { LoadingSpinner, ErrorBanner, StatusBadge, WeatherIcon } from './shared';
import { useFarm } from '../context/FarmContext';

/**
 * Irrigation-window status → StatusBadge mapping.
 */
const WINDOW_STATUS_MAP = {
  good:  'ok',
  risky: 'warning',
  avoid: 'critical',
};

/**
 * Single forecast day card.
 */
function ForecastDayCard({ day }) {
  return (
    <div className="flex flex-col items-center gap-1 p-3 bg-slate-800 border border-slate-700 rounded-lg min-w-[100px]">
      <span className="text-xs text-slate-400">
        {new Date(day.date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
      </span>
      <WeatherIcon conditions={day.conditions} size="text-2xl" />
      <div className="flex gap-2 text-sm">
        <span className="text-white font-medium">{day.high_c}°</span>
        <span className="text-slate-400">{day.low_c}°</span>
      </div>
      <div className="flex items-center gap-1 text-xs text-slate-400">
        <span>🌧️</span>
        <span>{day.rain_probability_pct}%</span>
      </div>
      <div className="flex items-center gap-1 text-xs text-slate-400">
        <span>💨</span>
        <span>{day.wind_speed_kmh} km/h</span>
      </div>
    </div>
  );
}

/**
 * WeatherRisk — Priority-A page for v2.1
 *
 * Displays: current conditions, irrigation window indicator,
 * 7-day forecast strip, and historical rainfall chart.
 */
export default function WeatherRisk() {
  const { selectedFarm } = useFarm();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const farmId = selectedFarm?.id;
    if (!farmId) return;

    setLoading(true);
    setError(null);

    getWeather(farmId)
      .then(result => {
        setData(result);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [selectedFarm]);

  if (loading) {
    return <LoadingSpinner text="Loading weather data…" fullHeight />;
  }

  if (error) {
    return <ErrorBanner message={error} />;
  }

  if (!data) {
    return <p className="text-slate-400 p-6">No weather data available.</p>;
  }

  const { current, forecast, irrigation_window, historical } = data;

  // Rainfall chart data
  const rainfallChart = [
    { label: 'Cumulative', value: historical.cumulative_rainfall_mm },
    { label: 'Seasonal Avg', value: historical.seasonal_average_mm },
  ];

  return (
    <div className="space-y-6" data-testid="weather-risk-page">
      {/* ---- Header ---- */}
      <h1 className="text-xl font-semibold text-white">Weather &amp; Risk</h1>

      {/* ---- Top Row: Current Conditions + Irrigation Window ---- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Current Conditions */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 flex items-center gap-5">
          <WeatherIcon conditions={current.conditions} size="text-5xl" />
          <div className="flex-1 space-y-1">
            <h2 className="text-lg font-medium text-white">Current Conditions</h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
              <span className="text-slate-400">Temperature</span>
              <span className="text-white font-medium">{current.temperature_c}°C</span>
              <span className="text-slate-400">Humidity</span>
              <span className="text-white font-medium">{current.humidity_pct}%</span>
              <span className="text-slate-400">Wind</span>
              <span className="text-white font-medium">{current.wind_speed_kmh} km/h</span>
              <span className="text-slate-400">Rainfall today</span>
              <span className="text-white font-medium">{current.rainfall_mm_today} mm</span>
            </div>
            <p className="text-xs text-slate-500 pt-1">
              Updated {new Date(current.timestamp).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Irrigation Window */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 flex flex-col justify-center items-center gap-3">
          <h2 className="text-lg font-medium text-white">Irrigation Window</h2>
          <StatusBadge
            status={WINDOW_STATUS_MAP[irrigation_window.status] || 'info'}
            label={irrigation_window.status.toUpperCase()}
            size="lg"
          />
          <p className="text-sm text-slate-400 text-center max-w-xs">
            {irrigation_window.reason}
          </p>
        </div>
      </div>

      {/* ---- 7-Day Forecast Strip ---- */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-slate-300 mb-3">7-Day Forecast</h3>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {forecast.map(day => (
            <ForecastDayCard key={day.date} day={day} />
          ))}
        </div>
      </div>

      {/* ---- Historical Rainfall ---- */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-slate-300 mb-1">
          Historical Rainfall
        </h3>
        <p className="text-xs text-slate-500 mb-3">
          {historical.period_start} — {historical.period_end}
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={rainfallChart} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 13 }} />
            <YAxis
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              label={{ value: 'mm', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
              labelStyle={{ color: '#f8fafc' }}
            />
            <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={48} />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-slate-500 mt-2">
          {historical.cumulative_rainfall_mm >= historical.seasonal_average_mm
            ? '✅ Cumulative rainfall is on or above seasonal average.'
            : `⚠️ Cumulative rainfall is ${(historical.seasonal_average_mm - historical.cumulative_rainfall_mm).toFixed(0)} mm below seasonal average.`}
        </p>
      </div>
    </div>
  );
}
