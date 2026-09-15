const DATA_URL = "./tapanti_curada_100_confirmada.json";
const STORAGE_KEY = "tapanti.speciesCatalog.images.v2";
const URL_MAX_LENGTH = 2048;

const state = {
  search: "",
  group: "all",
  family: "all",
  status: "all",
  species: [],
  feedbackById: {},
  draftUrlById: {},
  eventsBound: false,
};

const elements = {
  searchInput: document.getElementById("searchInput"),
  groupFilter: document.getElementById("groupFilter"),
  familyFilter: document.getElementById("familyFilter"),
  statusFilter: document.getElementById("statusFilter"),
  resetFiltersButton: document.getElementById("resetFiltersButton"),
  resultsSummary: document.getElementById("resultsSummary"),
  speciesGrid: document.getElementById("speciesGrid"),
  emptyStateTemplate: document.getElementById("emptyStateTemplate"),
  heroSpeciesCount: document.getElementById("heroSpeciesCount"),
  heroGroupCount: document.getElementById("heroGroupCount"),
};

function sanitizeUrl(value) {
  if (typeof value !== "string") return "";

  const trimmed = value.trim();
  if (!trimmed || trimmed.length > URL_MAX_LENGTH) return "";

  try {
    const parsed = new URL(trimmed);
    if (!/^https?:$/.test(parsed.protocol)) return "";
    return parsed.toString();
  } catch {
    return "";
  }
}

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titleCase(value) {
  return String(value || "")
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function groupLabel(group) {
  const labels = {
    anfibio: "Anfibio",
    anuro: "Anuro",
    reptil: "Reptil",
    mamifero: "Mamífero",
    ave: "Ave",
    invertebrado: "Invertebrado",
    planta: "Planta",
  };

  return labels[group] || titleCase(group);
}

function inferBadgeClass(record) {
  const family = String(record.family || "");
  const group = String(record.group || "");

  if (family === "Viperidae" || family === "Elapidae") return "b-viper";
  if (["Dactyloidae", "Diploglossidae", "Phrynosomatidae", "Corytophanidae"].includes(family)) return "b-sauria";
  if (group === "anuro" || group === "anfibio") return "b-amphibia";
  if (group === "reptil") return "b-reptile";
  if (group === "mamifero") return "b-mammal";
  if (group === "ave") return "b-bird";
  if (group === "planta") return "b-plant";
  return "b-invertebrate";
}

function buildDefaultLinks(record) {
  const scientific = record.sciName || record.scientific || "";
  const encoded = encodeURIComponent(scientific);
  const group = String(record.group || "");

  if (group === "ave") {
    return {
      inatUrl: `https://www.inaturalist.org/taxa/search?q=${encoded}`,
      specUrl: `https://xeno-canto.org/explore?query=${encoded}`,
      specLabel: "Xeno-canto / ficha sonora",
    };
  }

  return {
    inatUrl: `https://www.inaturalist.org/taxa/search?q=${encoded}`,
    specUrl: `https://www.gbif.org/species/search?q=${encoded}`,
    specLabel: "GBIF / ficha de especie",
  };
}

function normalizeRecord(rawRecord, index) {
  const scientificName = String(rawRecord.sciName || rawRecord.scientific || "").trim();
  const commonName = String(rawRecord.commonName || rawRecord.common || scientificName).trim();
  const group = slugify(rawRecord.group || rawRecord.groupName || "invertebrado") || "invertebrado";
  const fallbackLinks = buildDefaultLinks({ ...rawRecord, sciName: scientificName, group });
  const badgeClass = String(rawRecord.badgeClass || inferBadgeClass({ ...rawRecord, group })) || "b-default";
  const family = String(rawRecord.family || "Sin familia").trim();
  const status = String(rawRecord.status || rawRecord.conservacion || "REGISTRO DE BIODIVERSIDAD").trim();
  const id = String(rawRecord.id || slugify(scientificName) || `tapanti-${index + 1}`);

  return {
    id,
    catalogNumber: Number(rawRecord.catalogNumber || index + 1),
    sciName: scientificName,
    commonName,
    group,
    groupLabel: String(rawRecord.groupLabel || groupLabel(group)),
    family,
    badge: String(rawRecord.badge || `${groupLabel(group)} · ${family}`),
    badgeClass,
    status,
    autoridad: String(rawRecord.autoridad || rawRecord.discovery || "Sin detalle de autoridad en esta ficha.").trim(),
    anatomia: String(rawRecord.anatomia || rawRecord.diagnostic || "Sin detalle anatómico en esta ficha.").trim(),
    fisiologia: String(rawRecord.fisiologia || rawRecord.physiology || "Sin detalle fisiológico en esta ficha.").trim(),
    etologia: String(rawRecord.etologia || rawRecord.behavior || rawRecord.field || "Sin detalle etológico en esta ficha.").trim(),
    curiosidad: String(rawRecord.curiosidad || rawRecord.curiosity || "Sin curiosidad registrada en esta ficha.").trim(),
    conservacion: String(rawRecord.conservacion || rawRecord.conservation || status).trim(),
    inatUrl: sanitizeUrl(rawRecord.inatUrl) || fallbackLinks.inatUrl,
    specUrl: sanitizeUrl(rawRecord.specUrl) || fallbackLinks.specUrl,
    specLabel: String(rawRecord.specLabel || fallbackLinks.specLabel).trim(),
    imageUrl: sanitizeUrl(rawRecord.imageUrl),
    publicImageUrl: sanitizeUrl(rawRecord.publicImageUrl),
  };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeSvgText(value) {
  return escapeHtml(value).replaceAll("#", "%23");
}

function createPlaceholderDataUrl(species) {
  const title = escapeSvgText(species.commonName || species.sciName);
  const subtitle = escapeSvgText(species.sciName);
  const badge = escapeSvgText(species.badge);

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 620">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#123d44" />
          <stop offset="100%" stop-color="#07191d" />
        </linearGradient>
      </defs>
      <rect width="960" height="620" rx="34" fill="url(#bg)" />
      <circle cx="740" cy="138" r="120" fill="rgba(93,226,209,0.17)" />
      <circle cx="130" cy="470" r="168" fill="rgba(134,168,255,0.13)" />
      <text x="64" y="96" fill="#8fd2e1" font-size="28" font-family="Inter,Arial,sans-serif" letter-spacing="4">${badge}</text>
      <text x="64" y="260" fill="#effbf8" font-size="58" font-weight="700" font-family="Inter,Arial,sans-serif">${title}</text>
      <text x="64" y="332" fill="#b8ddd4" font-size="34" font-family="Inter,Arial,sans-serif">${subtitle}</text>
      <text x="64" y="540" fill="#9bc1c0" font-size="26" font-family="Inter,Arial,sans-serif">Agrega una URL pública de imagen para esta ficha</text>
    </svg>
  `)}`;
}

function readStoredOverrides() {
  const parsedCurrent = readStoredObject(STORAGE_KEY);
  if (!parsedCurrent) return {};

  if (Array.isArray(parsedCurrent)) {
    return parsedCurrent.reduce((accumulator, item) => {
      if (!item || !item.id) return accumulator;
      const publicImageUrl = sanitizeUrl(item.publicImageUrl);
      if (publicImageUrl) {
        accumulator[item.id] = { publicImageUrl };
      }
      return accumulator;
    }, {});
  }

  return Object.entries(parsedCurrent).reduce((accumulator, [id, value]) => {
    const publicImageUrl = sanitizeUrl(value && value.publicImageUrl);
    if (publicImageUrl) {
      accumulator[id] = { publicImageUrl };
    }
    return accumulator;
  }, {});
}

function readStoredObject(key) {
  const saved = window.localStorage.getItem(key);
  if (!saved) return null;

  try {
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed) || (parsed && typeof parsed === "object")) {
      return parsed;
    }
  } catch {
    return null;
  }

  return null;
}

function persistSpeciesUrl(speciesId, nextUrl) {
  const overrides = readStoredOverrides();

  if (nextUrl) {
    overrides[speciesId] = { publicImageUrl: nextUrl };
  } else {
    delete overrides[speciesId];
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}

async function loadCatalog() {
  const response = await fetch(DATA_URL);
  if (!response.ok) {
    throw new Error(`No se pudo cargar ${DATA_URL} (${response.status})`);
  }

  const records = await response.json();
  if (!Array.isArray(records)) {
    throw new Error("El catálogo cargado no es un arreglo JSON válido.");
  }

  return records.map(normalizeRecord);
}

function mergeSpeciesWithOverrides(seedSpecies, overrides) {
  return seedSpecies.map((species) => {
    const overrideUrl = sanitizeUrl(overrides[species.id]?.publicImageUrl);
    return {
      ...species,
      publicImageUrl: overrideUrl || species.publicImageUrl || species.imageUrl,
    };
  });
}

function uniqueSortedValues(values) {
  return [...new Set(values.filter(Boolean))].sort((left, right) => left.localeCompare(right, "es"));
}

function appendOptions(selectElement, values) {
  selectElement.innerHTML = selectElement.querySelector("option")?.outerHTML || "";

  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    selectElement.append(option);
  });
}

function populateFilters() {
  appendOptions(elements.groupFilter, uniqueSortedValues(state.species.map((item) => item.groupLabel)));
  appendOptions(elements.familyFilter, uniqueSortedValues(state.species.map((item) => item.family)));
  appendOptions(elements.statusFilter, uniqueSortedValues(state.species.map((item) => item.status)));
  elements.groupFilter.value = state.group;
  elements.familyFilter.value = state.family;
  elements.statusFilter.value = state.status;
}

function matchesFilters(species) {
  const haystack = [
    species.catalogNumber,
    species.sciName,
    species.commonName,
    species.groupLabel,
    species.family,
    species.badge,
    species.status,
    species.autoridad,
    species.anatomia,
    species.fisiologia,
    species.etologia,
    species.curiosidad,
    species.conservacion,
  ]
    .join(" ")
    .toLocaleLowerCase("es");

  if (state.search && !haystack.includes(state.search)) return false;
  if (state.group !== "all" && species.groupLabel !== state.group) return false;
  if (state.family !== "all" && species.family !== state.family) return false;
  if (state.status !== "all" && species.status !== state.status) return false;
  return true;
}

function renderEmptyState() {
  elements.speciesGrid.innerHTML = "";
  elements.speciesGrid.append(elements.emptyStateTemplate.content.cloneNode(true));
}

function renderError(message) {
  elements.resultsSummary.textContent = message;
  elements.heroSpeciesCount.textContent = "Sin datos";
  elements.heroGroupCount.textContent = "Revisa la carga del JSON";
  elements.speciesGrid.innerHTML = `
    <article class="empty-state">
      <h2>Error al cargar el catálogo</h2>
      <p>${escapeHtml(message)}</p>
      <p>Sirve la carpeta raíz con un servidor estático o revisa que <code>tapanti_curada_100_confirmada.json</code> exista en la raíz del repositorio.</p>
    </article>
  `;
}

function renderSpeciesCard(species) {
  const currentImage = sanitizeUrl(species.publicImageUrl || species.imageUrl);
  const imageSrc = currentImage || createPlaceholderDataUrl(species);
  const hasOpenImage = Boolean(currentImage);
  const extraSourceLink = sanitizeUrl(species.specUrl);
  const iNatLink = sanitizeUrl(species.inatUrl);

  return `
    <article class="species-card" data-species-id="${escapeHtml(species.id)}">
      <div class="card-top">
        <div class="card-meta">
          <span class="badge ${escapeHtml(species.badgeClass)}">${escapeHtml(species.badge)}</span>
          <span class="status-pill">${escapeHtml(species.status)}</span>
          <span class="family-pill">${escapeHtml(species.family)}</span>
        </div>
        <div class="card-heading">
          <div>
            <p class="catalog-id">Ficha #${escapeHtml(species.catalogNumber)}</p>
            <h2>${escapeHtml(species.commonName)}</h2>
            <p class="scientific-name"><em>${escapeHtml(species.sciName)}</em></p>
          </div>
          <span class="group-pill">${escapeHtml(species.groupLabel)}</span>
        </div>
      </div>

      <section class="image-panel">
        <div class="image-frame">
          <img alt="Referencia de ${escapeHtml(species.sciName)}" loading="lazy" referrerpolicy="no-referrer" src="${escapeHtml(imageSrc)}" />
        </div>
        <div class="image-helper">
          <span>Imagen de referencia</span>
          <span>${hasOpenImage ? "URL pública activa" : "Usa una URL pública para activar la imagen"}</span>
        </div>
      </section>

      <section class="card-body">
        <form class="url-form" autocomplete="off">
          <label>
            <span>URL pública de imagen</span>
            <input type="url" name="publicImageUrl" maxlength="${URL_MAX_LENGTH}" value="${escapeHtml(state.draftUrlById[species.id] ?? currentImage)}" placeholder="https://..." />
          </label>
          <button class="save-button" type="submit">Guardar</button>
        </form>

        <div class="card-links">
          <a class="open-link${hasOpenImage ? "" : " is-disabled"}" href="${escapeHtml(hasOpenImage ? currentImage : "#")}" target="_blank" rel="noopener noreferrer" ${hasOpenImage ? "" : 'aria-disabled="true" tabindex="-1"'}>Abrir imagen</a>
          ${iNatLink ? `<a class="open-link" href="${escapeHtml(iNatLink)}" target="_blank" rel="noopener noreferrer">iNaturalist</a>` : ""}
          ${extraSourceLink ? `<a class="open-link" href="${escapeHtml(extraSourceLink)}" target="_blank" rel="noopener noreferrer">${escapeHtml(species.specLabel || "Fuente")}</a>` : ""}
        </div>

        <p class="card-feedback ${escapeHtml(state.feedbackById[species.id]?.type || "")}" aria-live="polite">${escapeHtml(state.feedbackById[species.id]?.message || " ")}</p>

        <div class="info-grid">
          <div class="info-box">
            <h3>Autoridad / descubrimiento</h3>
            <p>${escapeHtml(species.autoridad)}</p>
          </div>
          <div class="info-box">
            <h3>Anatomía / diagnóstico</h3>
            <p>${escapeHtml(species.anatomia)}</p>
          </div>
          <div class="info-box">
            <h3>Fisiología</h3>
            <p>${escapeHtml(species.fisiologia)}</p>
          </div>
          <div class="info-box">
            <h3>Etología y hábitat</h3>
            <p>${escapeHtml(species.etologia)}</p>
          </div>
          <div class="info-box">
            <h3>Conservación</h3>
            <p>${escapeHtml(species.conservacion)}</p>
          </div>
          <div class="info-box">
            <h3>Curiosidad</h3>
            <p>${escapeHtml(species.curiosidad)}</p>
          </div>
        </div>
      </section>
    </article>
  `;
}

function attachCardEvents() {
  document.querySelectorAll(".species-card").forEach((card) => {
    const form = card.querySelector(".url-form");
    const input = card.querySelector('input[name="publicImageUrl"]');
    const speciesId = card.dataset.speciesId;

    if (!form || !input || !speciesId) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      handleUrlSave(speciesId, input.value);
    });

    input.addEventListener("input", (event) => {
      state.draftUrlById[speciesId] = event.target.value;
    });
  });
}

function handleUrlSave(speciesId, rawValue) {
  const species = state.species.find((item) => item.id === speciesId);
  if (!species) return;

  const trimmed = rawValue.trim();

  if (!trimmed) {
    persistSpeciesUrl(speciesId, "");
    delete state.draftUrlById[speciesId];
    species.publicImageUrl = species.imageUrl;
    state.feedbackById[speciesId] = {
      type: "success",
      message: "Se restauró la imagen de referencia de la ficha.",
    };
    render();
    return;
  }

  const nextUrl = sanitizeUrl(trimmed);
  if (!nextUrl) {
    state.feedbackById[speciesId] = {
      type: "error",
      message: "Usa una URL pública absoluta con protocolo http o https.",
    };
    render();
    return;
  }

  persistSpeciesUrl(speciesId, nextUrl);
  delete state.draftUrlById[speciesId];
  species.publicImageUrl = nextUrl;
  state.feedbackById[speciesId] = {
    type: "success",
    message: "Imagen guardada en este navegador.",
  };
  render();
}

function updateHeroMeta() {
  const visibleGroups = uniqueSortedValues(state.species.map((item) => item.groupLabel));
  elements.heroSpeciesCount.textContent = `${state.species.length} fichas cargadas`;
  elements.heroGroupCount.textContent = `${visibleGroups.length} grupos · ${visibleGroups.join(" · ")}`;
}

function render() {
  const visibleSpecies = state.species.filter(matchesFilters);
  const visibleLabel = visibleSpecies.length === 1 ? "especie visible" : "especies visibles";

  elements.resultsSummary.textContent = `${visibleSpecies.length} ${visibleLabel} · ${state.species.length} fichas en el catálogo curado`;

  if (visibleSpecies.length === 0) {
    renderEmptyState();
    return;
  }

  elements.speciesGrid.innerHTML = visibleSpecies.map(renderSpeciesCard).join("");
  attachCardEvents();
}

function resetFilters() {
  state.search = "";
  state.group = "all";
  state.family = "all";
  state.status = "all";
  elements.searchInput.value = "";
  elements.groupFilter.value = "all";
  elements.familyFilter.value = "all";
  elements.statusFilter.value = "all";
  render();
}

function bindEvents() {
  if (state.eventsBound) return;

  elements.searchInput.addEventListener("input", () => {
    state.search = elements.searchInput.value.trim().toLocaleLowerCase("es");
    render();
  });

  elements.groupFilter.addEventListener("change", () => {
    state.group = elements.groupFilter.value;
    render();
  });

  elements.familyFilter.addEventListener("change", () => {
    state.family = elements.familyFilter.value;
    render();
  });

  elements.statusFilter.addEventListener("change", () => {
    state.status = elements.statusFilter.value;
    render();
  });

  elements.resetFiltersButton.addEventListener("click", resetFilters);
  state.eventsBound = true;
}

async function bootstrap() {
  try {
    const seedSpecies = await loadCatalog();
    const overrides = readStoredOverrides();
    state.species = mergeSpeciesWithOverrides(seedSpecies, overrides);
    populateFilters();
    updateHeroMeta();
    bindEvents();
    render();
  } catch (error) {
    renderError(error instanceof Error ? error.message : "Error desconocido al cargar el catálogo.");
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    bootstrap,
    renderError,
    readStoredOverrides,
    sanitizeUrl,
  };
}

if (typeof window !== "undefined" && typeof document !== "undefined" && !window.__TAPANTI_DISABLE_AUTO_BOOTSTRAP__) {
  bootstrap();
}
