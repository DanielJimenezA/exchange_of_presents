// ===============================
// CONFIGURACIÓN GLOBAL DEL BACKEND
// ===============================

// 🔴 PRODUCCIÓN (AZURE)
const BACKEND_PROD = "https://exchange-of-presents-api.azurewebsites.net";

// 🟡 DESARROLLO LOCAL (opcional)
const BACKEND_LOCAL = "http://127.0.0.1:8000";

// Detectar si estamos en localhost
const isLocal =
  location.hostname === "localhost" ||
  location.hostname === "127.0.0.1";

// Selección automática
window.BACKEND_BASE_URL = isLocal ? BACKEND_LOCAL : BACKEND_PROD;
