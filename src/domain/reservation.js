const REQUIRED_FIELDS = ['studentName', 'email', 'desiredDatetime'];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Normalize incoming reservation payload into a consistent shape.
 * Trims string values and keeps optional fields as empty strings when missing.
 * @param {Record<string, any>} payload
 * @returns {{studentName: string, email: string, phone: string|null, desiredDatetime: string, note: string|null}}
 */
function normalizeReservationInput(payload) {
  const normalized = {
    studentName: '',
    email: '',
    phone: null,
    desiredDatetime: '',
    note: null
  };

  if (typeof payload?.studentName === 'string') {
    normalized.studentName = payload.studentName.trim();
  }

  if (typeof payload?.email === 'string') {
    normalized.email = payload.email.trim();
  }

  if (typeof payload?.phone === 'string') {
    const trimmed = payload.phone.trim();
    normalized.phone = trimmed.length ? trimmed : null;
  }

  if (typeof payload?.desiredDatetime === 'string') {
    normalized.desiredDatetime = payload.desiredDatetime.trim();
  }

  if (typeof payload?.note === 'string') {
    const trimmedNote = payload.note.trim();
    normalized.note = trimmedNote.length ? trimmedNote : null;
  }

  return normalized;
}

/**
 * Validate reservation payload, returning an array of error messages.
 * @param {Record<string, any>} payload
 * @returns {string[]}
 */
function validateReservationInput(payload) {
  const errors = [];
  const normalized = normalizeReservationInput(payload);

  for (const field of REQUIRED_FIELDS) {
    if (!normalized[field]) {
      errors.push(`${field} is required.`);
    }
  }

  if (normalized.email && !EMAIL_REGEX.test(normalized.email)) {
    errors.push('email must be a valid email address.');
  }

  if (normalized.desiredDatetime) {
    const timestamp = Date.parse(normalized.desiredDatetime);
    if (Number.isNaN(timestamp)) {
      errors.push('desiredDatetime must be a valid ISO date-time string.');
    }
  }

  return errors;
}

module.exports = {
  normalizeReservationInput,
  validateReservationInput
};
