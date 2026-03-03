import { useState, useEffect, useMemo } from 'react';
import { getAlerts, acknowledgeAlert, snoozeAlert, dismissAlert } from '../api/client';
import { cardClasses } from '../styles/tokens';
import { LoadingSpinner, ErrorBanner, TimeRangeToggle } from './shared';
import AlertFilters from './AlertFilters';
import AlertGroup from './AlertGroup';
import AlertCard from './AlertCard';
import AggregatedAlertCard from './AggregatedAlertCard';
import { useAuth } from '../context/AuthContext';
import { useFarm } from '../context/FarmContext';

const TIME_RANGE_OPTIONS = [1, 7, 30];
const TIME_RANGE_LABELS = { 1: '24h', 7: '7d', 30: '30d' };

export default function AlertsList() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ search: '', severity: 'all', fieldId: 'all' });
  const [timeRange, setTimeRange] = useState(30);
  const [groupSimilar, setGroupSimilar] = useState(false);
  const { isAuthenticated } = useAuth();
  const { selectedFarm } = useFarm();

  useEffect(() => {
    const farmId = selectedFarm?.id || null;
    setLoading(true);
    getAlerts(farmId)
      .then(data => {
        setAlerts(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [selectedFarm]);

  // Get unique field IDs for filter dropdown
  const fieldIds = useMemo(() => {
    return [...new Set(alerts.map(a => a.field_id))].sort();
  }, [alerts]);

  // Filter alerts based on current filters + time range
  const filteredAlerts = useMemo(() => {
    const now = new Date();
    const cutoff = new Date(now.getTime() - timeRange * 24 * 60 * 60 * 1000);

    return alerts.filter(alert => {
      // Time-range filter
      if (alert.timestamp && new Date(alert.timestamp) < cutoff) return false;

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          alert.message.toLowerCase().includes(searchLower) ||
          alert.field_id.toLowerCase().includes(searchLower) ||
          alert.type.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }
      
      // Severity filter
      if (filters.severity !== 'all' && alert.severity !== filters.severity) {
        return false;
      }
      
      // Field filter
      if (filters.fieldId !== 'all' && alert.field_id !== filters.fieldId) {
        return false;
      }
      
      return true;
    });
  }, [alerts, filters, timeRange]);

  // Group alerts by severity
  const groupedAlerts = useMemo(() => {
    const groups = { critical: [], warning: [], info: [] };
    filteredAlerts.forEach(alert => {
      if (groups[alert.severity]) {
        groups[alert.severity].push(alert);
      }
    });
    return groups;
  }, [filteredAlerts]);

  // Aggregate similar alerts: collapse by (type, severity)
  const aggregatedGroups = useMemo(() => {
    if (!groupSimilar) return null;

    const buildAggregated = (alertList) => {
      const buckets = {};
      alertList.forEach(alert => {
        const key = `${alert.type}::${alert.severity}`;
        if (!buckets[key]) {
          buckets[key] = { type: alert.type, severity: alert.severity, alerts: [] };
        }
        buckets[key].alerts.push(alert);
      });
      return Object.values(buckets);
    };

    return {
      critical: buildAggregated(groupedAlerts.critical),
      warning: buildAggregated(groupedAlerts.warning),
      info: buildAggregated(groupedAlerts.info),
    };
  }, [groupSimilar, groupedAlerts]);

  // Alert action handlers
  const handleAcknowledge = async (alert) => {
    try {
      await acknowledgeAlert(alert.field_id, alert.type);
      // Remove from local state (optimistic update)
      setAlerts(prev => prev.filter(a => 
        !(a.field_id === alert.field_id && a.type === alert.type)
      ));
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    }
  };

  const handleSnooze = async (alert) => {
    try {
      await snoozeAlert(alert.field_id, alert.type, 1);
      // Remove from local state
      setAlerts(prev => prev.filter(a => 
        !(a.field_id === alert.field_id && a.type === alert.type)
      ));
    } catch (err) {
      console.error('Failed to snooze alert:', err);
    }
  };

  const handleDismiss = async (alert) => {
    try {
      await dismissAlert(alert.field_id, alert.type);
      // Remove from local state
      setAlerts(prev => prev.filter(a => 
        !(a.field_id === alert.field_id && a.type === alert.type)
      ));
    } catch (err) {
      console.error('Failed to dismiss alert:', err);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading alerts..." fullHeight />;
  }

  if (error) {
    return <ErrorBanner message={error} />;
  }

  return (
    <div data-testid="alerts-list">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-2xl font-bold text-white">Alerts & Recommendations</h2>
        <div className="flex items-center gap-3">
          {/* Time-range toggle */}
          <TimeRangeToggle
            value={timeRange}
            onChange={setTimeRange}
            options={TIME_RANGE_OPTIONS}
          />
          {/* Aggregation toggle */}
          <button
            data-testid="aggregate-toggle"
            onClick={() => setGroupSimilar(g => !g)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              groupSimilar
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {groupSimilar ? 'Ungrouped' : 'Group similar'}
          </button>
          <span className="text-sm text-slate-400">
            {filteredAlerts.length} alert{filteredAlerts.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Filters */}
      <AlertFilters 
        onFilterChange={setFilters} 
        fieldIds={fieldIds}
      />
      
      {alerts.length === 0 ? (
        <div className={`${cardClasses} p-8 text-center`}>
          <div className="text-4xl mb-4">✅</div>
          <h3 className="text-lg font-semibold text-white mb-2">All Clear!</h3>
          <p className="text-slate-400">No active alerts for your fields.</p>
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className={`${cardClasses} p-8 text-center`}>
          <p className="text-slate-400">No alerts match your filter criteria.</p>
        </div>
      ) : (
        <div>
          {['critical', 'warning', 'info'].map((sev, idx) => (
            <AlertGroup
              key={sev}
              severity={sev}
              count={groupedAlerts[sev].length}
              defaultExpanded={
                idx === 0
                  ? true
                  : sev === 'warning'
                    ? groupedAlerts.critical.length === 0
                    : groupedAlerts.critical.length === 0 && groupedAlerts.warning.length === 0
              }
            >
              {groupSimilar && aggregatedGroups
                ? aggregatedGroups[sev].map(bucket => (
                    <AggregatedAlertCard
                      key={`${bucket.type}-${bucket.severity}`}
                      bucket={bucket}
                      onAcknowledge={isAuthenticated ? handleAcknowledge : null}
                      onSnooze={isAuthenticated ? handleSnooze : null}
                      onDismiss={isAuthenticated ? handleDismiss : null}
                    />
                  ))
                : groupedAlerts[sev].map((alert, index) => (
                    <AlertCard
                      key={`${alert.field_id}-${alert.type}-${index}`}
                      alert={alert}
                      onAcknowledge={isAuthenticated ? handleAcknowledge : null}
                      onSnooze={isAuthenticated ? handleSnooze : null}
                      onDismiss={isAuthenticated ? handleDismiss : null}
                    />
                  ))
              }
            </AlertGroup>
          ))}
        </div>
      )}
    </div>
  );
}
