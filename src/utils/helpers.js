/**
 * Shared utility/helper functions for the Well Management application.
 */

/**
 * Generates a unique ID for a new well record.
 * @returns {string} A unique well identifier string.
 */
export function generateId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `well-${timestamp}-${random}`;
}

/**
 * Formats an ISO 8601 date string for display.
 * Returns a locale-formatted date string (e.g., "Jan 15, 2024").
 *
 * @param {string|null|undefined} isoString - An ISO 8601 date string.
 * @returns {string} The formatted date string, or '-' if input is invalid/null.
 */
export function formatDate(isoString) {
  if (!isoString) {
    return '-';
  }

  const date = new Date(isoString);
  if (isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Formats a lastLive timestamp for display.
 * Returns '-' for null/undefined values, otherwise formats as date + time.
 *
 * @param {string|null|undefined} timestamp - An ISO 8601 datetime string or null.
 * @returns {string} The formatted datetime string, or '-' if input is null/undefined/invalid.
 */
export function formatLastLive(timestamp) {
  if (timestamp === null || timestamp === undefined || timestamp === '') {
    return '-';
  }

  const date = new Date(timestamp);
  if (isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Creates a debounced version of the provided function.
 * The debounced function delays invoking `fn` until after `delay` milliseconds
 * have elapsed since the last time the debounced function was invoked.
 *
 * @param {Function} fn - The function to debounce.
 * @param {number} delay - The debounce delay in milliseconds.
 * @returns {Function} The debounced function with a `.cancel()` method.
 */
export function debounce(fn, delay) {
  let timerId = null;

  const debounced = function (...args) {
    if (timerId !== null) {
      clearTimeout(timerId);
    }
    timerId = setTimeout(() => {
      fn.apply(this, args);
      timerId = null;
    }, delay);
  };

  debounced.cancel = function () {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
  };

  return debounced;
}

/**
 * Sorts an array of objects by a given field and direction.
 * Handles string, date, and boolean comparisons.
 * Null/undefined values are sorted to the end regardless of direction.
 *
 * @param {Array<Object>} array - The array to sort.
 * @param {string} field - The field name to sort by.
 * @param {('asc'|'desc')} direction - The sort direction.
 * @returns {Array<Object>} A new sorted array (does not mutate the original).
 */
export function sortByField(array, field, direction) {
  if (!array || !Array.isArray(array) || !field) {
    return array || [];
  }

  return [...array].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];

    if (aVal === null || aVal === undefined) {
      return 1;
    }
    if (bVal === null || bVal === undefined) {
      return -1;
    }

    if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
      const result = aVal === bVal ? 0 : aVal ? -1 : 1;
      return direction === 'asc' ? result : -result;
    }

    if (field === 'spudDate' || field === 'lastLive' || field === 'createdAt' || field === 'updatedAt') {
      const dateA = new Date(aVal).getTime();
      const dateB = new Date(bVal).getTime();

      if (isNaN(dateA) && isNaN(dateB)) {
        return 0;
      }
      if (isNaN(dateA)) {
        return 1;
      }
      if (isNaN(dateB)) {
        return -1;
      }

      const result = dateA - dateB;
      return direction === 'asc' ? result : -result;
    }

    const strA = String(aVal).toLowerCase();
    const strB = String(bVal).toLowerCase();

    if (strA < strB) {
      return direction === 'asc' ? -1 : 1;
    }
    if (strA > strB) {
      return direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
}

/**
 * Filters an array of well objects by multiple column filters.
 * Performs case-insensitive partial matching on each specified filter field.
 * The 'status' filter is handled specially, matching against the well's isActive state.
 *
 * @param {Array<Object>} wells - The array of well objects to filter.
 * @param {Object} filters - An object mapping field names to filter strings.
 * @returns {Array<Object>} A new array containing only the wells that match all filters.
 */
export function filterWells(wells, filters) {
  if (!wells || !Array.isArray(wells)) {
    return [];
  }

  if (!filters || typeof filters !== 'object') {
    return [...wells];
  }

  const activeFilters = Object.entries(filters).filter(
    ([, value]) => value !== undefined && value !== null && String(value).trim() !== ''
  );

  if (activeFilters.length === 0) {
    return [...wells];
  }

  return wells.filter((well) =>
    activeFilters.every(([key, value]) => {
      const filterValue = String(value).toLowerCase().trim();

      if (key === 'status') {
        const wellStatus = well.isActive ? 'active' : 'idle';
        return wellStatus.includes(filterValue);
      }

      const wellValue = well[key];
      if (wellValue === null || wellValue === undefined) {
        return false;
      }

      return String(wellValue).toLowerCase().includes(filterValue);
    })
  );
}