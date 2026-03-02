import { useState, useEffect, useMemo } from 'react';
import { getFields, getAlerts } from '../api/client';
import { LoadingSpinner, ErrorBanner, KPIStrip, StatusFilter } from './shared';
import ExpandableFieldCard from './ExpandableFieldCard';
import { useOffline } from '../App';
import { useFarm } from '../context/FarmContext';

export default function FarmOverview() {
  const [fields, setFields] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({ status: 'all', query: '' });
  const { lastSync } = useOffline();
  const { selectedFarm } = useFarm();

  // Fetch fields and alerts when farm changes
  useEffect(() => {
    const farmId = selectedFarm?.id || null;
    setLoading(true);
    setError(null);

    Promise.all([
      getFields(farmId),
      getAlerts(farmId)
    ])
      .then(([fieldsData, alertsData]) => {
        setFields(fieldsData);
        setAlerts(alertsData);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [selectedFarm]);

  // Count alerts per field
  const alertsByField = useMemo(() => {
    return alerts.reduce((acc, alert) => {
      acc[alert.field_id] = (acc[alert.field_id] || 0) + 1;
      return acc;
    }, {});
  }, [alerts]);

  // Calculate KPI counts
  const kpiCounts = useMemo(() => {
    return fields.reduce(
      (acc, field) => {
        acc[field.status] = (acc[field.status] || 0) + 1;
        return acc;
      },
      { critical: 0, warning: 0, ok: 0 }
    );
  }, [fields]);

  // Count sensors
  const sensorCounts = useMemo(() => {
    let total = 0;
    let online = 0;
    fields.forEach(field => {
      const sensors = field.sensors || [];
      total += sensors.length;
      online += sensors.filter(s => s.status === 'online').length;
    });
    return { total, online };
  }, [fields]);

  // Filter fields based on status and search query
  const filteredFields = useMemo(() => {
    return fields.filter(field => {
      const matchesStatus = filter.status === 'all' || field.status === filter.status;
      const matchesQuery = !filter.query || 
        field.name.toLowerCase().includes(filter.query.toLowerCase());
      return matchesStatus && matchesQuery;
    });
  }, [fields, filter]);

  if (loading) {
    return <LoadingSpinner text="Loading fields..." fullHeight />;
  }

  if (error) {
    return (
      <ErrorBanner 
        message={error} 
        details="Make sure the API is running at http://localhost:8000"
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-white m-0">
          {selectedFarm?.name || 'All Farms'}
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {fields.length} fields • {sensorCounts.total} sensors deployed
        </p>
      </header>
      
      {/* KPI Strip */}
      <KPIStrip
        totalFields={fields.length}
        criticalCount={kpiCounts.critical}
        warningCount={kpiCounts.warning}
        okCount={kpiCounts.ok}
        lastSync={lastSync}
      />

      {/* Filters */}
      <StatusFilter onFilterChange={setFilter} />
      
      {/* Field cards with expandable schematics */}
      {filteredFields.length === 0 ? (
        <div className="text-center text-slate-400 py-12 bg-slate-800 rounded-xl">
          <p className="text-lg">No fields match your filter criteria.</p>
          <p className="text-sm mt-2">Try changing the status filter or search query.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 mt-4">
          {filteredFields.map(field => (
            <ExpandableFieldCard
              key={field.id}
              field={field}
              alertCount={alertsByField[field.id] || 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
