// ErrorBanner component

/**
 * Reusable error banner component
 * @param {object} props
 * @param {string} props.message - Error message to display
 * @param {string} [props.details] - Optional additional details (e.g., technical info)
 * @param {function} [props.onRetry] - Optional retry callback
 * @param {'error' | 'warning' | 'info'} [props.variant='error'] - Banner type
 * @param {string} [props.className] - Additional CSS classes
 */
export default function ErrorBanner({ 
  message, 
  details,
  onRetry,
  variant = 'error',
  className = ''
}) {
  const variantStyles = {
    error: {
      bg: 'bg-red-900/20',
      border: 'border-red-500',
      text: 'text-red-400',
      buttonBg: 'bg-red-500 hover:bg-red-600',
    },
    warning: {
      bg: 'bg-orange-900/20',
      border: 'border-orange-500',
      text: 'text-orange-400',
      buttonBg: 'bg-orange-500 hover:bg-orange-600',
    },
    info: {
      bg: 'bg-blue-900/20',
      border: 'border-blue-500',
      text: 'text-blue-400',
      buttonBg: 'bg-blue-500 hover:bg-blue-600',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className={`${styles.bg} border ${styles.border} rounded-lg p-4 ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className={`${styles.text} font-medium`}>
            {variant === 'error' ? 'Error: ' : ''}{message}
          </p>
          {details && (
            <p className="text-slate-400 text-sm mt-2">{details}</p>
          )}
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className={`${styles.buttonBg} text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors`}
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
