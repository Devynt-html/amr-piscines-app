/* ============================================================
   Suivi de projet : recherche par référence + timeline
   d'avancement (démo avec progression simulable)
   ============================================================ */

const TIMELINE = [
  { title: "Demande reçue", desc: "Votre demande a été enregistrée, notre équipe la traite." },
  { title: "Visite technique", desc: "Rendez-vous sur site pour étudier votre terrain et votre projet." },
  { title: "Devis transmis", desc: "Vous recevez un devis détaillé et personnalisé." },
  { title: "Travaux planifiés", desc: "Date de démarrage fixée, équipe et matériel réservés." },
  { title: "Chantier en cours", desc: "Réalisation des travaux par nos équipes." },
  { title: "Réception & livraison", desc: "Visite de réception, remise des clés. Profitez !" },
];

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

function findProject(ref) {
  return Store.get("projects", []).find(p => p.ref.toLowerCase() === ref.toLowerCase());
}

function renderRecent() {
  const all = Store.get("projects", []);
  const wrap = document.getElementById("recentWrap");
  const list = document.getElementById("recentList");
  if (!all.length) { wrap.classList.add("hidden"); return; }
  wrap.classList.remove("hidden");
  list.innerHTML = all.slice(0, 6).map(p =>
    `<button type="button" class="filter-btn" data-ref="${p.ref}">${p.ref} · ${p.serviceLabel}</button>`
  ).join("");
  list.querySelectorAll("[data-ref]").forEach(b => b.addEventListener("click", () => {
    document.getElementById("refInput").value = b.dataset.ref;
    show(b.dataset.ref);
  }));
}

function clientName(p) { return `${p.client.prenom} ${p.client.nom}`; }

function render(project) {
  const idx = project.stepIndex ?? 0;
  const pct = Math.round((idx / (TIMELINE.length - 1)) * 100);
  const res = document.getElementById("result");

  const estLine = project.estimate && project.estimate.raw > 0
    ? `<div><span>Estimation</span><strong>${euro(project.estimate.min)} – ${euro(project.estimate.max)}</strong></div>` : "";
  const slotLine = project.slot
    ? `<div><span>Rendez-vous</span><strong>${project.slot.day} · ${project.slot.hour}</strong></div>` : "";

  res.innerHTML = `
    <div class="track-card">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:8px">
        <h3 class="mb-0">Dossier ${project.ref}</h3>
        <span class="badge ${idx >= TIMELINE.length - 1 ? "badge--green" : "badge--slate"}">${TIMELINE[idx].title}</span>
      </div>

      <div class="progress"><div class="progress__bar" style="width:${pct}%"></div></div>

      <div class="track-meta">
        <div><span>Client</span><strong>${clientName(project)}</strong></div>
        <div><span>Prestation</span><strong>${project.serviceLabel}</strong></div>
        <div><span>Type</span><strong>${project.type === "rdv" ? "Rendez-vous" : "Demande de devis"}</strong></div>
        <div><span>Ouvert le</span><strong>${fmtDate(project.createdAt)}</strong></div>
        ${estLine}
        ${slotLine}
      </div>

      <div class="timeline">
        ${TIMELINE.map((st, i) => {
          const cls = i < idx ? "done" : (i === idx ? "current" : "pending");
          return `<div class="tl-step ${cls}">
            <h4>${st.title}</h4>
            <p>${st.desc}</p>
            ${i === idx ? `<span class="date">Étape en cours</span>` : (i < idx ? `<span class="date">${icon("check", 13)} Terminé</span>` : "")}
          </div>`;
        }).join("")}
      </div>

      <div style="margin-top:22px;display:flex;gap:12px;flex-wrap:wrap">
        <a class="btn btn--outline" href="${AMR.phoneHref}">${icon("phone", 18)} Contacter mon conseiller</a>
        ${idx < TIMELINE.length - 1
          ? `<button class="btn btn--primary" id="advanceBtn">${icon("arrow", 18)} Faire avancer l'étape (démo)</button>`
          : `<span class="badge badge--green">${icon("checkCircle", 16)} Projet livré</span>`}
      </div>
      <p class="muted" style="font-size:.8rem;margin-top:12px">Le bouton « démo » simule la mise à jour faite par l'équipe AMR depuis son interface, pour illustrer le suivi en temps réel.</p>
    </div>`;

  res.classList.remove("hidden");
  document.getElementById("notFound").classList.add("hidden");

  const adv = document.getElementById("advanceBtn");
  if (adv) adv.addEventListener("click", () => {
    project.stepIndex = Math.min((project.stepIndex ?? 0) + 1, TIMELINE.length - 1);
    project.status = TIMELINE[project.stepIndex].title;
    const all = Store.get("projects", []);
    const i = all.findIndex(p => p.ref === project.ref);
    if (i > -1) { all[i] = project; Store.set("projects", all); }
    render(project);
  });
}

function show(ref) {
  const p = findProject(ref);
  if (!p) {
    document.getElementById("result").classList.add("hidden");
    document.getElementById("notFound").classList.remove("hidden");
    return;
  }
  render(p);
}

document.addEventListener("DOMContentLoaded", () => {
  renderRecent();

  document.getElementById("lookupForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const ref = document.getElementById("refInput").value.trim();
    if (ref) show(ref);
  });

  // Pré-remplissage via ?ref= ou dernier dossier
  const params = new URLSearchParams(location.search);
  const ref = params.get("ref") || Store.get("lastRef", "");
  if (ref) { document.getElementById("refInput").value = ref; show(ref); }
});
