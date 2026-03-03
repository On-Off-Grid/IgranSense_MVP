import { WeatherIcon, StatusBadge } from './shared';

/**
 * Map irrigation-window status to StatusBadge status prop.
 */
const WINDOW_MAP = { good: 'ok', risky: 'warning', avoid: 'critical' };

/**
 * FieldWeatherCard — compact inline weather widget for Field Detail.
 *
 * Shows current temperature + conditions and an irrigation-window badge,
 * powered by the `weather` object included in `FieldDetailResponse`.
 *
 * @param {object} props
 * @param {object} props.weather - CurrentWeather object from the backend
 * @param {object} [props.irrigationWindow] - IrrigationWindow object (optional separate prop)
 */
export default function FieldWeatherCard({ weather, irrigationWindow }) {
  if (!weather) return null;

  return (
    <div
      className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex items-center gap-4"
      data-testid="field-weather-card"
    >
      <WeatherIcon conditions={weather.conditions} size="text-3xl" />

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-medium text-white">{weather.temperature_c}°C</span>
          <span className="text-sm text-slate-400 capitalize">
            {weather.conditions?.replace('_', ' ')}
          </span>
        </div>
        <div className="flex gap-4 text-xs text-slate-400 mt-0.5">
          <span>💧 {weather.humidity_pct}%</span>
          <span>💨 {weather.wind_speed_kmh} km/h</span>
          {weather.rainfall_mm_today > 0 && (
            <span>🌧️ {weather.rainfall_mm_today} mm</span>
          )}
        </div>
      </div>

      {irrigationWindow && (
        <div className="text-center shrink-0">
          <StatusBadge
            status={WINDOW_MAP[irrigationWindow.status] || 'info'}
            label={irrigationWindow.status?.toUpperCase()}
            size="sm"
          />
          <p className="text-[10px] text-slate-500 mt-0.5 max-w-[100px] leading-tight">
            Irrigation window
          </p>
        </div>
      )}
    </div>
  );
}
