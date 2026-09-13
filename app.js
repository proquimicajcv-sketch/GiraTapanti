const STORAGE_KEY = 'tapanti.speciesCatalog.v1';
const URL_MAX_LENGTH = 2048;

const SEED_SPECIES = [
  {
    id: 'mimosa-pudica',
    status: 'DATOS A CONFIRMAR',
    family: 'Fabaceae',
    scientificName: 'Mimosa pudica',
    commonName: 'Dormilona · Sensitiva',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0c/Mimosa_pudica_001.JPG',
    authority: 'Carl Linnaeus describió la especie en 1753 a partir de ejemplares tropicales ampliamente observados por su movimiento foliar.',
    anatomy: 'Hierba o subarbusto espinoso con hojas bipinnadas muy finas, foliolos opuestos y flores rosadas agrupadas en glomérulos esféricos.',
    physiology: 'Presenta tigmonastia: los foliolos se pliegan en segundos ante contacto o vibración gracias a cambios rápidos de turgencia en los pulvínulos.',
    behaviorHabitat: 'Frecuente en bordes de sendero, claros húmedos y sitios alterados de bosque premontano; soporta alta humedad y radiación parcial.'
  },
  {
    id: 'monstera-deliciosa',
    status: 'DATOS A CONFIRMAR',
    family: 'Araceae',
    scientificName: 'Monstera deliciosa',
    commonName: 'Costilla de Adán · Cerimán',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/36/Monstera_deliciosa2.jpg',
    authority: 'Friedrich Anton Wilhelm Miquel formalizó la especie en 1863; es una arácea emblemática de bosques húmedos neotropicales.',
    anatomy: 'Liana hemiepífita con hojas grandes, coriáceas y fenestradas; desarrolla raíces aéreas robustas para trepar sobre troncos y rocas húmedas.',
    physiology: 'Aprovecha microclimas sombreados con alta humedad relativa; sus raíces aéreas y láminas perforadas favorecen soporte y disipación de agua.',
    behaviorHabitat: 'Común en sotobosques y bordes ribereños del bosque lluvioso; usa árboles como soporte mientras explora claros con luz filtrada.'
  },
  {
    id: 'cecropia-obtusifolia',
    status: 'EN CURACIÓN',
    family: 'Urticaceae',
    scientificName: 'Cecropia obtusifolia',
    commonName: 'Guarumo',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/09/Cecropia_obtusifolia_01.jpg',
    authority: 'Henri Pittier y colaboradores documentaron ampliamente el género en Centroamérica por su importancia ecológica en sucesión secundaria.',
    anatomy: 'Árbol pionero de tronco claro y hueco, hojas palmadas con envés plateado y largos pecíolos visibles desde el dosel bajo.',
    physiology: 'Crece con rapidez en ambientes perturbados; su relación con hormigas mutualistas mejora defensa y reciclaje de nutrientes.',
    behaviorHabitat: 'Característico de claros, deslizamientos y bordes de camino en Tapantí, donde acelera la cobertura vegetal y atrae fauna frugívora.'
  },
  {
    id: 'heliconia-latispatha',
    status: 'LISTA PARA REVISIÓN',
    family: 'Heliconiaceae',
    scientificName: 'Heliconia latispatha',
    commonName: 'Platanilla',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Heliconia_latispatha.jpg',
    authority: 'Bentham describió esta heliconia en 1849; hoy se reconoce como un recurso floral clave para colibríes neotropicales.',
    anatomy: 'Hierba rizomatosa con pseudotallos, hojas grandes y brácteas anaranjadas o rojas que protegen flores tubulares vistosas.',
    physiology: 'Mantiene inflorescencias con abundante néctar que favorecen polinizadores especializados; su tejido acuoso resiste lluvias intensas.',
    behaviorHabitat: 'Se desarrolla en quebradas, claros húmedos y orillas de senderos donde recibe luz parcial y suelos profundos con drenaje constante.'
  }
];

const state = {
  species: [],
  search: '',
  family: 'all',
  status: 'all',
  feedbackById: {},
  draftUrlById: {}
};

const elements = {
  searchInput: document.querySelector('#searchInput'),
  familyFilter: document.querySelector('#familyFilter'),
  statusFilter: document.querySelector('#statusFilter'),
  resetFiltersButton: document.querySelector('#resetFiltersButton'),
  resultsSummary: document.querySelector('#resultsSummary'),
  speciesGrid: document.querySelector('#speciesGrid'),
  emptyStateTemplate: document.querySelector('#emptyStateTemplate')
};

function createPlaceholderDataUrl(species) {
  const scientific = escapeSvgText(species.scientificName);
  const common = escapeSvgText(species.commonName);
  const family = escapeSvgText(species.family);

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#0d5158" />
          <stop offset="100%" stop-color="#082b31" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" rx="32" fill="url(#bg)" />
      <circle cx="640" cy="140" r="110" fill="rgba(159,226,188,0.15)" />
      <circle cx="150" cy="460" r="150" fill="rgba(103,198,185,0.12)" />
      <text x="60" y="94" fill="#9fe2bc" font-family="Arial, sans-serif" font-size="24" letter-spacing="5">${family}</text>
      <text x="60" y="260" fill="#ebfff8" font-family="Arial, sans-serif" font-size="54" font-weight="700">${scientific}</text>
      <text x="60" y="330" fill="#b8ddd4" font-family="Arial, sans-serif" font-size="34">${common}</text>
      <text x="60" y="520" fill="#8bb7af" font-family="Inter, Arial, sans-serif" font-size="24">Sin imagen válida · usa URL pública</text>
    </svg>
  `)}`;
}

function escapeSvgText(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function safeAbsoluteImageUrl(candidate) {
  if (typeof candidate !== 'string') {
    return null;
  }

  const trimmed = candidate.trim();

  if (!trimmed || trimmed.length > URL_MAX_LENGTH) {
    return null;
  }

  try {
    const parsed = new URL(trimmed);
    const allowedProtocols = new Set(['http:', 'https:']);

    if (!allowedProtocols.has(parsed.protocol)) {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
}

function readStoredOverrides() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function persistSpeciesUrl(speciesId, nextUrl) {
  const current = readStoredOverrides();

  if (nextUrl) {
    current[speciesId] = { publicImageUrl: nextUrl };
  } else {
    delete current[speciesId];
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
}

function mergeSpeciesWithOverrides(seedSpecies, overrides) {
  return seedSpecies.map((species) => {
    const override = overrides[species.id];
    const overrideUrl = safeAbsoluteImageUrl(override?.publicImageUrl);

    return {
      ...species,
      publicImageUrl: overrideUrl || species.imageUrl,
      placeholderUrl: createPlaceholderDataUrl(species)
    };
  });
}

function uniqueSortedValues(values) {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right, 'es'));
}

function populateFilters() {
  const families = uniqueSortedValues(SEED_SPECIES.map((species) => species.family));
  const statuses = uniqueSortedValues(SEED_SPECIES.map((species) => species.status));

  appendOptions(elements.familyFilter, families);
  appendOptions(elements.statusFilter, statuses);
}

function appendOptions(selectElement, values) {
  values.forEach((value) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    selectElement.append(option);
  });
}

function updateResultsSummary(count) {
  const plural = count === 1 ? 'especie visible' : 'especies visibles';
  elements.resultsSummary.textContent = `${count} ${plural} · ${SEED_SPECIES.length} en el catálogo inicial`;
}

function filterSpecies() {
  const searchValue = state.search.trim().toLocaleLowerCase('es');

  return state.species.filter((species) => {
    const haystack = [
      species.scientificName,
      species.commonName,
      species.family,
      species.status,
      species.authority,
      species.anatomy,
      species.physiology,
      species.behaviorHabitat
    ]
      .join(' ')
      .toLocaleLowerCase('es');

    const matchesSearch = !searchValue || haystack.includes(searchValue);
    const matchesFamily = state.family === 'all' || species.family === state.family;
    const matchesStatus = state.status === 'all' || species.status === state.status;

    return matchesSearch && matchesFamily && matchesStatus;
  });
}

function clearGrid() {
  while (elements.speciesGrid.firstChild) {
    elements.speciesGrid.removeChild(elements.speciesGrid.firstChild);
  }
}

function buildInfoCard(title, content) {
  const card = document.createElement('section');
  card.className = 'info-card';

  const heading = document.createElement('h3');
  heading.textContent = title;

  const paragraph = document.createElement('p');
  paragraph.textContent = content;

  card.append(heading, paragraph);
  return card;
}

function createCard(species) {
  const article = document.createElement('article');
  article.className = 'species-card';
  article.dataset.speciesId = species.id;

  const meta = document.createElement('div');
  meta.className = 'card-meta';

  const badge = document.createElement('span');
  badge.className = 'badge';
  badge.textContent = species.status;

  const family = document.createElement('span');
  family.className = 'family-pill';
  family.textContent = species.family;

  meta.append(badge, family);

  const title = document.createElement('header');
  title.className = 'card-title';

  const scientificName = document.createElement('h2');
  scientificName.textContent = species.scientificName;

  const commonName = document.createElement('p');
  commonName.textContent = species.commonName;

  title.append(scientificName, commonName);

  const imagePanel = document.createElement('section');
  imagePanel.className = 'image-panel';

  const imageFrame = document.createElement('div');
  imageFrame.className = 'image-frame';

  const image = document.createElement('img');
  image.alt = `Referencia de ${species.scientificName}`;
  image.loading = 'lazy';
  image.referrerPolicy = 'no-referrer';
  image.src = safeAbsoluteImageUrl(species.publicImageUrl) || species.placeholderUrl;
  image.dataset.placeholder = species.placeholderUrl;
  image.addEventListener('error', () => {
    image.src = image.dataset.placeholder;
  });

  imageFrame.append(image);

  const helper = document.createElement('div');
  helper.className = 'image-helper';

  const helperLeft = document.createElement('span');
  helperLeft.textContent = 'Imagen de referencia';

  const helperRight = document.createElement('span');
  helperRight.textContent = 'Acepta URLs http/https';

  helper.append(helperLeft, helperRight);
  imagePanel.append(imageFrame, helper);

  const form = document.createElement('form');
  form.className = 'url-form';
  form.dataset.speciesId = species.id;
  form.noValidate = true;

  const label = document.createElement('label');
  label.className = 'field';

  const labelText = document.createElement('span');
  labelText.textContent = 'URL pública';

  const actions = document.createElement('div');
  actions.className = 'url-actions';

  const input = document.createElement('input');
  input.type = 'url';
  input.name = `public-url-${species.id}`;
  input.inputMode = 'url';
  input.autocomplete = 'url';
  input.maxLength = URL_MAX_LENGTH;
  input.placeholder = 'https://ejemplo.com/imagen.jpg';
  input.value = state.draftUrlById[species.id] ?? species.publicImageUrl ?? '';
  input.setAttribute('aria-label', `URL pública para ${species.scientificName}`);
  input.addEventListener('input', (event) => {
    state.draftUrlById[species.id] = event.target.value;
  });

  const button = document.createElement('button');
  button.className = 'primary-button';
  button.type = 'submit';
  button.textContent = 'Guardar';

  actions.append(input, button);
  label.append(labelText, actions);

  const feedback = document.createElement('p');
  feedback.className = 'card-feedback';
  feedback.textContent = state.feedbackById[species.id]?.message || ' '; 
  if (state.feedbackById[species.id]?.type) {
    feedback.classList.add(state.feedbackById[species.id].type);
  }

  const linkRow = document.createElement('div');
  linkRow.className = 'card-links';

  const link = document.createElement('a');
  const currentImageUrl = safeAbsoluteImageUrl(species.publicImageUrl);
  link.textContent = 'Abrir imagen';
  link.target = '_blank';
  link.rel = 'noreferrer noopener';

  if (currentImageUrl) {
    link.href = currentImageUrl;
    link.removeAttribute('aria-disabled');
  } else {
    link.href = '#';
    link.setAttribute('aria-disabled', 'true');
  }

  const hint = document.createElement('span');
  hint.className = 'link-hint';
  hint.textContent = currentImageUrl
    ? 'La ficha abrirá la URL guardada actualmente.'
    : 'Guarda una URL válida para habilitar el enlace.';

  linkRow.append(link, hint);

  form.append(label, feedback, linkRow);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    handleUrlSave(species.id, input.value);
  });

  const infoGrid = document.createElement('div');
  infoGrid.className = 'info-grid';
  infoGrid.append(
    buildInfoCard('Autoridad / descubrimiento', species.authority),
    buildInfoCard('Características anatómicas', species.anatomy),
    buildInfoCard('Características fisiológicas', species.physiology),
    buildInfoCard('Etología y hábitat', species.behaviorHabitat)
  );

  article.append(meta, title, imagePanel, form, infoGrid);
  return article;
}

function renderSpecies() {
  clearGrid();
  const filtered = filterSpecies();
  updateResultsSummary(filtered.length);

  if (filtered.length === 0) {
    elements.speciesGrid.append(elements.emptyStateTemplate.content.cloneNode(true));
    return;
  }

  const fragment = document.createDocumentFragment();
  filtered.forEach((species) => fragment.append(createCard(species)));
  elements.speciesGrid.append(fragment);
}

function handleUrlSave(speciesId, rawValue) {
  const trimmed = rawValue.trim();

  if (!trimmed) {
    persistSpeciesUrl(speciesId, '');
    delete state.draftUrlById[speciesId];
    state.species = mergeSpeciesWithOverrides(SEED_SPECIES, readStoredOverrides());
    state.feedbackById[speciesId] = {
      type: 'success',
      message: 'Se restauró la imagen de referencia inicial de la ficha.'
    };
    renderSpecies();
    return;
  }

  const safeUrl = safeAbsoluteImageUrl(trimmed);

  if (!safeUrl) {
    state.draftUrlById[speciesId] = rawValue;
    state.feedbackById[speciesId] = {
      type: 'error',
      message: 'Usa una URL pública absoluta con protocolo http o https.'
    };
    renderSpecies();
    return;
  }

  persistSpeciesUrl(speciesId, safeUrl);
  delete state.draftUrlById[speciesId];
  state.species = mergeSpeciesWithOverrides(SEED_SPECIES, readStoredOverrides());
  state.feedbackById[speciesId] = {
    type: 'success',
    message: 'Imagen guardada en este navegador. Recarga la página para comprobar la persistencia.'
  };
  renderSpecies();
}

function resetFilters() {
  state.search = '';
  state.family = 'all';
  state.status = 'all';
  elements.searchInput.value = '';
  elements.familyFilter.value = 'all';
  elements.statusFilter.value = 'all';
  renderSpecies();
}

function bindEvents() {
  elements.searchInput.addEventListener('input', (event) => {
    state.search = event.target.value;
    renderSpecies();
  });

  elements.familyFilter.addEventListener('change', (event) => {
    state.family = event.target.value;
    renderSpecies();
  });

  elements.statusFilter.addEventListener('change', (event) => {
    state.status = event.target.value;
    renderSpecies();
  });

  elements.resetFiltersButton.addEventListener('click', resetFilters);
}

function init() {
  populateFilters();
  state.species = mergeSpeciesWithOverrides(SEED_SPECIES, readStoredOverrides());
  bindEvents();
  renderSpecies();
}

init();
