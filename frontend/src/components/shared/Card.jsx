import { cardClasses, cardHoverClasses } from '../../styles/tokens';

/**
 * Reusable card component with consistent styling
 * @param {object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} [props.title] - Optional card title
 * @param {boolean} [props.hoverable=false] - Enable hover effect
 * @param {boolean} [props.clickable=false] - Make card clickable (implies hoverable)
 * @param {function} [props.onClick] - Click handler
 * @param {'sm' | 'md' | 'lg'} [props.padding='md'] - Padding size
 * @param {string} [props.className] - Additional CSS classes
 */
export default function Card({ 
  children, 
  title,
  hoverable = false,
  clickable = false,
  onClick,
  padding = 'md',
  className = ''
}) {
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const baseClasses = clickable || hoverable ? cardHoverClasses : cardClasses;

  const handleClick = () => {
    if (clickable && onClick) {
      onClick();
    }
  };

  const handleKeyDown = (e) => {
    if (clickable && onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div 
      className={`${baseClasses} ${paddingClasses[padding]} ${className}`}
      onClick={handleClick}
      onKeyDown={clickable ? handleKeyDown : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      {title && (
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      )}
      {children}
    </div>
  );
}
