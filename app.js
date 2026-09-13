const STORAGE_KEY = "tapanti.sightings.v1";

const ORGANISMS = [
  {
    id: "quercus-costaricensis",
    commonName: "Roble de altura",
    scientificName: "Quercus costaricensis",
    group: "flora",
    zone: "sendero",
    tags: ["bosque nuboso", "dosel"],
    conservation: "Nativo",
    description:
      "Árbol dominante en zonas altas de Tapantí. Su hojarasca favorece la retención de humedad.",
  },
  {
    id: "chusquea-talamancensis",
    commonName: "Bambú de montaña",
    scientificName: "Chusquea talamancensis",
    group: "flora",
    zone: "sendero",
    tags: ["sotobosque", "cobertura"],
    conservation: "Nativo",
    description:
      "Forma parches densos en claros y bordes de sendero, importantes para refugio de fauna pequeña.",
  },
  {
    id: "resplendent-quetzal",
    commonName: "Quetzal resplandeciente",
    scientificName: "Pharomachrus mocinno",
    group: "fauna",
    zone: "canopy",
    tags: ["ave", "frugívoro"],
    conservation: "Casi amenazado",
    description:
      "Ave emblemática de bosques montanos; su presencia suele asociarse a árboles con frutos silvestres.",
  },
  {
    id: "tapirus-bairdii",
    commonName: "Danta de Baird",
    scientificName: "Tapirus bairdii",
    group: "fauna",
    zone: "rio",
    tags: ["mamífero", "herbívoro"],
    conservation: "En peligro",
    description:
      "Mamífero de gran tamaño y hábitos crepusculares, frecuenta zonas húmedas y cuerpos de agua.",
  },
  {
    id: "ateles-geoffroyi",
    commonName: "Mono araña",
    scientificName: "Ateles geoffroyi",
    group: "fauna",
    zone: "canopy",
    tags: ["primate", "social"],
    conservation: "En peligro",
    description:
      "Primate altamente móvil en estratos altos del bosque, sensible a fragmentación de hábitat.",
  },
  {
    id: "glasfrog",
    commonName: "Rana de vidrio",
    scientificName: "Hyalinobatrachium fleischmanni",
    group: "fauna",
    zone: "nocturno",
    tags: ["anfibio", "indicador"],
    conservation: "Preocupación menor",
    description:
      "Anfibio nocturno asociado a quebradas limpias; útil como indicador de calidad de agua.",
  },
  {
    id: "amanita-sp",
    commonName: "Amanita de bosque nuboso",
    scientificName: "Amanita sp.",
    group: "fungi",
    zone: "sendero",
    tags: ["descomponedor", "micelio"],
    conservation: "Sin evaluar",
    description:
      "Hongo observado en suelos ricos en materia orgánica, importante para ciclos de nutrientes.",
  },
  {
    id: "trametes-versicolor",
    commonName: "Cola de pavo",
    scientificName: "Trametes versicolor",
    group: "fungi",
    zone: "rio",
    tags: ["madera", "descomposición"],
    conservation: "Sin evaluar",
    description:
      "Hongo lignícola frecuente en troncos en descomposición de ambientes húmedos.",
  },
];

const GROUP_LABELS = {
  flora: "Flora",
  fauna: "Fauna",
  fungi: "Hongos",
};

const ZONE_LABELS = {
  sendero: "Sendero principal",
  rio: "Zona de río",
  canopy: "Dosel / canopy",
  nocturno: "Recorrido nocturno",
};

const state = {
  filters: {
    search: "",
    group: "all",
    zone: "all",
    sort: "name",
  },
  sightings: [],
};

const elements = {
  catalog: document.querySelector("#catalog"),
  count: document.querySelector("#organism-count"),
  filtersForm: document.querySelector("#filters"),
  sightingForm: document.querySelector("#sighting-form"),
  organismSelect: document.querySelector("#organism"),
  sightingZone: document.querySelector("#sighting-zone"),
  sightingList: document.querySelector("#sighting-list"),
  summary: document.querySelector("#sighting-summary"),
  clearSightingsButton: document.querySelector("#clear-sightings"),
  exportJsonButton: document.querySelector("#export-json"),
  emptyStateTemplate: document.querySelector("#empty-state-template"),
};

function init() {
  hydrateSightings();
  populateOrganismOptions();
  setupEvents();
  render();
}

function setupEvents() {
  elements.filtersForm.addEventListener("input", (event) => {
    const formData = new FormData(elements.filtersForm);
    state.filters.search = String(formData.get("search") || "").trim().toLowerCase();
    state.filters.group = String(formData.get("group") || "all");
    state.filters.zone = String(formData.get("zone") || "all");
    state.filters.sort = String(formData.get("sort") || "name");
    renderCatalog();
  });

  elements.sightingForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(elements.sightingForm);
    const organismId = String(formData.get("organism") || "");
    const quantity = Number(formData.get("quantity") || 1);
    const observer = String(formData.get("observer") || "").trim();

    if (!organismId || Number.isNaN(quantity) || quantity < 1 || !observer) {
      return;
    }

    const sighting = {
      id: crypto.randomUUID(),
      organismId,
      quantity: Math.floor(quantity),
      zone: String(formData.get("sightingZone") || "sendero"),
      observer,
      notes: String(formData.get("notes") || "").trim(),
      createdAt: new Date().toISOString(),
    };

    state.sightings.unshift(sighting);
    persistSightings();
    elements.sightingForm.reset();
    elements.sightingZone.value = sighting.zone;
    renderSightings();
  });

  elements.catalog.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) {
      return;
    }

    const organismId = target.dataset.organismId;
    if (!organismId) {
      return;
    }

    elements.organismSelect.value = organismId;
    elements.sightingForm.scrollIntoView({ behavior: "smooth", block: "start" });
    elements.sightingForm.querySelector("#observer")?.focus();
  });

  elements.clearSightingsButton.addEventListener("click", () => {
    if (!confirm("¿Seguro que deseas borrar todo el historial de avistamientos?")) {
      return;
    }
    state.sightings = [];
    persistSightings();
    renderSightings();
  });

  elements.exportJsonButton.addEventListener("click", exportSightings);
}

function getFilteredOrganisms() {
  const filtered = ORGANISMS.filter((item) => {
    const text = `${item.commonName} ${item.scientificName}`.toLowerCase();
    const matchesText = !state.filters.search || text.includes(state.filters.search);
    const matchesGroup = state.filters.group === "all" || item.group === state.filters.group;
    const matchesZone = state.filters.zone === "all" || item.zone === state.filters.zone;

    return matchesText && matchesGroup && matchesZone;
  });

  const sorters = {
    name: (a, b) => a.commonName.localeCompare(b.commonName, "es"),
    group: (a, b) => `${a.group}-${a.commonName}`.localeCompare(`${b.group}-${b.commonName}`, "es"),
    zone: (a, b) => `${a.zone}-${a.commonName}`.localeCompare(`${b.zone}-${b.commonName}`, "es"),
  };

  return filtered.sort(sorters[state.filters.sort] || sorters.name);
}

function renderCatalog() {
  const organisms = getFilteredOrganisms();
  elements.count.textContent = `${organisms.length} de ${ORGANISMS.length} organismos`;

  if (organisms.length === 0) {
    elements.catalog.innerHTML = "";
    elements.catalog.append(elements.emptyStateTemplate.content.cloneNode(true));
    return;
  }

  elements.catalog.innerHTML = organisms
    .map((item) => {
      const tags = item.tags.map((tag) => `<span class="chip">${tag}</span>`).join("");
      return `
        <article class="card">
          <h3 class="card__title">${escapeHtml(item.commonName)}</h3>
          <p class="card__meta"><em>${escapeHtml(item.scientificName)}</em></p>
          <p class="card__meta">${GROUP_LABELS[item.group]} · ${ZONE_LABELS[item.zone]}</p>
          <p class="card__meta">Conservación: ${escapeHtml(item.conservation)}</p>
          <p class="card__desc">${escapeHtml(item.description)}</p>
          <div class="chips">${tags}</div>
          <div class="actions">
            <button type="button" class="btn btn--primary" data-organism-id="${item.id}">
              Registrar avistamiento
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

function populateOrganismOptions() {
  const options = ORGANISMS.map(
    (item) =>
      `<option value="${item.id}">${escapeHtml(item.commonName)} (${escapeHtml(item.scientificName)})</option>`,
  ).join("");

  elements.organismSelect.innerHTML = options;
}

function hydrateSightings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      state.sightings = [];
      return;
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      state.sightings = [];
      return;
    }

    state.sightings = parsed.filter((item) => item && typeof item === "object");
  } catch {
    state.sightings = [];
  }
}

function persistSightings() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.sightings));
}

function renderSightings() {
  const total = state.sightings.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const latest = state.sightings[0]?.createdAt;
  const latestText = latest
    ? new Intl.DateTimeFormat("es-CR", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(latest))
    : "sin registros";

  elements.summary.textContent = `${state.sightings.length} registros · ${total} individuos · Último: ${latestText}`;

  if (state.sightings.length === 0) {
    elements.sightingList.innerHTML = "<li class='empty-state'>Aún no hay avistamientos guardados.</li>";
    return;
  }

  elements.sightingList.innerHTML = state.sightings
    .map((item) => {
      const organism = ORGANISMS.find((org) => org.id === item.organismId);
      const label = organism ? organism.commonName : "Organismo desconocido";
      const date = new Intl.DateTimeFormat("es-CR", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(item.createdAt));

      const notes = item.notes ? `<p>${escapeHtml(item.notes)}</p>` : "";

      return `
        <li>
          <strong>${escapeHtml(label)} · ${Number(item.quantity || 0)} indiv.</strong>
          <span class="muted">${escapeHtml(ZONE_LABELS[item.zone] || item.zone)} · ${escapeHtml(item.observer)} · ${date}</span>
          ${notes}
        </li>
      `;
    })
    .join("");
}

function exportSightings() {
  const payload = {
    exportedAt: new Date().toISOString(),
    source: "Gira Tapantí",
    totalRecords: state.sightings.length,
    records: state.sightings,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `tapanti-avistamientos-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function render() {
  renderCatalog();
  renderSightings();
}

init();
