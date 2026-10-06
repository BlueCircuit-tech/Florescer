import test from 'node:test';
import assert from 'node:assert/strict';

/** Estado de uma usuária que já usava o app antes das últimas mudanças. */
const legacy = {
  schema: 1,
  profile: { phase: 'posparto' },
  settings: {
    homeShortcuts: { posparto: ['diapers', 'diapers', 'unknown', 'missions'] },
    // recursos que saíram do app desde então
    notifications: { missions: true, community: true, time: '09:00', fertile: true },
  },
  missionDays: { '2026-01-01': ['agua'] },
  notices: [
    { id: 'missions:2026-01-01', kind: 'missions', title: 'Ainda há missões', to: 'missoes', at: Date.now(), read: false },
    { id: 'tip:2026-01-01', kind: 'tip', title: 'Sua sugestão', to: 'home', at: Date.now(), read: false },
  ],
  notifyLog: { 'fertile:2026-01-01': 1 },
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

test('atalho de um recurso removido não sobrevive à migração', () => {
  assert.ok(!getState().settings.homeShortcuts.posparto.includes('missions'));
});

test('a migração limpa o que ficou de recursos que saíram do app', () => {
  const state = getState();
  assert.equal(state.missionDays, undefined, 'missões diárias');
  assert.equal(state.notifyLog, undefined, 'notificações do sistema');
  assert.equal(state.settings.notifications.missions, undefined);
  assert.equal(state.settings.notifications.community, undefined);
  assert.equal(state.settings.notifications.time, undefined);
  assert.equal(state.settings.notifications.fertile, true, 'o que continua valendo é preservado');
});

test('aviso guardado de um recurso removido sai do sininho', () => {
  const kinds = getState().notices.map((n) => n.kind);
  assert.ok(!kinds.includes('missions'), 'apontaria para uma tela que não existe mais');
  assert.ok(kinds.includes('tip'), 'os outros avisos continuam');
});
