function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const FIELD_METADATA = {
  studentName: {
    label: '学生氏名',
    patterns: ['studentName', '氏名'],
    translations: {
      required: '学生氏名は必須です。',
      invalid: '学生氏名の入力内容を確認してください。'
    }
  },
  email: {
    label: 'メールアドレス',
    patterns: ['email', 'メール'],
    translations: {
      required: 'メールアドレスは必須です。',
      invalid: 'メールアドレスの形式が正しくありません。'
    }
  },
  phone: {
    label: '電話番号',
    patterns: ['phone', '電話'],
    translations: {
      invalid: '電話番号の入力内容を確認してください。'
    }
  },
  desiredDatetime: {
    label: '希望日時',
    patterns: ['desiredDatetime', '希望日時'],
    translations: {
      required: '希望日時は必須です。',
      invalid: '希望日時は正しい日付で入力してください。'
    }
  },
  note: {
    label: 'メモ',
    patterns: ['note', 'メモ'],
    translations: {
      invalid: 'メモの入力内容を確認してください。'
    }
  }
};

const EXACT_ERROR_TRANSLATIONS = {
  'studentName is required.': '学生氏名は必須です。',
  'email is required.': 'メールアドレスは必須です。',
  'email must be a valid email address.': 'メールアドレスの形式が正しくありません。',
  'desiredDatetime is required.': '希望日時は必須です。',
  'desiredDatetime must be a valid ISO date-time string.': '希望日時は正しい日付で入力してください。'
};

const FIELD_PATTERN_REGEX = Object.fromEntries(
  Object.entries(FIELD_METADATA).map(([field, meta]) => [
    field,
    meta.patterns.map((pattern) => new RegExp(pattern, 'i'))
  ])
);

function mapErrors(errors = []) {
  const fieldErrors = Object.fromEntries(
    Object.keys(FIELD_METADATA).map((field) => [field, []])
  );
  const generalErrors = [];

  for (const error of errors) {
    const field = findFieldForError(error);
    const translated = translateError(error, field);
    if (field) {
      fieldErrors[field].push(translated);
    } else {
      generalErrors.push(translated);
    }
  }

  return { fieldErrors, generalErrors };
}

function findFieldForError(error) {
  for (const [field, regexList] of Object.entries(FIELD_PATTERN_REGEX)) {
    if (regexList.some((regex) => regex.test(error))) {
      return field;
    }
  }
  return null;
}

function translateError(error, field) {
  if (Object.prototype.hasOwnProperty.call(EXACT_ERROR_TRANSLATIONS, error)) {
    return EXACT_ERROR_TRANSLATIONS[error];
  }

  if (!field) {
    return error;
  }

  const meta = FIELD_METADATA[field] ?? {};
  const lower = error.toLowerCase();

  if (lower.includes('required') && meta.translations?.required) {
    return meta.translations.required;
  }

  if (lower.includes('valid') && meta.translations?.invalid) {
    return meta.translations.invalid;
  }

  return error;
}

function renderGeneralErrors(errors) {
  const hasErrors = errors.length > 0;
  if (!hasErrors) {
    return '<div id="generalErrors" class="alert alert-danger" role="alert" hidden></div>';
  }

  return `
    <div id="generalErrors" class="alert alert-danger" role="alert">
      <ul>
        ${errors.map((err) => `<li>${escapeHtml(err)}</li>`).join('')}
      </ul>
    </div>
  `;
}

function renderFieldError(field, fieldErrors) {
  const errors = fieldErrors[field] ?? [];
  if (errors.length === 0) {
    return `<p class="field-error" data-error-for="${field}"></p>`;
  }
  return `<p class="field-error" data-error-for="${field}">${errors
    .map((err) => escapeHtml(err))
    .join('<br />')}</p>`;
}

function renderReservationForm({ errors = [], values = {} } = {}) {
  const v = {
    studentName: values.studentName || '',
    email: values.email || '',
    phone: values.phone || '',
    desiredDatetime: values.desiredDatetime || '',
    note: values.note || ''
  };

  const { fieldErrors, generalErrors } = mapErrors(errors);
  const clientFieldMeta = JSON.stringify(
    Object.fromEntries(
      Object.entries(FIELD_METADATA).map(([field, meta]) => [
        field,
        { label: meta.label, patterns: meta.patterns, translations: meta.translations ?? {} }
      ])
    )
  );

  return `
  <!DOCTYPE html>
  <html lang="ja">
    <head>
      <meta charset="utf-8" />
      <title>受講予約</title>
      <style>
        body { font-family: sans-serif; margin: 2rem; }
        .form-sections { display: grid; gap: 1.5rem; }
        fieldset.form-section { border: 1px solid #ddd; border-radius: 8px; padding: 1.5rem; }
        fieldset.form-section legend { font-weight: bold; padding: 0 0.5rem; }
        .form-group { margin-top: 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group:first-of-type { margin-top: 0; }
        label { font-weight: 600; display: flex; align-items: center; gap: 0.5rem; }
        input, textarea { width: 100%; padding: 0.6rem; border: 1px solid #ccc; border-radius: 4px; font-size: 1rem; }
        textarea { resize: vertical; min-height: 6rem; }
        .required-indicator { font-size: 0.8rem; color: #b30000; background: #ffe6e6; border-radius: 999px; padding: 0.1rem 0.6rem; }
        .alert { color: #b30000; margin-bottom: 1rem; }
        .field-error { color: #b30000; font-size: 0.9rem; margin: 0; min-height: 1.2rem; }
        .field-error.visible { display: block; }
        .actions { margin-top: 1.5rem; }
        .actions button { padding: 0.75rem 1.5rem; font-size: 1rem; }
        #formSuccess { margin-bottom: 1rem; }
      </style>
    </head>
    <body>
      <h1>受講予約フォーム</h1>
      ${renderGeneralErrors(generalErrors)}
      <div id="formSuccess" style="color: #006400;"></div>
      <form id="reservationForm" action="/reservations" method="post" novalidate>
        <div class="form-sections">
          <fieldset class="form-section">
            <legend>連絡先</legend>
            <div class="form-group">
              <label for="studentName">氏名 <span class="required-indicator">必須</span></label>
              <input id="studentName" type="text" name="studentName" required value="${escapeHtml(v.studentName)}" />
              ${renderFieldError('studentName', fieldErrors)}
            </div>
            <div class="form-group">
              <label for="email">メールアドレス <span class="required-indicator">必須</span></label>
              <input id="email" type="email" name="email" required value="${escapeHtml(v.email)}" />
              ${renderFieldError('email', fieldErrors)}
            </div>
            <div class="form-group">
              <label for="phone">電話番号</label>
              <input id="phone" type="tel" name="phone" value="${escapeHtml(v.phone)}" />
              ${renderFieldError('phone', fieldErrors)}
            </div>
          </fieldset>
          <fieldset class="form-section">
            <legend>予約情報</legend>
            <div class="form-group">
              <label for="desiredDatetime">希望日時 <span class="required-indicator">必須</span></label>
              <input id="desiredDatetime" type="datetime-local" name="desiredDatetime" required value="${escapeHtml(v.desiredDatetime)}" />
              ${renderFieldError('desiredDatetime', fieldErrors)}
            </div>
            <div class="form-group">
              <label for="note">メモ</label>
              <textarea id="note" name="note" rows="3">${escapeHtml(v.note)}</textarea>
              ${renderFieldError('note', fieldErrors)}
            </div>
          </fieldset>
        </div>
        <div class="actions">
          <button type="submit">予約する</button>
        </div>
      </form>
      <script>
        const form = document.getElementById('reservationForm');
        const generalErrors = document.getElementById('generalErrors');
        const success = document.getElementById('formSuccess');
        const fieldMeta = ${clientFieldMeta};
        const fieldNames = Object.keys(fieldMeta);
        const fieldMatchers = Object.fromEntries(
          Object.entries(fieldMeta).map(([field, meta]) => [
            field,
            meta.patterns.map((pattern) => new RegExp(pattern, 'i'))
          ])
        );

        form.addEventListener('submit', async function (event) {
          event.preventDefault();
          clearErrors();
          success.textContent = '';

          const requiredFields = ['studentName', 'email', 'desiredDatetime'];
          const missing = requiredFields.filter((name) => !form.elements[name].value.trim());
          if (missing.length > 0) {
            missing.forEach((field) => {
              const meta = fieldMeta[field];
              if (meta?.translations?.required) {
                showFieldError(field, meta.translations.required);
              } else {
                showFieldError(field, (meta?.label || field) + 'は必須です。');
              }
            });
            showGeneralErrors(['必須項目を入力してください。']);
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
              applyServerErrors(result.errors || ['送信に失敗しました。']);
              return false;
            }

            form.reset();
            success.textContent = '予約を受け付けました。ありがとうございました。';
            return true;
          } catch (error) {
            showGeneralErrors(['送信中にエラーが発生しました。再度お試しください。']);
            return false;
          }
        });

        function clearErrors() {
          fieldNames.forEach((field) => {
            const el = document.querySelector('[data-error-for=\"' + field + '\"]');
            if (el) {
              el.textContent = '';
            }
          });
          if (generalErrors) {
            generalErrors.innerHTML = '';
            generalErrors.hidden = true;
          }
        }

        function showFieldError(field, message) {
          const el = document.querySelector('[data-error-for=\"' + field + '\"]');
          if (el) {
            el.textContent = message;
          }
        }

        function showGeneralErrors(messages) {
          if (!generalErrors) return;
          generalErrors.innerHTML = '';
          if (!messages || messages.length === 0) {
            generalErrors.hidden = true;
            return;
          }
          const list = document.createElement('ul');
          messages.forEach((message) => {
            const li = document.createElement('li');
            li.textContent = message;
            list.appendChild(li);
          });
          generalErrors.appendChild(list);
          generalErrors.hidden = false;
        }

        function applyServerErrors(errors) {
          const fieldErrorMap = {};
          const general = [];

          errors.forEach((errorMessage) => {
            let matched = false;
            for (const [field, patterns] of Object.entries(fieldMatchers)) {
              if (patterns.some((regex) => regex.test(errorMessage))) {
                const translated = translateClientError(field, errorMessage);
                fieldErrorMap[field] = fieldErrorMap[field] || [];
                fieldErrorMap[field].push(translated);
                matched = true;
                break;
              }
            }
            if (!matched) {
              general.push(errorMessage);
            }
          });

          Object.entries(fieldErrorMap).forEach(([field, messages]) => {
            showFieldError(field, messages.join('\\n'));
          });
          if (general.length > 0) {
            showGeneralErrors(general);
          }
        }

        function translateClientError(field, message) {
          const meta = fieldMeta[field] || {};
          const lower = message.toLowerCase();
          if (lower.includes('required') && meta.translations && meta.translations.required) {
            return meta.translations.required;
          }
          if (lower.includes('valid') && meta.translations && meta.translations.invalid) {
            return meta.translations.invalid;
          }
          return message;
        }
      </script>
    </body>
  </html>
  `;
}

module.exports = {
  renderReservationForm
};
