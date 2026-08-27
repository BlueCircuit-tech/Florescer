import test from 'node:test';
import assert from 'node:assert/strict';

import { recordPregnancyTest } from '../assets/js/pregnancyTest.js';

const state = () => ({ profile: { phase: 'tentante' }, pregnancyTests: [] });

test('registra resultado de teste sem mudar a fase quando não é positivo', () => {
  const current = state();
  const saved = recordPregnancyTest(current, { date: '2026-08-26', result: 'negativo' }, 123);

  assert.deepEqual(saved, { id: '2026-08-26-123', date: '2026-08-26', result: 'negativo', createdAt: 123 });
  assert.deepEqual(current.pregnancyTests, [saved]);
  assert.equal(current.profile.phase, 'tentante');
});

test('teste positivo muda automaticamente a fase para gestação', () => {
  const current = state();
  recordPregnancyTest(current, { date: '2026-08-26', result: 'positivo' }, 456);

  assert.equal(current.profile.phase, 'gravida');
  assert.equal(current.pregnancyTests[0].result, 'positivo');
});

test('rejeita teste sem data ou resultado válido', () => {
  assert.throws(() => recordPregnancyTest(state(), { date: '', result: 'positivo' }), /data/);
  assert.throws(() => recordPregnancyTest(state(), { date: '2026-08-26', result: 'talvez' }), /resultado/);
});
