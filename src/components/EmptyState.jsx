import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

/**
 * EmptyState — renders an empty state UI when no wells exist in the system.
 * Shows an icon, descriptive message, and a call-to-action button to create the first well.
 * Styled to match the dark theme.
 *
 * @param {{ onCreateWell?: () => void }} props
 * @returns {React.ReactElement}
 */
function EmptyState({ onCreateWell }) {
  const navigate = useNavigate();

  const handleCreateWell = useCallback(() => {
    if (onCreateWell && typeof onCreateWell === 'function') {
      onCreateWell();
    } else {
      navigate('/wells/new');
    }
  }, [onCreateWell, navigate]);

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dark-700 bg-surface-elevated px-6 py-16 text-center shadow-well animate-fade-in">
      {/* Icon */}
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-surface-overlay">
        <svg
          aria-hidden="true"
          className="h-10 w-10 text-dark-500"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Heading */}
      <h3 className="mb-2 text-lg font-semibold text-dark-100">
        No wells found
      </h3>

      {/* Description */}
      <p className="mb-8 max-w-sm text-sm text-dark-400">
        There are no wells in the system yet. Get started by creating your first well to begin managing your drilling operations.
      </p>

      {/* Call-to-action button */}
      <button
        className="btn-primary inline-flex items-center gap-2 text-sm"
        onClick={handleCreateWell}
        type="button"
      >
        <svg
          aria-hidden="true"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 4.5v15m7.5-7.5h-15"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Create First Well
      </button>
    </div>
  );
}

EmptyState.propTypes = {
  onCreateWell: PropTypes.func,
};

EmptyState.defaultProps = {
  onCreateWell: null,
};

export default EmptyState;