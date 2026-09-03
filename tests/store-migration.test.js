import test from 'node:test';
import assert from 'node:assert/strict';

const legacy = {
  schema: 1,
  profile: { phase: 'posparto' },
  settings: { homeShortcuts: { posparto: ['diapers', 'diapers', 'unknown'] } },
};
let persisted = null;
globalThis.localStorage = { getItem: () => JSON.stringify(legacy), setItem: (_key, value) => { persisted = JSON.parse(value); } };

const { getState } = await import('../assets/js/store.js');

test('migração preserva a chave antiga e normaliza atalhos do schema anterior', () => {
  const state = getState();
  assert.equal(state.schema, 2);
  assert.deepEqual(state.settings.homeShortcuts.posparto, ['diapers', 'calendar', 'baby-vaccines', 'baby-growth']);
  assert.equal(state.settings.homeShortcuts.tentante.length, 4);
  assert.equal(state.settings.homeShortcuts.gravida.length, 4);
  assert.equal(persisted.schema, 2);
});
