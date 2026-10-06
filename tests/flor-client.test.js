import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.localStorage = { getItem: () => null, setItem: () => {} };
// o Node 24 já expõe `navigator` como getter: só dá para trocar redefinindo
const setOnline = (onLine) => Object.defineProperty(globalThis, 'navigator', {
  value: { onLine }, configurable: true, writable: true,
});
setOnline(true);

const { getState, update } = await import('../assets/js/store.js');
const { addDays, today, toKey } = await import('../assets/js/cycle.js');
const {
  aiDecided,
  aiEnabled,
  askFlorAI,
  cycleContext,
  recentHistory,
} = await import('../assets/js/florClient.js');

const setTentante = () => update((state) => {
  state.onboarded = true;
  state.profile.phase = 'tentante';
  state.profile.cycleLength = 28;
  state.profile.periodLength = 5;
  state.profile.lastPeriodStart = toKey(addDays(today(), -9));
  state.logs = {};
});

test('o contexto enviado tem números do ciclo e nenhum dado pessoal', () => {
  setTentante();
  update((state) => { state.profile.name = 'Marcele'; });

  const ctx = cycleContext(getState());
  const serializado = JSON.stringify(ctx);

  assert.equal(ctx.phase, 'tentante');
  assert.equal(ctx.dayOfCycle, 10);
  assert.equal(ctx.avgLength, 28);
  assert.match(ctx.fertileStart, /^\d{4}-\d{2}-\d{2}$/);

  assert.doesNotMatch(serializado, /Marcele/, 'o nome não pode ser enviado');
  assert.ok(!('logs' in ctx) && !('symptoms' in ctx), 'o diário não pode ser enviado');
});

test('gestante e pós-parto enviam só a fase e a idade gestacional', () => {
  update((state) => {
    state.profile.phase = 'gravida';
    state.profile.dueDate = toKey(addDays(today(), 140));
  });
  const gravida = cycleContext(getState());
  assert.equal(gravida.phase, 'gravida');
  assert.equal(typeof gravida.weeks, 'number');
  assert.equal(gravida.dayOfCycle, undefined);

  update((state) => {
    state.profile.phase = 'posparto';
    state.profile.birthDate = toKey(addDays(today(), -70));
  });
  const pos = cycleContext(getState());
  assert.equal(pos.phase, 'posparto');
  assert.equal(typeof pos.babyWeeks, 'number');
});

test('sem dados de ciclo, envia apenas a fase', () => {
  update((state) => {
    state.profile.phase = 'tentante';
    state.profile.lastPeriodStart = null;
    state.logs = {};
  });
  assert.deepEqual(cycleContext(getState()), { phase: 'tentante' });
});

test('o histórico enviado é curto e normalizado', () => {
  const chat = [
    { role: 'user', text: 'oi' },
    { role: 'flor', text: 'olá' },
    { role: 'user', text: 'quando ovulo?' },
    { role: 'flor', text: 'resposta' },
    { role: 'user', text: 'e depois?' },
  ];
  const historico = recentHistory(chat, 4);

  assert.equal(historico.length, 4);
  assert.deepEqual([...new Set(historico.map((m) => m.role))].sort(), ['assistant', 'user']);
  assert.ok(historico.every((m) => typeof m.content === 'string'));
});

test('a preferência começa indefinida e vira booleano quando a usuária escolhe', () => {
  update((state) => { state.settings.florAI = null; });
  assert.equal(aiDecided(getState()), false);
  assert.equal(aiEnabled(getState()), false);

  update((state) => { state.settings.florAI = false; });
  assert.equal(aiDecided(getState()), true);
  assert.equal(aiEnabled(getState()), false);

  update((state) => { state.settings.florAI = true; });
  assert.equal(aiEnabled(getState()), true);
});

test('offline não tenta chamar o servidor', async () => {
  setOnline(false);
  let chamou = false;
  globalThis.fetch = async () => { chamou = true; };

  assert.equal(await askFlorAI({ question: 'oi' }), null);
  assert.equal(chamou, false);
  setOnline(true);
});

test('erro do servidor devolve null em vez de lançar', async () => {
  globalThis.fetch = async () => ({ ok: false, status: 500, json: async () => ({}) });
  assert.equal(await askFlorAI({ question: 'oi' }), null);

  globalThis.fetch = async () => { throw new Error('rede caiu'); };
  assert.equal(await askFlorAI({ question: 'oi' }), null);
});

test('resposta vazia é tratada como falha', async () => {
  globalThis.fetch = async () => ({ ok: true, json: async () => ({ answer: '   ' }) });
  assert.equal(await askFlorAI({ question: 'oi' }), null);
});

test('resposta válida volta com o texto limpo', async () => {
  globalThis.fetch = async () => ({ ok: true, json: async () => ({ answer: '  Sua janela fértil começa amanhã.  ' }) });
  const resultado = await askFlorAI({ question: 'quando?' });
  assert.deepEqual(resultado, { answer: 'Sua janela fértil começa amanhã.' });
});
