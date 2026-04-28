import { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

/**
 * @typedef {'success' | 'error'} ToastVariant
 */

/**
 * @typedef {Object} ToastMessage
 * @property {string} id - Unique identifier for the toast.
 * @property {string} message - The message to display.
 * @property {ToastVariant} variant - The toast variant (success or error).
 */

const DEFAULT_TIMEOUT = 4000;

const VARIANT_STYLES = {
  success: {
    container: 'border-well-green/30 bg-well-green/10',
    icon: 'text-well-green',
    text: 'text-well-green',
    closeHover: 'hover:text-well-green',
  },
  error: {
    container: 'border-well-danger/30 bg-well-danger/10',
    icon: 'text-well-danger',
    text: 'text-well-danger',
    closeHover: 'hover:text-well-danger',
  },
};

/**
 * SuccessIcon — renders a checkmark circle icon for success toasts.
 * @returns {React.ReactElement}
 */
function SuccessIcon() {
  return (
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
        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * ErrorIcon — renders an exclamation circle icon for error toasts.
 * @returns {React.ReactElement}
 */
function ErrorIcon() {
  return (
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
        d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * ToastItem — renders a single toast notification with auto-dismiss and close button.
 *
 * @param {{
 *   id: string,
 *   message: string,
 *   variant: ToastVariant,
 *   timeout: number,
 *   onDismiss: (id: string) => void,
 * }} props
 * @returns {React.ReactElement}
 */
function ToastItem({ id, message, variant, timeout, onDismiss }) {
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef(null);

  const styles = VARIANT_STYLES[variant] || VARIANT_STYLES.success;

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss(id);
    }, 200);
  }, [id, onDismiss]);

  useEffect(() => {
    requestAnimationFrame(() => {
      setIsVisible(true);
    });

    timerRef.current = setTimeout(() => {
      handleDismiss();
    }, timeout);

    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, [handleDismiss, timeout]);

  return (
    <div
      aria-live="polite"
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 shadow-well-lg transition-all duration-200 ${styles.container} ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
      role="alert"
    >
      <span className={`mt-0.5 flex-shrink-0 ${styles.icon}`}>
        {variant === 'error' ? <ErrorIcon /> : <SuccessIcon />}
      </span>

      <p className={`flex-1 text-sm font-medium ${styles.text}`}>
        {message}
      </p>

      <button
        aria-label="Dismiss notification"
        className={`flex-shrink-0 rounded-md p-0.5 text-dark-400 ${styles.closeHover} transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-dark-500`}
        onClick={handleDismiss}
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
            d="M6 18L18 6M6 6l12 12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}

ToastItem.propTypes = {
  id: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  onDismiss: PropTypes.func.isRequired,
  timeout: PropTypes.number,
  variant: PropTypes.oneOf(['success', 'error']).isRequired,
};

ToastItem.defaultProps = {
  timeout: DEFAULT_TIMEOUT,
};

/**
 * Toast — container component that renders a stack of toast notifications.
 * Positioned fixed at the top-right of the viewport.
 * Supports success (green) and error (red) variants.
 * Each toast auto-dismisses after a configurable timeout.
 *
 * @param {{
 *   toasts: Array<ToastMessage>,
 *   onDismiss: (id: string) => void,
 *   timeout?: number,
 * }} props
 * @returns {React.ReactElement|null}
 */
function Toast({ toasts, onDismiss, timeout }) {
  if (!toasts || toasts.length === 0) {
    return null;
  }

  return (
    <div
      aria-label="Notifications"
      className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm"
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          id={toast.id}
          message={toast.message}
          onDismiss={onDismiss}
          timeout={timeout || DEFAULT_TIMEOUT}
          variant={toast.variant}
        />
      ))}
    </div>
  );
}

Toast.propTypes = {
  onDismiss: PropTypes.func.isRequired,
  timeout: PropTypes.number,
  toasts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired,
      variant: PropTypes.oneOf(['success', 'error']).isRequired,
    })
  ).isRequired,
};

Toast.defaultProps = {
  timeout: DEFAULT_TIMEOUT,
};

export default Toast;