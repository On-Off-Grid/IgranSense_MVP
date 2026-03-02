import { getStatusColors } from '../../styles/tokens';

/**
 * Reusable status badge component
 * @param {object} props
 * @param {'ok' | 'warning' | 'critical' | 'info' | 'offline'} props.status - Status type
 * @param {string} [props.label] - Optional custom label (defaults to status name)
 * @param {'sm' | 'md' | 'lg'} [props.size='md'] - Badge size
 * @param {'pill' | 'dot' | 'banner'} [props.variant='pill'] - Badge style variant
 * @param {string} [props.className] - Additional CSS classes
 */
export default function StatusBadge({ 
  status, 
  label,
  size = 'md',
  variant = 'pill',
  className = ''
}) {
  const statusColors = getStatusColors(status);
  const displayLabel = label || status?.toUpperCase() || 'UNKNOWN';

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  const dotSizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  if (variant === 'dot') {
    return (
      <span 
        className={`${dotSizes[size]} rounded-full ${statusColors.bg} ${className}`}
        title={displayLabel}
      />
    );
  }

  if (variant === 'banner') {
    return (
      <div className={`rounded-lg p-4 border-l-4 ${statusColors.bgSubtle} ${statusColors.border} ${statusColors.text} ${className}`}>
        <span className="font-semibold uppercase text-sm">{displayLabel}</span>
      </div>
    );
  }

  // Default: pill variant
  return (
    <span 
      className={`inline-flex items-center font-semibold uppercase rounded ${statusColors.bg} text-white ${sizeClasses[size]} ${className}`}
    >
      {displayLabel}
    </span>
  );
}
