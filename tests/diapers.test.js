import test from 'node:test';
import assert from 'node:assert/strict';

import { diaperSummary, saveDiaperLog } from '../assets/js/diapers.js';

test('registra uma troca com urina ou fezes', () => {
  const state = { diaperLogs: [] };
  const saved = saveDiaperLog(state, { babyName: 'Lia', date: '2026-08-28', time: '10:30', urine: true });

  assert.equal(saved.urine, true);
  assert.equal(saved.stool, false);
  assert.equal(state.diaperLogs.length, 1);
});

test('calcula a frequência diária separada por bebê', () => {
  const state = { diaperLogs: [] };
  saveDiaperLog(state, { babyName: 'Lia', date: '2026-08-28', urine: true });
  saveDiaperLog(state, { babyName: 'Lia', date: '2026-08-28', urine: true, stool: true });
  saveDiaperLog(state, { babyName: 'Eva', date: '2026-08-28', stool: true });

  assert.deepEqual(diaperSummary(state, '2026-08-28', 'Lia'), { total: 2, urine: 2, stool: 1 });
  assert.deepEqual(diaperSummary(state, '2026-08-28', 'Eva'), { total: 1, urine: 0, stool: 1 });
});

test('rejeita troca sem urina ou fezes e dados inválidos', () => {
  assert.throws(() => saveDiaperLog({}, { date: '2026-08-28' }), /Marque/);
  assert.throws(() => saveDiaperLog({}, { date: '2026-02-30', urine: true }), /data/);
  assert.throws(() => saveDiaperLog({}, { date: '2026-08-28', time: '25:00', urine: true }), /horário/);
});
