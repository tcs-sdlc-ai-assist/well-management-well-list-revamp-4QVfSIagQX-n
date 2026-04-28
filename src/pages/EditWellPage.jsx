import { useCallback, useState } from 'react';
import WellEditForm from '../components/WellEditForm.jsx';
import Toast from '../components/Toast.jsx';

/**
 * Generates a unique ID for toast notifications.
 * @returns {string}
 */
function generateToastId() {
  return `toast-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * EditWellPage — page wrapper for the Edit Well flow.
 *
 * Reads well ID from route params (handled internally by WellEditForm via useParams),
 * fetches well data from context, and renders WellEditForm with pre-populated data.
 * Rig Setup section is collapsed by default, Well Setup section is expanded.
 * Manages toast notifications for success/error feedback.
 *
 * Route: /wells/:id/edit
 *
 * @returns {React.ReactElement}
 */
function EditWellPage() {
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
   * Handles success callback from WellEditForm.
   * @param {string} message - The success message.
   */
  const handleSuccess = useCallback(
    (message) => {
      addToast(message, 'success');
    },
    [addToast]
  );

  return (
    <div className="min-h-screen bg-surface-primary">
      <div className="mx-auto max-w-9xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Well Edit Form */}
        <WellEditForm onSuccess={handleSuccess} />

        {/* Toast Notifications */}
        <Toast
          onDismiss={dismissToast}
          toasts={toasts}
        />
      </div>
    </div>
  );
}

export default EditWellPage;