import test from 'node:test';
import assert from 'node:assert/strict';

import { babyPhaseGuide, registerBirth } from '../assets/js/postpartum.js';
import { fromKey, toKey } from '../assets/js/cycle.js';

globalThis.localStorage = { getItem: () => null, setItem: () => {} };
const { initialBirthDate } = await import('../assets/js/screens/onboarding.js');

test('registro do nascimento muda automaticamente para o Florescer Baby', () => {
  const state = {
    profile: {
      phase: 'gravida',
      babyName: 'Lia',
      babyNames: ['Lia', 'Liz'],
    },
  };

  registerBirth(state, '2026-08-26', 123);

  assert.equal(state.profile.phase, 'posparto');
  assert.equal(state.profile.birthDate, '2026-08-26');
  assert.equal(state.profile.birthRegisteredAt, 123);
  assert.deepEqual(state.profile.babyNames, ['Lia', 'Liz']);
});

test('registro do nascimento exige uma data válida', () => {
  assert.throws(() => registerBirth({ profile: {} }, ''), /data/);
});

test('data de hoje exibida no cadastro também é gravada no rascunho', () => {
  const ref = fromKey('2026-09-03');
  const date = initialBirthDate(null, ref);
  const state = { profile: { phase: 'gravida' } };

  assert.equal(date, toKey(ref));
  assert.doesNotThrow(() => registerBirth(state, date));
  assert.equal(state.profile.birthDate, '2026-09-03');
  assert.equal(state.profile.phase, 'posparto');
});

test('guia do bebê seleciona marcos conforme a idade em dias', () => {
  assert.match(babyPhaseGuide(41).action, /acompanhar seu rosto/);
  assert.match(babyPhaseGuide(42).action, /sorrir/);
  assert.match(babyPhaseGuide(180).action, /sentar sem apoio/);
  assert.match(babyPhaseGuide(210).action, /se deslocar/);
  assert.match(babyPhaseGuide(365).action, /primeiros passos/);
});

test('guia do bebê usa os primeiros dias para idades inválidas ou negativas', () => {
  assert.equal(babyPhaseGuide(-10).from, 0);
  assert.equal(babyPhaseGuide(Number.NaN).from, 0);
});
