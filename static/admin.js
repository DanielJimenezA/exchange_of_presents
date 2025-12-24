function api(path) {
  return window.BACKEND_BASE_URL + path;
}

let intercambioId = "";

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

function mensajeWhatsApp(da, recibe, regalos) {
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

async function generarId() {
  intercambioId = "NAV-" + crypto.randomUUID().slice(0, 8).toUpperCase();
  document.getElementById("id").value = intercambioId;

  const base = location.href.replace(/admin\.html.*$/i, "");
  const link = base + "participante.html?id=" + intercambioId;
  document.getElementById("link").value = link;

  document.getElementById("qr").src =
    "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=" +
    encodeURIComponent(link);

  await fetch(api("/api/intercambio/crear"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ intercambio_id: intercambioId })
  });

  refreshAll();
}

async function refreshAll() {
  if (!intercambioId) return;

  const r1 = await fetch(api(`/api/intercambio/${intercambioId}/contador`));
  const { total } = await r1.json();
  document.getElementById("contador").textContent = total;

  const r2 = await fetch(api(`/api/intercambio/${intercambioId}/participantes`));
  const data = await r2.json();

  const tbody = document.getElementById("tablaParticipantes");
  tbody.innerHTML = "";

  data.forEach((p, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="text-center">${i + 1}</td>
      <td>${escapeHtml(p.nombre)}</td>
      <td>${escapeHtml(p.whatsapp)}</td>
      <td>
        🎁 ${escapeHtml(p.regalos[0] || "")}<br>
        🎁 ${escapeHtml(p.regalos[1] || "")}<br>
        🎁 ${escapeHtml(p.regalos[2] || "")}
      </td>
      <td><code>${escapeHtml(p.token)}</code></td>
    `;
    tbody.appendChild(tr);
  });
}

async function sortear() {
  const r = await fetch(api(`/api/intercambio/${intercambioId}/sorteo`), {
    method: "POST"
  });
  const data = await r.json();

  const tbody = document.getElementById("tablaSorteo");
  tbody.innerHTML = "";

  data.forEach((row, i) => {
    const mensaje = encodeURIComponent(
      mensajeWhatsApp(row.da, row.recibe, row.regalos)
    );

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="text-center">${i + 1}</td>
      <td>${escapeHtml(row.da)}</td>
      <td class="fw-bold text-danger">${escapeHtml(row.recibe)}</td>
      <td>
        <a class="btn btn-success btn-sm"
           target="_blank"
           href="https://wa.me/${row.whatsapp}?text=${mensaje}">
           Enviar WhatsApp
        </a>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function cerrarIntercambio() {
  if (!confirm("¿Cerrar el intercambio?")) return;
  await fetch(api(`/api/intercambio/${intercambioId}/cerrar`), { method: "POST" });
  alert("Intercambio cerrado");
}

function copiar(id) {
  navigator.clipboard.writeText(document.getElementById(id).value);
}

function abrirLink() {
  window.open(document.getElementById("link").value, "_blank");
}

document.addEventListener("DOMContentLoaded", () => {
  setInterval(refreshAll, 5000);
});
