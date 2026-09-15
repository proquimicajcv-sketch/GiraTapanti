const test = require('node:test');
const assert = require('node:assert/strict');

function makeElement() {
  return {
    value: '',
    textContent: '',
    innerHTML: '',
    listeners: {},
    append() {},
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
  };

  global.fetch = async () => ({ ok: false, status: 503 });

  delete require.cache[require.resolve('./app.js')];
  const app = require('./app.js');

  await app.bootstrap();

  assert.match(elements.get('resultsSummary').textContent, /No se pudo cargar/);
  assert.equal(elements.get('heroSpeciesCount').textContent, 'Sin datos');
  assert.match(elements.get('speciesGrid').innerHTML, /Error al cargar el catálogo/);
});
