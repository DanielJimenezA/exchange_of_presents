
// Backend público (local o producción)
(function () {
  const DEFAULT = "http://127.0.0.1:8000";
  // En producción cambia a:
  // https://TU-BACKEND.onrender.com

  const saved = localStorage.getItem("backend_url");
  window.BACKEND_BASE_URL = (saved || DEFAULT).replace(/\/$/, "");
})();
