import PropTypes from 'prop-types';
import { STATUS_ACTIVE, STATUS_IDLE, BADGE_STYLES, STATUS_COLORS } from '../utils/constants.js';

/**
 * StatusBadge — renders an active/idle status indicator badge.
 * For active wells, displays a green badge with pulse animation.
 * Returns null for non-active (idle) wells.
 *
 * @param {{ isActive: boolean }} props
 * @returns {React.ReactElement|null}
 */
function StatusBadge({ isActive }) {
  if (!isActive) {
    return null;
  }

  const status = STATUS_ACTIVE;
  const colors = STATUS_COLORS[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${colors.bg} ${colors.text} border ${colors.border}`}
    >
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full ${colors.dot} animate-pulse-active`}
      />
      {status}
    </span>
  );
}

StatusBadge.propTypes = {
  isActive: PropTypes.bool.isRequired,
};

export default StatusBadge;