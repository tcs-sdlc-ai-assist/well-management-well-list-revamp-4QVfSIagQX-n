import { useCallback, useMemo } from 'react';

/**
 * @typedef {Object} PaginationResult
 * @property {number} currentPage - The current active page (1-indexed).
 * @property {number} totalPages - The total number of pages.
 * @property {number[]} pageNumbers - Array of page numbers for rendering.
 * @property {() => void} goToFirst - Navigate to the first page.
 * @property {() => void} goToLast - Navigate to the last page.
 * @property {() => void} goToNext - Navigate to the next page.
 * @property {() => void} goToPrev - Navigate to the previous page.
 * @property {(page: number) => void} goToPage - Navigate to a specific page.
 * @property {number} startIndex - The start index of items on the current page (0-indexed).
 * @property {number} endIndex - The end index of items on the current page (exclusive).
 * @property {boolean} isFirstPage - Whether the current page is the first page.
 * @property {boolean} isLastPage - Whether the current page is the last page.
 */

/**
 * Custom hook encapsulating pagination logic.
 * Accepts total items count, page size, current page, and a page setter callback.
 * Returns pagination state and navigation helpers.
 *
 * @param {Object} options
 * @param {number} options.totalItems - Total number of items to paginate.
 * @param {number} options.pageSize - Number of items per page.
 * @param {number} options.currentPage - The current active page (1-indexed).
 * @param {(page: number) => void} options.onPageChange - Callback to update the current page.
 * @returns {PaginationResult}
 */
function usePagination({ totalItems, pageSize, currentPage, onPageChange }) {
  const totalPages = useMemo(() => {
    if (totalItems <= 0 || pageSize <= 0) {
      return 1;
    }
    return Math.ceil(totalItems / pageSize);
  }, [totalItems, pageSize]);

  const safePage = useMemo(() => {
    if (currentPage < 1) {
      return 1;
    }
    if (currentPage > totalPages) {
      return totalPages;
    }
    return currentPage;
  }, [currentPage, totalPages]);

  const isFirstPage = safePage === 1;
  const isLastPage = safePage === totalPages;

  const startIndex = useMemo(() => {
    return (safePage - 1) * pageSize;
  }, [safePage, pageSize]);

  const endIndex = useMemo(() => {
    const end = safePage * pageSize;
    return totalItems > 0 ? Math.min(end, totalItems) : 0;
  }, [safePage, pageSize, totalItems]);

  const pageNumbers = useMemo(() => {
    const maxVisiblePages = 5;
    const pages = [];

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, safePage - Math.floor(maxVisiblePages / 2));
      let end = start + maxVisiblePages - 1;

      if (end > totalPages) {
        end = totalPages;
        start = Math.max(1, end - maxVisiblePages + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  }, [totalPages, safePage]);

  const goToPage = useCallback(
    (page) => {
      if (typeof page !== 'number' || isNaN(page)) {
        return;
      }
      const targetPage = Math.max(1, Math.min(page, totalPages));
      if (targetPage !== currentPage) {
        onPageChange(targetPage);
      }
    },
    [totalPages, currentPage, onPageChange]
  );

  const goToFirst = useCallback(() => {
    if (!isFirstPage) {
      onPageChange(1);
    }
  }, [isFirstPage, onPageChange]);

  const goToLast = useCallback(() => {
    if (!isLastPage) {
      onPageChange(totalPages);
    }
  }, [isLastPage, totalPages, onPageChange]);

  const goToNext = useCallback(() => {
    if (!isLastPage) {
      onPageChange(safePage + 1);
    }
  }, [isLastPage, safePage, onPageChange]);

  const goToPrev = useCallback(() => {
    if (!isFirstPage) {
      onPageChange(safePage - 1);
    }
  }, [isFirstPage, safePage, onPageChange]);

  return {
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
  };
}

export default usePagination;