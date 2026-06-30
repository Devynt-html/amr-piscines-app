/* ============================================================
   Devis intelligent : formulaire qui s'adapte au métier choisi
   + estimation de prix automatique + création d'un dossier suivi
   ============================================================ */

/* Schéma des champs dynamiques par métier */
const FIELD_SCHEMA = {
  piscine: {
    title: "Votre piscine",
    fields: [
      { name: "longueur", label: "Longueur (m)", type: "number", min: 2, value: 8, required: true },
      { name: "largeur",  label: "Largeur (m)",  type: "number", min: 2, value: 4, required: true },
      { name: "type", label: "Type de bassin", type: "select", options: [
        ["beton", "Béton armé traditionnel"], ["debordement", "À débordement"], ["couloir", "Couloir de nage"], ["spa", "Mini-piscine / spa"]
      ]},
      { name: "volet", label: "Volet / sécurité immergée", type: "select", options: [["non","Non"],["oui","Oui (+ env. 7 000 €)"]] },
      { name: "abords", label: "Aménagement des abords (plage, pool house)", type: "select", options: [["non","Non"],["oui","Oui"]] },
    ],
  },
  terrassement: {
    title: "Votre terrassement",
    fields: [
      { name: "surface", label: "Surface à terrasser (m²)", type: "number", min: 5, value: 80, required: true },
      { name: "sol", label: "Nature du sol", type: "select", options: [["facile","Terre / facile"],["moyen","Mixte"],["rocheux","Rocheux / difficile"]] },
      { name: "acces", label: "Accès au chantier", type: "select", options: [["bon","Bon (engin OK)"],["limite","Limité"]] },
    ],
  },
  maconnerie: {
    title: "Votre projet de maçonnerie",
    fields: [
      { name: "ouvrage", label: "Type d'ouvrage", type: "select", options: [["mur","Mur / muret"],["terrasse","Terrasse"],["escalier","Escalier extérieur"],["autre","Autre"]] },
      { name: "surface", label: "Surface estimée (m²)", type: "number", min: 1, value: 25, required: true },
    ],
  },
  cloture: {
    title: "Votre clôture",
    fields: [
      { name: "longueur", label: "Longueur (mètres linéaires)", type: "number", min: 1, value: 40, required: true },
      { name: "materiau", label: "Matériau", type: "select", options: [["rigide","Panneaux rigides"],["alu","Aluminium"],["bois","Bois / composite"]] },
      { name: "portail", label: "Portail", type: "select", options: [["non","Aucun"],["battant","Portail battant"],["coulissant","Portail coulissant"]] },
    ],
  },
  allees: {
    title: "Vos allées & accès",
    fields: [
      { name: "surface", label: "Surface (m²)", type: "number", min: 2, value: 50, required: true },
      { name: "revetement", label: "Revêtement souhaité", type: "select", options: [["gravier","Gravier stabilisé"],["enrobe","Enrobé"],["pave","Pavés"],["desactive","Béton désactivé"]] },
    ],
  },
  plantation: {
    title: "Votre aménagement végétal",
    fields: [
      { name: "prestation", label: "Type de prestation", type: "select", options: [["gazon","Gazon / engazonnement"],["massif","Massifs & vivaces"],["haie","Haie (ml)"],["arbres","Plantation d'arbres"]] },
      { name: "quantite", label: "Surface (m²) ou quantité", type: "number", min: 1, value: 100, required: true },
    ],
  },
  bassin: {
    title: "Votre bassin / fontaine",
    fields: [
      { name: "taille", label: "Taille du bassin", type: "select", options: [["petit","Petit (< 5 m²)"],["moyen","Moyen (5–15 m²)"],["grand","Grand (> 15 m²)"]] },
      { name: "fontaine", label: "Fontaine / cascade décorative", type: "select", options: [["non","Non"],["oui","Oui"]] },
    ],
  },
  entretien: {
    title: "Votre entretien",
    fields: [
      { name: "prestation", label: "Prestation", type: "select", options: [["taille","Taille de haie (ml)"],["elagage","Élagage d'arbres (nb)"],["tonte","Tonte / entretien jardin (m²)"]] },
      { name: "quantite", label: "Quantité", type: "number", min: 1, value: 20, required: true },
    ],
  },
};

/* Calcul de l'estimation selon le métier */
function computeEstimate(service, v) {
  const num = (x) => parseFloat(x) || 0;
  let base = 0, note = "";

  switch (service) {
    case "piscine": {
      const area = num(v.longueur) * num(v.largeur);
      const unit = { beton: 1000, debordement: 1500, couloir: 1250, spa: 1700 }[v.type] || 1000;
      base = area * unit;
      if (v.volet === "oui") base += 7000;
      if (v.abords === "oui") base += area * 350;
      note = `Bassin ${num(v.longueur)}×${num(v.largeur)} m (${area.toFixed(0)} m²).`;
      break;
    }
    case "terrassement": {
      const unit = { facile: 28, moyen: 45, rocheux: 80 }[v.sol] || 45;
      base = num(v.surface) * unit * (v.acces === "limite" ? 1.2 : 1);
      note = `${num(v.surface)} m² · sol ${v.sol}.`;
      break;
    }
    case "maconnerie": {
      const unit = { mur: 180, terrasse: 130, escalier: 350, autre: 160 }[v.ouvrage] || 160;
      base = num(v.surface) * unit;
      note = `${num(v.surface)} m² · ${v.ouvrage}.`;
      break;
    }
    case "cloture": {
      const unit = { rigide: 70, alu: 190, bois: 110 }[v.materiau] || 70;
      base = num(v.longueur) * unit;
      base += { non: 0, battant: 1500, coulissant: 2800 }[v.portail] || 0;
      note = `${num(v.longueur)} ml · ${v.materiau}.`;
      break;
    }
    case "allees": {
      const unit = { gravier: 40, enrobe: 60, pave: 130, desactive: 95 }[v.revetement] || 60;
      base = num(v.surface) * unit;
      note = `${num(v.surface)} m² · ${v.revetement}.`;
      break;
    }
    case "plantation": {
      const unit = { gazon: 25, massif: 65, haie: 45, arbres: 120 }[v.prestation] || 40;
      base = num(v.quantite) * unit;
      note = `${num(v.quantite)} ${v.prestation === "haie" ? "ml" : (v.prestation==="arbres"?"arbre(s)":"m²")}.`;
      break;
    }
    case "bassin": {
      base = { petit: 2800, moyen: 6500, grand: 13000 }[v.taille] || 5000;
      if (v.fontaine === "oui") base += 1800;
      note = `Bassin ${v.taille}${v.fontaine === "oui" ? " + fontaine" : ""}.`;
      break;
    }
    case "entretien": {
      const u = { taille: 14, elagage: 160, tonte: 4 }[v.prestation] || 10;
      base = num(v.quantite) * u;
      note = `${num(v.quantite)} unité(s) · ${v.prestation}.`;
      break;
    }
  }

  if (base <= 0) return { min: 0, max: 0, note: "Projet à chiffrer sur mesure.", raw: 0 };
  return { min: base * 0.88, max: base * 1.18, note, raw: base };
}

/* --- État & navigation --- */
const state = { service: null, step: 1, values: {} };

function buildServicePicker() {
  const wrap = document.getElementById("servicePicker");
  wrap.innerHTML = SERVICES.map(s => `
    <div class="service-opt">
      <input type="radio" name="service" id="svc-${s.id}" value="${s.id}">
      <label for="svc-${s.id}"><span class="emo">${icon(s.ic, 30)}</span>${s.label}</label>
    </div>`).join("");

  wrap.addEventListener("change", (e) => {
    state.service = e.target.value;
    document.getElementById("next1").disabled = false;
  });
}

function buildDynFields() {
  const schema = FIELD_SCHEMA[state.service];
  const svc = SERVICE_MAP[state.service];
  document.getElementById("dynTitle").innerHTML = icon(svc ? svc.ic : "file", 22) + " " + schema.title;
  const host = document.getElementById("dynFields");
  host.innerHTML = schema.fields.map(f => {
    if (f.type === "select") {
      return `<div class="field">
        <label for="f-${f.name}">${f.label}</label>
        <select id="f-${f.name}" name="${f.name}">
          ${f.options.map(o => `<option value="${o[0]}">${o[1]}</option>`).join("")}
        </select></div>`;
    }
    return `<div class="field">
      <label for="f-${f.name}">${f.label}${f.required ? ' <span class="required">*</span>' : ""}</label>
      <input id="f-${f.name}" name="${f.name}" type="${f.type}" ${f.min!=null?`min="${f.min}"`:""} value="${f.value ?? ""}" ${f.required?"required":""}>
    </div>`;
  }).join("");
}

function collectValues() {
  const schema = FIELD_SCHEMA[state.service];
  const v = {};
  schema.fields.forEach(f => { v[f.name] = document.getElementById("f-" + f.name).value; });
  v.message = document.getElementById("message").value;
  state.values = v;
  return v;
}

function showStep(step) {
  state.step = step;
  document.querySelectorAll(".step").forEach(s => s.classList.toggle("hidden", s.dataset.step != String(step)));
  document.querySelectorAll("#stepper .stepper__item").forEach(it => {
    const n = Number(it.dataset.step);
    it.classList.toggle("is-active", n === step);
    it.classList.toggle("is-done", n < step);
  });
  window.scrollTo({ top: document.getElementById("stepper").offsetTop - 90, behavior: "smooth" });
}

function renderEstimate() {
  const v = collectValues();
  const est = computeEstimate(state.service, v);
  const box = document.getElementById("estimateValue");
  if (est.raw <= 0) {
    box.textContent = "Sur devis";
  } else {
    box.textContent = `${euro(est.min)} – ${euro(est.max)}`;
  }
  document.getElementById("estimateNote").textContent = est.note + " Fourchette indicative TTC, hors options spécifiques.";
  state.estimate = est;
}

/* --- Init --- */
document.addEventListener("DOMContentLoaded", () => {
  buildServicePicker();

  // Pré-sélection via ancre (#piscine, #cloture, …)
  const hash = location.hash.replace("#", "");
  if (hash && SERVICE_MAP[hash]) {
    const radio = document.getElementById("svc-" + hash);
    if (radio) { radio.checked = true; state.service = hash; document.getElementById("next1").disabled = false; }
  }

  document.querySelectorAll("[data-next]").forEach(btn => btn.addEventListener("click", () => {
    if (state.step === 1) {
      if (!state.service) return;
      buildDynFields();
      showStep(2);
    } else if (state.step === 2) {
      // validation simple des champs requis
      const reqEmpty = [...document.querySelectorAll("#dynFields [required]")].some(el => !el.value);
      if (reqEmpty) { alert("Merci de remplir les champs obligatoires."); return; }
      renderEstimate();
      showStep(3);
    }
  }));

  document.querySelectorAll("[data-prev]").forEach(btn => btn.addEventListener("click", () => showStep(state.step - 1)));

  document.getElementById("devisForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    if (!form.checkValidity()) { form.reportValidity(); return; }

    const btn = document.getElementById("devisSubmit");
    btn.disabled = true;
    const btnTxt = btn.textContent;
    btn.textContent = "Envoi en cours…";

    const ref = genRef("DEV");
    const project = {
      ref,
      type: "devis",
      service: state.service,
      serviceLabel: SERVICE_MAP[state.service].label,
      values: state.values,
      estimate: state.estimate,
      client: {
        prenom: form.prenom.value, nom: form.nom.value,
        email: form.email.value, tel: form.tel.value,
        cp: form.cp.value, ville: form.ville.value, delai: form.delai.value,
      },
      createdAt: new Date().toISOString(),
      status: "Demande reçue",
      stepIndex: 0,
    };

    const all = Store.get("projects", []);
    all.unshift(project);
    Store.set("projects", all);
    Store.set("lastRef", ref);

    // Notification e-mail à AMR (si configurée)
    const estTxt = project.estimate && project.estimate.raw > 0
      ? `${euro(project.estimate.min)} – ${euro(project.estimate.max)}` : "Sur devis";
    const detail = Object.entries(state.values)
      .filter(([k]) => k !== "message")
      .map(([k, v]) => `${k}: ${v}`).join(" | ");
    await sendNotification(`Nouvelle demande de devis — ${project.serviceLabel} (${ref})`, {
      "Référence": ref,
      "Prestation": project.serviceLabel,
      "Estimation": estTxt,
      "Détails": detail,
      "Client": `${project.client.prenom} ${project.client.nom}`,
      "Téléphone": project.client.tel,
      "Email": project.client.email,
      "Ville": `${project.client.cp} ${project.client.ville}`,
      "Échéance": project.client.delai,
      "Message": state.values.message || "—",
      replyto: project.client.email,
    });

    btn.textContent = btnTxt;
    document.getElementById("refOut").textContent = ref;
    document.getElementById("trackLink").href = "suivi.html?ref=" + encodeURIComponent(ref);
    showStep("done");
  });
});
