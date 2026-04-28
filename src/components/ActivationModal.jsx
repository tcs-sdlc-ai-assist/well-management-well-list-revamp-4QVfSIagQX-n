import { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * ActivationModal — confirmation dialog for well activation.
 *
 * Shows well info and contextual messaging:
 * - If no well is currently active on the rig, shows target well info with activation message.
 * - If a well is already active on the rig, shows new well info (green box) and current active
 *   well info (red box) with replacement message.
 *
 * On confirm, calls onConfirm callback and closes.
 * Styled as a centered modal overlay matching the dark theme.
 *
 * @param {{
 *   isOpen: boolean,
 *   well: Object|null,
 *   currentActiveWell: Object|null,
 *   onConfirm: () => void,
 *   onCancel: () => void,
 * }} props
 * @returns {React.ReactElement|null}
 */
function ActivationModal({ isOpen, well, currentActiveWell, onConfirm, onCancel }) {
  const modalRef = useRef(null);
  const confirmButtonRef = useRef(null);

  useEffect(() => {
    if (isOpen && confirmButtonRef.current) {
      confirmButtonRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onCancel]);

  const handleOverlayClick = useCallback(
    (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onCancel();
      }
    },
    [onCancel]
  );

  const handleConfirm = useCallback(() => {
    if (onConfirm && typeof onConfirm === 'function') {
      onConfirm();
    }
  }, [onConfirm]);

  if (!isOpen || !well) {
    return null;
  }

  const hasActiveWell = currentActiveWell !== null && currentActiveWell !== undefined;

  return (
    <div
      aria-labelledby="activation-modal-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={handleOverlayClick}
      role="dialog"
    >
      <div
        ref={modalRef}
        className="w-full max-w-md rounded-xl border border-dark-700 bg-surface-elevated shadow-well-lg animate-slide-up mx-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-dark-700 px-6 py-4">
          <h2
            className="text-lg font-semibold text-dark-100"
            id="activation-modal-title"
          >
            Confirm Activation
          </h2>
          <button
            aria-label="Close modal"
            className="rounded-md p-1 text-dark-400 hover:text-dark-200 hover:bg-surface-overlay transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-well-green"
            onClick={onCancel}
            type="button"
          >
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 18L18 6M6 6l12 12"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {hasActiveWell ? (
            <>
              <p className="text-sm text-dark-300">
                Activating this well will deactivate the currently active well on rig{' '}
                <span className="font-medium text-dark-100">{well.rig}</span>.
              </p>

              {/* New well to activate — green box */}
              <div className="rounded-lg border border-well-green/30 bg-well-green/10 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 rounded-full bg-well-active"
                  />
                  <span className="text-xs font-semibold uppercase tracking-wide text-well-green">
                    Will be activated
                  </span>
                </div>
                <p className="text-sm font-medium text-dark-100">{well.wellName}</p>
                <p className="text-xs text-dark-400 mt-0.5">
                  Well ID: {well.wellId}
                </p>
              </div>

              {/* Current active well — red box */}
              <div className="rounded-lg border border-well-danger/30 bg-well-danger/10 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 rounded-full bg-well-danger"
                  />
                  <span className="text-xs font-semibold uppercase tracking-wide text-well-danger">
                    Will be deactivated
                  </span>
                </div>
                <p className="text-sm font-medium text-dark-100">{currentActiveWell.wellName}</p>
                <p className="text-xs text-dark-400 mt-0.5">
                  Well ID: {currentActiveWell.wellId}
                </p>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-dark-300">
                Are you sure you want to activate the following well on rig{' '}
                <span className="font-medium text-dark-100">{well.rig}</span>?
              </p>

              {/* Target well info — green box */}
              <div className="rounded-lg border border-well-green/30 bg-well-green/10 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 rounded-full bg-well-active"
                  />
                  <span className="text-xs font-semibold uppercase tracking-wide text-well-green">
                    Will be activated
                  </span>
                </div>
                <p className="text-sm font-medium text-dark-100">{well.wellName}</p>
                <p className="text-xs text-dark-400 mt-0.5">
                  Well ID: {well.wellId}
                </p>
              </div>

              <p className="text-xs text-dark-500">
                No well is currently active on this rig.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-dark-700 px-6 py-4">
          <button
            className="btn-secondary text-sm"
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            ref={confirmButtonRef}
            className="btn-primary text-sm"
            onClick={handleConfirm}
            type="button"
          >
            Confirm Activation
          </button>
        </div>
      </div>
    </div>
  );
}

ActivationModal.propTypes = {
  currentActiveWell: PropTypes.shape({
    id: PropTypes.string.isRequired,
    wellId: PropTypes.string.isRequired,
    wellName: PropTypes.string.isRequired,
  }),
  isOpen: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  well: PropTypes.shape({
    id: PropTypes.string.isRequired,
    rig: PropTypes.string.isRequired,
    wellId: PropTypes.string.isRequired,
    wellName: PropTypes.string.isRequired,
  }),
};

ActivationModal.defaultProps = {
  currentActiveWell: null,
  well: null,
};

export default ActivationModal;