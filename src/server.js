const express = require('express');
const path = require('path');

const { createAppDatabase } = require('../config/database.js');
const { ReservationDomain } = require('./domain/reservationDomain.js');
const { createReservationRouter } = require('./routes/reservations.js');
const { renderReservationForm } = require('./views/reservationFormView.js');
const { renderReservationList } = require('./views/reservationListView.js');

function createApp({ domain } = {}) {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  let appDomain = domain;
  if (!appDomain) {
    const { db, repository } = createAppDatabase();
    appDomain = new ReservationDomain(repository);
    repository.init().catch((error) => {
      console.error('Failed to initialise database schema:', error);
      process.exit(1);
    });
  }

  app.get('/', (req, res) => {
    res.send(renderReservationForm());
  });

  app.get('/admin/reservations', async (req, res, next) => {
    try {
      const reservations = await appDomain.listReservations();
      res.send(renderReservationList(reservations));
    } catch (error) {
      next(error);
    }
  });

  app.use('/reservations', createReservationRouter(appDomain));

  app.use((err, req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  });

  return app;
}

if (require.main === module) {
  const app = createApp();
  const port = process.env.PORT || 3000;
  app
    .listen(port, '0.0.0.0', () => {
      console.log(`Reservation Management app listening on port ${port}`);
    })
    .on('error', (err) => {
      console.error('Failed to start server:', err.message);
      console.error('If running inside a restricted environment, bind to an allowed interface or run locally.');
      process.exit(1);
    });
}

module.exports = {
  createApp
};
