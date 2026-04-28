import { useCallback } from 'react';
import PropTypes from 'prop-types';
import usePagination from '../hooks/usePagination.js';
import { PAGE_SIZE_OPTIONS } from '../utils/constants.js';

/**
 * PaginationControls — renders pagination UI at the bottom of the well list table.
 *
 * Displays:
 * - Entry count: "Showing X to Y of Z entries"
 * - Page size dropdown (10/25/50)
 * - Navigation controls: First, Previous, numbered page buttons, Next, Last
 *
 * Active page number is highlighted with a dark background per design spec.
 * Buttons are disabled when not applicable (e.g., Previous on first page).
 *
 * @param {{
 *   totalItems: number,
 *   pageSize: number,
 *   currentPage: number,
 *   onPageChange: (page: number) => void,
 *   onPageSizeChange: (pageSize: number) => void,
 * }} props
 * @returns {React.ReactElement}
 */
function PaginationControls({ totalItems, pageSize, currentPage, onPageChange, onPageSizeChange }) {
  const {
    currentPage: safePage,
    totalPages,
    pageNumbers,
    goToFirst,
    goToLast,
    goToNext,
    goToPrev,
    goToPage,
    startIndex,
    endIndex,
    isFirstPage,
    isLastPage,
  } = usePagination({
    totalItems,
    pageSize,
    currentPage,
    onPageChange,
  });

  const handlePageSizeChange = useCallback(
    (e) => {
      const newSize = Number(e.target.value);
      if (!isNaN(newSize) && newSize > 0) {
        onPageSizeChange(newSize);
      }
    },
    [onPageSizeChange]
  );

  const showingFrom = totalItems > 0 ? startIndex + 1 : 0;
  const showingTo = endIndex;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-dark-700 bg-surface-elevated">
      {/* Entry count and page size */}
      <div className="flex items-center gap-4">
        <span className="text-xs text-dark-400">
          Showing{' '}
          <span className="font-medium text-dark-200">{showingFrom}</span>
          {' '}to{' '}
          <span className="font-medium text-dark-200">{showingTo}</span>
          {' '}of{' '}
          <span className="font-medium text-dark-200">{totalItems}</span>
          {' '}entries
        </span>

        <div className="flex items-center gap-2">
          <label className="text-xs text-dark-400" htmlFor="page-size-select">
            Rows:
          </label>
          <select
            className="rounded-md border border-dark-700 bg-surface-tertiary px-2 py-1 text-xs text-dark-100 focus:border-well-green focus:outline-none focus:ring-1 focus:ring-well-green transition-colors duration-200"
            id="page-size-select"
            onChange={handlePageSizeChange}
            value={pageSize}
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Navigation controls */}
      <div className="flex items-center gap-1">
        {/* First */}
        <button
          aria-label="Go to first page"
          className="inline-flex items-center justify-center rounded-md px-2 py-1 text-xs font-medium text-dark-400 hover:text-dark-100 hover:bg-surface-overlay transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-dark-400 focus:outline-none focus:ring-1 focus:ring-well-green"
          disabled={isFirstPage}
          onClick={goToFirst}
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
              d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Previous */}
        <button
          aria-label="Go to previous page"
          className="inline-flex items-center justify-center rounded-md px-2 py-1 text-xs font-medium text-dark-400 hover:text-dark-100 hover:bg-surface-overlay transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-dark-400 focus:outline-none focus:ring-1 focus:ring-well-green"
          disabled={isFirstPage}
          onClick={goToPrev}
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
              d="M15.75 19.5L8.25 12l7.5-7.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Page numbers */}
        {pageNumbers.map((pageNum) => (
          <button
            key={pageNum}
            aria-current={pageNum === safePage ? 'page' : undefined}
            aria-label={`Go to page ${pageNum}`}
            className={`inline-flex items-center justify-center rounded-md min-w-[28px] px-2 py-1 text-xs font-medium transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-well-green ${
              pageNum === safePage
                ? 'bg-dark-900 text-dark-100 border border-dark-600'
                : 'text-dark-400 hover:text-dark-100 hover:bg-surface-overlay'
            }`}
            onClick={() => goToPage(pageNum)}
            type="button"
          >
            {pageNum}
          </button>
        ))}

        {/* Next */}
        <button
          aria-label="Go to next page"
          className="inline-flex items-center justify-center rounded-md px-2 py-1 text-xs font-medium text-dark-400 hover:text-dark-100 hover:bg-surface-overlay transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-dark-400 focus:outline-none focus:ring-1 focus:ring-well-green"
          disabled={isLastPage}
          onClick={goToNext}
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
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Last */}
        <button
          aria-label="Go to last page"
          className="inline-flex items-center justify-center rounded-md px-2 py-1 text-xs font-medium text-dark-400 hover:text-dark-100 hover:bg-surface-overlay transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-dark-400 focus:outline-none focus:ring-1 focus:ring-well-green"
          disabled={isLastPage}
          onClick={goToLast}
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
              d="M5.25 4.5l7.5 7.5-7.5 7.5m6-15l7.5 7.5-7.5 7.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

PaginationControls.propTypes = {
  currentPage: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onPageSizeChange: PropTypes.func.isRequired,
  pageSize: PropTypes.number.isRequired,
  totalItems: PropTypes.number.isRequired,
};

export default PaginationControls;