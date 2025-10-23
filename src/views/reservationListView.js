const { format } = require('../utils/datetime.js');

function renderReservationList(reservations = []) {
  const hasReservations = Array.isArray(reservations) && reservations.length > 0;
  const rows = hasReservations
    ? reservations
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
        .join('')
    : '';

  return `
  <!DOCTYPE html>
  <html lang="ja">
    <head>
      <meta charset="utf-8" />
      <title>予約一覧</title>
      <style>
        body { font-family: sans-serif; margin: 2rem; }
        .reservations-layout { display: flex; flex-direction: column; gap: 1.5rem; }
        .reservations-table { border-collapse: separate; border-spacing: 0; width: 100%; border: 1px solid #dcdcdc; border-radius: 8px; overflow: hidden; }
        .reservations-table th, .reservations-table td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid #ececec; }
        .reservations-table th { background-color: #f7f7fb; font-weight: 700; }
        .reservations-table tbody tr:nth-child(even) { background-color: #fafbff; }
        .reservations-table tbody tr:hover { background-color: #eef3ff; }
        .reservations-table td { vertical-align: top; word-break: break-word; white-space: normal; line-height: 1.4; }
        .empty-state { padding: 1.5rem; border: 1px dashed #b3b3b3; border-radius: 8px; background: #fcfcff; color: #555; }
      </style>
    </head>
    <body>
      <h1>予約一覧</h1>
      <div class="reservations-layout">
        ${
          hasReservations
            ? `
        <table class="reservations-table">
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
            ${rows}
          </tbody>
        </table>
        `
            : ''
        }
        ${
          hasReservations
            ? ''
            : `<div class="empty-state" role="status">予約はまだ登録されていません。フォームから最初の予約を登録すると一覧に表示されます。</div>`
        }
      </div>
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
