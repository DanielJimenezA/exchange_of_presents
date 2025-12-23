// === Backend URL configuration ===
// 1) Set DEFAULT below to your deployed FastAPI (Render/Railway/etc.)
//    Example: "https://exchange-of-presents-backend.onrender.com"
// 2) You can also override it in the browser console:
//    localStorage.setItem('backend_url','https://...'); location.reload();

(function(){
  const DEFAULT = "https://YOUR-BACKEND.example.com"; // <-- CHANGE THIS
  const saved = localStorage.getItem("backend_url");
  window.BACKEND_BASE_URL = (saved && saved.trim()) ? saved.trim().replace(/\/$/, "") : DEFAULT.replace(/\/$/, "");
})();
