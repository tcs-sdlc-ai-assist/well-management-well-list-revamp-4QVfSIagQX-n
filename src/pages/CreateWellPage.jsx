import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WellSetupForm from '../components/WellSetupForm.jsx';
import Toast from '../components/Toast.jsx';

/**
 * Generates a unique ID for toast notifications.
 * @returns {string}
 */
function generateToastId() {
  return `toast-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * CreateWellPage — page wrapper for the Create New Well flow.
 *
 * Renders the WellSetupForm component and manages toast notifications
 * for success/error feedback.
 *
 * Route: /wells/create (also /wells/new)
 *
 * @returns {React.ReactElement}
 */
function CreateWellPage() {
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
   * Handles success callback from WellSetupForm.
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
        {/* Well Setup Form */}
        <WellSetupForm onSuccess={handleSuccess} />

        {/* Toast Notifications */}
        <Toast
          onDismiss={dismissToast}
          toasts={toasts}
        />
      </div>
    </div>
  );
}

export default CreateWellPage;