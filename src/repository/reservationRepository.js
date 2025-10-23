const sqlite3 = require('sqlite3').verbose();

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function callback(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this);
    });
  });
}

function all(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
}

function createReservationRepository(db) {
  return {
    async init() {
      await run(
        db,
        `CREATE TABLE IF NOT EXISTS reservations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          student_name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT,
          desired_datetime TEXT NOT NULL,
          note TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          UNIQUE(email, desired_datetime)
        )`
      );
      return this;
    },

    async create(reservation) {
      try {
        const result = await run(
          db,
          `INSERT INTO reservations (student_name, email, phone, desired_datetime, note)
           VALUES (?, ?, ?, ?, ?)`,
          [
            reservation.studentName,
            reservation.email,
            reservation.phone,
            reservation.desiredDatetime,
            reservation.note
          ]
        );
        return {
          id: result.lastID,
          ...reservation
        };
      } catch (error) {
        if (error?.code === 'SQLITE_CONSTRAINT') {
          throw new Error('duplicate reservation detected');
        }
        throw error;
      }
    },

    async listAll() {
      const rows = await all(
        db,
        `SELECT id, student_name AS studentName, email, phone, desired_datetime AS desiredDatetime,
                note, created_at AS createdAt
         FROM reservations
         ORDER BY desired_datetime ASC`
      );
      return rows;
    }
  };
}

function createFileDatabase(filePath) {
  const db = new sqlite3.Database(filePath);
  const repository = createReservationRepository(db);
  return { db, repository };
}

module.exports = {
  createReservationRepository,
  createFileDatabase
};
