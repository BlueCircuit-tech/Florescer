import test from 'node:test';
import assert from 'node:assert/strict';

import {
  deleteDevelopmentRecord,
  listDevelopmentRecords,
  saveDevelopmentRecord,
} from '../assets/js/development.js';
import { fromKey } from '../assets/js/cycle.js';

const stateFor = (birthDate = '2026-01-01') => ({
  profile: { birthDate },
  babyDevelopmentRecords: [],
});

test('salva um marco predefinido com título pronto para a linha do tempo', () => {
  const state = stateFor();
  const record = saveDevelopmentRecord(state, {
    babyName: 'Lia', milestoneType: 'first_smile', happenedOn: '2026-02-10', notes: 'Sorriu para a mamãe.',
  }, 100, fromKey('2026-09-02'));

  assert.equal(record.title, 'Primeiro sorriso');
  assert.equal(record.createdAt, 100);
  assert.equal(record.updatedAt, 100);
  assert.equal(state.babyDevelopmentRecords.length, 1);
});

test('salva marcos personalizados e permite mais de um por bebê', () => {
  const state = stateFor();
  saveDevelopmentRecord(state, { babyName: 'Lia', milestoneType: 'custom', title: 'Primeiro passeio', happenedOn: '2026-02-01' }, 100, fromKey('2026-09-02'));
  saveDevelopmentRecord(state, { babyName: 'Lia', milestoneType: 'custom', title: 'Primeira viagem', happenedOn: '2026-03-01' }, 101, fromKey('2026-09-02'));

  assert.deepEqual(listDevelopmentRecords(state, 'Lia').map((record) => record.title), ['Primeiro passeio', 'Primeira viagem']);
});

test('separa os marcos por bebê e ordena os acontecimentos por data', () => {
  const state = stateFor();
  saveDevelopmentRecord(state, { babyName: 'Lia', milestoneType: 'first_steps', happenedOn: '2026-08-10' }, 100, fromKey('2026-09-02'));
  saveDevelopmentRecord(state, { babyName: 'Liz', milestoneType: 'first_smile', happenedOn: '2026-02-01' }, 101, fromKey('2026-09-02'));
  saveDevelopmentRecord(state, { babyName: 'Lia', milestoneType: 'first_smile', happenedOn: '2026-02-10' }, 102, fromKey('2026-09-02'));

  assert.deepEqual(listDevelopmentRecords(state, 'Lia').map((record) => record.milestoneType), ['first_smile', 'first_steps']);
  assert.equal(listDevelopmentRecords(state, 'Liz').length, 1);
});

test('edita e exclui um marco sem duplicar nem perder sua data de criação', () => {
  const state = stateFor();
  const saved = saveDevelopmentRecord(state, { babyName: 'Lia', milestoneType: 'first_smile', happenedOn: '2026-02-10' }, 100, fromKey('2026-09-02'));
  const edited = saveDevelopmentRecord(state, { id: saved.id, babyName: 'Lia', milestoneType: 'first_smile', happenedOn: '2026-02-11', notes: 'Foi lindo.' }, 200, fromKey('2026-09-02'));

  assert.equal(state.babyDevelopmentRecords.length, 1);
  assert.equal(edited.createdAt, 100);
  assert.equal(edited.updatedAt, 200);
  assert.equal(edited.happenedOn, '2026-02-11');
  assert.equal(deleteDevelopmentRecord(state, edited.id), true);
  assert.equal(state.babyDevelopmentRecords.length, 0);
});

test('rejeita datas futuras, anteriores ao nascimento e marcos duplicados', () => {
  const state = stateFor();
  const ref = fromKey('2026-09-02');

  assert.throws(() => saveDevelopmentRecord(state, { babyName: 'Lia', milestoneType: 'first_smile', happenedOn: '2026-09-03' }, 100, ref), /futuro/);
  assert.throws(() => saveDevelopmentRecord(state, { babyName: 'Lia', milestoneType: 'first_smile', happenedOn: '2025-12-31' }, 100, ref), /anterior ao nascimento/);
  saveDevelopmentRecord(state, { babyName: 'Lia', milestoneType: 'first_smile', happenedOn: '2026-02-01' }, 100, ref);
  assert.throws(() => saveDevelopmentRecord(state, { babyName: 'Lia', milestoneType: 'first_smile', happenedOn: '2026-02-02' }, 101, ref), /já foi registrado/);
  assert.doesNotThrow(() => saveDevelopmentRecord(state, { babyName: 'Liz', milestoneType: 'first_smile', happenedOn: '2026-02-02' }, 102, ref));
});

test('exige um título para marcos personalizados', () => {
  assert.throws(() => saveDevelopmentRecord(stateFor(), {
    babyName: 'Lia', milestoneType: 'custom', title: ' ', happenedOn: '2026-02-01',
  }, 100, fromKey('2026-09-02')), /Dê um nome/);
});
