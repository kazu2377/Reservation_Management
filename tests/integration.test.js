const test = require('node:test');
const assert = require('node:assert/strict');
const sqlite3 = require('sqlite3').verbose();

const { createReservationRepository } = require('../src/repository/reservationRepository.js');
const { ReservationDomain } = require('../src/domain/reservationDomain.js');
const { createReservationRouter } = require('../src/routes/reservations.js');
const { invokeRoute } = require('./helpers/express.js');

test('reservation creation flows through repository and surfaces in list endpoint', async () => {
  const db = new sqlite3.Database(':memory:');
  const repository = createReservationRepository(db);
  await repository.init();
  const domain = new ReservationDomain(repository);
  const router = createReservationRouter(domain);

  const createResponse = await invokeRoute(router, 'post', '/', {
    body: {
      studentName: 'Integration Tester',
      email: 'integration@example.com',
      desiredDatetime: '2025-12-24T10:00',
      phone: '09000000000',
      note: 'Integration path'
    }
  });

  assert.equal(createResponse.statusCode, 201);
  assert.ok(createResponse.json.data.id);

  const listResponse = await invokeRoute(router, 'get', '/');
  assert.equal(listResponse.statusCode, 200);
  assert.equal(listResponse.json.data.length, 1);
  assert.equal(listResponse.json.data[0].studentName, 'Integration Tester');

  db.close();
});
