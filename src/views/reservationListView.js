const { format } = require('../utils/datetime.js');

function renderReservationList(reservations = []) {
  return `
  <!DOCTYPE html>
  <html lang="ja">
    <head>
      <meta charset="utf-8" />
      <title>予約一覧</title>
      <style>
        body { font-family: sans-serif; margin: 2rem; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ccc; padding: 0.5rem; text-align: left; }
        th { background-color: #f2f2f2; }
      </style>
    </head>
    <body>
      <h1>予約一覧</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>氏名</th>
            <th>メール</th>
            <th>希望日時</th>
            <th>メモ</th>
          </tr>
        </thead>
        <tbody>
          ${reservations
            .map(
              (reservation) => `
              <tr>
                <td>${reservation.id}</td>
                <td>${escapeHtml(reservation.studentName)}</td>
                <td>${escapeHtml(reservation.email)}</td>
                <td>${escapeHtml(format(reservation.desiredDatetime))}</td>
                <td>${escapeHtml(reservation.note ?? '')}</td>
              </tr>
            `
            )
            .join('')}
        </tbody>
      </table>
    </body>
  </html>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = {
  renderReservationList
};
