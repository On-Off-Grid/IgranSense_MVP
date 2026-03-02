import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getStatusColors } from '../styles/tokens';

/**
 * AlertFilters - search and filter controls for alerts
 * 
 * @param {object} props
 * @param {function} props.onFilterChange - Callback: ({ search, severity, fieldId }) => void
 * @param {Array<string>} props.fieldIds - Available field IDs for dropdown
 */
export default function AlertFilters({ onFilterChange, fieldIds = [] }) {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [severity, setSeverity] = useState(searchParams.get('severity') || 'all');
  const [fieldId, setFieldId] = useState(searchParams.get('field') || 'all');

  // Sync URL params on filter change
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (severity !== 'all') params.set('severity', severity);
    if (fieldId !== 'all') params.set('field', fieldId);
    setSearchParams(params, { replace: true });
    
    onFilterChange({ search, severity, fieldId });
  }, [search, severity, fieldId]);

  const severities = ['all', 'critical', 'warning', 'info'];

  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search alerts..."
          className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg 
                     pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 
                     focus:border-blue-500 placeholder-slate-500"
        />
        <svg 
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
          />
        </svg>
      </div>

      {/* Severity Chips */}
      <div className="flex gap-1">
        {severities.map(sev => {
          const isActive = severity === sev;
          const sevColors = sev === 'all' ? null : getStatusColors(sev);
          
          return (
            <button
              key={sev}
              onClick={() => setSeverity(sev)}
              className={`
                px-3 py-1.5 rounded-full text-xs font-medium transition-all
                ${isActive 
                  ? sev === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : `${sevColors.bg} text-white`
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700'
                }
              `}
            >
              {sev === 'all' ? 'All' : sev.charAt(0).toUpperCase() + sev.slice(1)}
            </button>
          );
        })}
      </div>

      {/* Field Dropdown */}
      <select
        value={fieldId}
        onChange={(e) => setFieldId(e.target.value)}
        className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 
                   text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                   cursor-pointer hover:border-slate-500 transition-colors"
      >
        <option value="all">All Fields</option>
        {fieldIds.map(id => (
          <option key={id} value={id}>
            {id.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </option>
        ))}
      </select>

      {/* Clear filters */}
      {(search || severity !== 'all' || fieldId !== 'all') && (
        <button
          onClick={() => {
            setSearch('');
            setSeverity('all');
            setFieldId('all');
          }}
          className="text-sm text-slate-400 hover:text-white transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  );
}
