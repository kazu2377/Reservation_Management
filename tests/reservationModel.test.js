const test = require('node:test');
const assert = require('node:assert/strict');

const { normalizeReservationInput, validateReservationInput } = require('../src/domain/reservation.js');

const validPayload = {
  studentName: ' Alice Example ',
  email: 'alice@example.com ',
  phone: '090-0000-0000',
  desiredDatetime: '2025-11-01T10:00',
  note: 'First trial lesson'
};

test('normalizeReservationInput trims strings and maps fields', () => {
  const normalized = normalizeReservationInput(validPayload);
  assert.deepEqual(normalized, {
    studentName: 'Alice Example',
    email: 'alice@example.com',
    phone: '090-0000-0000',
    desiredDatetime: '2025-11-01T10:00',
    note: 'First trial lesson'
  });
});

test('validateReservationInput returns empty array when valid', () => {
  const errors = validateReservationInput(validPayload);
  assert.equal(errors.length, 0);
});

test('validateReservationInput detects missing required fields', () => {
  const errors = validateReservationInput({});
  assert(errors.some((msg) => msg.includes('studentName')));
  assert(errors.some((msg) => msg.includes('email')));
  assert(errors.some((msg) => msg.includes('desiredDatetime')));
});

test('validateReservationInput detects invalid email and datetime format', () => {
  const errors = validateReservationInput({
    studentName: 'Bob',
    email: 'not-an-email',
    desiredDatetime: 'invalid-date'
  });

  assert(errors.some((msg) => msg.includes('email')));
  assert(errors.some((msg) => msg.includes('desiredDatetime')));
});
