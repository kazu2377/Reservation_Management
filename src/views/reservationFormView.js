function renderErrorList(errors = []) {
  if (!errors || errors.length === 0) {
    return '';
  }

  return `
    <div class="alert alert-danger" role="alert">
      <ul>
        ${errors.map((err) => `<li>${escapeHtml(err)}</li>`).join('')}
      </ul>
    </div>
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

function renderReservationForm({ errors = [], values = {} } = {}) {
  const v = {
    studentName: values.studentName || '',
    email: values.email || '',
    phone: values.phone || '',
    desiredDatetime: values.desiredDatetime || '',
    note: values.note || ''
  };

  return `
  <!DOCTYPE html>
  <html lang="ja">
    <head>
      <meta charset="utf-8" />
      <title>受講予約</title>
      <style>
        body { font-family: sans-serif; margin: 2rem; }
        label { display: block; margin-top: 1rem; }
        input, textarea { width: 100%; padding: 0.5rem; }
        .alert { color: #b30000; }
        .actions { margin-top: 1.5rem; }
      </style>
    </head>
    <body>
      <h1>受講予約フォーム</h1>
      ${renderErrorList(errors)}
      <div id="formSuccess" style="color: #006400;"></div>
      <div id="formErrors"></div>
      <form id="reservationForm" action="/reservations" method="post" novalidate>
        <label>氏名（必須）
          <input type="text" name="studentName" required value="${escapeHtml(v.studentName)}" />
        </label>
        <label>メールアドレス（必須）
          <input type="email" name="email" required value="${escapeHtml(v.email)}" />
        </label>
        <label>電話番号
          <input type="tel" name="phone" value="${escapeHtml(v.phone)}" />
        </label>
        <label>希望日時（必須）
          <input type="datetime-local" name="desiredDatetime" required value="${escapeHtml(v.desiredDatetime)}" />
        </label>
        <label>メモ
          <textarea name="note" rows="3">${escapeHtml(v.note)}</textarea>
        </label>
        <div class="actions">
          <button type="submit">予約する</button>
        </div>
      </form>
      <script>
        const form = document.getElementById('reservationForm');
        const errs = document.getElementById('formErrors');
        const success = document.getElementById('formSuccess');

        form.addEventListener('submit', async function (event) {
          event.preventDefault();
          errs.innerHTML = '';
          success.textContent = '';

          const requiredFields = ['studentName', 'email', 'desiredDatetime'];
          const missing = requiredFields.filter((name) => !form.elements[name].value.trim());
          if (missing.length > 0) {
            errs.innerHTML = '<div class="alert alert-danger"><ul>' + missing.map((name) => '<li>' + name + 'は必須です</li>').join('') + '</ul></div>';
            return false;
          }

          const payload = {
            studentName: form.elements.studentName.value.trim(),
            email: form.elements.email.value.trim(),
            phone: form.elements.phone.value.trim(),
            desiredDatetime: form.elements.desiredDatetime.value,
            note: form.elements.note.value.trim()
          };

          try {
            const response = await fetch('/reservations', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (!response.ok) {
              errs.innerHTML = '<div class="alert alert-danger"><ul>' + (result.errors || []).map((err) => '<li>' + err + '</li>').join('') + '</ul></div>';
              return false;
            }

            form.reset();
            success.textContent = '予約を受け付けました。ありがとうございました。';
            return true;
          } catch (error) {
            errs.innerHTML = '<div class="alert alert-danger">送信中にエラーが発生しました。再度お試しください。</div>';
            return false;
          }
        });
      </script>
    </body>
  </html>
  `;
}

module.exports = {
  renderReservationForm
};
