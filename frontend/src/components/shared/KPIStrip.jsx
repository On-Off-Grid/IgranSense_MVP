import { getStatusColors } from '../../styles/tokens';

/**
 * KPI Strip - displays field status counts in a horizontal bar
 * 
 * @param {object} props
 * @param {number} props.totalFields - Total number of fields
 * @param {number} props.criticalCount - Fields with critical status
 * @param {number} props.warningCount - Fields with warning status
 * @param {number} props.okCount - Fields with OK status
 * @param {string} [props.lastSync] - Last sync timestamp
 */
export default function KPIStrip({ 
  totalFields, 
  criticalCount = 0, 
  warningCount = 0, 
  okCount = 0, 
  lastSync 
}) {
  const critical = getStatusColors('critical');
  const warning = getStatusColors('warning');
  const ok = getStatusColors('ok');

  const kpis = [
    { label: 'Total Fields', value: totalFields, colorClass: 'text-white bg-slate-700' },
    { label: 'Critical', value: criticalCount, colorClass: `${critical.text} ${critical.bgSubtle}` },
    { label: 'Warning', value: warningCount, colorClass: `${warning.text} ${warning.bgSubtle}` },
    { label: 'OK', value: okCount, colorClass: `${ok.text} ${ok.bgSubtle}` },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-slate-800 rounded-lg border border-slate-700 mb-4">
      {kpis.map(kpi => (
        <div 
          key={kpi.label}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${kpi.colorClass}`}
        >
          <span className="text-lg font-bold">{kpi.value}</span>
          <span className="text-sm opacity-80">{kpi.label}</span>
        </div>
      ))}
      
      {lastSync && (
        <div className="ml-auto text-sm text-slate-400">
          Last sync: <span className="text-slate-300">
            {lastSync instanceof Date ? lastSync.toLocaleTimeString() : lastSync}
          </span>
        </div>
      )}
    </div>
  );
}
