function api(path) {
  if (!window.BACKEND_BASE_URL) throw new Error("BACKEND_BASE_URL vacío");
  return window.BACKEND_BASE_URL + path;
}

let intercambioId = "";

function showToast(msg, kind="success"){
  const el = document.getElementById("toast");
  el.className = "alert " + (kind==="success" ? "alert-success" : kind==="danger" ? "alert-danger" : "alert-info");
  el.textContent = msg;
  el.classList.remove("d-none");
  setTimeout(()=>el.classList.add("d-none"), 2500);
}

async function healthCheck() {
  try {
    const r = await fetch(api("/api/health"));
    if (!r.ok) throw new Error();
    document.getElementById("backendBadge").textContent = "Backend OK";
    document.getElementById("backendBadge").className = "badge text-bg-success";
  } catch {
    document.getElementById("backendBadge").textContent = "Backend NO responde";
    document.getElementById("backendBadge").className = "badge text-bg-danger";
  }
}

function generarId() {
  intercambioId = "NAV-" + crypto.randomUUID().slice(0, 8).toUpperCase();
  document.getElementById("id").value = intercambioId;

  const base = location.href.replace(/admin\.html.*$/i, "");
  const link = base + "participante.html?id=" + encodeURIComponent(intercambioId);
  document.getElementById("link").value = link;

  document.getElementById("qr").src =
    "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" +
    encodeURIComponent(link);

  // registrar en backend
  fetch(api("/api/intercambio/crear"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ intercambio_id: intercambioId })
  }).then(r => {
    if (r.ok) showToast("✅ Intercambio creado en backend");
    else showToast("❌ No se pudo crear el intercambio", "danger");
  });

  refreshAll();
}

function copiar(inputId) {
  const val = document.getElementById(inputId).value;
  navigator.clipboard.writeText(val).then(() => showToast("✅ Copiado"));
}

function abrirLink() {
  const link = document.getElementById("link").value;
  if (link) window.open(link, "_blank");
}

async function refreshContador() {
  if (!intercambioId) return;
  const r = await fetch(api(`/api/intercambio/${encodeURIComponent(intercambioId)}/contador`));
  if (!r.ok) return;
  const d = await r.json();
  document.getElementById("contador").textContent = d.total ?? 0;
}

async function refreshParticipantes() {
  if (!intercambioId) return;
  const r = await fetch(api(`/api/intercambio/${encodeURIComponent(intercambioId)}/participantes`));
  if (!r.ok) return;
  const data = await r.json();

  const tbody = document.getElementById("tablaParticipantes");
  tbody.innerHTML = "";

  if (!data || data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-muted text-center">Aún no hay participantes</td></tr>`;
    return;
  }

  data.forEach((p, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="text-center">${i + 1}</td>
      <td>${escapeHtml(p.nombre)}</td>
      <td>${escapeHtml(p.whatsapp)}</td>
      <td>🎁 ${escapeHtml((p.regalos||[])[0]||"")}<br>🎁 ${escapeHtml((p.regalos||[])[1]||"")}<br>🎁 ${escapeHtml((p.regalos||[])[2]||"")}</td>
      <td><code>${escapeHtml(p.token || "")}</code></td>
    `;
    tbody.appendChild(tr);
  });
}

function escapeHtml(s){
  return String(s ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

async function cerrarIntercambio() {
  if (!intercambioId) return showToast("Primero genera el ID", "info");
  if (!confirm("¿Seguro que quieres cerrar el intercambio? Ya no podrán registrarse.")) return;

  const r = await fetch(api(`/api/intercambio/${encodeURIComponent(intercambioId)}/cerrar`), { method: "POST" });
  if (r.ok) showToast("✅ Intercambio cerrado");
  else showToast("❌ Error al cerrar", "danger");
}

async function sortear() {
  if (!intercambioId) return showToast("Primero genera el ID", "info");

  const r = await fetch(api(`/api/intercambio/${encodeURIComponent(intercambioId)}/sorteo`), { method: "POST" });
  if (!r.ok) {
    const txt = await r.text();
    return showToast("❌ No se pudo sortear (revisa participantes)", "danger");
  }
  const data = await r.json();

  const tbody = document.getElementById("tablaSorteo");
  tbody.innerHTML = "";

  data.forEach((row, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="text-center">${i + 1}</td>
      <td>${escapeHtml(row.da)}</td>
      <td class="fw-bold text-danger">${escapeHtml(row.recibe)}</td>
      <td>
        <a class="btn btn-success btn-sm" target="_blank"
           href="https://wa.me/${encodeURIComponent(row.whatsapp)}?text=${encodeURIComponent(mensajeWhatsApp(row.da, row.recibe))}">
           Enviar WhatsApp
        </a>
      </td>
    `;
    tbody.appendChild(tr);
  });

  showToast("🎉 Sorteo realizado y guardado");
}

function mensajeWhatsApp(da, recibe){
  return `🎄 Amigo Secreto 🎁\nHola ${da}!\nTe tocó regalar a: ${recibe}\n\n¡Gracias por participar! 🎅`;
}

function exportarExcel(){
  if (!intercambioId) return showToast("Primero genera el ID", "info");
  window.open(api(`/api/intercambio/${encodeURIComponent(intercambioId)}/excel`), "_blank");
}

async function refreshAll(){
  await refreshContador();
  await refreshParticipantes();
}

document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("backendUrl").textContent = window.BACKEND_BASE_URL || "(no configurado)";
  await healthCheck();
  setInterval(()=>healthCheck(), 10000);
  setInterval(()=>refreshAll(), 5000);
});
