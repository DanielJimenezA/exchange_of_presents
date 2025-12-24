function api(path) {
  return window.BACKEND_BASE_URL + path;
}

let intercambioId = "";

function escapeHtml(s){
  return String(s ?? "").replace(/[&<>"']/g, c =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])
  );
}

function adminHeaders(){
  const t = localStorage.getItem("admin_token") || "";
  return {
    "Content-Type": "application/json",
    "X-Admin-Token": t
  };
}

function requireAdminToken(){
  const t = (localStorage.getItem("admin_token") || "").trim();
  if (!t) {
    alert("⚠️ Falta el Admin Token. Pégalo y guarda primero.");
    throw new Error("missing admin token");
  }
  return t;
}

function showToast(msg, kind="success"){
  const el = document.getElementById("toast");
  el.className = "alert " + (kind==="success" ? "alert-success" : kind==="danger" ? "alert-danger" : "alert-info");
  el.textContent = msg;
  el.classList.remove("d-none");
  setTimeout(()=>el.classList.add("d-none"), 2500);
}

function guardarToken(){
  const token = (document.getElementById("adminToken").value || "").trim();
  if (!token) return alert("Pega el token");
  localStorage.setItem("admin_token", token);
  showToast("✅ Token guardado");
}

function copiar(id){
  navigator.clipboard.writeText(document.getElementById(id).value || "");
  showToast("✅ Copiado");
}

function abrirLink(){
  const link = document.getElementById("link").value;
  if (link) window.open(link, "_blank");
}

function buildParticipantLink(iid){
  const base = location.href.replace(/admin\.html.*$/i, "");
  return base + "participante.html?id=" + encodeURIComponent(iid);
}

async function generarId(){
  requireAdminToken();

  intercambioId = "NAV-" + crypto.randomUUID().slice(0,8).toUpperCase();
  document.getElementById("id").value = intercambioId;

  const link = buildParticipantLink(intercambioId);
  document.getElementById("link").value = link;

  document.getElementById("qr").src =
    "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=" + encodeURIComponent(link);

  const r = await fetch(api("/api/intercambio/crear"), {
    method: "POST",
    headers: adminHeaders(),
    body: JSON.stringify({ intercambio_id: intercambioId })
  });

  if (!r.ok) return showToast("❌ No se pudo crear intercambio (token?)", "danger");
  showToast("✅ Intercambio creado");
  await cargarIntercambio(intercambioId);
}

async function buscarIntercambio(){
  requireAdminToken();

  const id = (document.getElementById("buscarId").value || "").trim();
  if (!id) return alert("Ingresa un ID");
  await cargarIntercambio(id);
}

async function cargarIntercambio(id){
  requireAdminToken();

  const r = await fetch(api(`/api/intercambio/${encodeURIComponent(id)}`), { headers: adminHeaders() });
  if (!r.ok) return showToast("❌ Intercambio no encontrado (o token inválido)", "danger");
  const d = await r.json();

  intercambioId = d.id;
  document.getElementById("id").value = intercambioId;

  const link = buildParticipantLink(intercambioId);
  document.getElementById("link").value = link;

  document.getElementById("qr").src =
    "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=" + encodeURIComponent(link);

  document.getElementById("contador").textContent = d.total_participantes ?? 0;
  document.getElementById("estado").textContent = `cerrado=${d.cerrado ? "sí" : "no"} | sorteado=${d.sorteado ? "sí" : "no"}`;

  await refreshParticipantes();
  await refreshSorteoIfExists();

  showToast("✅ Intercambio cargado");
}

async function refreshParticipantes(){
  if (!intercambioId) return;

  const r = await fetch(api(`/api/intercambio/${encodeURIComponent(intercambioId)}/participantes`), { headers: adminHeaders() });
  if (!r.ok) return;

  const data = await r.json();
  const tbody = document.getElementById("tablaParticipantes");
  tbody.innerHTML = "";

  if (!data || data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-muted text-center">Aún no hay participantes</td></tr>`;
    return;
  }

  data.forEach((p, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="text-center">${i+1}</td>
      <td>${escapeHtml(p.nombre)}</td>
      <td>${escapeHtml(p.whatsapp)}</td>
      <td>🎁 ${escapeHtml((p.regalos||[])[0]||"")}<br>🎁 ${escapeHtml((p.regalos||[])[1]||"")}<br>🎁 ${escapeHtml((p.regalos||[])[2]||"")}</td>
      <td><code>${escapeHtml(p.token||"")}</code></td>
      <td>${escapeHtml(p.recibe||"")}</td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById("contador").textContent = data.length;
}

function mensajeWhatsApp(da, recibe, regalos){
  const lista = (regalos || [])
    .filter(r => r && r.trim())
    .map(r => `🎁 ${r}`)
    .join("\n");

  return [
    "🎄 *Amigo Secreto* 🎁",
    "",
    `Hola *${da}*!`,
    "",
    `Te tocó regalar a: *${recibe}*`,
    "",
    "🎁 *Opciones de regalo:*",
    lista || "— Sin opciones registradas —",
    "",
    "¡Gracias por participar! 🎅✨"
  ].join("\n");
}

async function sortear(){
  requireAdminToken();
  if (!intercambioId) return showToast("Primero carga un intercambio", "info");

  const r = await fetch(api(`/api/intercambio/${encodeURIComponent(intercambioId)}/sorteo`), {
    method: "POST",
    headers: adminHeaders()
  });

  if (!r.ok) return showToast("❌ No se pudo sortear (token? participantes?)", "danger");
  const data = await r.json();

  const tbody = document.getElementById("tablaSorteo");
  tbody.innerHTML = "";

  data.forEach((row, i) => {
    const msg = encodeURIComponent(mensajeWhatsApp(row.da, row.recibe, row.regalos));
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="text-center">${i+1}</td>
      <td>${escapeHtml(row.da)}</td>
      <td class="fw-bold text-danger">${escapeHtml(row.recibe)}</td>
      <td>
        <a class="btn btn-success btn-sm" target="_blank"
           href="https://wa.me/${encodeURIComponent(row.whatsapp)}?text=${msg}">
           Enviar WhatsApp
        </a>
      </td>
    `;
    tbody.appendChild(tr);
  });

  await refreshParticipantes();
  showToast("🎉 Sorteo realizado y guardado");
}

async function refreshSorteoIfExists(){
  // si ya sorteado, el backend regresa el sorteo persistido con el mismo endpoint
  if (!intercambioId) return;
  const r = await fetch(api(`/api/intercambio/${encodeURIComponent(intercambioId)}`), { headers: adminHeaders() });
  if (!r.ok) return;
  const d = await r.json();
  document.getElementById("estado").textContent = `cerrado=${d.cerrado ? "sí" : "no"} | sorteado=${d.sorteado ? "sí" : "no"}`;
}

async function cerrarIntercambio(){
  requireAdminToken();
  if (!intercambioId) return showToast("Primero carga un intercambio", "info");
  if (!confirm("¿Seguro que quieres cerrar el intercambio?")) return;

  const r = await fetch(api(`/api/intercambio/${encodeURIComponent(intercambioId)}/cerrar`), {
    method: "POST",
    headers: adminHeaders()
  });

  if (!r.ok) return showToast("❌ Error al cerrar (token?)", "danger");
  showToast("✅ Intercambio cerrado");
  await cargarIntercambio(intercambioId);
}

async function resetIntercambio(){
  requireAdminToken();
  if (!intercambioId) return showToast("Primero carga un intercambio", "info");
  if (!confirm("Reset: reabre y elimina el sorteo (recibe=NULL). ¿Continuar?")) return;

  const r = await fetch(api(`/api/intercambio/${encodeURIComponent(intercambioId)}/reset`), {
    method: "POST",
    headers: adminHeaders()
  });

  if (!r.ok) return showToast("❌ No se pudo resetear", "danger");
  showToast("✅ Reseteado");
  await cargarIntercambio(intercambioId);
}

async function eliminarIntercambio(){
  requireAdminToken();
  if (!intercambioId) return showToast("Primero carga un intercambio", "info");
  if (!confirm("⚠️ Esto borrará participantes y el intercambio. ¿Eliminar?")) return;

  const r = await fetch(api(`/api/intercambio/${encodeURIComponent(intercambioId)}`), {
    method: "DELETE",
    headers: adminHeaders()
  });

  if (!r.ok) return showToast("❌ No se pudo eliminar", "danger");
  showToast("🗑️ Eliminado");
  intercambioId = "";
  document.getElementById("id").value = "";
  document.getElementById("link").value = "";
  document.getElementById("contador").textContent = "0";
  document.getElementById("estado").textContent = "—";
  document.getElementById("tablaParticipantes").innerHTML = "";
  document.getElementById("tablaSorteo").innerHTML = "";
}

async function exportarExcel(){
  requireAdminToken();
  if (!intercambioId) return showToast("Primero carga un intercambio", "info");
  window.open(api(`/api/intercambio/${encodeURIComponent(intercambioId)}/excel`), "_blank");
}

async function cargarHistorial(){
  requireAdminToken();

  const r = await fetch(api("/api/intercambios"), { headers: adminHeaders() });
  if (!r.ok) return showToast("❌ No se pudo cargar historial (token?)", "danger");
  const data = await r.json();

  const tbody = document.getElementById("tablaHistorial");
  tbody.innerHTML = "";

  if (!data || data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-muted text-center">Sin intercambios</td></tr>`;
    return;
  }

  data.forEach(x => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><code>${escapeHtml(x.id)}</code></td>
      <td class="text-center">${x.total_participantes}</td>
      <td class="text-center">${x.cerrado ? "✅" : "—"}</td>
      <td class="text-center">${x.sorteado ? "✅" : "—"}</td>
      <td class="text-center">
        <button class="btn btn-sm btn-outline-primary" onclick="cargarIntercambio('${escapeHtml(x.id)}')">Cargar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  showToast("📜 Historial cargado");
}

// Auto-llenar token si ya existe
document.addEventListener("DOMContentLoaded", () => {
  const t = localStorage.getItem("admin_token") || "";
  document.getElementById("adminToken").value = t;
});
