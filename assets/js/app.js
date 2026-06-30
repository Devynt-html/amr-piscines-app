/* ============================================================
   AMR Piscines - logique partagée (header, footer, données)
   Prototype de démonstration - données stockées en localStorage
   ============================================================ */

const AMR = {
  name: "AMR",
  fullName: "AMR — Aménagement Maçonnerie Rénovation",
  baseline: "Maçon & Paysagiste en Drôme / Ardèche / Isère",
  phone: "04 75 72 23 18",
  phoneHref: "tel:+33475722318",
  mobile: "06 77 03 86 81",
  mobileHref: "tel:+33677038681",
  email: "sergevignon@orange.fr",
  address: "23 Rue de Genissieux, 26540 Mours-Saint-Eusèbe",
  city: "Mours-Saint-Eusèbe (26)",
  zone: "Drôme · Ardèche · Isère",
  facebook: "https://www.facebook.com/Am%C3%A9nagement-Ma%C3%A7onnerie-r%C3%A9novation-1192852620775241",
  instagram: "https://www.instagram.com/amr_by_piscine_et_paysage_/",
  logo: "assets/img/logo-amr-blanc.png",
};

/* ============================================================
   CONFIGURATION DE PRODUCTION
   ------------------------------------------------------------
   Pour rendre le site réellement opérationnel :
   1. Créez une clé gratuite sur https://web3forms.com (associée à
      l'e-mail qui doit recevoir les demandes) et collez-la dans
      `formAccessKey` ci-dessous.
   2. Vérifiez `notifyEmail` (e-mail qui reçoit devis et rendez-vous).
   Tant que `formAccessKey` est vide, le site fonctionne en mode démo
   (les demandes sont seulement enregistrées dans le navigateur).
   ============================================================ */
const CONFIG = {
  formAccessKey: "0ab6f2f7-6cfc-4753-ac59-8336f7457199",                       // <-- clé Web3Forms ici
  notifyEmail: "contact.devynt@gmail.com",  // <-- e-mail de réception
  adminPin: "dev1234",                     // <-- code d'accès à l'espace admin
};

/* Envoi d'une notification e-mail via Web3Forms (sans serveur).
   Retourne {ok, skipped?} ; n'interrompt jamais le parcours client. */
async function sendNotification(subject, fields) {
  if (!CONFIG.formAccessKey) return { ok: false, skipped: true };
  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: CONFIG.formAccessKey,
        subject,
        from_name: "Site AMR",
        ...fields,
      }),
    });
    const json = await res.json();
    return { ok: !!json.success };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

/* Les vrais métiers issus du site amr-piscines.fr */
const SERVICES = [
  { id: "piscine",     label: "Piscines & spas",       ic: "piscine",      desc: "Tout type de piscine en béton armé : à débordement, couloir de nage, spa intégré et rénovation." },
  { id: "terrassement",label: "Terrassement",          ic: "terrassement", desc: "Préparation et nivellement de terrain, déblais, remblais et viabilisation avant travaux." },
  { id: "maconnerie",  label: "Maçonnerie",            ic: "maconnerie",   desc: "Murs, terrasses, dallages, escaliers et ouvrages maçonnés, en neuf comme en rénovation." },
  { id: "cloture",     label: "Clôtures & portails",   ic: "cloture",      desc: "Clôtures, murets, portails et portillons pour sécuriser et délimiter votre extérieur." },
  { id: "allees",      label: "Allées & accès",        ic: "allees",       desc: "Allées, accès et cours en béton désactivé, enrobé ou pavés, carrossables et durables." },
  { id: "plantation",  label: "Plantation végétaux",   ic: "plantation",   desc: "Création d'espaces verts, massifs, gazon et plantation de végétaux adaptés à votre terrain." },
  { id: "bassin",      label: "Bassins & fontaines",   ic: "bassin",       desc: "Bassins d'agrément et fontaines pour apporter fraîcheur et caractère à votre jardin." },
  { id: "entretien",   label: "Entretien & élagage",   ic: "entretien",    desc: "Élagage, taille des arbres et entretien de jardin pour un extérieur toujours soigné." },
];

/* ---- Jeu d'icônes SVG (style trait, professionnel) ---- */
const ICONS = {
  piscine: '<path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5s2.4 2 5 2 2.5-2 5-2c1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1s2.5-2 5-2 2.4 2 5 2 2.5-2 5-2c1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1s2.5-2 5-2 2.4 2 5 2 2.5-2 5-2c1.3 0 1.9.5 2.5 1"/>',
  terrassement: '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 12.18-9.17 4.16a2 2 0 0 1-1.66 0L2 12.18"/><path d="m22 17.18-9.17 4.16a2 2 0 0 1-1.66 0L2 17.18"/>',
  maconnerie: '<rect width="18" height="18" x="3" y="3" rx="1"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v6"/><path d="M15 9v6"/><path d="M9 15v6"/>',
  cloture: '<path d="M5 3v18"/><path d="M12 3v18"/><path d="M19 3v18"/><path d="M3 8h18"/><path d="M3 14h18"/>',
  allees: '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
  plantation: '<path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>',
  bassin: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C7 11.1 6 13 6 15a7 7 0 0 0 6 7Z"/>',
  entretien: '<circle cx="6" cy="6" r="3"/><path d="M8.12 8.12 12 12"/><path d="M20 4 8.12 15.88"/><circle cx="6" cy="18" r="3"/><path d="M14.8 14.8 20 20"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  hardhat: '<path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1Z"/><path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5"/><path d="M4 15v-3a6 6 0 0 1 6-6"/><path d="M14 6a6 6 0 0 1 6 6v3"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1Z"/><path d="m9 12 2 2 4-4"/>',
  file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>',
  calendar: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z"/>',
  sparkles: '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>',
  pin: '<path d="M20 10c0 4.4-5.6 9-8 11-2.4-2-8-6.6-8-11a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  bulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  checkCircle: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>',
  arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/>',
  mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  dashboard: '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
  euro: '<path d="M14.5 5.5a5 5 0 1 0 0 13"/><path d="M5 9h7"/><path d="M5 14h7"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6"/>',
  handshake: '<path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25H21"/><path d="m3 3 1 11h-2"/><path d="M3 4h8"/>',
  facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
  instagram: '<rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>',
};

function icon(name, size) {
  const s = size || 22;
  return `<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ""}</svg>`;
}

function hydrateIcons(root) {
  (root || document).querySelectorAll("[data-icon]").forEach(el => {
    el.innerHTML = icon(el.dataset.icon, el.dataset.isize ? Number(el.dataset.isize) : 22);
  });
}

const SERVICE_MAP = Object.fromEntries(SERVICES.map(s => [s.id, s]));

/* ---- Utilitaires localStorage ---- */
const Store = {
  get(key, fallback) {
    try { return JSON.parse(localStorage.getItem("amr_" + key)) ?? fallback; }
    catch { return fallback; }
  },
  set(key, val) { localStorage.setItem("amr_" + key, JSON.stringify(val)); },
};

function genRef(prefix) {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${new Date().getFullYear()}-${n}`;
}

function euro(n) { return new Intl.NumberFormat("fr-FR").format(Math.round(n)) + " €"; }

/* ---- Créneaux horaires (partagés entre RDV et admin) ---- */
const SLOT_HOURS = ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];

function formatDateFr(key) {
  const d = new Date(key + "T00:00:00");
  return d.toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
}

/* ---- Gestion des indisponibilités (agenda) ----
   blockedDays : ["YYYY-MM-DD", ...]  -> journée entière fermée
   blockedSlots: { "YYYY-MM-DD": ["10:00", ...] } -> créneaux fermés    */
const Availability = {
  days() { return Store.get("blockedDays", []); },
  slots() { return Store.get("blockedSlots", {}); },
  isDayBlocked(key) { return this.days().includes(key); },
  blockedSlotsFor(key) {
    if (this.isDayBlocked(key)) return [...SLOT_HOURS];
    return this.slots()[key] || [];
  },
  blockDay(key) {
    const d = this.days();
    if (!d.includes(key)) { d.push(key); Store.set("blockedDays", d); }
    const s = this.slots(); delete s[key]; Store.set("blockedSlots", s);
  },
  blockSlot(key, hour) {
    const s = this.slots();
    s[key] = [...new Set([...(s[key] || []), hour])];
    Store.set("blockedSlots", s);
  },
  unblockDay(key) {
    Store.set("blockedDays", this.days().filter(k => k !== key));
  },
  unblockSlot(key, hour) {
    const s = this.slots();
    if (s[key]) { s[key] = s[key].filter(h => h !== hour); if (!s[key].length) delete s[key]; Store.set("blockedSlots", s); }
  },
};

/* ---- Header / Footer injectés ---- */
function renderChrome() {
  const page = document.body.dataset.page || "";
  const header = document.getElementById("site-header");
  if (header) {
    header.innerHTML = `
      <div class="site-header">
        <div class="demo-ribbon">Démonstration interactive proposée pour <strong>${AMR.fullName}</strong> · maquette non officielle</div>
        <div class="nav-wrap">
          <div class="container nav">
            <a class="nav__brand" href="index.html" aria-label="Accueil ${AMR.name}">
              <img src="${AMR.logo}" alt="${AMR.name} Piscines">
            </a>
            <button class="nav__toggle" id="navToggle" aria-label="Menu">&#9776;</button>
            <ul class="nav__links" id="navLinks">
              <li><a href="index.html" data-p="home">Accueil</a></li>
              <li><a href="realisations.html" data-p="realisations">Réalisations</a></li>
              <li><a href="eden-aire.html" data-p="eden">Eden Aire</a></li>
              <li><a href="devis.html" data-p="devis">Devis en ligne</a></li>
              <li><a href="rendez-vous.html" data-p="rdv">Rendez-vous</a></li>
              <li><a href="suivi.html" data-p="suivi">Suivi de projet</a></li>
              <li class="nav__cta"><a class="btn btn--primary" href="devis.html">Demander un devis</a></li>
            </ul>
          </div>
        </div>
      </div>`;
    const active = header.querySelector(`[data-p="${page}"]`);
    if (active) active.classList.add("is-active");
    const toggle = header.querySelector("#navToggle");
    const links = header.querySelector("#navLinks");
    toggle?.addEventListener("click", () => links.classList.toggle("is-open"));
  }

  const footer = document.getElementById("site-footer");
  if (footer) {
    footer.innerHTML = `
      <footer class="site-footer">
        <div class="container">
          <div class="footer-grid">
            <div>
              <img src="${AMR.logo}" alt="${AMR.name}">
              <p>${AMR.fullName}.<br>Entreprise familiale de maçonnerie et paysagisme depuis plus de 15 ans, basée à ${AMR.city}.</p>
              <p>Interventions : ${AMR.zone}</p>
            </div>
            <div>
              <h4>Nos services</h4>
              ${SERVICES.slice(0,6).map(s => `<a href="devis.html#${s.id}">${s.label}</a>`).join("")}
            </div>
            <div>
              <h4>Contact</h4>
              <a href="${AMR.phoneHref}">${icon("phone", 17)} ${AMR.phone}</a>
              <a href="${AMR.mobileHref}">${icon("phone", 17)} ${AMR.mobile}</a>
              <a href="mailto:${AMR.email}">${icon("mail", 17)} ${AMR.email}</a>
              <a href="https://maps.google.com/?q=${encodeURIComponent(AMR.address)}" target="_blank" rel="noopener">${icon("pin", 17)} ${AMR.address}</a>
              <div class="footer-social">
                <a href="${AMR.facebook}" target="_blank" rel="noopener" aria-label="Facebook">${icon("facebook", 18)}</a>
                <a href="${AMR.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${icon("instagram", 18)}</a>
              </div>
            </div>
          </div>
          <div class="footer-bottom">
            <span>© ${new Date().getFullYear()} ${AMR.name} — Tous droits réservés · <a href="mentions-legales.html" style="display:inline">Mentions légales</a> · <a href="admin.html" style="display:inline">Espace pro</a></span>
            <span>Maquette de démonstration · fonctionnalités interactives</span>
          </div>
        </div>
      </footer>`;
  }
}

/* ---- Animations d'apparition au scroll ---- */
function initReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || !els.length) {
    els.forEach(el => el.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  els.forEach(el => io.observe(el));
}

/* ---- Diaporama du hero (fondu enchaîné) ---- */
function initHeroSlides() {
  const host = document.getElementById("heroSlides");
  if (!host) return;
  const slides = [...host.querySelectorAll(".hero__slide")];
  if (slides.length < 2) return;
  let i = 0;
  setInterval(() => {
    slides[i].classList.remove("is-active");
    i = (i + 1) % slides.length;
    slides[i].classList.add("is-active");
  }, 3000);
}

/* ---- Lightbox générique (images avec [data-lightbox]) ---- */
function initLightbox() {
  const triggers = document.querySelectorAll("[data-lightbox]");
  const box = document.getElementById("amrLightbox");
  if (!triggers.length || !box) return;
  const img = box.querySelector("img");
  const cap = box.querySelector(".lightbox__cap");
  const open = (src, caption) => { img.src = src; cap.textContent = caption || ""; box.classList.add("is-open"); };
  const close = () => box.classList.remove("is-open");
  triggers.forEach(t => {
    t.style.cursor = "zoom-in";
    t.addEventListener("click", () => open(t.getAttribute("data-lightbox") || t.src, t.getAttribute("data-cap")));
  });
  box.addEventListener("click", (e) => { if (e.target === box) close(); });
  box.querySelector(".lightbox__close").addEventListener("click", close);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
}

document.addEventListener("DOMContentLoaded", () => {
  renderChrome();
  hydrateIcons();
  initReveal();
  initHeroSlides();
  initLightbox();
});
