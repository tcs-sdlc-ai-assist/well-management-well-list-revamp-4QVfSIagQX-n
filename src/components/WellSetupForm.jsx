import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useWellContext } from '../context/WellContext.jsx';
import { REQUIRED_WELL_FIELDS } from '../utils/constants.js';

/**
 * Initial form state for creating a new well.
 * @returns {Object} Empty form data object.
 */
function getInitialFormData() {
  return {
    rig: '',
    wellName: '',
    wellId: '',
    spudDate: '',
    operator: '',
    contractor: '',
    country: '',
  };
}

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
 * Field configuration for the well setup form.
 * @type {Array<{ key: string, label: string, type: string, placeholder: string }>}
 */
const FIELD_CONFIG = [
  { key: 'rig', label: 'Rig', type: 'text', placeholder: 'Enter rig name' },
  { key: 'wellName', label: 'Well Name', type: 'text', placeholder: 'Enter well name' },
  { key: 'wellId', label: 'Well ID', type: 'text', placeholder: 'Enter well ID' },
  { key: 'spudDate', label: 'Spud Date', type: 'date', placeholder: 'Select spud date' },
  { key: 'operator', label: 'Operator', type: 'text', placeholder: 'Enter operator name' },
  { key: 'contractor', label: 'Contractor', type: 'text', placeholder: 'Enter contractor name' },
  { key: 'country', label: 'Country', type: 'text', placeholder: 'Enter country' },
];

/**
 * WellSetupForm — form component for creating a new well.
 *
 * Contains controlled inputs for all required well fields.
 * Validates required fields on submit.
 * On successful submission, calls context addWell, shows success toast via onSuccess callback,
 * and navigates back to the well list.
 *
 * @param {{ onSuccess?: (message: string) => void }} props
 * @returns {React.ReactElement}
 */
function WellSetupForm({ onSuccess }) {
  const navigate = useNavigate();
  const { addWell } = useWellContext();

  const [formData, setFormData] = useState(getInitialFormData);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      const validationErrors = validateForm(formData);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      setIsSubmitting(true);

      try {
        const spudDateISO = formData.spudDate
          ? new Date(formData.spudDate).toISOString()
          : formData.spudDate;

        const wellData = {
          rig: formData.rig,
          wellName: formData.wellName,
          wellId: formData.wellId,
          spudDate: spudDateISO,
          operator: formData.operator,
          contractor: formData.contractor,
          country: formData.country,
          lastLive: null,
        };

        addWell(wellData);

        if (onSuccess && typeof onSuccess === 'function') {
          onSuccess(`Well "${formData.wellName.trim()}" created successfully.`);
        }

        navigate('/');
      } catch (error) {
        setSubmitError(error.message || 'Failed to create well. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, addWell, onSuccess, navigate]
  );

  const handleCancel = useCallback(() => {
    navigate('/');
  }, [navigate]);

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-dark-100 tracking-tight">
          Create New Well
        </h1>
        <p className="mt-1 text-sm text-dark-400">
          Fill in the details below to create a new well record.
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

            {/* Form fields */}
            {FIELD_CONFIG.map((field) => {
              const hasError = Boolean(errors[field.key]);
              return (
                <div key={field.key} className="flex flex-col gap-1.5">
                  <label
                    className="text-sm font-medium text-dark-200"
                    htmlFor={`well-field-${field.key}`}
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
                    id={`well-field-${field.key}`}
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
                  Creating...
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
                      d="M12 4.5v15m7.5-7.5h-15"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Create Well
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

WellSetupForm.propTypes = {
  onSuccess: PropTypes.func,
};

WellSetupForm.defaultProps = {
  onSuccess: null,
};

export default WellSetupForm;