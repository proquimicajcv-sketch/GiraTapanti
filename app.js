const organisms = [
  {
    id: "oophaga-pumilio",
    commonName: "Rana dardo fresa",
    scientificName: "Oophaga pumilio",
    group: "Anfibio",
    habitat: "Bosque húmedo",
    activity: "Diurna",
    clues: "Pequeña, colores intensos, cerca de bromelias.",
  },
  {
    id: "agalychnis-callidryas",
    commonName: "Rana de ojos rojos",
    scientificName: "Agalychnis callidryas",
    group: "Anfibio",
    habitat: "Vegetación ribereña",
    activity: "Nocturna",
    clues: "Ojos rojos, cuerpo verde, flancos azul/amarillo.",
  },
  {
    id: "bothriechis-schlegelii",
    commonName: "Bocaracá",
    scientificName: "Bothriechis schlegelii",
    group: "Reptil",
    habitat: "Bosque húmedo",
    activity: "Nocturna",
    clues: "Víbora arborícola, coloración muy variable.",
  },
  {
    id: "anolis-limon",
    commonName: "Anolis de bosque",
    scientificName: "Anolis limifrons",
    group: "Reptil",
    habitat: "Sotobosque",
    activity: "Diurna",
    clues: "Lagartija pequeña en troncos y hojas bajas.",
  },
  {
    id: "ramphastos-sulfuratus",
    commonName: "Tucán pico iris",
    scientificName: "Ramphastos sulfuratus",
    group: "Ave",
    habitat: "Dosel del bosque",
    activity: "Diurna",
    clues: "Pico grande multicolor, vocalización fuerte.",
  },
  {
    id: "chlorophonia-callophrys",
    commonName: "Verdillo cejidorado",
    scientificName: "Chlorophonia callophrys",
    group: "Ave",
    habitat: "Bosque nuboso",
    activity: "Diurna",
    clues: "Pequeña ave verde con ceja amarilla marcada.",
  },
  {
    id: "nasua-narica",
    commonName: "Pizote",
    scientificName: "Nasua narica",
    group: "Mamífero",
    habitat: "Senderos y borde de bosque",
    activity: "Diurna",
    clues: "Hocico largo, cola anillada, suele andar en grupo.",
  },
  {
    id: "dasyprocta-punctata",
    commonName: "Guatusa",
    scientificName: "Dasyprocta punctata",
    group: "Mamífero",
    habitat: "Suelo del bosque",
    activity: "Diurna",
    clues: "Roedor mediano, corre rápido entre hojarasca.",
  },
  {
    id: "morpho-peleides",
    commonName: "Mariposa Morpho azul",
    scientificName: "Morpho peleides",
    group: "Insecto",
    habitat: "Claridades y senderos",
    activity: "Diurna",
    clues: "Alas azules brillantes en vuelo.",
  },
  {
    id: "attacus-sp",
    commonName: "Polilla gigante",
    scientificName: "Attacus sp.",
    group: "Insecto",
    habitat: "Bosque húmedo",
    activity: "Nocturna",
    clues: "Gran tamaño, atraída por luz artificial.",
  },
];

const els = {
  searchInput: document.getElementById("searchInput"),
  groupFilter: document.getElementById("groupFilter"),
  habitatFilter: document.getElementById("habitatFilter"),
  activityFilter: document.getElementById("activityFilter"),
  resultCount: document.getElementById("resultCount"),
  organismList: document.getElementById("organismList"),
  detailCard: document.getElementById("detailCard"),
  sightingForm: document.getElementById("sightingForm"),
  sightingOrganism: document.getElementById("sightingOrganism"),
  sightingPlace: document.getElementById("sightingPlace"),
  sightingNote: document.getElementById("sightingNote"),
  sightingsList: document.getElementById("sightingsList"),
};

const sightingsStorageKey = "giratapanti-sightings";
let selectedOrganismId = organisms[0]?.id || null;

function uniqueValues(key) {
  return [...new Set(organisms.map((item) => item[key]))].sort();
}

function fillSelect(select, values) {
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
}

function fillOrganismOptions() {
  organisms.forEach((org) => {
    const option = document.createElement("option");
    option.value = org.id;
    option.textContent = `${org.commonName} (${org.scientificName})`;
    els.sightingOrganism.appendChild(option);
  });
}

function getFilteredOrganisms() {
  const text = els.searchInput.value.trim().toLowerCase();
  const group = els.groupFilter.value;
  const habitat = els.habitatFilter.value;
  const activity = els.activityFilter.value;

  return organisms.filter((org) => {
    const matchText =
      !text ||
      org.commonName.toLowerCase().includes(text) ||
      org.scientificName.toLowerCase().includes(text) ||
      org.clues.toLowerCase().includes(text);
    const matchGroup = !group || org.group === group;
    const matchHabitat = !habitat || org.habitat === habitat;
    const matchActivity = !activity || org.activity === activity;
    return matchText && matchGroup && matchHabitat && matchActivity;
  });
}

function renderDetail(organism) {
  if (!organism) {
    els.detailCard.className = "detail-card empty";
    els.detailCard.textContent = "";
    const p = document.createElement("p");
    p.textContent = "Selecciona un organismo para ver su ficha.";
    els.detailCard.appendChild(p);
    return;
  }

  els.detailCard.className = "detail-card";
  els.detailCard.textContent = "";

  const h3 = document.createElement("h3");
  h3.textContent = organism.commonName;

  const pScientific = document.createElement("p");
  const strongScientific = document.createElement("strong");
  strongScientific.textContent = "Nombre científico: ";
  const emScientific = document.createElement("em");
  emScientific.textContent = organism.scientificName;
  pScientific.append(strongScientific, emScientific);

  const pGroup = document.createElement("p");
  const strongGroup = document.createElement("strong");
  strongGroup.textContent = "Grupo: ";
  pGroup.append(strongGroup, document.createTextNode(organism.group));

  const pHabitat = document.createElement("p");
  const strongHabitat = document.createElement("strong");
  strongHabitat.textContent = "Hábitat: ";
  pHabitat.append(strongHabitat, document.createTextNode(organism.habitat));

  const pActivity = document.createElement("p");
  const strongActivity = document.createElement("strong");
  strongActivity.textContent = "Actividad: ";
  pActivity.append(strongActivity, document.createTextNode(organism.activity));

  const pClues = document.createElement("p");
  const strongClues = document.createElement("strong");
  strongClues.textContent = "Pistas de identificación: ";
  pClues.append(strongClues, document.createTextNode(organism.clues));

  els.detailCard.append(h3, pScientific, pGroup, pHabitat, pActivity, pClues);
}

function renderOrganisms() {
  const filtered = getFilteredOrganisms();
  els.resultCount.textContent = `${filtered.length} resultado(s)`;
  els.organismList.innerHTML = "";

  if (!filtered.length) {
    const empty = document.createElement("p");
    empty.textContent = "No hay coincidencias con los filtros actuales.";
    els.organismList.appendChild(empty);
    renderDetail(null);
    return;
  }

  const hasSelectedInFiltered = filtered.some((org) => org.id === selectedOrganismId);
  if (!hasSelectedInFiltered) {
    selectedOrganismId = filtered[0].id;
  }

  const selectedOrganism = filtered.find((org) => org.id === selectedOrganismId) || filtered[0];
  renderDetail(selectedOrganism);

  filtered.forEach((org) => {
    const card = document.createElement("button");
    card.className = "organism-card";
    card.type = "button";
    card.setAttribute("aria-pressed", String(org.id === selectedOrganismId));
    const h3 = document.createElement("h3");
    h3.textContent = org.commonName;

    const p = document.createElement("p");
    const em = document.createElement("em");
    em.textContent = org.scientificName;
    p.appendChild(em);

    const tags = document.createElement("div");
    tags.className = "tags";
    [org.group, org.habitat, org.activity].forEach((value) => {
      const span = document.createElement("span");
      span.className = "tag";
      span.textContent = value;
      tags.appendChild(span);
    });

    card.append(h3, p, tags);
    card.addEventListener("click", () => {
      selectedOrganismId = org.id;
      renderOrganisms();
    });
    els.organismList.appendChild(card);
  });
}

function getSightings() {
  try {
    return JSON.parse(localStorage.getItem(sightingsStorageKey) || "[]");
  } catch {
    return [];
  }
}

function saveSightings(sightings) {
  localStorage.setItem(sightingsStorageKey, JSON.stringify(sightings));
}

function organismLabelById(id) {
  const found = organisms.find((item) => item.id === id);
  return found ? found.commonName : id;
}

function formatTimestamp(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Fecha no disponible" : date.toLocaleString("es-CR");
}

function renderSightings() {
  const sightings = getSightings();
  els.sightingsList.innerHTML = "";

  if (!sightings.length) {
    const li = document.createElement("li");
    li.textContent = "Aún no hay avistamientos guardados.";
    els.sightingsList.appendChild(li);
    return;
  }

  sightings
    .slice()
    .reverse()
    .forEach((sighting) => {
      const li = document.createElement("li");
      const title = document.createElement("strong");
      title.textContent = organismLabelById(sighting.organismId);

      const date = document.createElement("small");
      date.textContent = formatTimestamp(sighting.createdAt);

      const place = document.createElement("span");
      const placeStrong = document.createElement("strong");
      placeStrong.textContent = "Lugar: ";
      place.append(placeStrong, document.createTextNode(sighting.place));

      const note = document.createElement("span");
      const noteStrong = document.createElement("strong");
      noteStrong.textContent = "Nota: ";
      note.append(noteStrong, document.createTextNode(sighting.note || "Sin nota"));

      li.append(
        title,
        document.createElement("br"),
        date,
        document.createElement("br"),
        place,
        document.createElement("br"),
        note,
      );
      els.sightingsList.appendChild(li);
    });
}

function onSubmitSighting(event) {
  event.preventDefault();
  const organismId = els.sightingOrganism.value;
  const place = els.sightingPlace.value.trim();
  const note = els.sightingNote.value.trim();

  if (!organismId || !place) return;

  const sightings = getSightings();
  sightings.push({
    organismId,
    place,
    note,
    createdAt: new Date().toISOString(),
  });
  saveSightings(sightings);
  els.sightingForm.reset();
  renderSightings();
}

function init() {
  fillSelect(els.groupFilter, uniqueValues("group"));
  fillSelect(els.habitatFilter, uniqueValues("habitat"));
  fillSelect(els.activityFilter, uniqueValues("activity"));
  fillOrganismOptions();

  ["input", "change"].forEach((eventName) => {
    els.searchInput.addEventListener(eventName, renderOrganisms);
    els.groupFilter.addEventListener(eventName, renderOrganisms);
    els.habitatFilter.addEventListener(eventName, renderOrganisms);
    els.activityFilter.addEventListener(eventName, renderOrganisms);
  });

  els.sightingForm.addEventListener("submit", onSubmitSighting);

  renderOrganisms();
  renderSightings();
}

init();
