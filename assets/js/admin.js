/* ============================================================
   Espace pro AMR — tableau de bord de gestion des demandes
   (devis, rendez-vous, suivi de chantier) + export CSV
   ============================================================ */

const STAGES = [
  "Demande reçue",
  "Visite technique",
  "Devis transmis",
  "Travaux planifiés",
  "Chantier en cours",
  "Réception & livraison",
];

let adminFilter = "all";

/* ---- Accès ---- */
function unlock() {
  document.getElementById("gate").classList.add("hidden");
  document.getElementById("dash").classList.remove("hidden");
  document.getElementById("logoutBtn").style.display = "";
  initAgenda();
  render();
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

function projects() { return Store.get("projects", []); }

function saveProjects(list) { Store.set("projects", list); }

/* ---- Statistiques ---- */
function renderStats() {
  const all = projects();
  const now = Date.now();
  const week = all.filter(p => now - new Date(p.createdAt).getTime() < 7 * 864e5).length;
  const enCours = all.filter(p => (p.stepIndex ?? 0) > 0 && (p.stepIndex ?? 0) < STAGES.length - 1).length;

  const stats = [
    { n: all.length, l: "Demandes totales", ic: "inbox" },
    { n: all.filter(p => p.type === "devis").length, l: "Devis", ic: "file" },
    { n: all.filter(p => p.type === "rdv").length, l: "Rendez-vous", ic: "calendar" },
    { n: week, l: "Cette semaine", ic: "clock" },
  ];
  document.getElementById("adminStats").innerHTML = stats.map(s => `
    <div class="admin-stat">
      <div class="n">${s.n}</div>
      <div class="l">${icon(s.ic === "inbox" ? "dashboard" : s.ic, 16)} ${s.l}</div>
    </div>`).join("");
}

/* ---- Tableau ---- */
function detailOf(p) {
  if (p.type === "rdv") return p.slot ? `${p.slot.day} · ${p.slot.hour}` : "—";
  if (p.estimate && p.estimate.raw > 0) return `${euro(p.estimate.min)}–${euro(p.estimate.max)}`;
  return "Sur devis";
}

function render() {
  renderStats();
  const all = projects().filter(p => adminFilter === "all" || p.type === adminFilter);
  const body = document.getElementById("dataBody");
  const empty = document.getElementById("emptyState");

  if (!all.length) {
    body.innerHTML = "";
    empty.classList.remove("hidden");
    return;
  }
  empty.classList.add("hidden");

  body.innerHTML = all.map(p => {
    const idx = p.stepIndex ?? 0;
    const opts = STAGES.map((s, i) => `<option value="${i}" ${i === idx ? "selected" : ""}>${s}</option>`).join("");
    return `
      <tr>
        <td class="cell-strong">${p.ref}</td>
        <td>${fmtDate(p.createdAt)}</td>
        <td><span class="tag-type ${p.type}">${p.type === "rdv" ? "RDV" : "Devis"}</span></td>
        <td class="cell-strong">${p.client.prenom} ${p.client.nom}</td>
        <td>
          <a href="tel:${p.client.tel}">${p.client.tel}</a><br>
          <span class="muted" style="font-size:.82rem">${p.client.email}</span>
        </td>
        <td>${p.serviceLabel}</td>
        <td>${detailOf(p)}</td>
        <td><select data-ref="${p.ref}">${opts}</select></td>
        <td><button class="icon-btn" data-del="${p.ref}" title="Supprimer">${icon("trash", 16)}</button></td>
      </tr>`;
  }).join("");

  body.querySelectorAll("select[data-ref]").forEach(sel => sel.addEventListener("change", () => {
    const list = projects();
    const p = list.find(x => x.ref === sel.dataset.ref);
    if (p) { p.stepIndex = Number(sel.value); p.status = STAGES[p.stepIndex]; saveProjects(list); render(); }
  }));

  body.querySelectorAll("button[data-del]").forEach(btn => btn.addEventListener("click", () => {
    const ref = btn.dataset.del;
    const target = projects().find(x => x.ref === ref);
    const isRdv = target && target.type === "rdv" && target.slot;
    const msg = isRdv
      ? "Annuler ce rendez-vous ? Le créneau sera de nouveau disponible à la réservation."
      : "Supprimer définitivement cette demande ?";
    if (!confirm(msg)) return;

    // Annulation d'un RDV : on libère le créneau réservé
    if (isRdv) freeSlot(target.slot.key, target.slot.hour);

    saveProjects(projects().filter(x => x.ref !== ref));
    render();
  }));
}

/* Libère un créneau réservé (annulation de RDV) */
function freeSlot(key, hour) {
  const booked = Store.get("bookedSlots", {});
  if (!booked[key]) return;
  booked[key] = booked[key].filter(h => h !== hour);
  if (!booked[key].length) delete booked[key];
  Store.set("bookedSlots", booked);
}

/* ---- Agenda : indisponibilités ---- */
function reasons() { return Store.get("blockReasons", {}); }
function setReason(id, txt) { const r = reasons(); if (txt) r[id] = txt; else delete r[id]; Store.set("blockReasons", r); }

function initAgenda() {
  const sel = document.getElementById("blockSlot");
  sel.innerHTML = `<option value="all">Journée entière</option>` +
    SLOT_HOURS.map(h => `<option value="${h}">${h}</option>`).join("");
  const dateInput = document.getElementById("blockDate");
  dateInput.min = new Date().toISOString().slice(0, 10);
  renderBlocks();
}

function renderBlocks() {
  const host = document.getElementById("blockList");
  const r = reasons();
  const items = [];

  Availability.days().forEach(key => items.push({ key, hour: null, sort: key + " 00:00" }));
  const slots = Availability.slots();
  Object.keys(slots).forEach(key => slots[key].forEach(h => items.push({ key, hour: h, sort: key + " " + h })));
  items.sort((a, b) => a.sort.localeCompare(b.sort));

  if (!items.length) {
    host.innerHTML = `<div class="block-empty">Aucune indisponibilité enregistrée. Vos créneaux sont tous ouverts à la réservation.</div>`;
    return;
  }

  host.innerHTML = items.map(it => {
    const id = it.hour ? `${it.key}|${it.hour}` : it.key;
    const tag = it.hour
      ? `<span class="slot-tag partial">${it.hour}</span>`
      : `<span class="slot-tag full">Journée entière</span>`;
    const reason = r[id] ? `<span class="reason">${r[id]}</span>` : `<span class="reason"></span>`;
    return `
      <div class="block-item">
        <span class="when">${formatDateFr(it.key)}</span>
        ${tag}
        ${reason}
        <button class="icon-btn" data-unblock="${id}" title="Réactiver">${icon("trash", 16)}</button>
      </div>`;
  }).join("");

  host.querySelectorAll("[data-unblock]").forEach(btn => btn.addEventListener("click", () => {
    const id = btn.dataset.unblock;
    if (id.includes("|")) { const [k, h] = id.split("|"); Availability.unblockSlot(k, h); }
    else Availability.unblockDay(id);
    setReason(id, "");
    renderBlocks();
  }));
}

/* ---- Export CSV ---- */
function exportCSV() {
  const all = projects();
  if (!all.length) { alert("Aucune donnée à exporter."); return; }
  const headers = ["Référence", "Date", "Type", "Prénom", "Nom", "Téléphone", "Email", "Ville", "Prestation", "Détail", "Statut"];
  const rows = all.map(p => [
    p.ref, new Date(p.createdAt).toLocaleString("fr-FR"), p.type,
    p.client.prenom, p.client.nom, p.client.tel, p.client.email,
    `${p.client.cp || ""} ${p.client.ville || ""}`.trim(), p.serviceLabel,
    detailOf(p), STAGES[p.stepIndex ?? 0],
  ]);
  const csv = [headers, ...rows]
    .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(";"))
    .join("\r\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `amr-demandes-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ---- Init ---- */
document.addEventListener("DOMContentLoaded", () => {
  if (sessionStorage.getItem("amr_admin_ok") === "1") unlock();

  document.getElementById("gateForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const pin = document.getElementById("pin").value;
    if (pin === CONFIG.adminPin) {
      sessionStorage.setItem("amr_admin_ok", "1");
      unlock();
    } else {
      document.getElementById("gateError").classList.remove("hidden");
    }
  });

  document.getElementById("logoutBtn").addEventListener("click", () => {
    sessionStorage.removeItem("amr_admin_ok");
    location.reload();
  });

  document.getElementById("adminTabs").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-f]");
    if (!btn) return;
    adminFilter = btn.dataset.f;
    document.querySelectorAll("#adminTabs .filter-btn").forEach(b => b.classList.toggle("is-active", b === btn));
    render();
  });

  document.getElementById("exportBtn").addEventListener("click", exportCSV);

  document.getElementById("blockForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const key = document.getElementById("blockDate").value;
    const slot = document.getElementById("blockSlot").value;
    const reason = document.getElementById("blockReason").value.trim();
    if (!key) return;

    if (slot === "all") { Availability.blockDay(key); setReason(key, reason); }
    else { Availability.blockSlot(key, slot); setReason(`${key}|${slot}`, reason); }

    document.getElementById("blockReason").value = "";
    renderBlocks();
  });
});
