/**
 * WeatherIcon — maps weather condition strings to emoji icons.
 *
 * @param {object} props
 * @param {string} props.conditions - "sunny" | "partly_cloudy" | "cloudy" | "rainy"
 * @param {string} [props.size='text-2xl'] - Tailwind text-size class
 */
const CONDITION_MAP = {
  sunny:         { icon: '☀️', label: 'Sunny' },
  partly_cloudy: { icon: '⛅', label: 'Partly Cloudy' },
  cloudy:        { icon: '☁️', label: 'Cloudy' },
  rainy:         { icon: '🌧️', label: 'Rainy' },
  stormy:        { icon: '⛈️', label: 'Stormy' },
  windy:         { icon: '💨', label: 'Windy' },
  snow:          { icon: '❄️', label: 'Snow' },
};

export default function WeatherIcon({ conditions, size = 'text-2xl' }) {
  const entry = CONDITION_MAP[conditions] || { icon: '🌤️', label: conditions };
  return (
    <span className={size} role="img" aria-label={entry.label} title={entry.label}>
      {entry.icon}
    </span>
  );
}
