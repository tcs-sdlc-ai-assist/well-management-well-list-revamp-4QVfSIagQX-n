import { useCallback, useState } from 'react';
import { useWellContext } from '../context/WellContext.jsx';
import WellListHeader from '../components/WellListHeader.jsx';
import WellTable from '../components/WellTable.jsx';
import ActivationModal from '../components/ActivationModal.jsx';
import Toast from '../components/Toast.jsx';

/**
 * Generates a unique ID for toast notifications.
 * @returns {string}
 */
function generateToastId() {
  return `toast-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * WellListPage — main container page for the Well List view.
 *
 * Orchestrates the overall layout and data flow:
 * - Renders WellListHeader with action buttons.
 * - Renders WellTable (which internally handles EmptyState, filtering, sorting, pagination).
 * - Manages ActivationModal open/close state and activation workflow.
 * - Manages Toast notifications for success/error feedback.
 *
 * This is the primary route component for '/'.
 *
 * @returns {React.ReactElement}
 */
function WellListPage() {
  const { wells, activateWell, getActiveWell } = useWellContext();

  const [modalOpen, setModalOpen] = useState(false);
  const [targetWell, setTargetWell] = useState(null);
  const [currentActiveWell, setCurrentActiveWell] = useState(null);
  const [toasts, setToasts] = useState([]);

  /**
   * Adds a toast notification to the stack.
   * @param {string} message - The message to display.
   * @param {'success'|'error'} variant - The toast variant.
   */
  const addToast = useCallback((message, variant = 'success') => {
    const id = generateToastId();
    setToasts((prev) => [...prev, { id, message, variant }]);
  }, []);

  /**
   * Dismisses a toast notification by id.
   * @param {string} id - The toast id to dismiss.
   */
  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /**
   * Handles the activate action from ActionCell.
   * Finds the target well and any currently active well on the same rig,
   * then opens the ActivationModal for confirmation.
   *
   * @param {string} wellId - The unique id of the well to activate.
   */
  const handleActivate = useCallback(
    (wellId) => {
      const well = wells.find((w) => w.id === wellId);
      if (!well) {
        addToast('Well not found.', 'error');
        return;
      }

      const activeWell = getActiveWell(well.rig);

      setTargetWell(well);
      setCurrentActiveWell(activeWell && activeWell.id !== well.id ? activeWell : null);
      setModalOpen(true);
    },
    [wells, getActiveWell, addToast]
  );

  /**
   * Handles confirmation of well activation from the ActivationModal.
   * Calls activateWell from context, shows success/error toast, and closes modal.
   */
  const handleConfirmActivation = useCallback(() => {
    if (!targetWell) {
      return;
    }

    try {
      const result = activateWell(targetWell.id);

      if (result && result.success) {
        if (result.deactivatedWell) {
          addToast(
            `Well "${result.activatedWell.wellName}" activated. Well "${result.deactivatedWell.wellName}" deactivated.`,
            'success'
          );
        } else {
          addToast(`Well "${result.activatedWell.wellName}" activated successfully.`, 'success');
        }
      }
    } catch (error) {
      addToast(error.message || 'Failed to activate well. Please try again.', 'error');
    } finally {
      setModalOpen(false);
      setTargetWell(null);
      setCurrentActiveWell(null);
    }
  }, [targetWell, activateWell, addToast]);

  /**
   * Handles cancellation/close of the ActivationModal.
   */
  const handleCancelActivation = useCallback(() => {
    setModalOpen(false);
    setTargetWell(null);
    setCurrentActiveWell(null);
  }, []);

  return (
    <div className="min-h-screen bg-surface-primary">
      <div className="mx-auto max-w-9xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Page Header */}
        <WellListHeader />

        {/* Well Table (includes EmptyState, filtering, sorting, pagination) */}
        <WellTable onActivate={handleActivate} />

        {/* Activation Confirmation Modal */}
        <ActivationModal
          currentActiveWell={currentActiveWell}
          isOpen={modalOpen}
          onCancel={handleCancelActivation}
          onConfirm={handleConfirmActivation}
          well={targetWell}
        />

        {/* Toast Notifications */}
        <Toast
          onDismiss={dismissToast}
          toasts={toasts}
        />
      </div>
    </div>
  );
}

export default WellListPage;