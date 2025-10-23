const test = require('node:test');
const assert = require('node:assert/strict');
const sqlite3 = require('sqlite3').verbose();

const { createReservationRepository } = require('../src/repository/reservationRepository.js');

function createDb() {
  return new sqlite3.Database(':memory:');
}

test('ReservationRepository creates and lists reservations in date order', async (t) => {
  const db = createDb();
  const repository = createReservationRepository(db);
  await repository.init();

  t.after(() => db.close());

  const first = {
    studentName: 'Alice',
    email: 'alice@example.com',
    phone: '09011112222',
    desiredDatetime: '2025-11-01T09:00:00.000Z',
    note: 'Morning slot'
  };
  const second = {
    studentName: 'Bob',
    email: 'bob@example.com',
    phone: null,
    desiredDatetime: '2025-10-25T10:00:00.000Z',
    note: null
  };

  const savedFirst = await repository.create(first);
  const savedSecond = await repository.create(second);

  assert.ok(savedFirst.id);
  assert.ok(savedSecond.id);

  const all = await repository.listAll();
  assert.equal(all.length, 2);
  assert.deepEqual(
    all.map((row) => row.studentName),
    ['Bob', 'Alice'],
    'reservations should be sorted by desiredDatetime ascending'
  );
});

test('ReservationRepository rejects duplicate slot for same student/email', async (t) => {
  const db = createDb();
  const repository = createReservationRepository(db);
  await repository.init();
  t.after(() => db.close());

  const payload = {
    studentName: 'Charlie',
    email: 'charlie@example.com',
    phone: null,
    desiredDatetime: '2025-11-05T12:00:00.000Z',
    note: null
  };

  await repository.create(payload);
  await assert.rejects(async () => repository.create(payload), /duplicate reservation/);
});
