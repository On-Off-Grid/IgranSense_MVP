import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSystemStatus } from '../api/client';
import { cardClasses } from '../styles/tokens';
import { LoadingSpinner, ErrorBanner, MetricCard } from './shared';
import SensorHealthBar from './SensorHealthBar';
import MDCStatusCard from './MDCStatusCard';

export default function SystemStatus() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getSystemStatus()
      .then(data => {
        setStatus(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading system status..." fullHeight />;
  }

  if (error) {
    return <ErrorBanner message={error} />;
  }

  const { mdc_status, last_sync, sensor_health_summary, mdc_metrics } = status;

  return (
    <div data-testid="system-status">
      <h2 className="text-2xl font-bold text-white mb-6">System Status</h2>

      {/* Edge Processing Banner */}
      <div
        data-testid="edge-banner"
        className="mb-6 flex items-center gap-3 rounded-lg border border-green-700/40 bg-green-900/20 px-4 py-3"
      >
        <span className="text-lg">🖥️</span>
        <span className="text-green-300 text-sm font-medium">
          Edge processing active — no internet required
        </span>
      </div>

      {/* MDC Metrics Strip */}
      {mdc_metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6" data-testid="mdc-metrics-strip">
          <MetricCard icon="🧠" label="CPU" value={mdc_metrics.cpu_pct} unit="%" status={mdc_metrics.cpu_pct > 80 ? 'critical' : mdc_metrics.cpu_pct > 60 ? 'warning' : 'ok'} />
          <MetricCard icon="💾" label="Memory" value={mdc_metrics.memory_pct} unit="%" status={mdc_metrics.memory_pct > 80 ? 'critical' : mdc_metrics.memory_pct > 60 ? 'warning' : 'ok'} />
          <MetricCard icon="📀" label="Disk" value={mdc_metrics.disk_pct} unit="%" status={mdc_metrics.disk_pct > 80 ? 'critical' : mdc_metrics.disk_pct > 60 ? 'warning' : 'ok'} />
          <MetricCard icon="📡" label="Req/min" value={mdc_metrics.requests_per_min} unit="" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MDC Status Card */}
        <MDCStatusCard
          status={mdc_status}
          lastSync={last_sync}
          uptime={99.2}  // Mock value - would come from backend
          version="1.0.0-beta"  // Mock value
        />

        {/* Sensor Network Card */}
        <div className={`${cardClasses} p-5`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Sensor Network</h3>
            <Link 
              to="/sensors"
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              View all sensors →
            </Link>
          </div>

          {/* Total Count */}
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-3xl font-bold text-white">
              {sensor_health_summary.total_sensors}
            </span>
            <span className="text-slate-400">sensors deployed</span>
          </div>

          {/* Health Bar */}
          <SensorHealthBar
            total={sensor_health_summary.total_sensors}
            online={sensor_health_summary.online_sensors}
            offline={sensor_health_summary.offline_sensors}
            batteryLow={sensor_health_summary.battery_low_sensors}
          />

          {/* Operational Percentage */}
          <div className="mt-4 pt-4 border-t border-slate-700">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Network Health</span>
              <span className={`font-semibold ${
                (sensor_health_summary.online_sensors / sensor_health_summary.total_sensors) > 0.9 
                  ? 'text-green-400' 
                  : (sensor_health_summary.online_sensors / sensor_health_summary.total_sensors) > 0.7
                    ? 'text-orange-400'
                    : 'text-red-400'
              }`}>
                {Math.round((sensor_health_summary.online_sensors / sensor_health_summary.total_sensors) * 100)}% operational
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
