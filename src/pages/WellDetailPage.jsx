import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

/**
 * WellDetailPage — placeholder page for the Well Detail view.
 *
 * Displays the well ID from route params and a message indicating
 * the detail view is under development.
 *
 * Route: /wells/:id (also /wells/:id/details)
 *
 * @returns {React.ReactElement}
 */
function WellDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleBackToList = useCallback(() => {
    navigate('/');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-surface-primary">
      <div className="mx-auto max-w-9xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="animate-fade-in">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-dark-100 tracking-tight">
              Well Details
            </h1>
            <p className="mt-1 text-sm text-dark-400">
              Viewing details for well
            </p>
          </div>

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
                    d="M11.42 15.17l-5.1-5.1m0 0L11.42 4.97m-5.1 5.1h13.36M4.93 19.93l14.14-14.14"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* Well ID */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-dark-700 bg-surface-tertiary px-4 py-2">
              <span className="text-xs font-medium text-dark-400">Well ID:</span>
              <span className="text-sm font-mono font-medium text-dark-100">{id}</span>
            </div>

            {/* Heading */}
            <h2 className="mb-2 text-lg font-semibold text-dark-100">
              Under Development
            </h2>

            {/* Description */}
            <p className="mb-8 mx-auto max-w-sm text-sm text-dark-400">
              The Well Detail view is currently under development and will be available in a future release.
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

export default WellDetailPage;