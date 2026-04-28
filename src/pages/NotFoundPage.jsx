import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * NotFoundPage — 404 page displayed for unmatched routes.
 * Shows a message and a link back to the Well List.
 *
 * @returns {React.ReactElement}
 */
function NotFoundPage() {
  const navigate = useNavigate();

  const handleBackToList = useCallback(() => {
    navigate('/');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-surface-primary">
      <div className="mx-auto max-w-9xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="animate-fade-in">
          <div className="rounded-xl border border-dark-700 bg-surface-elevated shadow-well px-6 py-16 text-center">
            {/* Icon */}
            <div className="mb-6 flex items-center justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface-overlay">
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
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* Error Code */}
            <h1 className="mb-2 text-5xl font-bold text-dark-200">404</h1>

            {/* Heading */}
            <h2 className="mb-2 text-lg font-semibold text-dark-100">
              Page Not Found
            </h2>

            {/* Description */}
            <p className="mb-8 mx-auto max-w-sm text-sm text-dark-400">
              The page you are looking for does not exist or has been moved. Please check the URL or navigate back to the Well List.
            </p>

            {/* Back button */}
            <button
              className="btn-primary inline-flex items-center gap-2 text-sm"
              onClick={handleBackToList}
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
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Back to Well List
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;