import { useState, useEffect } from 'react';
import Card from '../../components/shared/Card';

/**
 * Diagnostics - Admin page for system diagnostics and monitoring
 */
export default function Diagnostics() {
  const [systemStats, setSystemStats] = useState({
    uptime: '14d 7h 23m',
    cpuUsage: 23,
    memoryUsage: 67,
    diskUsage: 41,
    activeConnections: 12,
    requestsPerMin: 145,
  });

  const [logs] = useState([
    { id: 1, level: 'info', message: 'System health check passed', timestamp: '2026-03-01T10:45:00' },
    { id: 2, level: 'warning', message: 'High memory usage detected on edge-node-3', timestamp: '2026-03-01T10:42:00' },
    { id: 3, level: 'info', message: 'NDVI snapshot processed for field_1', timestamp: '2026-03-01T10:40:00' },
    { id: 4, level: 'info', message: 'Sensor sm_001 reconnected', timestamp: '2026-03-01T10:38:00' },
    { id: 5, level: 'error', message: 'Failed to sync with cloud endpoint', timestamp: '2026-03-01T10:35:00' },
    { id: 6, level: 'info', message: 'Rule engine evaluated 3 conditions', timestamp: '2026-03-01T10:30:00' },
  ]);

  const logLevelStyles = {
    info: 'bg-blue-500/20 text-blue-400',
    warning: 'bg-yellow-500/20 text-yellow-400',
    error: 'bg-red-500/20 text-red-400',
  };

  // Simulate live stats
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStats(prev => ({
        ...prev,
        cpuUsage: Math.min(100, Math.max(10, prev.cpuUsage + (Math.random() - 0.5) * 5)),
        requestsPerMin: Math.max(50, prev.requestsPerMin + Math.floor((Math.random() - 0.5) * 20)),
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const formatTimestamp = (ts) => {
    return new Date(ts).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">System Diagnostics</h1>
        <p className="text-slate-400 text-sm mt-1">Real-time platform monitoring</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <StatCard label="Uptime" value={systemStats.uptime} />
        <StatCard label="CPU" value={`${Math.round(systemStats.cpuUsage)}%`} color={systemStats.cpuUsage > 80 ? 'red' : 'green'} />
        <StatCard label="Memory" value={`${systemStats.memoryUsage}%`} color={systemStats.memoryUsage > 80 ? 'red' : 'yellow'} />
        <StatCard label="Disk" value={`${systemStats.diskUsage}%`} />
        <StatCard label="Connections" value={systemStats.activeConnections} />
        <StatCard label="Req/min" value={systemStats.requestsPerMin} />
      </div>

      {/* Resource Bars */}
      <Card className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Resource Usage</h3>
        <div className="space-y-4">
          <ResourceBar label="CPU" value={systemStats.cpuUsage} />
          <ResourceBar label="Memory" value={systemStats.memoryUsage} />
          <ResourceBar label="Disk" value={systemStats.diskUsage} />
        </div>
      </Card>

      {/* Recent Logs */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Recent Logs</h3>
          <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
            View all logs →
          </button>
        </div>
        <div className="space-y-2">
          {logs.map(log => (
            <div 
              key={log.id}
              className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg"
            >
              <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${logLevelStyles[log.level]}`}>
                {log.level}
              </span>
              <span className="flex-1 text-sm text-slate-300">{log.message}</span>
              <span className="text-xs text-slate-500">{formatTimestamp(log.timestamp)}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/**
 * Stat card component
 */
function StatCard({ label, value, color }) {
  const colorClasses = {
    red: 'text-red-400',
    yellow: 'text-yellow-400',
    green: 'text-green-400',
  };

  return (
    <Card className="text-center">
      <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-xl font-bold ${colorClasses[color] || 'text-white'}`}>{value}</p>
    </Card>
  );
}

/**
 * Resource bar component
 */
function ResourceBar({ label, value }) {
  const getColor = (val) => {
    if (val >= 80) return 'bg-red-500';
    if (val >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-slate-400">{label}</span>
        <span className="text-sm text-white font-medium">{Math.round(value)}%</span>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${getColor(value)}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
