const test = require('node:test');
const assert = require('node:assert/strict');

const { ReservationDomain } = require('../src/domain/reservationDomain.js');

function createStubRepository() {
  return {
    createCalls: [],
    listCalled: false,
    async init() {},
    async create(data) {
      this.createCalls.push(data);
      if (this.shouldThrowDuplicate) {
        const err = new Error('duplicate reservation detected');
        throw err;
      }
      return { id: 1, ...data };
    },
    async listAll() {
      this.listCalled = true;
      return this.listResponse ?? [];
    }
  };
}

test('ReservationDomain returns validation errors for invalid payload', async () => {
  const repo = createStubRepository();
  const domain = new ReservationDomain(repo);

  const result = await domain.createReservation({});
  assert.equal(result.success, false);
  assert.ok(result.errors.find((err) => err.includes('studentName')));
  assert.equal(repo.createCalls.length, 0, 'repository should not be called on validation failure');
});

test('ReservationDomain normalizes input and delegates to repository', async () => {
  const repo = createStubRepository();
  const domain = new ReservationDomain(repo);

  const payload = {
    studentName: '  Dana ',
    email: 'dana@example.com ',
    desiredDatetime: '2025-12-01T10:00',
    phone: '',
    note: '  Prefers front row '
  };

  const result = await domain.createReservation(payload);
  assert.equal(result.success, true);
  assert.equal(repo.createCalls.length, 1);
  assert.equal(repo.createCalls[0].studentName, 'Dana');
  assert.equal(result.reservation.studentName, 'Dana');
});

test('ReservationDomain maps duplicate reservation error to user-friendly message', async () => {
  const repo = createStubRepository();
  repo.shouldThrowDuplicate = true;
  const domain = new ReservationDomain(repo);

  const result = await domain.createReservation({
    studentName: 'Eve',
    email: 'eve@example.com',
    desiredDatetime: '2025-11-10T09:00'
  });

  assert.equal(result.success, false);
  assert.ok(result.errors.some((err) => err.includes('同じ日時')));
});

test('ReservationDomain exposes listReservations with repository ordering', async () => {
  const repo = createStubRepository();
  repo.listResponse = [
    { id: 2, studentName: 'B', desiredDatetime: '2025-11-02T10:00:00.000Z' },
    { id: 1, studentName: 'A', desiredDatetime: '2025-11-01T10:00:00.000Z' }
  ];
  const domain = new ReservationDomain(repo);

  const list = await domain.listReservations();
  assert.equal(repo.listCalled, true);
  assert.deepEqual(list.map((item) => item.id), [2, 1]);
});
