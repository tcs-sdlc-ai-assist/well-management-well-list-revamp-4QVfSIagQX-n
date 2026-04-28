import { createContext, useCallback, useContext, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import wellRepository from '../services/wellRepository.js';
import wellLifecycleManager from '../services/wellLifecycleManager.js';
import { DEFAULT_PAGE_SIZE, SORT_ASC } from '../utils/constants.js';

/**
 * @typedef {import('../services/wellRepository.js').Well} Well
 */

/**
 * @typedef {Object} WellContextState
 * @property {Well[]} wells
 * @property {Object} filters
 * @property {{ key: string, direction: 'asc'|'desc' }} sort
 * @property {number} page
 * @property {number} pageSize
 * @property {boolean} loading
 * @property {string|null} error
 */

/**
 * @typedef {Object} WellContextValue
 * @property {Well[]} wells
 * @property {Object} filters
 * @property {{ key: string, direction: 'asc'|'desc' }} sort
 * @property {number} page
 * @property {number} pageSize
 * @property {boolean} loading
 * @property {string|null} error
 * @property {() => Well[]} getWells
 * @property {(wellData: Object) => Well} addWell
 * @property {(id: string, updates: Object) => Well} updateWell
 * @property {(id: string) => import('../services/wellLifecycleManager.js').ActivationResult} activateWell
 * @property {(rig: string) => Well|null} getActiveWell
 * @property {(filters: Object) => void} setFilters
 * @property {(sort: { key: string, direction: 'asc'|'desc' }) => void} setSort
 * @property {(page: number) => void} setPage
 * @property {(pageSize: number) => void} setPageSize
 * @property {() => void} refreshWells
 */

const ACTION_TYPES = {
  SET_WELLS: 'SET_WELLS',
  SET_FILTERS: 'SET_FILTERS',
  SET_SORT: 'SET_SORT',
  SET_PAGE: 'SET_PAGE',
  SET_PAGE_SIZE: 'SET_PAGE_SIZE',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
};

/** @type {WellContextState} */
const initialState = {
  wells: [],
  filters: {},
  sort: { key: 'wellName', direction: SORT_ASC },
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  loading: true,
  error: null,
};

/**
 * Reducer for well context state transitions.
 * @param {WellContextState} state
 * @param {{ type: string, payload: * }} action
 * @returns {WellContextState}
 */
function wellReducer(state, action) {
  switch (action.type) {
    case ACTION_TYPES.SET_WELLS:
      return { ...state, wells: action.payload, loading: false, error: null };
    case ACTION_TYPES.SET_FILTERS:
      return { ...state, filters: action.payload, page: 1 };
    case ACTION_TYPES.SET_SORT:
      return { ...state, sort: action.payload, page: 1 };
    case ACTION_TYPES.SET_PAGE:
      return { ...state, page: action.payload };
    case ACTION_TYPES.SET_PAGE_SIZE:
      return { ...state, pageSize: action.payload, page: 1 };
    case ACTION_TYPES.SET_LOADING:
      return { ...state, loading: action.payload };
    case ACTION_TYPES.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
}

const WellContext = createContext(null);

/**
 * WellProvider — provides global well state and actions to the component tree.
 * Initializes from wellRepository on mount and subscribes to repository changes.
 *
 * @param {{ children: React.ReactNode }} props
 * @returns {React.ReactElement}
 */
export function WellProvider({ children }) {
  const [state, dispatch] = useReducer(wellReducer, initialState);

  const loadWells = useCallback(() => {
    try {
      const wells = wellRepository.getWells();
      dispatch({ type: ACTION_TYPES.SET_WELLS, payload: wells });
    } catch (error) {
      console.error('Failed to load wells:', error);
      dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
    }
  }, []);

  useEffect(() => {
    loadWells();

    const unsubscribe = wellRepository.subscribe(() => {
      loadWells();
    });

    return unsubscribe;
  }, [loadWells]);

  /**
   * Returns the current wells array from state.
   * @returns {Well[]}
   */
  const getWells = useCallback(() => {
    return state.wells;
  }, [state.wells]);

  /**
   * Creates a new well, persists it, and refreshes state.
   * @param {Object} wellData
   * @returns {Well}
   */
  const addWell = useCallback((wellData) => {
    try {
      const newWell = wellRepository.createWell(wellData);
      return newWell;
    } catch (error) {
      console.error('Failed to add well:', error);
      dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
      throw error;
    }
  }, []);

  /**
   * Updates an existing well by id, persists changes, and refreshes state.
   * @param {string} id
   * @param {Object} updates
   * @returns {Well}
   */
  const updateWell = useCallback((id, updates) => {
    try {
      const updatedWell = wellRepository.updateWell(id, updates);
      return updatedWell;
    } catch (error) {
      console.error('Failed to update well:', error);
      dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
      throw error;
    }
  }, []);

  /**
   * Activates a well by id, enforcing single-active-well-per-rig rule.
   * @param {string} id
   * @returns {import('../services/wellLifecycleManager.js').ActivationResult}
   */
  const activateWell = useCallback((id) => {
    try {
      const result = wellLifecycleManager.activateWell(id);
      return result;
    } catch (error) {
      console.error('Failed to activate well:', error);
      dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
      throw error;
    }
  }, []);

  /**
   * Returns the currently active well for a given rig.
   * @param {string} rig
   * @returns {Well|null}
   */
  const getActiveWell = useCallback((rig) => {
    return wellLifecycleManager.getActiveWell(rig);
  }, []);

  /**
   * Updates filter state. Resets page to 1.
   * @param {Object} filters
   */
  const setFilters = useCallback((filters) => {
    dispatch({ type: ACTION_TYPES.SET_FILTERS, payload: filters });
  }, []);

  /**
   * Updates sort configuration. Resets page to 1.
   * @param {{ key: string, direction: 'asc'|'desc' }} sort
   */
  const setSort = useCallback((sort) => {
    dispatch({ type: ACTION_TYPES.SET_SORT, payload: sort });
  }, []);

  /**
   * Updates the current page number.
   * @param {number} page
   */
  const setPage = useCallback((page) => {
    dispatch({ type: ACTION_TYPES.SET_PAGE, payload: page });
  }, []);

  /**
   * Updates the page size. Resets page to 1.
   * @param {number} pageSize
   */
  const setPageSize = useCallback((pageSize) => {
    dispatch({ type: ACTION_TYPES.SET_PAGE_SIZE, payload: pageSize });
  }, []);

  /**
   * Manually refreshes the wells array from the repository.
   */
  const refreshWells = useCallback(() => {
    loadWells();
  }, [loadWells]);

  /** @type {WellContextValue} */
  const contextValue = {
    wells: state.wells,
    filters: state.filters,
    sort: state.sort,
    page: state.page,
    pageSize: state.pageSize,
    loading: state.loading,
    error: state.error,
    getWells,
    addWell,
    updateWell,
    activateWell,
    getActiveWell,
    setFilters,
    setSort,
    setPage,
    setPageSize,
    refreshWells,
  };

  return (
    <WellContext.Provider value={contextValue}>
      {children}
    </WellContext.Provider>
  );
}

WellProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Custom hook to consume the WellContext.
 * Throws if used outside of a WellProvider.
 *
 * @returns {WellContextValue}
 */
export function useWellContext() {
  const context = useContext(WellContext);
  if (context === null) {
    throw new Error('useWellContext must be used within a WellProvider.');
  }
  return context;
}

export default WellContext;