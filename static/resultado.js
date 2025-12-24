function api(path) {
  if (!window.BACKEND_BASE_URL) throw new Error("BACKEND_BASE_URL vacío");
  return window.BACKEND_BASE_URL + path;
}

function getParam(name){
  return new URLSearchParams(location.search).get(name);
}

const intercambioId = getParam("id");

async function cargar(){
  const out = document.getElementById("out");
  if (!intercambioId) {
    out.innerHTML = `<div class="alert alert-danger">❌ Link inválido</div>`;
    return;
  }

  const token = localStorage.getItem("token_" + intercambioId);
  if (!token) {
    out.innerHTML = `<div class="alert alert-warning">⚠️ No encuentro tu token en este navegador. Regístrate desde este mismo dispositivo o pide al admin tu token.</div>`;
    return;
  }

  try {
    const r = await fetch(api(`/api/intercambio/${encodeURIComponent(intercambioId)}/resultado?token=${encodeURIComponent(token)}`));
    if (!r.ok) throw new Error();
    const d = await r.json();

    out.innerHTML = `
      <div class="card shadow p-4">
        <h4>Hola <span class="text-danger fw-bold">${escapeHtml(d.da)}</span> 🎄</h4>
        <p class="mt-3 mb-1 fw-bold">Te tocó regalar a:</p>
        <h2 class="text-success">${escapeHtml(d.recibe)}</h2>
      </div>
    `;
  } catch {
    out.innerHTML = `<div class="alert alert-danger">❌ Resultado no disponible todavía (o token inválido).</div>`;
  }
}

function escapeHtml(s){
  return String(s ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("exchangeId").textContent = intercambioId || "(sin id)";
  document.getElementById("backendUrl").textContent = window.BACKEND_BASE_URL || "(no configurado)";
  cargar();
});
