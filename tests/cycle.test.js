import test from 'node:test';
import assert from 'node:assert/strict';

import {
  toKey,
  fromKey,
  addDays,
  diffDays,
  periodsFromLogs,
  cycleLengths,
  cycleInfo,
  isFertileReminderEligible,
  pregnancyInfo,
  postpartumInfo,
} from '../assets/js/cycle.js';

test('toKey converte uma data para AAAA-MM-DD', () => {
  const date = new Date(2026, 7, 24);

  assert.equal(toKey(date), '2026-08-24');
});

test('fromKey converte uma chave para Date', () => {
  const date = fromKey('2026-08-24');

  assert.equal(date.getFullYear(), 2026);
  assert.equal(date.getMonth(), 7);
  assert.equal(date.getDate(), 24);
});

test('addDays não altera a data original', () => {
  const original = new Date(2026, 7, 24);
  const resultado = addDays(original, 5);

  assert.equal(toKey(resultado), '2026-08-29');
  assert.equal(toKey(original), '2026-08-24');
});

test('diffDays calcula a distância entre datas', () => {
  const inicio = fromKey('2026-08-01');
  const fim = fromKey('2026-08-10');

  assert.equal(diffDays(fim, inicio), 9);
});

test('periodsFromLogs agrupa dias consecutivos com fluxo', () => {
  const logs = {
    '2026-08-01': { flow: 'medium' },
    '2026-08-02': { flow: 'light' },
    '2026-08-03': { flow: 'none' },
  };

  assert.deepEqual(periodsFromLogs(logs), [
    {
      start: '2026-08-01',
      end: '2026-08-02',
      length: 2,
    },
  ]);
});

test('cycleLengths calcula a duração entre menstruações', () => {
  const state = {
    profile: {},
    logs: {
      '2026-07-01': { flow: 'medium' },
      '2026-07-29': { flow: 'medium' },
    },
  };

  assert.deepEqual(cycleLengths(state), [
    {
      start: '2026-07-01',
      length: 28,
    },
  ]);
});

test('cycleInfo estima a janela fértil de um ciclo de 28 dias', () => {
  const state = {
    profile: {
      lastPeriodStart: '2026-08-01',
      cycleLength: 28,
      periodLength: 5,
    },
    settings: {
      lutealPhase: 14,
    },
    logs: {},
  };

  const info = cycleInfo(state, fromKey('2026-08-10'));

  assert.equal(info.known, true);
  assert.equal(info.dayOfCycle, 10);
  assert.equal(toKey(info.nextPeriod), '2026-08-29');
  assert.equal(toKey(info.ovulation), '2026-08-15');
  assert.equal(toKey(info.fertileStart), '2026-08-10');
  assert.equal(toKey(info.fertileEnd), '2026-08-16');
  assert.equal(info.inFertile, true);
  assert.equal(info.phase, 'fertile');
});

test('lembrete fértil só é elegível para tentante dentro da janela fértil', () => {
  const state = {
    profile: {
      phase: 'tentante',
      lastPeriodStart: '2026-08-01',
      cycleLength: 28,
      periodLength: 5,
    },
    settings: { lutealPhase: 14 },
    logs: {},
  };

  assert.equal(isFertileReminderEligible(state, fromKey('2026-08-09')), false);
  assert.equal(isFertileReminderEligible(state, fromKey('2026-08-10')), true);
  assert.equal(isFertileReminderEligible(state, fromKey('2026-08-16')), true);
  assert.equal(isFertileReminderEligible(state, fromKey('2026-08-17')), false);

  state.profile.phase = 'gravida';
  assert.equal(isFertileReminderEligible(state, fromKey('2026-08-10')), false);
});

test('pregnancyInfo calcula semana, dias restantes e guia semanal', () => {
  const state = { profile: { dueDate: '2026-10-29' } };

  const info = pregnancyInfo(state, fromKey('2026-08-20'));

  assert.equal(info.weeks, 30);
  assert.equal(info.days, 0);
  assert.equal(info.daysLeft, 70);
  assert.equal(info.countdown, 'Faltam 70 dias para você conhecer o amor da sua vida!');
  assert.equal(info.guide.week, 30);
  assert.equal(info.guide.weight, '1,3 kg');
});

test('pregnancyInfo usa mensagem plural na gestação múltipla', () => {
  const state = { profile: { dueDate: '2026-10-29', pregnancyType: 'gemelar' } };
  const info = pregnancyInfo(state, fromKey('2026-08-20'));

  assert.equal(info.multiple, true);
  assert.equal(info.countdown, 'Faltam 70 dias para você conhecer os amores da sua vida!');
});

test('postpartumInfo calcula meses completos e dias restantes', () => {
  const state = { profile: { birthDate: '2026-01-14' } };

  const info = postpartumInfo(state, fromKey('2026-03-17'));

  assert.equal(info.months, 2);
  assert.equal(info.monthDays, 3);
  assert.equal(info.age, '2 meses e 3 dias');
  assert.match(info.guide.action, /sustentar melhor a cabeça/);
});

test('postpartumInfo apresenta somente dias antes do primeiro mês', () => {
  const state = { profile: { birthDate: '2026-08-20' } };

  const info = postpartumInfo(state, fromKey('2026-08-24'));

  assert.equal(info.age, '4 dias');
});

test('postpartumInfo respeita singular e omite zero dias', () => {
  const state = { profile: { birthDate: '2026-01-14' } };

  assert.equal(postpartumInfo(state, fromKey('2026-02-14')).age, '1 mês');
  assert.equal(postpartumInfo(state, fromKey('2026-02-15')).age, '1 mês e 1 dia');
});

test('postpartumInfo ajusta aniversário mensal para o fim de meses curtos', () => {
  const state = { profile: { birthDate: '2026-01-31' } };

  const info = postpartumInfo(state, fromKey('2026-02-28'));

  assert.equal(info.age, '1 mês');
});
