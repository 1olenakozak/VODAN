(function () {
  const PHONE_PATTERN = /^\+380\d{9}$/;
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function normalizePhoneValue(value) {
    if (!value) {
      return '';
    }

    const digitsAndPlus = value.replace(/[\s\-()]/g, '').replace(/[^\d+]/g, '');

    if (!digitsAndPlus) {
      return '';
    }

    const cleaned = digitsAndPlus.replace(/\+/g, '');
    const digitsOnly = cleaned || '';

    if (!digitsOnly) {
      return '';
    }

    let normalized = '';

    if (digitsOnly.startsWith('380')) {
      normalized = `+${digitsOnly}`;
    } else if (digitsOnly.startsWith('80')) {
      normalized = `+3${digitsOnly}`;
    } else if (digitsOnly.startsWith('0')) {
      normalized = `+38${digitsOnly.slice(1)}`;
    } else {
      normalized = `+${digitsOnly}`;
    }

    return normalized.slice(0, 13);
  }

  function getPhoneErrorMessage(value) {
    if (!value) {
      return 'Введіть номер телефону.';
    }

    const normalized = normalizePhoneValue(value);

    if (normalized !== value) {
      return 'Формат номера: +380XXXXXXXXX. Використовуйте лише цифри без пробілів, дужок і дефісів.';
    }

    if (!PHONE_PATTERN.test(value)) {
      if (value.startsWith('+380') && value.length < 13) {
        return 'Номер не завершений. Формат: +380XXXXXXXXX.';
      }

      return 'Номер телефону має бути у форматі +380XXXXXXXXX.';
    }

    return '';
  }

  function getErrorMessage(field) {
    const fieldName = field.name || field.id || '';
    const value = field.type === 'checkbox' ? '' : (field.value || '').trim();

    if (field.type === 'checkbox') {
      return field.checked ? '' : 'Потрібна згода на обробку персональних даних.';
    }

    if (fieldName.includes('phone')) {
      return getPhoneErrorMessage(value);
    }

    if (fieldName.includes('email')) {
      if (!value) {
        return 'Введіть електронну адресу.';
      }

      if (!EMAIL_PATTERN.test(value)) {
        return 'Введіть коректну електронну адресу.';
      }

      return '';
    }

    if (fieldName.includes('name')) {
      if (!value) {
        return 'Введіть ваше ім’я.';
      }

      if (value.length < 2) {
        return 'Ім’я має містити мінімум 2 символи.';
      }

      return '';
    }

    if (fieldName.includes('message')) {
      if (!value) {
        return '';
      }

      if (value.length < 10) {
        return 'Повідомлення має містати мінімум 10 символів.';
      }

      return '';
    }

    return '';
  }

  function setFieldErrorState(field, message) {
    const errorNode = document.getElementById(`${field.id}Error`);

    field.setAttribute('aria-invalid', 'true');
    field.style.borderColor = '#FF8A8A';
    field.style.boxShadow = '0 0 0 1px rgba(255, 138, 138, 0.25)';

    if (errorNode) {
      errorNode.textContent = message;
      errorNode.classList.remove('hidden');
    }
  }

  function clearFieldErrorState(field) {
    const errorNode = document.getElementById(`${field.id}Error`);

    field.setAttribute('aria-invalid', 'false');
    field.style.borderColor = '';
    field.style.boxShadow = '';

    if (errorNode) {
      errorNode.textContent = '';
      errorNode.classList.add('hidden');
    }
  }

  function validateField(field, showError = false) {
    const message = getErrorMessage(field);

    if (message) {
      if (showError) {
        setFieldErrorState(field, message);
      } else {
        clearFieldErrorState(field);
      }
      return false;
    }

    clearFieldErrorState(field);
    return true;
  }

  function getFieldsToValidate(form) {
    return Array.from(form.querySelectorAll('input, textarea')).filter((field) => {
      const fieldName = field.name || field.id || '';
      return /(name|email|phone|message|privacy|agreement)/i.test(fieldName);
    });
  }

  function updateConfirmButtonState(form) {
    const formKey = form.dataset.bookingForm;
    const confirmButton = document.querySelector(`[data-confirm-for="${formKey}"]`);

    if (!confirmButton) {
      return;
    }

    const fields = getFieldsToValidate(form);
    const isValid = fields.every((field) => !getErrorMessage(field));

    confirmButton.disabled = !isValid;
    confirmButton.setAttribute('aria-disabled', String(!isValid));
    confirmButton.classList.toggle('opacity-50', !isValid);
    confirmButton.classList.toggle('cursor-not-allowed', !isValid);
  }

  function markFieldAsTouched(field) {
    field.dataset.touched = 'true';
  }

  function handlePhoneInput(field) {
    const normalized = normalizePhoneValue(field.value);

    if (normalized !== field.value) {
      field.value = normalized;
    }

    if (field.value && !PHONE_PATTERN.test(field.value)) {
      const message = getPhoneErrorMessage(field.value);
      setFieldErrorState(field, message);
      return false;
    }

    clearFieldErrorState(field);
    return true;
  }

  function attachValidation(form) {
    const fields = getFieldsToValidate(form);

    form.addEventListener('submit', (event) => {
      let isValid = true;

      fields.forEach((field) => {
        markFieldAsTouched(field);
        if (!validateField(field, true)) {
          isValid = false;
        }
      });

      if (!isValid) {
        event.preventDefault();
      }
    });

    fields.forEach((field) => {
      field.addEventListener('input', () => {
        markFieldAsTouched(field);

        if ((field.name || field.id || '').includes('phone')) {
          handlePhoneInput(field);
        } else {
          validateField(field, true);
        }

        updateConfirmButtonState(form);
      });

      field.addEventListener('change', () => {
        markFieldAsTouched(field);
        validateField(field, true);
        updateConfirmButtonState(form);
      });

      field.addEventListener('blur', () => {
        markFieldAsTouched(field);
        validateField(field, true);
        updateConfirmButtonState(form);
      });
    });

    const confirmButton = document.querySelector(`[data-confirm-for="${form.dataset.bookingForm}"]`);
    if (confirmButton) {
      confirmButton.addEventListener('click', (event) => {
        event.preventDefault();

        if (confirmButton.disabled) {
          alert('Поставте галочку “Я даю згоду...” і заповніть всі обов’язкові поля.');
          return;
        }
      });
    }

    updateConfirmButtonState(form);
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('form[data-booking-form]').forEach((form) => {
      attachValidation(form);
    });
  });
})();
