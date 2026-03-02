import { useState } from 'react';
import { getStatusColors } from '../styles/tokens';

/**
 * AlertGroup - collapsible accordion for grouping alerts by severity
 * 
 * @param {object} props
 * @param {string} props.severity - 'critical' | 'warning' | 'info'
 * @param {number} props.count - Number of alerts in this group
 * @param {boolean} [props.defaultExpanded] - Start expanded (true for critical)
 * @param {React.ReactNode} props.children - Alert cards to render
 */
export default function AlertGroup({ 
  severity, 
  count, 
  defaultExpanded = false, 
  children 
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const colors = getStatusColors(severity);

  if (count === 0) return null;

  return (
    <div className="mb-4">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`
          w-full flex items-center justify-between p-3 rounded-lg
          ${colors.bgSubtle} border ${colors.borderSubtle}
          hover:border-slate-500 transition-colors
        `}
      >
        <div className="flex items-center gap-3">
          {/* Expand/Collapse Icon */}
          <svg 
            className={`w-4 h-4 text-slate-400 transition-transform ${expanded ? 'rotate-90' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          
          {/* Severity Badge */}
          <span className={`font-semibold uppercase text-sm ${colors.text}`}>
            {severity}
          </span>
        </div>
        
        {/* Count Badge */}
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${colors.bg} text-white`}>
          {count}
        </span>
      </button>

      {/* Content */}
      {expanded && (
        <div className="mt-2 space-y-2 pl-4 border-l-2 border-slate-700 ml-2">
          {children}
        </div>
      )}
    </div>
  );
}
