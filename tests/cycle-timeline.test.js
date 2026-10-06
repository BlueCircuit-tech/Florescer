import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.localStorage = { getItem: () => null, setItem: () => {} };

const { getState, update } = await import('../assets/js/store.js');
const { addDays, cycleInfo, today, toKey } = await import('../assets/js/cycle.js');
const screenModule = await import('../assets/js/screens/cycleTimeline.js');
const screen = screenModule.default;
const { cycleStages } = screenModule;

/** Tentante no dia pedido de um ciclo de 28 dias. */
const setCycle = (dayOfCycle) => update((state) => {
  state.onboarded = true;
  state.profile.phase = 'tentante';
  state.profile.cycleLength = 28;
  state.profile.periodLength = 5;
  state.profile.lastPeriodStart = toKey(addDays(today(), -(dayOfCycle - 1)));
  state.logs = {};
});

test('divide o ciclo em fases contínuas, sem buracos nem sobreposição', () => {
  setCycle(10);
  const info = cycleInfo(getState());
  const stages = cycleStages(info);

  assert.ok(stages.length >= 4);
  assert.equal(stages[0].from, 1);
  assert.equal(stages.at(-1).to, info.avgLength);
  for (let i = 1; i < stages.length; i++) {
    assert.equal(stages[i].from, stages[i - 1].to + 1, `fase ${stages[i].phase} não começa logo após a anterior`);
  }
});

test('marca a fase atual e as já vividas', () => {
  // ciclo de 28 dias com fase lútea de 14: ovulação no dia 15, janela fértil 10–16
  setCycle(7);
  const stages = cycleStages(cycleInfo(getState()));
  const current = stages.filter((stage) => stage.current);

  assert.equal(current.length, 1, 'apenas uma fase pode ser a atual');
  assert.equal(current[0].phase, 'follicular');
  assert.ok(stages[0].done, 'a menstruação do dia 7 já passou');
  assert.equal(stages.at(-1).done, false);
});

test('reconhece o dia da ovulação como fase própria', () => {
  setCycle(15);
  const stages = cycleStages(cycleInfo(getState()));
  const ovulation = stages.find((stage) => stage.phase === 'ovulation');

  assert.equal(ovulation.from, ovulation.to);
  assert.equal(ovulation.current, true);
});

test('a tela explica cada fase com linguagem simples', () => {
  setCycle(7);
  const output = screen.render();

  assert.match(output.appbar.sub, /Dia 7 de 28/);
  assert.match(output.html, /Menstruação/);
  assert.match(output.html, /Janela fértil/);
  assert.match(output.html, /Ovulação/);
  assert.match(output.html, /Fase lútea/);
  assert.match(output.html, /O que você pode notar/);
  assert.match(output.html, /Para lembrar/);
  assert.match(output.html, /timeline__item--current/);
});

test('fora da fase tentante a linha do tempo não aparece', () => {
  update((state) => { state.profile.phase = 'gravida'; });
  const output = screen.render();
  assert.match(output.html, /Linha do tempo indisponível/);
  assert.doesNotMatch(output.html, /timeline__item/);
});

