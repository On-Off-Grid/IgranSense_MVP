import { useState, useEffect } from 'react';
import { getFarms, getFields } from '../api/client';
import { MetricCard, LoadingSpinner } from './shared';

/**
 * CrossFarmSummary – aggregated KPI strip across all farms.
 * Shown to enterprise / admin users on FarmOverview.
 */
export default function CrossFarmSummary() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [farms, allFields] = await Promise.all([
          getFarms(),
          getFields(), // no farmId → returns all fields
        ]);

        const totalFarms = farms.length;
        const totalFields = allFields.length;
        const criticalFields = allFields.filter(f => f.status === 'critical').length;
        const warningFields = allFields.filter(f => f.status === 'warning').length;
        const okFields = allFields.filter(f => f.status === 'ok').length;

        setData({ totalFarms, totalFields, criticalFields, warningFields, okFields });
      } catch {
        // Silently fail — the rest of FarmOverview still works
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="mb-6 flex justify-center py-3">
        <LoadingSpinner text="Loading cross-farm summary..." />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div data-testid="cross-farm-summary" className="mb-6">
      <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">
        All-Farms Summary
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <MetricCard icon="🏘️" label="Farms" value={data.totalFarms} />
        <MetricCard icon="🌾" label="Total Fields" value={data.totalFields} />
        <MetricCard icon="🔴" label="Critical" value={data.criticalFields} status={data.criticalFields > 0 ? 'critical' : 'ok'} />
        <MetricCard icon="🟡" label="Warning" value={data.warningFields} status={data.warningFields > 0 ? 'warning' : 'ok'} />
        <MetricCard icon="🟢" label="Healthy" value={data.okFields} status="ok" />
      </div>
    </div>
  );
}
