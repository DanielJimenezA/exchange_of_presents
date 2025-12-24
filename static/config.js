/**
 * Backend URL selection:
 * - If you're running locally, it defaults to http://127.0.0.1:8000
 * - If you're on GitHub Pages and haven't set it, it will prompt you once.
 *
 * You can always override via console:
 *   localStorage.setItem('backend_url','https://your-backend.onrender.com'); location.reload();
 */
(function () {
  const isLocal = location.hostname === "127.0.0.1" || location.hostname === "localhost";
  const DEFAULT_LOCAL = "http://127.0.0.1:8000";
  const saved = localStorage.getItem("backend_url");

  function normalize(u){ return (u || "").trim().replace(/\/$/, ""); }

  let url = normalize(saved);

  if (!url) {
    if (isLocal) {
      url = DEFAULT_LOCAL;
    } else {
      url = normalize(prompt("Pega la URL pública del backend (Render/Railway), ej: https://xxxx.onrender.com", ""));
      if (url) localStorage.setItem("backend_url", url);
    }
  }

  window.BACKEND_BASE_URL = url;
})();
