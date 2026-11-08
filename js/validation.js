(function () {
  const PHONE_PATTERN = /^\+380\d{9}$/;
  const EMAIL_PATTERN = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/;
  const NAME_PATTERN = /^[A-Za-zА-Яа-яЁёІіЇїЄєҐґ'\-\s]+$/;

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
        return 'Введіть коректну електронну адресу на латиниці.';
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

      if (!NAME_PATTERN.test(value)) {
        return 'Ім’я може містити лише літери, пробіли та дефіси.';
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

  function createSuccessModal() {
    const modal = document.createElement('div');
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'success-modal-title');
    modal.setAttribute('aria-describedby', 'success-modal-description');
    modal.className = 'fixed inset-0 z-50 hidden items-center justify-center bg-[#0A111E]/80 p-4 backdrop-blur-sm';

    const dialog = document.createElement('div');
    dialog.setAttribute('tabindex', '-1');
    dialog.className = 'w-full max-w-md rounded-2xl border border-white/10 bg-[#0D1B2A] p-6 text-center shadow-2xl shadow-black/40';

    const heading = document.createElement('h2');
    heading.id = 'success-modal-title';
    heading.className = 'font-heading text-2xl font-bold text-[#F4F8FA]';
    heading.textContent = 'Успішно';

    const text = document.createElement('p');
    text.id = 'success-modal-description';
    text.className = 'mt-4 text-base leading-relaxed text-[#D9E3EF]';
    text.textContent = 'Дякуємо! Ваше повідомлення успішно надіслано.';

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'mt-6 inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#00C2D1] px-5 py-3 text-base font-semibold text-[#0A111E] transition-colors duration-200 hover:bg-[#00D7E6] focus-visible:outline-none';
    closeButton.textContent = 'Закрити';
    closeButton.setAttribute('aria-label', 'Закрити повідомлення про успішне надсилання');

    dialog.appendChild(heading);
    dialog.appendChild(text);
    dialog.appendChild(closeButton);
    modal.appendChild(dialog);
    document.body.appendChild(modal);

    closeButton.addEventListener('click', hideSuccessModal);
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        hideSuccessModal();
      }
    });

    return { modal, closeButton };
  }

  const successModal = createSuccessModal();
  let lastFocusedElement = null;

  function showSuccessModal() {
    lastFocusedElement = document.activeElement;
    successModal.modal.classList.remove('hidden');
    successModal.modal.classList.add('flex');
    document.body.classList.add('overflow-hidden');

    const focusableSelectors = 'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])';
    const focusableNodes = Array.from(successModal.modal.querySelectorAll(focusableSelectors));
    const firstFocusable = focusableNodes[0];
    const lastFocusable = focusableNodes[focusableNodes.length - 1];

    if (firstFocusable) {
      firstFocusable.focus();
    }

    successModal.modal.onkeydown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        hideSuccessModal();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      if (!focusableNodes.length) {
        event.preventDefault();
        return;
      }

      if (event.shiftKey && document.activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable.focus();
      } else if (!event.shiftKey && document.activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    };
  }

  function hideSuccessModal() {
    successModal.modal.classList.add('hidden');
    successModal.modal.classList.remove('flex');
    document.body.classList.remove('overflow-hidden');
    successModal.modal.onkeydown = null;

    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
    }
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
        return;
      }

      event.preventDefault();
      showSuccessModal();
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

        const formIsValid = getFieldsToValidate(form).every((field) => !getErrorMessage(field));
        if (!formIsValid) {
          alert('Форма ще містить помилки. Перевірте введені дані.');
          return;
        }

        showSuccessModal();
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
