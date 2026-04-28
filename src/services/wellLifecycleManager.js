import wellRepository from './wellRepository.js';
import { REQUIRED_WELL_FIELDS } from '../utils/constants.js';

/**
 * @typedef {import('./wellRepository.js').Well} Well
 */

/**
 * @typedef {Object} ActivationResult
 * @property {boolean} success
 * @property {Well} activatedWell
 * @property {Well|null} deactivatedWell
 */

/**
 * @typedef {Object} ValidationError
 * @property {string} field
 * @property {string} message
 */

/**
 * WellLifecycleManager — business logic layer for well lifecycle operations.
 * Enforces single-active-well-per-rig rule and provides validation.
 */
class WellLifecycleManager {
  /**
   * @param {import('./wellRepository.js').WellRepository} repository
   */
  constructor(repository) {
    this._repository = repository;
  }

  /**
   * Activates a well by its unique id, enforcing the single-active-well-per-rig rule.
   * If another well on the same rig is currently active, it will be deactivated first.
   *
   * @param {string} wellId - The unique `id` of the well to activate.
   * @returns {ActivationResult} The result containing activated and optionally deactivated well.
   * @throws {Error} If the well is not found.
   */
  activateWell(wellId) {
    if (!wellId || typeof wellId !== 'string') {
      throw new Error('ValidationError: A valid well id is required.');
    }

    const well = this._repository.getWellById(wellId);
    if (!well) {
      throw new Error(`NotFoundError: Well with id "${wellId}" not found.`);
    }

    if (well.isActive) {
      return {
        success: true,
        activatedWell: well,
        deactivatedWell: null,
      };
    }

    const allWells = this._repository.getWells();
    const now = new Date().toISOString();
    let deactivatedWell = null;

    const updatedWells = allWells.map((w) => {
      if (w.id === wellId) {
        return {
          ...w,
          isActive: true,
          updatedAt: now,
        };
      }

      if (w.rig === well.rig && w.isActive) {
        deactivatedWell = {
          ...w,
          isActive: false,
          updatedAt: now,
        };
        return deactivatedWell;
      }

      return w;
    });

    this._repository.persist(updatedWells);

    const activatedWell = updatedWells.find((w) => w.id === wellId);

    return {
      success: true,
      activatedWell: { ...activatedWell },
      deactivatedWell: deactivatedWell ? { ...deactivatedWell } : null,
    };
  }

  /**
   * Returns the currently active well for a given rig name.
   *
   * @param {string} rig - The rig name to search for.
   * @returns {Well|null} The active well for the rig, or null if none is active.
   */
  getActiveWell(rig) {
    if (!rig || typeof rig !== 'string') {
      return null;
    }

    const allWells = this._repository.getWells();
    const activeWell = allWells.find((w) => w.rig === rig && w.isActive);
    return activeWell ? { ...activeWell } : null;
  }

  /**
   * Validates well input data for create/edit forms.
   * Returns an array of validation errors. An empty array means the input is valid.
   *
   * @param {Object} wellData - The well data to validate.
   * @returns {ValidationError[]} Array of validation error objects.
   */
  validateWellInput(wellData) {
    /** @type {ValidationError[]} */
    const errors = [];

    if (!wellData || typeof wellData !== 'object') {
      errors.push({ field: 'form', message: 'Well data is required.' });
      return errors;
    }

    for (const field of REQUIRED_WELL_FIELDS) {
      const value = wellData[field];
      if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
        errors.push({
          field,
          message: `${field} is required and cannot be empty.`,
        });
      }
    }

    if (wellData.spudDate) {
      const date = new Date(wellData.spudDate);
      if (isNaN(date.getTime())) {
        errors.push({
          field: 'spudDate',
          message: 'Spud date must be a valid date.',
        });
      }
    }

    if (wellData.lastLive !== undefined && wellData.lastLive !== null && wellData.lastLive !== '') {
      const lastLiveDate = new Date(wellData.lastLive);
      if (isNaN(lastLiveDate.getTime())) {
        errors.push({
          field: 'lastLive',
          message: 'Last live date must be a valid date.',
        });
      }
    }

    if (wellData.wellId && typeof wellData.wellId === 'string' && wellData.wellId.trim() !== '') {
      const allWells = this._repository.getWells();
      const duplicate = allWells.find(
        (w) => w.wellId === wellData.wellId.trim() && w.id !== wellData.id
      );
      if (duplicate) {
        errors.push({
          field: 'wellId',
          message: `A well with wellId "${wellData.wellId.trim()}" already exists.`,
        });
      }
    }

    return errors;
  }
}

/** Singleton instance of WellLifecycleManager */
const wellLifecycleManager = new WellLifecycleManager(wellRepository);

export default wellLifecycleManager;

export { WellLifecycleManager };