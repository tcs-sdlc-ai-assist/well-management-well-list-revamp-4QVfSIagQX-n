import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * WellListHeader — page header for the Well List page.
 *
 * Left side: title ('Well Management') and subtitle ('Well List').
 * Right side: 'Create Sidetrack Well' button (disabled placeholder) and
 * 'Create New Well' button (navigates to /wells/create).
 *
 * Styled to match Well.png header layout with dark theme.
 *
 * @returns {React.ReactElement}
 */
function WellListHeader() {
  const navigate = useNavigate();

  const handleCreateNewWell = useCallback(() => {
    navigate('/wells/new');
  }, [navigate]);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 animate-fade-in">
      {/* Left side — Title and subtitle */}
      <div>
        <h1 className="text-2xl font-semibold text-dark-100 tracking-tight">
          Well Management
        </h1>
        <p className="mt-1 text-sm text-dark-400">
          Well List
        </p>
      </div>

      {/* Right side — Action buttons */}
      <div className="flex items-center gap-3">
        {/* Create Sidetrack Well — disabled placeholder for future story */}
        <button
          aria-label="Create Sidetrack Well"
          className="btn-secondary inline-flex items-center gap-2 text-sm opacity-50 cursor-not-allowed"
          disabled
          title="Create Sidetrack Well (coming soon)"
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
              d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Create Sidetrack Well
        </button>

        {/* Create New Well — navigates to /wells/new */}
        <button
          aria-label="Create New Well"
          className="btn-primary inline-flex items-center gap-2 text-sm"
          onClick={handleCreateNewWell}
          title="Create New Well"
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
          Create New Well
        </button>
      </div>
    </div>
  );
}

export default WellListHeader;