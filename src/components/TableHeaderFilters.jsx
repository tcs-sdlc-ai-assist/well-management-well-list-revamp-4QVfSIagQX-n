import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { debounce } from '../utils/helpers.js';
import { FILTERABLE_COLUMNS, TABLE_STYLES } from '../utils/constants.js';

/**
 * Column configuration for filter inputs.
 * Maps column keys to display labels and placeholder text.
 * @type {Array<{ key: string, label: string, placeholder: string }>}
 */
const FILTER_COLUMNS = [
  { key: 'rig', label: 'Rig', placeholder: 'Filter rig...' },
  { key: 'wellName', label: 'Well Name', placeholder: 'Filter well name...' },
  { key: 'wellId', label: 'Well ID', placeholder: 'Filter well ID...' },
  { key: 'operator', label: 'Operator', placeholder: 'Filter operator...' },
  { key: 'contractor', label: 'Contractor', placeholder: 'Filter contractor...' },
  { key: 'country', label: 'Country', placeholder: 'Filter country...' },
];

const DEBOUNCE_DELAY = 300;

/**
 * TableHeaderFilters — renders a table header row with embedded text input
 * filters for filterable columns. Inputs are controlled components that
 * trigger real-time filtering via the onFiltersChange callback with debouncing.
 *
 * @param {{ filters: Object, onFiltersChange: (filters: Object) => void }} props
 * @returns {React.ReactElement}
 */
function TableHeaderFilters({ filters, onFiltersChange }) {
  const [localValues, setLocalValues] = useState(() => {
    const initial = {};
    for (const col of FILTER_COLUMNS) {
      initial[col.key] = (filters && filters[col.key]) || '';
    }
    return initial;
  });

  const debouncedUpdate = useMemo(
    () =>
      debounce((updatedFilters) => {
        onFiltersChange(updatedFilters);
      }, DEBOUNCE_DELAY),
    [onFiltersChange]
  );

  const debouncedUpdateRef = useRef(debouncedUpdate);
  debouncedUpdateRef.current = debouncedUpdate;

  useEffect(() => {
    return () => {
      debouncedUpdateRef.current.cancel();
    };
  }, []);

  useEffect(() => {
    if (filters) {
      setLocalValues((prev) => {
        const next = {};
        let changed = false;
        for (const col of FILTER_COLUMNS) {
          const incoming = filters[col.key] || '';
          next[col.key] = incoming;
          if (prev[col.key] !== incoming) {
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }
  }, [filters]);

  const handleChange = useCallback(
    (key, value) => {
      setLocalValues((prev) => {
        const updated = { ...prev, [key]: value };
        const filtersToApply = {};
        for (const [k, v] of Object.entries(updated)) {
          if (v && v.trim() !== '') {
            filtersToApply[k] = v;
          }
        }
        debouncedUpdateRef.current(filtersToApply);
        return updated;
      });
    },
    []
  );

  return (
    <tr className={`${TABLE_STYLES.headerBg}`}>
      {FILTER_COLUMNS.map((col) => (
        <th key={col.key} className={`${TABLE_STYLES.cellPadding} text-left`}>
          <input
            aria-label={`Filter by ${col.label}`}
            className="w-full rounded-md border border-dark-700 bg-surface-tertiary px-2.5 py-1.5 text-xs text-dark-100 placeholder-dark-500 focus:border-well-green focus:outline-none focus:ring-1 focus:ring-well-green transition-colors duration-200"
            onChange={(e) => handleChange(col.key, e.target.value)}
            placeholder={col.placeholder}
            type="text"
            value={localValues[col.key] || ''}
          />
        </th>
      ))}
      <th className={`${TABLE_STYLES.cellPadding}`}>
        {/* Spacer for Spud Date column */}
      </th>
      <th className={`${TABLE_STYLES.cellPadding}`}>
        {/* Spacer for Last Live column */}
      </th>
      <th className={`${TABLE_STYLES.cellPadding}`}>
        {/* Spacer for Status column */}
      </th>
      <th className={`${TABLE_STYLES.cellPadding}`}>
        {/* Spacer for Actions column */}
      </th>
    </tr>
  );
}

TableHeaderFilters.propTypes = {
  filters: PropTypes.object.isRequired,
  onFiltersChange: PropTypes.func.isRequired,
};

export default TableHeaderFilters;