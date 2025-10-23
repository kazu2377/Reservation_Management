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
  assert.match(html, /fetch\('\/reservations'/);
});

test('renderReservationForm groups fields into sections and shows inline errors', () => {
  const html = renderReservationForm({
    errors: ['studentName is required.', 'Unexpected error'],
    values: {}
  });

  assert.match(html, /<fieldset[^>]*class="form-section"[^>]*>[\s\S]*連絡先/);
  assert.match(html, /<fieldset[^>]*class="form-section"[^>]*>[\s\S]*予約情報/);
  assert.match(html, /<span[^>]*class="required-indicator"[^>]*>必須<\/span>/);
  assert.match(html, /data-error-for="studentName"[^>]*>学生氏名は必須です。<\/p>/);
  assert.match(html, /id="generalErrors"[\s\S]*Unexpected error/);
});

test('renderReservationList outputs table rows for reservations', () => {
  const html = renderReservationList([
    { id: 1, studentName: 'Alice', email: 'alice@example.com', desiredDatetime: '2025-11-01T10:00:00.000Z' },
    { id: 2, studentName: 'Bob', email: 'bob@example.com', desiredDatetime: '2025-11-02T10:00:00.000Z' }
  ]);

  assert.match(html, /class="reservations-table"/);
  assert.match(html, /Alice/);
  assert.match(html, /Bob/);
  assert.ok((html.match(/<tr>/g) || []).length >= 3, 'includes header and rows');
  assert.match(html, /\.reservations-table tbody tr:nth-child\(even\)/);
  assert.match(html, /word-break:\s*break-word/);
});

test('renderReservationList shows empty state when there are no reservations', () => {
  const html = renderReservationList([]);

  assert.match(html, /予約はまだ登録されていません/);
  assert.doesNotMatch(html, /<tbody>\s*<\/tbody>/);
});
