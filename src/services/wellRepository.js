import seedData from '../data/seedData.js';
import { WELL_STORAGE_KEY, MAX_WELLS, REQUIRED_WELL_FIELDS } from '../utils/constants.js';

/**
 * @typedef {Object} Well
 * @property {string} id
 * @property {string} rig
 * @property {string} wellName
 * @property {string} wellId
 * @property {string} spudDate
 * @property {string} operator
 * @property {string} contractor
 * @property {string} country
 * @property {string|null} lastLive
 * @property {boolean} isActive
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * Generates a unique ID for a new well record.
 * @returns {string}
 */
function generateId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `well-${timestamp}-${random}`;
}

/**
 * WellRepository — localStorage persistence adapter for well records.
 * Implements the Repository pattern with subscriber notification.
 */
class WellRepository {
  constructor() {
    /** @type {Well[]} */
    this._wells = [];
    /** @type {Array<() => void>} */
    this._listeners = [];
    this._hydrate();
  }

  /**
   * Hydrates in-memory well data from localStorage.
   * Falls back to seed data if localStorage is empty or corrupt.
   * @private
   */
  _hydrate() {
    try {
      const raw = localStorage.getItem(WELL_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this._wells = parsed;
          return;
        }
      }
    } catch (error) {
      console.error('Failed to parse wells from localStorage, falling back to seed data:', error);
    }
    this._wells = structuredClone(seedData);
    this._persist();
  }

  /**
   * Persists the current in-memory wells array to localStorage.
   * @private
   */
  _persist() {
    try {
      localStorage.setItem(WELL_STORAGE_KEY, JSON.stringify(this._wells));
    } catch (error) {
      console.error('Failed to persist wells to localStorage:', error);
      throw new Error(`StorageError: Failed to persist wells — ${error.message}`);
    }
  }

  /**
   * Notifies all subscribed listeners of a data change.
   * @private
   */
  _notifyListeners() {
    for (const listener of this._listeners) {
      try {
        listener();
      } catch (error) {
        console.error('Error in well repository listener:', error);
      }
    }
  }

  /**
   * Returns all wells as a shallow copy of the array.
   * @returns {Well[]}
   */
  getWells() {
    return [...this._wells];
  }

  /**
   * Returns a single well by its unique `id` field.
   * @param {string} id - The well's unique identifier.
   * @returns {Well|null}
   */
  getWellById(id) {
    const well = this._wells.find((w) => w.id === id);
    return well ? { ...well } : null;
  }

  /**
   * Creates a new well record, persists it, and notifies listeners.
   * @param {Object} wellData - The well data (all required fields except id, isActive, createdAt, updatedAt).
   * @returns {Well} The newly created well record.
   * @throws {Error} If validation fails, a duplicate wellId exists, or max wells exceeded.
   */
  createWell(wellData) {
    this._validateWellInput(wellData);

    const duplicate = this._wells.find((w) => w.wellId === wellData.wellId);
    if (duplicate) {
      throw new Error(`ValidationError: A well with wellId "${wellData.wellId}" already exists.`);
    }

    if (this._wells.length >= MAX_WELLS) {
      throw new Error(`ValidationError: Maximum number of wells (${MAX_WELLS}) reached.`);
    }

    const now = new Date().toISOString();
    /** @type {Well} */
    const newWell = {
      id: generateId(),
      rig: wellData.rig.trim(),
      wellName: wellData.wellName.trim(),
      wellId: wellData.wellId.trim(),
      spudDate: wellData.spudDate,
      operator: wellData.operator.trim(),
      contractor: wellData.contractor.trim(),
      country: wellData.country.trim(),
      lastLive: wellData.lastLive || null,
      isActive: false,
      createdAt: now,
      updatedAt: now,
    };

    this._wells.push(newWell);
    this._persist();
    this._notifyListeners();

    return { ...newWell };
  }

  /**
   * Updates an existing well record by id, persists changes, and notifies listeners.
   * @param {string} id - The well's unique identifier.
   * @param {Partial<Object>} updates - Fields to update.
   * @returns {Well} The updated well record.
   * @throws {Error} If the well is not found or validation fails.
   */
  updateWell(id, updates) {
    const index = this._wells.findIndex((w) => w.id === id);
    if (index === -1) {
      throw new Error(`NotFoundError: Well with id "${id}" not found.`);
    }

    if (updates.wellId !== undefined && updates.wellId !== this._wells[index].wellId) {
      const duplicate = this._wells.find((w) => w.wellId === updates.wellId && w.id !== id);
      if (duplicate) {
        throw new Error(`ValidationError: A well with wellId "${updates.wellId}" already exists.`);
      }
    }

    const immutableFields = ['id', 'createdAt'];
    const sanitizedUpdates = {};
    for (const [key, value] of Object.entries(updates)) {
      if (immutableFields.includes(key)) {
        continue;
      }
      if (typeof value === 'string' && key !== 'spudDate' && key !== 'lastLive' && key !== 'updatedAt' && key !== 'createdAt') {
        sanitizedUpdates[key] = value.trim();
      } else {
        sanitizedUpdates[key] = value;
      }
    }

    const now = new Date().toISOString();
    this._wells[index] = {
      ...this._wells[index],
      ...sanitizedUpdates,
      updatedAt: now,
    };

    this._persist();
    this._notifyListeners();

    return { ...this._wells[index] };
  }

  /**
   * Replaces the entire wells array, persists, and notifies listeners.
   * Useful for batch/transactional operations (e.g., activation swaps).
   * @param {Well[]} wells - The full wells array to persist.
   */
  persist(wells) {
    if (!Array.isArray(wells)) {
      throw new Error('ValidationError: persist() expects an array of wells.');
    }
    this._wells = wells;
    this._persist();
    this._notifyListeners();
  }

  /**
   * Subscribes a listener callback that is invoked on any data change.
   * @param {() => void} callback - The listener function.
   * @returns {() => void} An unsubscribe function.
   */
  subscribe(callback) {
    if (typeof callback !== 'function') {
      throw new Error('ValidationError: subscribe() expects a function callback.');
    }
    this._listeners.push(callback);
    return () => {
      this._listeners = this._listeners.filter((listener) => listener !== callback);
    };
  }

  /**
   * Validates that all required fields are present and non-empty.
   * @param {Object} wellData
   * @private
   * @throws {Error} If any required field is missing or empty.
   */
  _validateWellInput(wellData) {
    for (const field of REQUIRED_WELL_FIELDS) {
      if (wellData[field] === undefined || wellData[field] === null || (typeof wellData[field] === 'string' && wellData[field].trim() === '')) {
        throw new Error(`ValidationError: Field "${field}" is required and cannot be empty.`);
      }
    }
  }
}

/** Singleton instance of WellRepository */
const wellRepository = new WellRepository();

export default wellRepository;

export { WellRepository };