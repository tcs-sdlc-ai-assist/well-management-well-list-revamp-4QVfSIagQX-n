/**
 * Application-wide constants and configuration values
 * for the Well Management application.
 */

// ─── Storage ────────────────────────────────────────────────────────────────
export const WELL_STORAGE_KEY = 'wellManagement.wells';

// ─── Pagination ─────────────────────────────────────────────────────────────
export const PAGE_SIZE_OPTIONS = [10, 25, 50];
export const DEFAULT_PAGE_SIZE = 10;

// ─── Well Status ────────────────────────────────────────────────────────────
export const STATUS_ACTIVE = 'Active';
export const STATUS_IDLE = 'Idle';

// ─── Table Columns ──────────────────────────────────────────────────────────

/**
 * Columns that support filtering in the well list table.
 * @type {string[]}
 */
export const FILTERABLE_COLUMNS = [
  'rig',
  'wellName',
  'wellId',
  'operator',
  'contractor',
  'country',
  'status',
];

/**
 * Columns that support sorting in the well list table.
 * @type {string[]}
 */
export const SORTABLE_COLUMNS = [
  'rig',
  'wellName',
  'wellId',
  'spudDate',
  'operator',
  'contractor',
  'country',
  'lastLive',
  'status',
];

// ─── Sort Directions ────────────────────────────────────────────────────────
export const SORT_ASC = 'asc';
export const SORT_DESC = 'desc';

// ─── Color / Style Constants (matching Well.png dark theme) ─────────────────

export const STATUS_COLORS = {
  [STATUS_ACTIVE]: {
    bg: 'bg-well-green/10',
    text: 'text-well-green',
    dot: 'bg-well-active',
    border: 'border-well-green/30',
  },
  [STATUS_IDLE]: {
    bg: 'bg-dark-700/50',
    text: 'text-dark-400',
    dot: 'bg-well-inactive',
    border: 'border-dark-700',
  },
};

export const TABLE_STYLES = {
  headerBg: 'bg-surface-secondary',
  headerText: 'text-dark-400',
  rowBg: 'bg-surface-elevated',
  rowHoverBg: 'hover:bg-surface-overlay',
  rowBorder: 'border-b border-dark-700',
  cellPadding: 'px-4 py-3',
};

export const BADGE_STYLES = {
  active: 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-well-green/10 text-well-green border border-well-green/30',
  idle: 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-dark-700/50 text-dark-400 border border-dark-700',
};

// ─── Validation ─────────────────────────────────────────────────────────────

export const REQUIRED_WELL_FIELDS = [
  'rig',
  'wellName',
  'wellId',
  'spudDate',
  'operator',
  'contractor',
  'country',
];

// ─── Limits ─────────────────────────────────────────────────────────────────
export const MAX_WELLS = 200;