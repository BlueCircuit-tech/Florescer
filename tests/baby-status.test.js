import test from 'node:test';
import assert from 'node:assert/strict';

import { babyCareOnDate, babyEvents, babyGrowthSeries, babyReminder, saveBabyStatus } from '../assets/js/babyStatus.js';
import { fromKey } from '../assets/js/cycle.js';

test('salva medidas, vacina e consulta para um bebê', () => {
  const state = { babyStatus: [] };
  const saved = saveBabyStatus(state, {
    babyName: 'Lia',
    recordedOn: '2026-08-20',
    weight: 5.2,
    height: 58,
    headCircumference: 38.5,
    nextVaccineDate: '2026-08-28',
    nextVaccine: 'Pentavalente',
    nextAppointmentDate: '2026-09-02',
    nextAppointment: 'Pediatra',
  }, 123);

  assert.equal(saved.weight, 5.2);
  assert.equal(saved.height, 58);
  assert.equal(saved.headCircumference, 38.5);
  assert.equal(state.babyStatus.length, 1);
  assert.deepEqual(babyEvents(state).map((event) => event.type), ['vaccine', 'appointment']);
});

test('atualiza o status do mesmo bebê na mesma data sem duplicar', () => {
  const state = { babyStatus: [] };
  saveBabyStatus(state, { babyName: 'Lia', recordedOn: '2026-08-20', weight: 5.2, nextVaccineDate: '2026-08-28' });
  saveBabyStatus(state, { babyName: 'Lia', recordedOn: '2026-08-20', height: 58 });

  assert.equal(state.babyStatus.length, 1);
  assert.equal(state.babyStatus[0].weight, 5.2);
  assert.equal(state.babyStatus[0].height, 58);
  assert.equal(state.babyStatus[0].nextVaccineDate, '2026-08-28');
  assert.equal(babyCareOnDate(state, '2026-08-20').statuses.length, 1);
});

test('monta lembretes para vacina e consulta no dia anterior', () => {
  const state = { babyStatus: [] };
  saveBabyStatus(state, {
    babyName: 'Lia',
    recordedOn: '2026-08-20',
    nextVaccineDate: '2026-08-28',
    nextVaccine: 'Pentavalente',
    nextAppointmentDate: '2026-08-28',
    nextAppointment: 'Pediatra',
  });

  assert.match(babyReminder(state, 'vaccine', fromKey('2026-08-27'))[1], /Pentavalente de Lia.*amanhã/);
  assert.match(babyReminder(state, 'appointment', fromKey('2026-08-27'))[1], /Pediatra de Lia.*amanhã/);
});

test('rejeita status vazio ou medidas fora do intervalo esperado', () => {
  assert.throws(() => saveBabyStatus({ babyStatus: [] }, { recordedOn: '2026-08-20' }), /medida/);
  assert.throws(() => saveBabyStatus({ babyStatus: [] }, { recordedOn: '2026-08-20', weight: 100 }), /Peso/);
  assert.throws(() => saveBabyStatus({ babyStatus: [] }, { recordedOn: '2026-08-20', headCircumference: 90 }), /Perímetro cefálico/);
});

test('monta a evolução de crescimento separada por bebê e data', () => {
  const state = { babyStatus: [] };
  saveBabyStatus(state, { babyName: 'Lia', recordedOn: '2026-08-28', weight: 5.4, height: 59, headCircumference: 39 });
  saveBabyStatus(state, { babyName: 'Lia', recordedOn: '2026-07-28', weight: 4.2, height: 54, headCircumference: 37 });
  saveBabyStatus(state, { babyName: 'Eva', recordedOn: '2026-08-28', weight: 5.1 });

  const series = babyGrowthSeries(state, 'Lia');
  assert.deepEqual(series.map((entry) => entry.date), ['2026-07-28', '2026-08-28']);
  assert.deepEqual(series.map((entry) => entry.headCircumference), [37, 39]);
});
