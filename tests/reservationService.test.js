const test = require('node:test');
const assert = require('node:assert/strict');

const { createReservationRouter } = require('../src/routes/reservations.js');
const { invokeRoute } = require('./helpers/express.js');

test('POST / reservations returns 400 when validation fails', async () => {
  const domain = {
    async createReservation() {
      return { success: false, errors: ['studentName is required.'] };
    }
  };
  const router = createReservationRouter(domain);
  const response = await invokeRoute(router, 'post', '/', { body: {} });
  assert.equal(response.statusCode, 400);
  assert.deepEqual(response.json.errors, ['studentName is required.']);
});

test('POST / reservations returns 201 on success', async () => {
  const domain = {
    async createReservation() {
      return {
        success: true,
        reservation: {
          id: 5,
          studentName: 'Alice',
          desiredDatetime: '2025-11-01T10:00:00.000Z'
        }
      };
    }
  };
  const router = createReservationRouter(domain);
  const response = await invokeRoute(router, 'post', '/', {
    body: { studentName: 'Alice', email: 'alice@example.com', desiredDatetime: '2025-11-01T10:00' }
  });

  assert.equal(response.statusCode, 201);
  assert.equal(response.json.message, 'Reservation created');
  assert.equal(response.json.data.id, 5);
});

test('POST / reservations returns 409 on duplicate error', async () => {
  const domain = {
    async createReservation() {
      return { success: false, errors: ['同じ日時の予約が既に存在します。別の日時を選択してください。'] };
    }
  };
  const router = createReservationRouter(domain);
  const response = await invokeRoute(router, 'post', '/', { body: { studentName: 'Bob' } });
  assert.equal(response.statusCode, 409);
  assert.ok(response.json.errors[0].includes('同じ日時'));
});

test('GET / reservations returns list from domain', async () => {
  const domain = {
    async listReservations() {
      return [{ id: 1, studentName: 'A', desiredDatetime: '2025-11-01T10:00:00.000Z' }];
    }
  };
  const router = createReservationRouter(domain);
  const response = await invokeRoute(router, 'get', '/');

  assert.equal(response.statusCode, 200);
  assert.equal(response.json.data.length, 1);
  assert.equal(response.json.data[0].studentName, 'A');
});
