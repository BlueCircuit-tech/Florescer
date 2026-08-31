import test from 'node:test';
import assert from 'node:assert/strict';

import { formatBreastfeedingDuration, saveBreastfeeding } from '../assets/js/breastfeeding.js';

test('salva tempo, lado, extração e estoque da amamentação', () => {
  const state = { breastfeedingLogs: [] };
  const saved = saveBreastfeeding(state, {
    date: '2026-08-27', babyName: 'Lia', durationSeconds: 754, side: 'esquerdo', extractedMl: 120, storedMl: 350,
  }, 123);

  assert.equal(saved.durationSeconds, 754);
  assert.equal(saved.side, 'esquerdo');
  assert.equal(saved.extractedMl, 120);
  assert.equal(saved.storedMl, 350);
  assert.equal(state.breastfeedingLogs.length, 1);
});

test('permite registrar somente extração ou estoque de leite', () => {
  const state = { breastfeedingLogs: [] };
  const saved = saveBreastfeeding(state, { date: '2026-08-27', extractedMl: 90, storedMl: 240 });

  assert.equal(saved.durationSeconds, 0);
  assert.equal(saved.side, null);
});

test('exige lado quando o cronômetro possui tempo', () => {
  assert.throws(() => saveBreastfeeding({ breastfeedingLogs: [] }, { date: '2026-08-27', durationSeconds: 60 }), /lado/);
});

test('formata o cronômetro em minutos e segundos', () => {
  assert.equal(formatBreastfeedingDuration(754), '12:34');
  assert.equal(formatBreastfeedingDuration(5), '00:05');
});
