import { getStatusColors } from '../../styles/tokens';

/**
 * MapLegend - displays status color legend for the map
 */
export default function MapLegend() {
  const statuses = [
    { key: 'critical', label: 'Critical' },
    { key: 'warning', label: 'Warning' },
    { key: 'ok', label: 'OK' },
  ];

  return (
    <div className="absolute bottom-4 right-4 z-[1000] bg-slate-800/95 backdrop-blur-sm border border-slate-700 rounded-lg p-3 shadow-lg">
      <h4 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
        Field Status
      </h4>
      <div className="space-y-1.5">
        {statuses.map(({ key, label }) => {
          const colors = getStatusColors(key);
          return (
            <div key={key} className="flex items-center gap-2">
              <div 
                className={`w-3 h-3 rounded-full ${colors.bg}`}
              />
              <span className={`text-xs ${colors.text}`}>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
