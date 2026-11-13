const calculator = document.querySelector(".calc-form");

if (calculator) {
  const prices = {
    base: 150,
    format: {
      self: 0,
      group: 80,
      solo: 350,
    },
    trainer: {
      oksana: { name: "Оксана Корновська", price: 0 },
      taras: { name: "Тарас Сорока", price: 50 },
      stepan: { name: "Степан Гула", price: 90 },
      olha: { name: "Ольга Логовська", price: 120 },
    },
    audience: {
      adult: 1,
      kids: 0.9,
    },
    visits: {
      4: { discount: 0 },
      8: { discount: 5 },
      12: { discount: 10 },
      24: { discount: 15 },
    },
    terms: {
      1: { surcharge: 0 },
      2: { surcharge: 500 },
      3: { surcharge: 900 },
    },
    extras: {
      sauna: { label: "Сауна", price: 300 },
      towel: { label: "Рушник і халат", price: 120 },
      locker: { label: "Шафка", price: 90 },
      freeze: { label: "Заморозка", price: 150 },
    },
  };
  const currency = new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "UAH",
    maximumFractionDigits: 0,
  });
  const formatHryvnia = (amount) => `${new Intl.NumberFormat("uk-UA").format(amount)} ₴`;
  const valueFor = (name) => calculator.querySelector(`input[name="${name}"]:checked`)?.value;

  const updateSummaryRow = (key, label, value, visible = true) => {
    const row = calculator.querySelector(`[data-summary="${key}"]`);
    row.replaceChildren();

    if (!visible) {
      row.classList.remove("is-visible");
      return;
    }

    const labelElement = document.createElement("span");
    labelElement.textContent = label;
    const valueElement = document.createElement("span");
    valueElement.className = "summary-value";
    valueElement.textContent = value;
    row.append(labelElement, valueElement);
    row.classList.add("is-visible");
  };

  const updateCalculator = () => {
    const selectedFormat = valueFor("format") || "group:adult";
    const [formatType, audience] = selectedFormat.split(":");
    const trainer = valueFor("trainer") || "oksana";
    const visits = Number(valueFor("visits") || 8);
    const term = Number(valueFor("term") || 1);
    const visitPricing = prices.visits[visits];
    const termSurcharge = prices.terms[term].surcharge;
    const isSelf = formatType === "self";
    const selectedTrainer = prices.trainer[trainer];
    const trainerPrice = isSelf ? 0 : selectedTrainer.price;
    const unitPrice = prices.base * prices.audience[audience]
      + prices.format[formatType]
      + trainerPrice;
    const discountedSubtotal = unitPrice * visits * (1 - visitPricing.discount / 100);
    const extrasTotal = Object.entries(prices.extras).reduce((total, [key, extra]) => {
      return total + (calculator.querySelector(`#extra-${key}`).checked ? extra.price : 0);
    }, 0);
    const total = Math.round(discountedSubtotal + termSurcharge + extrasTotal);
    const perVisit = total / visits;

    calculator.querySelector("#price-base").textContent = `${currency.format(prices.base)} / відвідування`;
    calculator.querySelector("#price-total").textContent = currency.format(total);
    calculator.querySelector("#price-per-visit").textContent = `${currency.format(perVisit)} за відвідування`;
    calculator.querySelector("#confirmation-total").textContent = currency.format(total);

    const formatLabels = {
      "self:adult": "Вільне плавання, доросле",
      "self:kids": "Вільне плавання, дитяче",
      "group:adult": "Групові заняття, доросле",
      "group:kids": "Групові заняття, дитяче",
      "solo:adult": "Індивідуальні заняття, доросле",
      "solo:kids": "Індивідуальні заняття, дитяче",
    };
    updateSummaryRow("format", formatLabels[selectedFormat], `${currency.format(unitPrice)} / відвідування`);
    updateSummaryRow(
      "trainer",
      selectedTrainer.name,
      isSelf ? "Не застосовується" : `${currency.format(trainerPrice)} / відвідування`,
      !isSelf,
    );
    updateSummaryRow(
      "visits",
      "Кількість відвідувань",
      `× ${visits}${visitPricing.discount ? ` · знижка ${visitPricing.discount}%` : ""}`,
    );
    updateSummaryRow(
      "term",
      `Термін: ${term} ${term === 1 ? "місяць" : "місяці"}`,
      `+ ${formatHryvnia(termSurcharge)}`,
    );

    const selectedTime = valueFor("time");
    updateSummaryRow("time", `Час: ${selectedTime}`, "", !isSelf);

    Object.entries(prices.extras).forEach(([key, extra]) => {
      const selected = calculator.querySelector(`#extra-${key}`).checked;
      updateSummaryRow(key, extra.label, `+ ${currency.format(extra.price)}`, selected);
    });

    calculator.querySelector(".trainer-step").hidden = isSelf;
    calculator.querySelector(".time-group").hidden = isSelf;
  };

  calculator.addEventListener("change", updateCalculator);
  const confirmationCheckbox = calculator.querySelector("#agree");
  const confirmationError = calculator.querySelector("#confirmation-error");

  calculator.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!confirmationCheckbox.checked) {
      confirmationCheckbox.setAttribute("aria-invalid", "true");
      confirmationError.hidden = false;
      confirmationCheckbox.focus();
      return;
    }

    confirmationCheckbox.removeAttribute("aria-invalid");
    confirmationError.hidden = true;
    sessionStorage.setItem("isConfirmed", "true");
    calculator.dataset.confirmed = "true";
    window.location.hash = "confirmation";
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  confirmationCheckbox.addEventListener("change", () => {
    if (confirmationCheckbox.checked) {
      confirmationCheckbox.removeAttribute("aria-invalid");
      confirmationError.hidden = true;
    }
  });

  calculator.querySelector("[data-confirm-edit]").addEventListener("click", (event) => {
    event.preventDefault();
    sessionStorage.removeItem("isConfirmed");
    calculator.dataset.confirmed = "false";
    confirmationCheckbox.checked = false;
    confirmationCheckbox.removeAttribute("aria-invalid");
    confirmationError.hidden = true;
    window.location.hash = "top";
  });

  updateCalculator();

  if (sessionStorage.getItem("isConfirmed") === "true") {
    confirmationCheckbox.checked = true;
    calculator.dataset.confirmed = "true";
    window.location.hash = "confirmation";
  }
}
