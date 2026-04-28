import { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useWellContext } from '../context/WellContext.jsx';
import { filterWells, formatDate, formatLastLive, sortByField } from '../utils/helpers.js';
import { SORT_ASC, SORT_DESC, SORTABLE_COLUMNS, TABLE_STYLES } from '../utils/constants.js';
import TableHeaderFilters from './TableHeaderFilters.jsx';
import StatusBadge from './StatusBadge.jsx';
import ActionCell from './ActionCell.jsx';
import PaginationControls from './PaginationControls.jsx';
import EmptyState from './EmptyState.jsx';

/**
 * Column definitions for the well list table.
 * @type {Array<{ key: string, label: string, sortable: boolean }>}
 */
const COLUMNS = [
  { key: 'status', label: 'Status', sortable: false },
  { key: 'rig', label: 'Rig', sortable: false },
  { key: 'wellName', label: 'Well Name', sortable: false },
  { key: 'wellId', label: 'Well ID', sortable: false },
  { key: 'spudDate', label: 'Spud Date', sortable: true },
  { key: 'operator', label: 'Operator', sortable: false },
  { key: 'contractor', label: 'Contractor', sortable: false },
  { key: 'country', label: 'Country', sortable: false },
  { key: 'lastLive', label: 'Last Live', sortable: true },
  { key: 'actions', label: 'Actions', sortable: false },
];

/**
 * SortIndicator — renders an ascending/descending sort arrow icon next to sortable column headers.
 *
 * @param {{ direction: 'asc'|'desc'|null }} props
 * @returns {React.ReactElement}
 */
function SortIndicator({ direction }) {
  if (!direction) {
    return (
      <svg
        aria-hidden="true"
        className="ml-1 inline-block h-3 w-3 text-dark-600"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (direction === SORT_ASC) {
    return (
      <svg
        aria-hidden="true"
        className="ml-1 inline-block h-3 w-3 text-well-green"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8.25 9L12 5.25 15.75 9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className="ml-1 inline-block h-3 w-3 text-well-green"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.25 15L12 18.75 15.75 15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

SortIndicator.propTypes = {
  direction: PropTypes.oneOf([SORT_ASC, SORT_DESC, null]),
};

SortIndicator.defaultProps = {
  direction: null,
};

/**
 * WellTable — main grid component rendering the well list table.
 *
 * Displays column headers with sort indicators on Spud Date and Last Live.
 * Integrates TableHeaderFilters row for real-time filtering.
 * Renders well rows with:
 * - Active well pinned at top with green left border
 * - Status badge for active wells
 * - Formatted dates
 * - '-' for null lastLive
 * - ActionCell per row
 *
 * Applies filtering, sorting (active well always pinned), and pagination from context.
 * Handles click on sort headers to toggle asc/desc.
 *
 * @param {{ onActivate: (id: string) => void }} props
 * @returns {React.ReactElement}
 */
function WellTable({ onActivate }) {
  const {
    wells,
    filters,
    sort,
    page,
    pageSize,
    setFilters,
    setSort,
    setPage,
    setPageSize,
  } = useWellContext();

  const handleSortClick = useCallback(
    (columnKey) => {
      if (sort.key === columnKey) {
        setSort({
          key: columnKey,
          direction: sort.direction === SORT_ASC ? SORT_DESC : SORT_ASC,
        });
      } else {
        setSort({
          key: columnKey,
          direction: SORT_ASC,
        });
      }
    },
    [sort, setSort]
  );

  const processedData = useMemo(() => {
    // Step 1: Filter
    const filtered = filterWells(wells, filters);

    // Step 2: Sort
    const sorted = sortByField(filtered, sort.key, sort.direction);

    // Step 3: Pin active wells to top
    const activeWells = sorted.filter((w) => w.isActive);
    const inactiveWells = sorted.filter((w) => !w.isActive);
    const pinned = [...activeWells, ...inactiveWells];

    return pinned;
  }, [wells, filters, sort]);

  const totalItems = processedData.length;

  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return processedData.slice(startIndex, endIndex);
  }, [processedData, page, pageSize]);

  if (wells.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="rounded-xl border border-dark-700 bg-surface-elevated shadow-well overflow-hidden animate-fade-in">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[1100px] table-auto">
          {/* Column Headers */}
          <thead>
            <tr className={`${TABLE_STYLES.headerBg} border-b border-dark-700`}>
              {COLUMNS.map((col) => {
                const isSortable = col.sortable;
                const isCurrentSort = sort.key === col.key;
                const sortDirection = isCurrentSort ? sort.direction : null;

                return (
                  <th
                    key={col.key}
                    className={`${TABLE_STYLES.cellPadding} text-left text-xs font-semibold uppercase tracking-wider ${TABLE_STYLES.headerText} ${
                      isSortable ? 'cursor-pointer select-none hover:text-dark-200 transition-colors duration-200' : ''
                    }`}
                    onClick={isSortable ? () => handleSortClick(col.key) : undefined}
                    scope="col"
                  >
                    <span className="inline-flex items-center">
                      {col.label}
                      {isSortable && <SortIndicator direction={sortDirection} />}
                    </span>
                  </th>
                );
              })}
            </tr>

            {/* Filter Row */}
            <TableHeaderFilters filters={filters} onFiltersChange={setFilters} />
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-dark-700">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  className={`${TABLE_STYLES.cellPadding} text-center text-sm text-dark-400 py-12`}
                  colSpan={COLUMNS.length}
                >
                  No wells match the current filters.
                </td>
              </tr>
            ) : (
              paginatedData.map((well) => (
                <tr
                  key={well.id}
                  className={`${TABLE_STYLES.rowBg} ${TABLE_STYLES.rowHoverBg} transition-colors duration-150 ${
                    well.isActive
                      ? 'border-l-2 border-l-well-green bg-well-green/5'
                      : 'border-l-2 border-l-transparent'
                  }`}
                >
                  {/* Status */}
                  <td className={TABLE_STYLES.cellPadding}>
                    <StatusBadge isActive={well.isActive} />
                  </td>

                  {/* Rig */}
                  <td className={`${TABLE_STYLES.cellPadding} text-sm text-dark-100 font-medium`}>
                    {well.rig}
                  </td>

                  {/* Well Name */}
                  <td className={`${TABLE_STYLES.cellPadding} text-sm text-dark-100`}>
                    {well.wellName}
                  </td>

                  {/* Well ID */}
                  <td className={`${TABLE_STYLES.cellPadding} text-sm text-dark-300 font-mono`}>
                    {well.wellId}
                  </td>

                  {/* Spud Date */}
                  <td className={`${TABLE_STYLES.cellPadding} text-sm text-dark-300`}>
                    {formatDate(well.spudDate)}
                  </td>

                  {/* Operator */}
                  <td className={`${TABLE_STYLES.cellPadding} text-sm text-dark-300`}>
                    {well.operator}
                  </td>

                  {/* Contractor */}
                  <td className={`${TABLE_STYLES.cellPadding} text-sm text-dark-300`}>
                    {well.contractor}
                  </td>

                  {/* Country */}
                  <td className={`${TABLE_STYLES.cellPadding} text-sm text-dark-300`}>
                    {well.country}
                  </td>

                  {/* Last Live */}
                  <td className={`${TABLE_STYLES.cellPadding} text-sm text-dark-300`}>
                    {formatLastLive(well.lastLive)}
                  </td>

                  {/* Actions */}
                  <td className={TABLE_STYLES.cellPadding}>
                    <ActionCell onActivate={onActivate} well={well} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalItems > 0 && (
        <PaginationControls
          currentPage={page}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          pageSize={pageSize}
          totalItems={totalItems}
        />
      )}
    </div>
  );
}

WellTable.propTypes = {
  onActivate: PropTypes.func.isRequired,
};

export default WellTable;