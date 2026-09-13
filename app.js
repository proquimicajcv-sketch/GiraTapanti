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
    els.detailCard.innerHTML = "<p>Selecciona un organismo para ver su ficha.</p>";
    return;
  }

  els.detailCard.className = "detail-card";
  els.detailCard.innerHTML = `
    <h3>${organism.commonName}</h3>
    <p><strong>Nombre científico:</strong> <em>${organism.scientificName}</em></p>
    <p><strong>Grupo:</strong> ${organism.group}</p>
    <p><strong>Hábitat:</strong> ${organism.habitat}</p>
    <p><strong>Actividad:</strong> ${organism.activity}</p>
    <p><strong>Pistas de identificación:</strong> ${organism.clues}</p>
  `;
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

  filtered.forEach((org, index) => {
    const card = document.createElement("button");
    card.className = "organism-card";
    card.type = "button";
    card.innerHTML = `
      <h3>${org.commonName}</h3>
      <p><em>${org.scientificName}</em></p>
      <div class="tags">
        <span class="tag">${org.group}</span>
        <span class="tag">${org.habitat}</span>
        <span class="tag">${org.activity}</span>
      </div>
    `;
    card.addEventListener("click", () => renderDetail(org));
    els.organismList.appendChild(card);
    if (index === 0) renderDetail(org);
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
      li.innerHTML = `
        <strong>${organismLabelById(sighting.organismId)}</strong><br />
        <small>${new Date(sighting.createdAt).toLocaleString("es-CR")}</small><br />
        <span><strong>Lugar:</strong> ${sighting.place}</span><br />
        <span><strong>Nota:</strong> ${sighting.note || "Sin nota"}</span>
      `;
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
