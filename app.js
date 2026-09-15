const STORAGE_KEY = "tapanti.speciesCatalog.v1";

const defaultSpecies = [
  {
    id: "mimosa-pudica",
    status: "DATOS A CONFIRMAR",
    family: "Fabaceae",
    scientificName: "Mimosa pudica",
    commonName: "Dormilona · Sensitiva",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/0/0c/Mimosa_pudica_001.JPG",
    publicImageUrl: "https://upload.wikimedia.org/wikipedia/commons/0/0c/Mimosa_pudica_001.JPG",
    authority: "Guía de Campo Tapantí · Biodiversidad Científica.",
    anatomy: "Ficha extraída de la Guía de Campo Tapantí, especie 137.",
    physiology: "Información pendiente de completar.",
    ecology: "Maleza ruderal sensible al tacto, frecuente en ambientes perturbados y bordes de sendero.",
  },
  {
    id: "monstera-deliciosa",
    status: "DATOS A CONFIRMAR",
    family: "Araceae",
    scientificName: "Monstera deliciosa",
    commonName: "Costilla de adán · Balazo",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/0/0a/Monstera_deliciosa.JPG",
    publicImageUrl: "https://upload.wikimedia.org/wikipedia/commons/0/0a/Monstera_deliciosa.JPG",
    authority: "Guía de Campo Tapantí · Biodiversidad Científica.",
    anatomy: "Ficha extraída de la Guía de Campo Tapantí, especie 146.",
    physiology: "Información pendiente de completar.",
    ecology: "Hemiepífita tropical de sombra húmeda, con hojas perforadas muy distintivas.",
  },
  {
    id: "heliconia-rostrata",
    status: "EN CURACIÓN",
    family: "Heliconiaceae",
    scientificName: "Heliconia rostrata",
    commonName: "Platanillo",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/32/Heliconia_rostrata_02.jpg",
    publicImageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/32/Heliconia_rostrata_02.jpg",
    authority: "Guía de Campo Tapantí · Biodiversidad Científica.",
    anatomy: "Inflorescencia colgante con brácteas rojas y amarillas; hojas grandes y alternas.",
    physiology: "Alta dependencia de humedad ambiental y suelos fértiles de bosque húmedo.",
    ecology: "Especie ornamental y de sotobosque, visitada por aves nectarívoras.",
  },
  {
    id: "cecropia-obtusifolia",
    status: "EN CURACIÓN",
    family: "Urticaceae",
    scientificName: "Cecropia obtusifolia",
    commonName: "Guarumo",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/6/63/Cecropia_obtusifolia.jpg",
    publicImageUrl: "https://upload.wikimedia.org/wikipedia/commons/6/63/Cecropia_obtusifolia.jpg",
    authority: "Guía de Campo Tapantí · Biodiversidad Científica.",
    anatomy: "Árbol pionero de copa abierta, hojas palmadas y tronco hueco.",
    physiology: "Crecimiento rápido en claros y bordes de bosque; asociación con hormigas.",
    ecology: "Elemento frecuente de sucesión temprana y sitios perturbados del bosque húmedo.",
  },
];

const state = {
  search: "",
  family: "all",
  status: "all",
  species: loadSpecies(),
};

const elements = {
  searchInput: document.getElementById("searchInput"),
  familyFilter: document.getElementById("familyFilter"),
  statusFilter: document.getElementById("statusFilter"),
  resetFiltersButton: document.getElementById("resetFiltersButton"),
  resultsSummary: document.getElementById("resultsSummary"),
  speciesGrid: document.getElementById("speciesGrid"),
};

function loadSpecies() {
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) return defaultSpecies.map((item) => ({ ...item }));

  try {
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return defaultSpecies.map((item) => ({ ...item }));

    const byId = new Map(defaultSpecies.map((item) => [item.id, item]));
    return defaultSpecies.map((seed) => ({
      ...seed,
      ...(parsed.find((item) => item && item.id === seed.id) || {}),
      publicImageUrl: sanitizeUrl((parsed.find((item) => item && item.id === seed.id) || seed).publicImageUrl || seed.publicImageUrl),
    }));
  } catch {
    return defaultSpecies.map((item) => ({ ...item }));
  }
}

function sanitizeUrl(value) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  try {
    const url = new URL(trimmed);
    if (!/^https?:$/.test(url.protocol)) return "";
    return url.toString();
  } catch {
    return "";
  }
}

function bootstrap() {
  fillFilterOptions();
  bindEvents();
  render();
}

function fillFilterOptions() {
  const families = [...new Set(defaultSpecies.map((item) => item.family))].sort();
  const statuses = [...new Set(defaultSpecies.map((item) => item.status))].sort();

  for (const family of families) {
    const option = document.createElement("option");
    option.value = family;
    option.textContent = family;
    elements.familyFilter.append(option);
  }

  for (const status of statuses) {
    const option = document.createElement("option");
    option.value = status;
    option.textContent = status;
    elements.statusFilter.append(option);
  }
}

function bindEvents() {
  elements.searchInput.addEventListener("input", () => {
    state.search = elements.searchInput.value.trim().toLowerCase();
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

  elements.resetFiltersButton.addEventListener("click", () => {
    state.search = "";
    state.family = "all";
    state.status = "all";
    elements.searchInput.value = "";
    elements.familyFilter.value = "all";
    elements.statusFilter.value = "all";
    render();
  });
}

function matchesFilters(species) {
  const haystack = [species.scientificName, species.commonName, species.family, species.status, species.authority, species.anatomy, species.physiology, species.ecology]
    .join(" ")
    .toLowerCase();

  if (state.search && !haystack.includes(state.search)) return false;
  if (state.family !== "all" && species.family !== state.family) return false;
  if (state.status !== "all" && species.status !== state.status) return false;
  return true;
}

function render() {
  const visible = state.species.filter(matchesFilters);
  elements.resultsSummary.textContent = `${visible.length} especies visibles · ${state.species.length} en el catálogo inicial`;
  elements.speciesGrid.innerHTML = visible.map(renderSpeciesCard).join("") || emptyState();
  attachCardEvents();
}

function emptyState() {
  return `
    <article class="species-card">
      <div class="card-top">
        <div class="card-meta">
          <span class="badge">SIN RESULTADOS</span>
        </div>
        <h2>No hay coincidencias</h2>
        <p>Prueba ajustar los filtros o limpiar la búsqueda.</p>
      </div>
    </article>
  `;
}

function renderSpeciesCard(species) {
  const currentImage = species.publicImageUrl || species.imageUrl;
  const safeImage = sanitizeUrl(currentImage) || species.imageUrl;

  return `
    <article class="species-card" data-species-id="${escapeHtml(species.id)}">
      <div class="card-top">
        <div class="card-meta">
          <span class="badge">${escapeHtml(species.status)}</span>
          <span class="family-pill">${escapeHtml(species.family)}</span>
        </div>
        <h2>${escapeHtml(species.scientificName)}</h2>
        <p>${escapeHtml(species.commonName)}</p>
      </div>

      <section class="image-panel">
        <div class="image-frame">
          <img alt="Referencia de ${escapeHtml(species.scientificName)}" loading="lazy" referrerpolicy="no-referrer" src="${escapeHtml(safeImage)}" />
        </div>
      </section>

      <section class="card-body">
        <form class="url-form" autocomplete="off">
          <label>
            <span>URL PÚBLICA</span>
            <input type="url" name="publicImageUrl" value="${escapeHtml(currentImage)}" placeholder="https://..." />
          </label>
          <button class="save-button" type="submit">Guardar</button>
        </form>
        <a class="open-link" href="${escapeHtml(safeImage)}" target="_blank" rel="noopener noreferrer">Abrir imagen</a>
        <p class="card-feedback" aria-live="polite"></p>

        <div class="info-grid">
          <div class="info-box">
            <h3>Autoridad / descubrimiento</h3>
            <p>${escapeHtml(species.authority)}</p>
          </div>
          <div class="info-box">
            <h3>Características anatómicas</h3>
            <p>${escapeHtml(species.anatomy)}</p>
          </div>
          <div class="info-box">
            <h3>Características fisiológicas</h3>
            <p>${escapeHtml(species.physiology)}</p>
          </div>
          <div class="info-box">
            <h3>Etología y hábitat</h3>
            <p>${escapeHtml(species.ecology)}</p>
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
    const feedback = card.querySelector(".card-feedback");
    const image = card.querySelector("img");
    const openLink = card.querySelector(".open-link");
    const speciesId = card.dataset.speciesId;

    const species = state.species.find((item) => item.id === speciesId);
    if (!species) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const nextUrl = sanitizeUrl(input.value);
      if (!nextUrl) {
        feedback.textContent = "Usa una URL pública absoluta con protocolo http o https.";
        return;
      }

      species.publicImageUrl = nextUrl;
      persistSpecies();
      image.src = nextUrl;
      openLink.href = nextUrl;
      feedback.textContent = "Imagen guardada y lista para abrir.";
    });
  });
}

function persistSpecies() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.species));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

bootstrap();
