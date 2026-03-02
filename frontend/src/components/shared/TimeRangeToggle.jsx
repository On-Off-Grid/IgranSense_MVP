/**
 * TimeRangeToggle - toggle buttons for selecting time range
 * 
 * @param {object} props
 * @param {number} props.value - Currently selected range in days
 * @param {function} props.onChange - Callback: (days) => void
 * @param {Array<number>} [props.options] - Available options (default: [7, 30, 90])
 */
export default function TimeRangeToggle({ 
  value, 
  onChange, 
  options = [7, 30, 90] 
}) {
  return (
    <div className="inline-flex rounded-lg border border-slate-700 overflow-hidden">
      {options.map((days, index) => (
        <button
          key={days}
          onClick={() => onChange(days)}
          className={`
            px-4 py-1.5 text-sm font-medium transition-colors
            ${value === days 
              ? 'bg-blue-600 text-white' 
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
            }
            ${index > 0 ? 'border-l border-slate-700' : ''}
          `}
        >
          {days}D
        </button>
      ))}
    </div>
  );
}
