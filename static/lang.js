let currentLang = localStorage.getItem("lang") || "es";

function t(key) {
  return (I18N[currentLang] && I18N[currentLang][key]) ? I18N[currentLang][key] : key;
}

function applyTextTranslations() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    el.textContent = t(key);
  });
}

function applyPlaceholderTranslations() {
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    el.placeholder = t(key);
  });
}

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("lang", lang);
  applyTextTranslations();
  applyPlaceholderTranslations();

  if (typeof window.onLanguageChanged === "function") {
    window.onLanguageChanged(lang);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setLanguage(currentLang);
});
