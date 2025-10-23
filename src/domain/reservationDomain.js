const {
  normalizeReservationInput,
  validateReservationInput
} = require('./reservation.js');

class ReservationDomain {
  constructor(repository) {
    this.repository = repository;
  }

  async createReservation(payload) {
    const errors = validateReservationInput(payload);
    if (errors.length > 0) {
      return { success: false, errors };
    }

    const normalized = normalizeReservationInput(payload);

    try {
      const saved = await this.repository.create(normalized);
      return { success: true, reservation: saved };
    } catch (error) {
      if (error?.message?.includes('duplicate reservation')) {
        return {
          success: false,
          errors: ['同じ日時の予約が既に存在します。別の日時を選択してください。']
        };
      }
      throw error;
    }
  }

  async listReservations() {
    return this.repository.listAll();
  }
}

module.exports = {
  ReservationDomain
};
