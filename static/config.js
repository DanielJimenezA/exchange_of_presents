// Producción (Azure)
const BACKEND_PROD = "https://exchange-of-presents-api.azurewebsites.net";

// Desarrollo local
const BACKEND_LOCAL = "http://127.0.0.1:8000";

const isLocal = location.hostname === "localhost" || location.hostname === "127.0.0.1";
window.BACKEND_BASE_URL = isLocal ? BACKEND_LOCAL : BACKEND_PROD;
