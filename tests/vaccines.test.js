import test from 'node:test';
import assert from 'node:assert/strict';

import { babyEvents, babyReminder } from '../assets/js/babyStatus.js';
import { deleteBabyVaccine, listBabyVaccines, markVaccineTaken, saveBabyVaccine } from '../assets/js/vaccines.js';
import { addDays, fromKey, today, toKey } from '../assets/js/cycle.js';

test('salva vacina marcada e adiciona ao calendário do bebê', () => {
  const state = { profile: { phase: 'posparto' }, babyVaccines: [], babyStatus: [] };
  const saved = saveBabyVaccine(state, {
    babyName: 'Lia', name: 'Pentavalente', dose: '2ª dose', status: 'scheduled', date: '2026-09-02',
  }, 123);

  assert.equal(saved.status, 'scheduled');
  assert.deepEqual(babyEvents(state).map((event) => event.type), ['vaccine']);
  assert.match(babyReminder(state, 'vaccine', fromKey('2026-09-01'))[1], /Pentavalente.*Lia.*amanhã/);
});

test('vacina tomada permanece no histórico e deixa de gerar lembrete', () => {
  const state = { babyVaccines: [], babyStatus: [] };
  const saved = saveBabyVaccine(state, {
    babyName: 'Lia', name: 'BCG', status: 'taken', date: '2026-08-20',
  }, 123, fromKey('2026-08-20'));

  assert.equal(listBabyVaccines(state, 'Lia')[0].status, 'taken');
  assert.equal(babyReminder(state, 'vaccine', fromKey('2026-08-20')), null);
  assert.equal(babyEvents(state)[0].status, 'taken');
});

test('incorpora vacina antiga do Status do bebê sem duplicar', () => {
  const state = { babyVaccines: [], babyStatus: [{
    id: '2026-08-20:Lia', babyName: 'Lia', nextVaccineDate: '2026-09-02', nextVaccine: 'Pentavalente',
  }] };
  assert.equal(listBabyVaccines(state, 'Lia').length, 1);
  assert.equal(listBabyVaccines(state, 'Lia')[0].legacy, true);

  saveBabyVaccine(state, { babyName: 'Lia', name: 'Pentavalente', status: 'scheduled', date: '2026-09-02' });
  assert.equal(listBabyVaccines(state, 'Lia').length, 1);
});

test('marca vacina como tomada e permite excluir o registro', () => {
  const state = { babyVaccines: [], babyStatus: [] };
  const reference = today();
  const todayKey = toKey(reference);
  const tomorrowKey = toKey(addDays(reference, 1));
  const saved = saveBabyVaccine(state, { babyName: 'Lia', name: 'VIP', status: 'scheduled', date: todayKey }, 123);

  assert.throws(() => markVaccineTaken(state, saved.id, tomorrowKey, 456), /não pode estar no futuro/);
  assert.equal(markVaccineTaken(state, saved.id, todayKey, 456), true);
  assert.equal(state.babyVaccines[0].status, 'taken');
  assert.equal(deleteBabyVaccine(state, saved.id), true);
  assert.equal(state.babyVaccines.length, 0);
});
