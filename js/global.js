const themeStorageKey = "vodan-theme";
const rootElement = document.documentElement;

const applyTheme = (theme) => {
  const isLight = theme === "light";
  rootElement.dataset.theme = isLight ? "light" : "dark";
  rootElement.classList.toggle("light-theme", isLight);
  document.body?.classList.toggle("light-theme", isLight);

  document.querySelectorAll(".theme-switcher").forEach((button) => {
    button.setAttribute("aria-label", isLight ? "Увімкнути темну тему" : "Увімкнути світлу тему");
    button.setAttribute("aria-pressed", String(isLight));
  });

  document.querySelectorAll(".logo img").forEach((image) => {
    const source = image.dataset.darkSrc || image.getAttribute("src");
    if (!source) {
      return;
    }

    const darkSource = source.replace(/(?:logolight|logol)\.svg$/i, "logo.svg");
    const lightSource = darkSource.replace(/logo\.svg$/i, "logolight.svg");
    image.dataset.darkSrc = darkSource;
    image.dataset.lightSrc = lightSource;
    image.src = isLight ? lightSource : darkSource;
  });

  document.querySelectorAll("img[src*='_darkmode.svg'], img[src*='_lightmode.svg']").forEach((image) => {
    const source = image.getAttribute("src");
    if (!source) {
      return;
    }

    const darkSource = source.replace(/_(?:darkmode|lightmode)\.svg$/i, "_darkmode.svg");
    const lightSource = source.replace(/_(?:darkmode|lightmode)\.svg$/i, "_lightmode.svg");
    image.dataset.darkSrc = darkSource;
    image.dataset.lightSrc = lightSource;
    image.src = isLight ? lightSource : darkSource;
  });
};

try {
  applyTheme(localStorage.getItem(themeStorageKey) === "light" ? "light" : "dark");
} catch (error) {
  console.warn("Не вдалося прочитати збережену тему; використовується темна тема.", error);
  applyTheme("dark");
}

document.addEventListener("DOMContentLoaded", () => {
  applyTheme(rootElement.dataset.theme);
});

document.addEventListener("click", (event) => {
  const target = event.target;

  if (!(target instanceof Element)) {
    return;
  }

  const clickedThemeButton = target.closest(".theme-switcher");
  if (clickedThemeButton) {
    const nextTheme = rootElement.dataset.theme === "light" ? "dark" : "light";
    applyTheme(nextTheme);

    try {
      localStorage.setItem(themeStorageKey, nextTheme);
    } catch (error) {
      console.warn("Не вдалося зберегти вибрану тему.", error);
    }
    return;
  }

  const clickedDetails = target.closest("details");
  document.querySelectorAll("details[open]").forEach((details) => {
    if (!clickedDetails || details !== clickedDetails) {
      details.open = false;
    }
  });
});

window.addEventListener("storage", (event) => {
  if (event.key === themeStorageKey) {
    applyTheme(event.newValue === "light" ? "light" : "dark");
  }
});
