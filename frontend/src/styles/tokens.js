/**
 * Design tokens for IgranSense dashboard
 * Centralizes color definitions and common Tailwind class patterns
 */

export const colors = {
  status: {
    ok: {
      bg: 'bg-green-500',
      bgSubtle: 'bg-green-500/10',
      text: 'text-green-400',
      textBold: 'text-green-500',
      border: 'border-green-500',
      borderSubtle: 'border-green-500/30',
      hex: '#22c55e',
    },
    warning: {
      bg: 'bg-orange-500',
      bgSubtle: 'bg-orange-500/10',
      text: 'text-orange-400',
      textBold: 'text-orange-500',
      border: 'border-orange-500',
      borderSubtle: 'border-orange-500/30',
      hex: '#f97316',
    },
    critical: {
      bg: 'bg-red-500',
      bgSubtle: 'bg-red-500/10',
      text: 'text-red-400',
      textBold: 'text-red-500',
      border: 'border-red-500',
      borderSubtle: 'border-red-500/30',
      hex: '#ef4444',
    },
    info: {
      bg: 'bg-blue-500',
      bgSubtle: 'bg-blue-500/10',
      text: 'text-blue-400',
      textBold: 'text-blue-500',
      border: 'border-blue-500',
      borderSubtle: 'border-blue-500/30',
      hex: '#3b82f6',
    },
    offline: {
      bg: 'bg-gray-500',
      bgSubtle: 'bg-gray-500/10',
      text: 'text-gray-400',
      textBold: 'text-gray-500',
      border: 'border-gray-500',
      borderSubtle: 'border-gray-500/30',
      hex: '#6b7280',
    },
  },
  surface: {
    card: 'bg-slate-800',
    cardHover: 'hover:bg-slate-700',
    border: 'border-slate-700',
    borderHover: 'hover:border-slate-500',
    background: 'bg-slate-900',
  },
  text: {
    primary: 'text-white',
    secondary: 'text-slate-400',
    muted: 'text-slate-500',
  },
};

/**
 * Get status color classes based on status string
 * @param {string} status - 'ok' | 'warning' | 'critical' | 'info' | 'offline'
 * @returns {object} Color token object
 */
export function getStatusColors(status) {
  return colors.status[status] || colors.status.offline;
}

/**
 * Common card class string
 */
export const cardClasses = `${colors.surface.card} rounded-lg border ${colors.surface.border}`;

/**
 * Common card with hover class string
 */
export const cardHoverClasses = `${cardClasses} cursor-pointer ${colors.surface.borderHover} transition-colors`;

/**
 * Chart tooltip style object (for Recharts)
 */
export const chartTooltipStyle = {
  backgroundColor: '#1e293b',
  border: '1px solid #475569',
  borderRadius: '8px',
  color: '#f8fafc',
};

/**
 * Chart axis tick style (for Recharts)
 */
export const chartAxisStyle = {
  fill: '#94a3b8',
  fontSize: 12,
};

/**
 * Chart grid stroke color
 */
export const chartGridStroke = '#334155';

/**
 * Surface styles (convenience export)
 */
export const SURFACE = {
  card: 'bg-slate-800',
  panel: 'bg-slate-900',
  border: 'border-slate-700',
};

/**
 * Chart configuration (for Recharts)
 */
export const CHART_CONFIG = {
  axis: {
    tick: '#94a3b8',
    line: '#334155',
  },
  tooltip: {
    bg: '#1e293b',
    border: '#475569',
  },
};

export default colors;
