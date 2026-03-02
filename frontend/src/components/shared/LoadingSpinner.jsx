/**
 * Reusable loading spinner component
 * @param {object} props
 * @param {'sm' | 'md' | 'lg'} [props.size='md'] - Spinner size
 * @param {string} [props.text] - Optional loading text
 * @param {boolean} [props.fullHeight=false] - Center vertically in full height container
 * @param {string} [props.className] - Additional CSS classes
 */
export default function LoadingSpinner({ 
  size = 'md', 
  text,
  fullHeight = false,
  className = ''
}) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const containerClasses = fullHeight 
    ? 'flex flex-col items-center justify-center h-96'
    : 'flex flex-col items-center justify-center';

  return (
    <div className={`${containerClasses} ${className}`}>
      <div 
        className={`${sizeClasses[size]} border-slate-600 border-t-green-500 rounded-full animate-spin`}
      />
      {text && (
        <p className={`text-slate-400 mt-3 ${textSizes[size]}`}>{text}</p>
      )}
    </div>
  );
}
