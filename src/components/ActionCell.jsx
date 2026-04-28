import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

/**
 * ActionCell — renders action buttons for a well row in the well list table.
 *
 * - Edit button: always visible, navigates to the well edit page.
 * - Activate button: visible only for non-active wells, triggers onActivate callback.
 * - View Details button: visible only for active wells, navigates to the well detail page.
 *
 * @param {{ well: Object, onActivate: (id: string) => void }} props
 * @returns {React.ReactElement}
 */
function ActionCell({ well, onActivate }) {
  const navigate = useNavigate();

  const handleEdit = useCallback(() => {
    navigate(`/wells/${well.id}/edit`);
  }, [navigate, well.id]);

  const handleViewDetails = useCallback(() => {
    navigate(`/wells/${well.id}`);
  }, [navigate, well.id]);

  const handleActivate = useCallback(() => {
    if (onActivate && typeof onActivate === 'function') {
      onActivate(well.id);
    }
  }, [onActivate, well.id]);

  return (
    <div className="flex items-center gap-2">
      {/* Edit Button — always visible */}
      <button
        aria-label={`Edit ${well.wellName}`}
        className="inline-flex items-center justify-center rounded-md p-1.5 text-dark-400 hover:text-well-green hover:bg-surface-overlay transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-well-green"
        onClick={handleEdit}
        title="Edit well"
        type="button"
      >
        <svg
          aria-hidden="true"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Activate Button — visible only for non-active wells */}
      {!well.isActive && (
        <button
          aria-label={`Activate ${well.wellName}`}
          className="inline-flex items-center justify-center rounded-md px-2.5 py-1 text-xs font-medium text-well-green bg-well-green/10 border border-well-green/30 hover:bg-well-green/20 transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-well-green"
          onClick={handleActivate}
          title="Activate well"
          type="button"
        >
          Activate
        </button>
      )}

      {/* View Details Button — visible only for active wells */}
      {well.isActive && (
        <button
          aria-label={`View details for ${well.wellName}`}
          className="inline-flex items-center justify-center rounded-md p-1.5 text-dark-400 hover:text-well-info hover:bg-surface-overlay transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-well-info"
          onClick={handleViewDetails}
          title="View details"
          type="button"
        >
          <svg
            aria-hidden="true"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

ActionCell.propTypes = {
  onActivate: PropTypes.func.isRequired,
  well: PropTypes.shape({
    id: PropTypes.string.isRequired,
    isActive: PropTypes.bool.isRequired,
    wellName: PropTypes.string.isRequired,
  }).isRequired,
};

export default ActionCell;