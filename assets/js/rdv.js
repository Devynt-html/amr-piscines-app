/* ============================================================
   Prise de rendez-vous en ligne
   - Jours ouvrés, créneaux horaires, gestion des créneaux pris
   - Création d'un dossier suivi en localStorage
   ============================================================ */

const DOW = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const MONTHS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

const rdv = { day: null, hour: null };

/* Génère les 12 prochains jours ouvrés (hors week-end) */
function nextWorkingDays(count) {
  const days = [];
  let d = new Date(); d.setHours(0, 0, 0, 0);
  while (days.length < count) {
    d = new Date(d.getTime() + 86400000);
    if (d.getDay() !== 0 && d.getDay() !== 6) days.push(new Date(d));
  }
  return days;
}

function dayKey(date) {
  // Clé locale (évite le décalage UTC qui ferait basculer d'un jour)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/* Créneaux indisponibles : rendez-vous déjà pris + créneaux bloqués par AMR */
function bookedSlots(key) {
  const fromStore = Store.get("bookedSlots", {});
  const set = new Set(fromStore[key] || []);
  // créneaux bloqués manuellement par AMR (agenda admin)
  Availability.blockedSlotsFor(key).forEach(h => set.add(h));
  return set;
}

function fillServiceSelect() {
  const sel = document.getElementById("rdvService");
  sel.innerHTML = `<option value="">— Non précisé —</option>` +
    SERVICES.map(s => `<option value="${s.id}">${s.label}</option>`).join("");
}

function renderDays() {
  const host = document.getElementById("dayTabs");
  const days = nextWorkingDays(12);
  host.innerHTML = days.map((d) => {
    const key = dayKey(d);
    const blocked = Availability.isDayBlocked(key);
    return `
    <button type="button" class="day-tab ${blocked ? "is-blocked" : ""}" data-key="${key}" data-label="${DOW[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}" ${blocked ? "disabled" : ""}>
      <span class="dow">${DOW[d.getDay()]}</span>
      <span class="dnum">${d.getDate()}</span>
      <span class="dow">${blocked ? "Fermé" : MONTHS[d.getMonth()]}</span>
    </button>`;
  }).join("");

  host.querySelectorAll(".day-tab:not([disabled])").forEach(tab => tab.addEventListener("click", () => {
    host.querySelectorAll(".day-tab").forEach(t => t.classList.remove("is-active"));
    tab.classList.add("is-active");
    rdv.day = { key: tab.dataset.key, label: tab.dataset.label };
    rdv.hour = null;
    renderSlots();
    updateSummary();
  }));
}

function renderSlots() {
  const host = document.getElementById("slotGrid");
  if (!rdv.day) { host.innerHTML = `<p class="muted">Choisissez d'abord un jour.</p>`; return; }
  const taken = bookedSlots(rdv.day.key);
  host.innerHTML = SLOT_HOURS.map(h => `
    <button type="button" class="slot" data-h="${h}" ${taken.has(h) ? "disabled" : ""}>${h}</button>`).join("");

  host.querySelectorAll(".slot:not([disabled])").forEach(s => s.addEventListener("click", () => {
    host.querySelectorAll(".slot").forEach(x => x.classList.remove("is-selected"));
    s.classList.add("is-selected");
    rdv.hour = s.dataset.h;
    updateSummary();
  }));
}

function updateSummary() {
  const motif = document.getElementById("motif").value;
  const svcId = document.getElementById("rdvService").value;
  document.getElementById("sMotif").textContent = motif;
  document.getElementById("sService").textContent = svcId ? SERVICE_MAP[svcId].label : "—";
  document.getElementById("sDate").textContent = rdv.day ? rdv.day.label : "—";
  document.getElementById("sHour").textContent = rdv.hour || "—";
  document.getElementById("rdvSubmit").disabled = !(rdv.day && rdv.hour);
}

document.addEventListener("DOMContentLoaded", () => {
  fillServiceSelect();
  renderDays();
  renderSlots();

  // pré-sélection prestation via ancre
  const hash = location.hash.replace("#", "");
  if (hash && SERVICE_MAP[hash]) document.getElementById("rdvService").value = hash;

  document.getElementById("motif").addEventListener("change", updateSummary);
  document.getElementById("rdvService").addEventListener("change", updateSummary);

  document.getElementById("rdvForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    if (!form.checkValidity()) { form.reportValidity(); return; }
    if (!rdv.day || !rdv.hour) return;

    const btn = document.getElementById("rdvSubmit");
    btn.disabled = true;
    const btnTxt = btn.textContent;
    btn.textContent = "Confirmation en cours…";

    // marque le créneau comme pris
    const booked = Store.get("bookedSlots", {});
    booked[rdv.day.key] = [...(booked[rdv.day.key] || []), rdv.hour];
    Store.set("bookedSlots", booked);

    const svcId = document.getElementById("rdvService").value;
    const ref = genRef("RDV");
    const project = {
      ref, type: "rdv",
      service: svcId || null,
      serviceLabel: svcId ? SERVICE_MAP[svcId].label : "Non précisé",
      motif: form.motif.value,
      slot: { day: rdv.day.label, key: rdv.day.key, hour: rdv.hour },
      client: {
        prenom: form.prenom.value, nom: form.nom.value,
        tel: form.tel.value, email: form.email.value, adresse: form.adresse.value,
      },
      createdAt: new Date().toISOString(),
      status: "Rendez-vous confirmé",
      stepIndex: 1,
    };

    const all = Store.get("projects", []);
    all.unshift(project);
    Store.set("projects", all);
    Store.set("lastRef", ref);

    // Notification e-mail à AMR (si configurée)
    await sendNotification(`Nouveau rendez-vous — ${project.motif} (${ref})`, {
      "Référence": ref,
      "Motif": project.motif,
      "Prestation": project.serviceLabel,
      "Date": `${project.slot.day} à ${project.slot.hour}`,
      "Client": `${project.client.prenom} ${project.client.nom}`,
      "Téléphone": project.client.tel,
      "Email": project.client.email,
      "Adresse": project.client.adresse || "—",
      replyto: project.client.email,
    });

    btn.textContent = btnTxt;
    document.getElementById("rdvRef").textContent = ref;
    document.getElementById("cDate").textContent = rdv.day.label;
    document.getElementById("cHour").textContent = rdv.hour;
    document.getElementById("cMotif").textContent = form.motif.value;
    document.getElementById("rdvTrack").href = "suivi.html?ref=" + encodeURIComponent(ref);

    document.getElementById("rdvBooking").classList.add("hidden");
    document.getElementById("rdvDone").classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});
