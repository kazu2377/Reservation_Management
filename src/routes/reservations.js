const express = require('express');

function createReservationRouter(domain) {
  const router = express.Router();

  router.get('/', async (req, res, next) => {
    try {
      const reservations = await domain.listReservations();
      res.json({ data: reservations });
    } catch (error) {
      next(error);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const result = await domain.createReservation(req.body ?? {});
      if (!result.success) {
        const status = result.errors.some((msg) => msg.includes('同じ日時')) ? 409 : 400;
        res.status(status).json({ errors: result.errors });
        return;
      }
      res.status(201).json({ message: 'Reservation created', data: result.reservation });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = {
  createReservationRouter
};
