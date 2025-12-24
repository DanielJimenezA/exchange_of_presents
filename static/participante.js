function api(path) {
  if (!window.BACKEND_BASE_URL) throw new Error("BACKEND_BASE_URL vacío");
  return window.BACKEND_BASE_URL + path;
}

function getParam(name){
  return new URLSearchParams(location.search).get(name);
}

const intercambioId = getParam("id");

function showAlert(msg, kind="success"){
  const el = document.getElementById("alert");
  el.className = "alert alert-" + kind;
  el.textContent = msg;
  el.classList.remove("d-none");
}

async function enviar(){
  if (!intercambioId) return showAlert("❌ Link inválido (no viene id)", "danger");

  const payload = {
    intercambio_id: intercambioId,
    nombre: (document.getElementById("nombre").value || "").trim(),
    whatsapp: (document.getElementById("whatsapp").value || "").trim(),
    regalos: [
      (document.getElementById("r1").value || "").trim(),
      (document.getElementById("r2").value || "").trim(),
      (document.getElementById("r3").value || "").trim()
    ]
  };

  if (!payload.nombre || !payload.whatsapp) return showAlert("❌ Nombre y WhatsApp son obligatorios", "danger");

  try {
    const r = await fetch(api("/api/participante"), {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(payload)
    });

    const data = await r.json().catch(()=>({}));

    if (!r.ok) {
      return showAlert("❌ El intercambio está cerrado, ya fue sorteado o es inválido", "danger");
    }

    // Guardamos token por intercambio (para consultar resultado después)
    localStorage.setItem("token_" + intercambioId, data.token || "");
    showAlert("✅ Registro guardado. Te avisaremos cuando hagan el sorteo.", "success");

  } catch {
    showAlert("❌ No se pudo conectar al backend. Revisa la URL.", "danger");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("exchangeId").textContent = intercambioId || "(sin id)";
  document.getElementById("backendUrl").textContent = window.BACKEND_BASE_URL || "(no configurado)";
});
