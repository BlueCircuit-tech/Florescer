import test from 'node:test';
import assert from 'node:assert/strict';

import { formatSleepDuration, saveSleepLog, sleepStats, sleepTips } from '../assets/js/sleep.js';

test('calcula o total de sono noturno e cochilos', () => {
  const state = { sleepLogs: [] };
  const saved = saveSleepLog(state, { date: '2026-08-28', nightHours: '6,5', napHours: 1.25, napCount: 2 });

  assert.equal(saved.nightMinutes, 390);
  assert.equal(saved.napMinutes, 75);
  assert.equal(saved.totalMinutes, 465);
  assert.equal(formatSleepDuration(saved.totalMinutes), '7h 45min');
});

test('atualiza o registro da mesma data e calcula a média recente', () => {
  const state = { sleepLogs: [] };
  saveSleepLog(state, { date: '2026-08-27', nightHours: 6 });
  saveSleepLog(state, { date: '2026-08-28', nightHours: 8 });
  saveSleepLog(state, { date: '2026-08-28', nightHours: 7 });

  assert.equal(state.sleepLogs.length, 2);
  assert.equal(sleepStats(state).averageTotalMinutes, 390);
});

test('personaliza dicas de sono para cada fase', () => {
  const state = { sleepLogs: [] };
  saveSleepLog(state, { date: '2026-08-28', nightHours: 5 });

  assert.match(sleepTips(state, 'tentante').join(' '), /horários/);
  assert.match(sleepTips(state, 'gravida').join(' '), /gestação/);
  assert.match(sleepTips(state, 'posparto').join(' '), /sofás ou poltronas/);
});

test('rejeita registro vazio ou duração fora do intervalo', () => {
  assert.throws(() => saveSleepLog({}, { date: '2026-08-28' }), /Informe o tempo/);
  assert.throws(() => saveSleepLog({}, { date: '2026-08-28', nightHours: 20 }), /Sono noturno/);
  assert.throws(() => saveSleepLog({}, { date: '2026-08-28', nightHours: 8, napCount: 11 }), /cochilos/);
});
