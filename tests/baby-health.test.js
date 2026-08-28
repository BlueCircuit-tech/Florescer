import test from 'node:test';
import assert from 'node:assert/strict';

import { babyHealthSummary, saveBabyHealthRecord } from '../assets/js/babyHealth.js';

test('salva um registro completo de saúde do bebê', () => {
  const state = { babyHealthRecords: [] };
  const saved = saveBabyHealthRecord(state, {
    babyName: 'Lia',
    recordedOn: '2026-08-28',
    recordedAt: '14:30',
    symptoms: 'Febre e tosse',
    medications: 'Medicamento orientado pelo pediatra, 14h30',
    allergies: 'Sem alergias conhecidas',
    hospitalizations: 'Observação por uma noite',
    appointments: 'Consulta com pediatra',
    exams: 'Hemograma realizado',
  }, 123);

  assert.equal(saved.babyName, 'Lia');
  assert.equal(saved.recordedAt, '14:30');
  assert.equal(state.babyHealthRecords.length, 1);
  assert.deepEqual(babyHealthSummary(saved), ['Sintomas', 'Medicamentos administrados', 'Alergias', 'Internações', 'Consultas', 'Exames']);
});

test('permite registrar apenas uma categoria de saúde', () => {
  const state = {};
  const saved = saveBabyHealthRecord(state, { recordedOn: '2026-08-28', symptoms: 'Tosse leve' });

  assert.equal(saved.symptoms, 'Tosse leve');
  assert.equal(saved.medications, '');
});

test('rejeita registro de saúde vazio, data inválida ou horário inválido', () => {
  assert.throws(() => saveBabyHealthRecord({}, { recordedOn: '2026-08-28' }), /dado de saúde/);
  assert.throws(() => saveBabyHealthRecord({}, { recordedOn: '2026-02-30', symptoms: 'Febre' }), /data/);
  assert.throws(() => saveBabyHealthRecord({}, { recordedOn: '2026-08-28', recordedAt: '25:00', symptoms: 'Febre' }), /horário/);
});
