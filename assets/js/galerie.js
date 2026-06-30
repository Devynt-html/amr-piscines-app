/* ============================================================
   Galerie de réalisations catégorisée par type de prestation
   avec filtres dynamiques (+ compteurs) et lightbox
   ============================================================ */

/* Réalisations classées par métier (cat = id de SERVICES) */
const REALISATIONS = [
  { cat: "piscine",      title: "Piscine béton à débordement",   loc: "Bourg-de-Péage",  img: "assets/img/real-1.jpg" },
  { cat: "piscine",      title: "Couloir de nage & plage",       loc: "Romans-sur-Isère", img: "assets/img/piscine-1.jpg" },
  { cat: "piscine",      title: "Piscine familiale & spa",       loc: "Mours-Saint-Eusèbe", img: "assets/img/real-2.jpg" },
  { cat: "maconnerie",   title: "Mur de soutènement en pierre",  loc: "Romans-sur-Isère", img: "assets/img/real-3.jpg" },
  { cat: "maconnerie",   title: "Terrasse maçonnée",             loc: "Châteauneuf",      img: "assets/img/real-4.jpg" },
  { cat: "terrassement", title: "Terrassement avant piscine",    loc: "Bourg-de-Péage",  img: "assets/img/real-1.jpg" },
  { cat: "terrassement", title: "Nivellement de terrain",        loc: "Saint-Donat",      img: "assets/img/hero.jpg" },
  { cat: "allees",       title: "Allée en béton désactivé",      loc: "Valence",          img: "assets/img/real-4.jpg" },
  { cat: "allees",       title: "Accès pavé & bordures",         loc: "Romans-sur-Isère", img: "assets/img/real-3.jpg" },
  { cat: "cloture",      title: "Clôture rigide & portail alu",  loc: "Chatuzange",       img: "assets/img/real-2.jpg" },
  { cat: "plantation",   title: "Aménagement paysager & massifs",loc: "Mours-Saint-Eusèbe", img: "assets/img/real-3.jpg" },
  { cat: "plantation",   title: "Engazonnement & haie",          loc: "Peyrins",          img: "assets/img/hero.jpg" },
  { cat: "bassin",       title: "Bassin décoratif & cascade",    loc: "Valence",          img: "assets/img/real-2.jpg" },
  { cat: "entretien",    title: "Élagage & taille de haies",     loc: "Romans-sur-Isère", img: "assets/img/real-4.jpg" },
];

let activeFilter = "all";

function countFor(cat) {
  return cat === "all" ? REALISATIONS.length : REALISATIONS.filter(r => r.cat === cat).length;
}

function renderFilters() {
  const host = document.getElementById("filters");
  const cats = [...new Set(REALISATIONS.map(r => r.cat))];
  const buttons = [{ id: "all", label: "Tout voir", ic: "sparkles" }]
    .concat(cats.map(c => ({ id: c, label: SERVICE_MAP[c].label, ic: SERVICE_MAP[c].ic })));

  host.innerHTML = buttons.map(b => `
    <button class="filter-btn ${b.id === activeFilter ? "is-active" : ""}" data-cat="${b.id}">
      ${icon(b.ic, 17)} ${b.label} <span class="count">(${countFor(b.id)})</span>
    </button>`).join("");

  host.querySelectorAll(".filter-btn").forEach(btn => btn.addEventListener("click", () => {
    activeFilter = btn.dataset.cat;
    renderFilters();
    renderGallery();
  }));
}

function renderGallery() {
  const host = document.getElementById("gallery");
  const items = REALISATIONS.filter(r => activeFilter === "all" || r.cat === activeFilter);

  if (!items.length) {
    host.innerHTML = `<div class="gallery-empty">Aucune réalisation dans cette catégorie pour le moment.</div>`;
    return;
  }

  host.innerHTML = items.map((r, i) => `
    <div class="gallery-item" data-img="${r.img}" data-title="${r.title}" data-loc="${r.loc}">
      <span class="gallery-item__cat">${SERVICE_MAP[r.cat].label}</span>
      <img src="${r.img}" alt="${r.title} — ${r.loc}" loading="lazy">
      <div class="gallery-item__overlay">
        <h4>${r.title}</h4>
        <span>${icon("pin", 14)} ${r.loc}</span>
      </div>
    </div>`).join("");

  host.querySelectorAll(".gallery-item").forEach(el => el.addEventListener("click", () => {
    openLightbox(el.dataset.img, el.dataset.title, el.dataset.loc);
  }));
}

/* Lightbox */
function openLightbox(img, title, loc) {
  document.getElementById("lbImg").src = img;
  document.getElementById("lbCap").textContent = `${title} — ${loc}`;
  document.getElementById("lightbox").classList.add("is-open");
}
function closeLightbox() { document.getElementById("lightbox").classList.remove("is-open"); }

document.addEventListener("DOMContentLoaded", () => {
  renderFilters();
  renderGallery();
  document.getElementById("lbClose").addEventListener("click", closeLightbox);
  document.getElementById("lightbox").addEventListener("click", (e) => {
    if (e.target.id === "lightbox") closeLightbox();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLightbox(); });
});
