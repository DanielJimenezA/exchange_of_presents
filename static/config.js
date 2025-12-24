
(function () {
  const DEFAULT = "http://127.0.0.1:8000"; // change to production backend
  const saved = localStorage.getItem("backend_url");
  window.BACKEND_BASE_URL = (saved || DEFAULT).replace(/\/$/, "");
})();
