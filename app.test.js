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
    },
    addEventListener(type, handler) {
      this.listeners[type] = handler;
    },
    querySelector() {
      return { outerHTML: '<option value="all">Todos</option>' };
    },
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
    ['emptyStateTemplate', { content: { cloneNode() { return {}; } } }],
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
    ['emptyStateTemplate', { content: { cloneNode() { return {}; } } }],
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
    json: async () => [
      {
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
      },
    ],
  });

  delete require.cache[require.resolve('./app.js')];
  const app = require('./app.js');

  await app.bootstrap();

  assert.match(elements.get('speciesGrid').innerHTML, /Duellmanohyla rufioculis/);
  assert.equal(elements.get('groupFilter').appended[0].value, 'anfibio');
  assert.equal(elements.get('groupFilter').appended[0].textContent, 'Anfibio');
  assert.match(elements.get('resultsSummary').textContent, /1 especie visible/);
});
