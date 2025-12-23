
// Set your PUBLIC backend URL here
(function(){
  const DEFAULT="https://YOUR-BACKEND.onrender.com"; // <-- CHANGE
  const saved=localStorage.getItem("backend_url");
  window.BACKEND_BASE_URL=(saved||DEFAULT).replace(/\/$/,"");
})();
