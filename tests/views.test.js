const test = require('node:test');
const assert = require('node:assert/strict');

const { renderReservationForm } = require('../src/views/reservationFormView.js');
const { renderReservationList } = require('../src/views/reservationListView.js');

test('renderReservationForm outputs form with required fields and validation script', () => {
  const html = renderReservationForm({
    errors: ['studentName is required.'],
    values: {
      studentName: 'Alice',
      email: 'alice@example.com',
      desiredDatetime: '2025-11-01T10:00'
    }
  });

  assert.match(html, /<form[^>]+action="\/reservations"/);
  assert.match(html, /name="studentName"/);
  assert.match(html, /name="email"/);
  assert.match(html, /name="desiredDatetime"/);
  assert.match(html, /required/);
  assert.match(html, /studentName is required\./);
  assert.match(html, /fetch\('\/reservations'/);
});

test('renderReservationList outputs table rows for reservations', () => {
  const html = renderReservationList([
    { id: 1, studentName: 'Alice', email: 'alice@example.com', desiredDatetime: '2025-11-01T10:00:00.000Z' },
    { id: 2, studentName: 'Bob', email: 'bob@example.com', desiredDatetime: '2025-11-02T10:00:00.000Z' }
  ]);

  assert.match(html, /<table/);
  assert.match(html, /Alice/);
  assert.match(html, /Bob/);
  assert.ok((html.match(/<tr>/g) || []).length >= 3, 'includes header and rows');
});
