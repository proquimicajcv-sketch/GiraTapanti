const test = require('node:test');
const assert = require('node:assert/strict');

function makeElement() {
  return {
    value: '',
    textContent: '',
    innerHTML: '',
    listeners: {},
    appended: [],
    append(option) {
      this.appended.push(option);
      if (option?.outerHTML) {
        this.innerHTML += option.outerHTML;
      }
    },
    addEventListener(type, handler) {
      this.listeners[type] = handler;
    },
    querySelector() {
      return { outerHTML: '<option value="all">Todos</option>' };
    },
  };
}

function makeSpeciesRecord(overrides = {}) {
  return {
    id: 'duellmanohyla-rufioculis',
    catalogNumber: 1,
    sciName: 'Duellmanohyla rufioculis',
    commonName: 'Rana de ojos rojizos de torrente',
    group: 'anfibio',
    groupLabel: 'Anfibio',
    family: 'Hylidae',
    badge: 'Anfibio · Hylidae',
    badgeClass: 'b-amphibia',
    autoridad: 'Test autoridad',
    anatomia: 'Test anatomía',
    fisiologia: 'Test fisiología',
    etologia: 'Test etología',
    curiosidad: 'Test curiosidad',
    conservacion: 'Datos a confirmar',
    inatUrl: 'https://www.inaturalist.org/taxa/search?q=Duellmanohyla%20rufioculis',
    specUrl: 'https://www.gbif.org/species/search?q=Duellmanohyla%20rufioculis',
    specLabel: 'GBIF / ficha de especie',
    imageUrl: 'https://example.com/field.jpg',
    ...overrides,
  };
}

test('bootstrap renders load error when catalog fetch fails', async () => {
  const elements = new Map([
    ['searchInput', makeElement()],
    ['groupFilter', makeElement()],
    ['familyFilter', makeElement()],
    ['statusFilter', makeElement()],
    ['resetFiltersButton', makeElement()],
    ['resultsSummary', makeElement()],
    ['speciesGrid', makeElement()],
    ['emptyStateTemplate', { content: { cloneNode() { return { outerHTML: '<article class="empty-state"></article>' }; } } }],
    ['heroSpeciesCount', makeElement()],
    ['heroGroupCount', makeElement()],
  ]);

  global.window = {
    __TAPANTI_DISABLE_AUTO_BOOTSTRAP__: true,
    localStorage: {
      getItem() {
        return null;
      },
      setItem() {},
    },
  };

  global.document = {
    getElementById(id) {
      return elements.get(id);
    },
    querySelectorAll() {
      return [];
    },
    createElement() {
      return { value: '', textContent: '' };
    },
  };

  global.fetch = async () => ({ ok: false, status: 503 });

  delete require.cache[require.resolve('./app.js')];
  const app = require('./app.js');

  await app.bootstrap();

  assert.match(elements.get('resultsSummary').textContent, /No se pudo cargar/);
  assert.equal(elements.get('heroSpeciesCount').textContent, 'Sin datos');
  assert.match(elements.get('speciesGrid').innerHTML, /Error al cargar el catálogo/);
});

test('bootstrap loads catalog and populates filters with stable group values', async () => {
  const elements = new Map([
    ['searchInput', makeElement()],
    ['groupFilter', makeElement()],
    ['familyFilter', makeElement()],
    ['statusFilter', makeElement()],
    ['resetFiltersButton', makeElement()],
    ['resultsSummary', makeElement()],
    ['speciesGrid', makeElement()],
    ['emptyStateTemplate', { content: { cloneNode() { return { outerHTML: '<article class="empty-state"></article>' }; } } }],
    ['heroSpeciesCount', makeElement()],
    ['heroGroupCount', makeElement()],
  ]);

  global.window = {
    __TAPANTI_DISABLE_AUTO_BOOTSTRAP__: true,
    localStorage: {
      getItem() {
        return null;
      },
      setItem() {},
    },
  };

  global.document = {
    getElementById(id) {
      return elements.get(id);
    },
    querySelectorAll() {
      return [];
    },
    createElement() {
      return { value: '', textContent: '' };
    },
  };

  global.fetch = async () => ({
    ok: true,
    json: async () => [makeSpeciesRecord()],
  });

  delete require.cache[require.resolve('./app.js')];
  const app = require('./app.js');

  await app.bootstrap();

  assert.match(elements.get('speciesGrid').innerHTML, /Duellmanohyla rufioculis/);
  assert.equal(elements.get('groupFilter').appended[0].value, 'anfibio');
  assert.equal(elements.get('groupFilter').appended[0].textContent, 'Anfibio');
  assert.match(elements.get('resultsSummary').textContent, /1 especie visible/);
  assert.match(elements.get('heroSpeciesCount').textContent, /1 fichas curadas/);
  assert.match(elements.get('heroGroupCount').textContent, /1 grupos/);
});

test('filters can produce empty state without crashing', async () => {
  const elements = new Map([
    ['searchInput', makeElement()],
    ['groupFilter', makeElement()],
    ['familyFilter', makeElement()],
    ['statusFilter', makeElement()],
    ['resetFiltersButton', makeElement()],
    ['resultsSummary', makeElement()],
    ['speciesGrid', makeElement()],
    ['emptyStateTemplate', { content: { cloneNode() { return { outerHTML: '<article class="empty-state"></article>' }; } } }],
    ['heroSpeciesCount', makeElement()],
    ['heroGroupCount', makeElement()],
  ]);

  global.window = {
    __TAPANTI_DISABLE_AUTO_BOOTSTRAP__: true,
    localStorage: {
      getItem() {
        return null;
      },
      setItem() {},
    },
  };

  global.document = {
    getElementById(id) {
      return elements.get(id);
    },
    querySelectorAll() {
      return [];
    },
    createElement() {
      return { value: '', textContent: '' };
    },
  };

  global.fetch = async () => ({
    ok: true,
    json: async () => [makeSpeciesRecord()],
  });

  delete require.cache[require.resolve('./app.js')];
  const app = require('./app.js');

  await app.bootstrap();

  elements.get('groupFilter').value = 'reptil';
  elements.get('groupFilter').listeners.change();

  assert.match(elements.get('resultsSummary').textContent, /Sin especies visibles/);
  assert.match(elements.get('speciesGrid').innerHTML, /empty-state/);
});

test('empty-state fallback works when template is unavailable', async () => {
  const elements = new Map([
    ['searchInput', makeElement()],
    ['groupFilter', makeElement()],
    ['familyFilter', makeElement()],
    ['statusFilter', makeElement()],
    ['resetFiltersButton', makeElement()],
    ['resultsSummary', makeElement()],
    ['speciesGrid', makeElement()],
    ['heroSpeciesCount', makeElement()],
    ['heroGroupCount', makeElement()],
  ]);

  global.window = {
    __TAPANTI_DISABLE_AUTO_BOOTSTRAP__: true,
    localStorage: {
      getItem() {
        return null;
      },
      setItem() {},
    },
  };

  global.document = {
    getElementById(id) {
      return elements.get(id);
    },
    querySelectorAll() {
      return [];
    },
    createElement() {
      return { value: '', textContent: '' };
    },
  };

  global.fetch = async () => ({
    ok: true,
    json: async () => [makeSpeciesRecord()],
  });

  delete require.cache[require.resolve('./app.js')];
  const app = require('./app.js');

  await app.bootstrap();

  elements.get('groupFilter').value = 'reptil';
  elements.get('groupFilter').listeners.change();

  assert.match(elements.get('resultsSummary').textContent, /Sin especies visibles/);
  assert.match(elements.get('speciesGrid').innerHTML, /Sin resultados/);
});

test('bootstrap merges stored image override by species id', async () => {
  const elements = new Map([
    ['searchInput', makeElement()],
    ['groupFilter', makeElement()],
    ['familyFilter', makeElement()],
    ['statusFilter', makeElement()],
    ['resetFiltersButton', makeElement()],
    ['resultsSummary', makeElement()],
    ['speciesGrid', makeElement()],
    ['emptyStateTemplate', { content: { cloneNode() { return { outerHTML: '<article class="empty-state"></article>' }; } } }],
    ['heroSpeciesCount', makeElement()],
    ['heroGroupCount', makeElement()],
  ]);

  global.window = {
    __TAPANTI_DISABLE_AUTO_BOOTSTRAP__: true,
    localStorage: {
      getItem(key) {
        if (key === 'tapanti.speciesCatalog.images.v2') {
          return JSON.stringify({
            'duellmanohyla-rufioculis': { publicImageUrl: 'https://example.com/override.jpg' },
          });
        }
        return null;
      },
      setItem() {},
    },
  };

  global.document = {
    getElementById(id) {
      return elements.get(id);
    },
    querySelectorAll() {
      return [];
    },
    createElement() {
      return { value: '', textContent: '' };
    },
  };

  global.fetch = async () => ({
    ok: true,
    json: async () => [makeSpeciesRecord()],
  });

  delete require.cache[require.resolve('./app.js')];
  const app = require('./app.js');
  await app.bootstrap();

  assert.match(elements.get('speciesGrid').innerHTML, /https:\/\/example\.com\/override\.jpg/);
});

test('mergeSpeciesWithOverrides keeps seeded publicImageUrl when no override exists', () => {
  global.window = {
    __TAPANTI_DISABLE_AUTO_BOOTSTRAP__: true,
    localStorage: { getItem() { return null; }, setItem() {} },
  };
  global.document = {
    getElementById() { return null; },
    querySelectorAll() { return []; },
    createElement() { return { value: '', textContent: '' }; },
  };

  delete require.cache[require.resolve('./app.js')];
  const app = require('./app.js');

  const merged = app.mergeSpeciesWithOverrides(
    [makeSpeciesRecord({ imageUrl: 'https://example.com/base.jpg', publicImageUrl: 'https://example.com/seed-public.jpg' })],
    {},
  );

  assert.equal(merged[0].publicImageUrl, 'https://example.com/seed-public.jpg');
});

test('mergeSpeciesWithOverrides restores curated public image when override is marked as cleared', () => {
  global.window = {
    __TAPANTI_DISABLE_AUTO_BOOTSTRAP__: true,
    localStorage: { getItem() { return null; }, setItem() {} },
  };
  global.document = {
    getElementById() { return null; },
    querySelectorAll() { return []; },
    createElement() { return { value: '', textContent: '' }; },
  };

  delete require.cache[require.resolve('./app.js')];
  const app = require('./app.js');

  const merged = app.mergeSpeciesWithOverrides(
    [makeSpeciesRecord({ imageUrl: 'https://example.com/base.jpg', publicImageUrl: 'https://example.com/seed-public.jpg' })],
    { 'duellmanohyla-rufioculis': { cleared: true } },
  );

  assert.equal(merged[0].publicImageUrl, 'https://example.com/seed-public.jpg');
});

test('url save handles invalid input and clearing persisted overrides', async () => {
  const elements = new Map([
    ['searchInput', makeElement()],
    ['groupFilter', makeElement()],
    ['familyFilter', makeElement()],
    ['statusFilter', makeElement()],
    ['resetFiltersButton', makeElement()],
    ['resultsSummary', makeElement()],
    ['speciesGrid', makeElement()],
    ['emptyStateTemplate', { content: { cloneNode() { return { outerHTML: '<article class="empty-state"></article>' }; } } }],
    ['heroSpeciesCount', makeElement()],
    ['heroGroupCount', makeElement()],
  ]);

  const writes = [];

  global.window = {
    __TAPANTI_DISABLE_AUTO_BOOTSTRAP__: true,
    localStorage: {
      getItem() {
        return null;
      },
      setItem(key, value) {
        writes.push({ key, value });
      },
    },
  };

  global.document = {
    getElementById(id) {
      return elements.get(id);
    },
    querySelectorAll() {
      return [];
    },
    createElement() {
      return { value: '', textContent: '' };
    },
  };

  global.fetch = async () => ({
    ok: true,
    json: async () => [makeSpeciesRecord({ imageUrl: 'nota-url-valida' })],
  });

  delete require.cache[require.resolve('./app.js')];
  const app = require('./app.js');
  await app.bootstrap();
  assert.match(elements.get('speciesGrid').innerHTML, /data:image\/svg\+xml/);
  assert.match(elements.get('speciesGrid').innerHTML, /<span class="open-link is-disabled" aria-disabled="true">Abrir imagen<\/span>/);

  app.handleUrlSave('duellmanohyla-rufioculis', 'invalida');
  assert.match(elements.get('speciesGrid').innerHTML, /Usa una URL pública absoluta/);

  app.handleUrlSave('duellmanohyla-rufioculis', 'https://example.com/public.jpg');
  assert.equal(writes.at(-1).key, 'tapanti.speciesCatalog.images.v2');
  assert.match(writes.at(-1).value, /public\.jpg/);
  assert.match(elements.get('speciesGrid').innerHTML, /Imagen guardada en este navegador/);

  app.handleUrlSave('duellmanohyla-rufioculis', '   ');
  assert.equal(writes.at(-1).value, '{"duellmanohyla-rufioculis":{"cleared":true}}');
  assert.match(elements.get('speciesGrid').innerHTML, /Se restauró la imagen de referencia de la ficha/);
});

test('clearing a custom URL restores the curated public image when available', async () => {
  const elements = new Map([
    ['searchInput', makeElement()],
    ['groupFilter', makeElement()],
    ['familyFilter', makeElement()],
    ['statusFilter', makeElement()],
    ['resetFiltersButton', makeElement()],
    ['resultsSummary', makeElement()],
    ['speciesGrid', makeElement()],
    ['emptyStateTemplate', { content: { cloneNode() { return { outerHTML: '<article class="empty-state"></article>' }; } } }],
    ['heroSpeciesCount', makeElement()],
    ['heroGroupCount', makeElement()],
  ]);

  global.window = {
    __TAPANTI_DISABLE_AUTO_BOOTSTRAP__: true,
    localStorage: {
      getItem() {
        return null;
      },
      setItem() {},
    },
  };

  global.document = {
    getElementById(id) {
      return elements.get(id);
    },
    querySelectorAll() {
      return [];
    },
    createElement() {
      return { value: '', textContent: '' };
    },
  };

  global.fetch = async () => ({
    ok: true,
    json: async () => [makeSpeciesRecord({ imageUrl: 'https://example.com/base.jpg', publicImageUrl: 'https://example.com/seed-public.jpg' })],
  });

  delete require.cache[require.resolve('./app.js')];
  const app = require('./app.js');
  await app.bootstrap();

  app.handleUrlSave('duellmanohyla-rufioculis', 'https://example.com/custom.jpg');
  app.handleUrlSave('duellmanohyla-rufioculis', ' ');

  assert.match(elements.get('speciesGrid').innerHTML, /https:\/\/example\.com\/seed-public\.jpg/);
});
