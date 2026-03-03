import { getStatusColors } from '../styles/tokens';

/**
 * Severity icon mapping (emoji).
 */
const SEVERITY_ICON = {
  critical: '🔴',
  warning: '🟡',
  info: 'ℹ️',
};

/**
 * RecommendationExplainer — "Why this recommendation?" panel
 *
 * Renders the field recommendation followed by a bulleted list of
 * rule triggers colored by severity.
 *
 * @param {object} props
 * @param {string} props.recommendation - The field-level recommendation text
 * @param {Array} props.triggers - List of rule trigger objects from the API
 */
export default function RecommendationExplainer({ recommendation, triggers = [] }) {
  if (!triggers.length && !recommendation) return null;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4" data-testid="recommendation-explainer">
      <h3 className="text-sm font-medium text-slate-300 mb-2">
        Why this recommendation?
      </h3>
      {recommendation && (
        <p className="text-sm text-white mb-3">{recommendation}</p>
      )}
      {triggers.length > 0 && (
        <ul className="space-y-1.5">
          {triggers.map((t, i) => {
            const sc = getStatusColors(t.severity);
            return (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="shrink-0">{SEVERITY_ICON[t.severity] || '•'}</span>
                <span className={sc.text}>
                  {t.message}
                  <span className="ml-2 text-xs text-slate-500">
                    ({t.rule_type}: actual {t.actual_value}, threshold {t.threshold})
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
