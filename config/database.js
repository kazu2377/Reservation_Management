const fs = require('fs');
const path = require('path');
const { createFileDatabase } = require('../src/repository/reservationRepository.js');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'reservations.sqlite');

function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function createAppDatabase() {
  ensureDataDirectory();
  const { db, repository } = createFileDatabase(DB_PATH);
  return { db, repository };
}

module.exports = {
  ensureDataDirectory,
  createAppDatabase,
  DATA_DIR,
  DB_PATH
};
