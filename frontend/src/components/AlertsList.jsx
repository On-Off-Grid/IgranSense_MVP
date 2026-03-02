import { useState, useEffect, useMemo } from 'react';
import { getAlerts, acknowledgeAlert, snoozeAlert, dismissAlert } from '../api/client';
import { cardClasses } from '../styles/tokens';
import { LoadingSpinner, ErrorBanner } from './shared';
import AlertFilters from './AlertFilters';
import AlertGroup from './AlertGroup';
import AlertCard from './AlertCard';
import { useAuth } from '../context/AuthContext';
import { useFarm } from '../context/FarmContext';

export default function AlertsList() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ search: '', severity: 'all', fieldId: 'all' });
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

  // Filter alerts based on current filters
  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
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
  }, [alerts, filters]);

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
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white">Alerts & Recommendations</h2>
        <span className="text-sm text-slate-400">
          {filteredAlerts.length} alert{filteredAlerts.length !== 1 ? 's' : ''}
        </span>
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
          {/* Critical Alerts - expanded by default */}
          <AlertGroup 
            severity="critical" 
            count={groupedAlerts.critical.length}
            defaultExpanded={true}
          >
            {groupedAlerts.critical.map((alert, index) => (
              <AlertCard
                key={`${alert.field_id}-${alert.type}-${index}`}
                alert={alert}
                onAcknowledge={isAuthenticated ? handleAcknowledge : null}
                onSnooze={isAuthenticated ? handleSnooze : null}
                onDismiss={isAuthenticated ? handleDismiss : null}
              />
            ))}
          </AlertGroup>

          {/* Warning Alerts */}
          <AlertGroup 
            severity="warning" 
            count={groupedAlerts.warning.length}
            defaultExpanded={groupedAlerts.critical.length === 0}
          >
            {groupedAlerts.warning.map((alert, index) => (
              <AlertCard
                key={`${alert.field_id}-${alert.type}-${index}`}
                alert={alert}
                onAcknowledge={isAuthenticated ? handleAcknowledge : null}
                onSnooze={isAuthenticated ? handleSnooze : null}
                onDismiss={isAuthenticated ? handleDismiss : null}
              />
            ))}
          </AlertGroup>

          {/* Info Alerts */}
          <AlertGroup 
            severity="info" 
            count={groupedAlerts.info.length}
            defaultExpanded={groupedAlerts.critical.length === 0 && groupedAlerts.warning.length === 0}
          >
            {groupedAlerts.info.map((alert, index) => (
              <AlertCard
                key={`${alert.field_id}-${alert.type}-${index}`}
                alert={alert}
                onAcknowledge={isAuthenticated ? handleAcknowledge : null}
                onSnooze={isAuthenticated ? handleSnooze : null}
                onDismiss={isAuthenticated ? handleDismiss : null}
              />
            ))}
          </AlertGroup>
        </div>
      )}
    </div>
  );
}
