import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useWellContext } from '../context/WellContext.jsx';
import { REQUIRED_WELL_FIELDS } from '../utils/constants.js';

/**
 * Field configuration for the well edit form.
 * @type {Array<{ key: string, label: string, type: string, placeholder: string, section: string }>}
 */
const FIELD_CONFIG = [
  { key: 'rig', label: 'Rig', type: 'text', placeholder: 'Enter rig name', section: 'rig' },
  { key: 'wellName', label: 'Well Name', type: 'text', placeholder: 'Enter well name', section: 'well' },
  { key: 'wellId', label: 'Well ID', type: 'text', placeholder: 'Enter well ID', section: 'well' },
  { key: 'spudDate', label: 'Spud Date', type: 'date', placeholder: 'Select spud date', section: 'well' },
  { key: 'operator', label: 'Operator', type: 'text', placeholder: 'Enter operator name', section: 'well' },
  { key: 'contractor', label: 'Contractor', type: 'text', placeholder: 'Enter contractor name', section: 'well' },
  { key: 'country', label: 'Country', type: 'text', placeholder: 'Enter country', section: 'well' },
];

/**
 * Validates the well form data.
 * Returns an object mapping field names to error messages.
 *
 * @param {Object} formData - The form data to validate.
 * @returns {Object} An object with field keys and error message values. Empty object means valid.
 */
function validateForm(formData) {
  const errors = {};

  for (const field of REQUIRED_WELL_FIELDS) {
    const value = formData[field];
    if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
      const label = FIELD_CONFIG.find((f) => f.key === field)?.label || field;
      errors[field] = `${label} is required.`;
    }
  }

  if (formData.spudDate && formData.spudDate.trim() !== '') {
    const date = new Date(formData.spudDate);
    if (isNaN(date.getTime())) {
      errors.spudDate = 'Spud Date must be a valid date.';
    }
  }

  return errors;
}

/**
 * Converts an ISO date string to a YYYY-MM-DD format suitable for date inputs.
 *
 * @param {string|null|undefined} isoString - An ISO 8601 date string.
 * @returns {string} The formatted date string or empty string.
 */
function toDateInputValue(isoString) {
  if (!isoString) {
    return '';
  }
  const date = new Date(isoString);
  if (isNaN(date.getTime())) {
    return '';
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * WellEditForm — form component for editing an existing well.
 *
 * Pre-populates all fields from the selected well record.
 * Rig Setup section is collapsed by default, Well Setup section is expanded.
 * All fields are editable with controlled inputs.
 * On submit, calls context updateWell with changed fields, shows success toast
 * via onSuccess callback, and navigates back to the well list.
 * Does not create a new well record.
 *
 * @param {{ onSuccess?: (message: string) => void }} props
 * @returns {React.ReactElement}
 */
function WellEditForm({ onSuccess }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { wells, updateWell } = useWellContext();

  const [formData, setFormData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rigSectionOpen, setRigSectionOpen] = useState(false);
  const [wellSectionOpen, setWellSectionOpen] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      return;
    }

    const well = wells.find((w) => w.id === id);
    if (!well) {
      setNotFound(true);
      return;
    }

    const data = {
      rig: well.rig || '',
      wellName: well.wellName || '',
      wellId: well.wellId || '',
      spudDate: toDateInputValue(well.spudDate),
      operator: well.operator || '',
      contractor: well.contractor || '',
      country: well.country || '',
    };

    setFormData(data);
    setOriginalData(data);
    setNotFound(false);
  }, [id, wells]);

  const handleChange = useCallback((key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (prev[key]) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return prev;
    });
    setSubmitError(null);
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      setSubmitError(null);

      if (!formData) {
        return;
      }

      const validationErrors = validateForm(formData);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      setIsSubmitting(true);

      try {
        const updates = {};

        for (const field of FIELD_CONFIG) {
          const key = field.key;
          const currentValue = formData[key];
          const originalValue = originalData[key];

          if (currentValue !== originalValue) {
            if (key === 'spudDate') {
              updates[key] = currentValue ? new Date(currentValue).toISOString() : currentValue;
            } else {
              updates[key] = currentValue;
            }
          }
        }

        updateWell(id, updates);

        if (onSuccess && typeof onSuccess === 'function') {
          onSuccess(`Well "${formData.wellName.trim()}" updated successfully.`);
        }

        navigate('/');
      } catch (error) {
        setSubmitError(error.message || 'Failed to update well. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, originalData, id, updateWell, onSuccess, navigate]
  );

  const handleCancel = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const toggleRigSection = useCallback(() => {
    setRigSectionOpen((prev) => !prev);
  }, []);

  const toggleWellSection = useCallback(() => {
    setWellSectionOpen((prev) => !prev);
  }, []);

  if (notFound) {
    return (
      <div className="animate-fade-in">
        <div className="rounded-xl border border-dark-700 bg-surface-elevated shadow-well px-6 py-16 text-center">
          <h2 className="text-lg font-semibold text-dark-100 mb-2">Well Not Found</h2>
          <p className="text-sm text-dark-400 mb-6">
            The well you are trying to edit could not be found.
          </p>
          <button
            className="btn-primary text-sm"
            onClick={handleCancel}
            type="button"
          >
            Back to Well List
          </button>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="animate-fade-in flex items-center justify-center py-16">
        <svg
          aria-hidden="true"
          className="h-8 w-8 animate-spin text-well-green"
          fill="none"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            fill="currentColor"
          />
        </svg>
      </div>
    );
  }

  const rigFields = FIELD_CONFIG.filter((f) => f.section === 'rig');
  const wellFields = FIELD_CONFIG.filter((f) => f.section === 'well');

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-dark-100 tracking-tight">
          Edit Well
        </h1>
        <p className="mt-1 text-sm text-dark-400">
          Update the details below for this well record.
        </p>
      </div>

      <div className="rounded-xl border border-dark-700 bg-surface-elevated shadow-well overflow-hidden">
        <form noValidate onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-5">
            {/* Submit error banner */}
            {submitError && (
              <div className="rounded-lg border border-well-danger/30 bg-well-danger/10 px-4 py-3">
                <p className="text-sm font-medium text-well-danger">{submitError}</p>
              </div>
            )}

            {/* Rig Setup Section — collapsed by default */}
            <div className="rounded-lg border border-dark-700 overflow-hidden">
              <button
                className="flex w-full items-center justify-between bg-surface-secondary px-4 py-3 text-left focus:outline-none focus:ring-1 focus:ring-well-green"
                onClick={toggleRigSection}
                type="button"
              >
                <span className="text-sm font-semibold text-dark-200">Rig Setup</span>
                <svg
                  aria-hidden="true"
                  className={`h-4 w-4 text-dark-400 transition-transform duration-200 ${rigSectionOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {rigSectionOpen && (
                <div className="px-4 py-4 space-y-4">
                  {rigFields.map((field) => {
                    const hasError = Boolean(errors[field.key]);
                    return (
                      <div key={field.key} className="flex flex-col gap-1.5">
                        <label
                          className="text-sm font-medium text-dark-200"
                          htmlFor={`well-edit-field-${field.key}`}
                        >
                          {field.label}
                          <span className="ml-1 text-well-danger">*</span>
                        </label>
                        <input
                          autoComplete="off"
                          className={`w-full rounded-lg border px-3 py-2 text-sm text-dark-100 placeholder-dark-500 bg-surface-tertiary transition-colors duration-200 focus:outline-none focus:ring-1 ${
                            hasError
                              ? 'border-well-danger focus:border-well-danger focus:ring-well-danger'
                              : 'border-dark-700 focus:border-well-green focus:ring-well-green'
                          }`}
                          id={`well-edit-field-${field.key}`}
                          onChange={(e) => handleChange(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          type={field.type}
                          value={formData[field.key]}
                        />
                        {hasError && (
                          <p className="text-xs text-well-danger">{errors[field.key]}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Well Setup Section — expanded by default */}
            <div className="rounded-lg border border-dark-700 overflow-hidden">
              <button
                className="flex w-full items-center justify-between bg-surface-secondary px-4 py-3 text-left focus:outline-none focus:ring-1 focus:ring-well-green"
                onClick={toggleWellSection}
                type="button"
              >
                <span className="text-sm font-semibold text-dark-200">Well Setup</span>
                <svg
                  aria-hidden="true"
                  className={`h-4 w-4 text-dark-400 transition-transform duration-200 ${wellSectionOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {wellSectionOpen && (
                <div className="px-4 py-4 space-y-4">
                  {wellFields.map((field) => {
                    const hasError = Boolean(errors[field.key]);
                    return (
                      <div key={field.key} className="flex flex-col gap-1.5">
                        <label
                          className="text-sm font-medium text-dark-200"
                          htmlFor={`well-edit-field-${field.key}`}
                        >
                          {field.label}
                          <span className="ml-1 text-well-danger">*</span>
                        </label>
                        <input
                          autoComplete="off"
                          className={`w-full rounded-lg border px-3 py-2 text-sm text-dark-100 placeholder-dark-500 bg-surface-tertiary transition-colors duration-200 focus:outline-none focus:ring-1 ${
                            hasError
                              ? 'border-well-danger focus:border-well-danger focus:ring-well-danger'
                              : 'border-dark-700 focus:border-well-green focus:ring-well-green'
                          }`}
                          id={`well-edit-field-${field.key}`}
                          onChange={(e) => handleChange(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          type={field.type}
                          value={formData[field.key]}
                        />
                        {hasError && (
                          <p className="text-xs text-well-danger">{errors[field.key]}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 border-t border-dark-700 px-6 py-4">
            <button
              className="btn-secondary text-sm"
              disabled={isSubmitting}
              onClick={handleCancel}
              type="button"
            >
              Cancel
            </button>
            <button
              className="btn-primary text-sm inline-flex items-center gap-2"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? (
                <>
                  <svg
                    aria-hidden="true"
                    className="h-4 w-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      fill="currentColor"
                    />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
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
                      d="M4.5 12.75l6 6 9-13.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

WellEditForm.propTypes = {
  onSuccess: PropTypes.func,
};

WellEditForm.defaultProps = {
  onSuccess: null,
};

export default WellEditForm;