import { useState } from 'react';

/**
 * StatusFilter - dropdown + search for filtering fields
 * 
 * @param {object} props
 * @param {function} props.onFilterChange - Callback: ({ status, query }) => void
 * @param {string} [props.className] - Additional classes
 */
export default function StatusFilter({ onFilterChange, className = '' }) {
  const [status, setStatus] = useState('all');
  const [query, setQuery] = useState('');

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    onFilterChange({ status: newStatus, query });
  };

  const handleQueryChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    onFilterChange({ status, query: newQuery });
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'critical', label: '🔴 Critical' },
    { value: 'warning', label: '🟠 Warning' },
    { value: 'ok', label: '🟢 OK' },
  ];

  return (
    <div className={`flex flex-wrap items-center gap-3 mb-4 ${className}`}>
      {/* Status Dropdown */}
      <select
        value={status}
        onChange={handleStatusChange}
        className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 
                   text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                   cursor-pointer hover:border-slate-500 transition-colors"
      >
        {statusOptions.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <input
          type="text"
          value={query}
          onChange={handleQueryChange}
          placeholder="Search fields..."
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

      {/* Clear filters button */}
      {(status !== 'all' || query) && (
        <button
          onClick={() => {
            setStatus('all');
            setQuery('');
            onFilterChange({ status: 'all', query: '' });
          }}
          className="text-sm text-slate-400 hover:text-white transition-colors"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
