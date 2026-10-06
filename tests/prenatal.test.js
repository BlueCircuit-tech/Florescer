import test from 'node:test';
import assert from 'node:assert/strict';

import {
  PRENATAL_STEPS,
  prenatalNextSteps,
  prenatalPlan,
  prenatalProgress,
  prenatalStepById,
  prenatalStepToEvent,
  prenatalWindowLabel,
} from '../assets/js/prenatal.js';
import { saveScheduledEvent } from '../assets/js/planner.js';
import { addDays, toKey, today } from '../assets/js/cycle.js';

/** Gestação com a idade gestacional desejada na data de hoje. */
const pregnantAt = (weeks) => {
  const due = addDays(today(), (40 - weeks) * 7);
  return { known: true, due, weeks, trimester: weeks < 14 ? 1 : weeks < 28 ? 2 : 3 };
};

const stateWith = (events = []) => ({ profile: { phase: 'gravida' }, calendarEvents: events });

test('o plano cobre consultas, ultrassons, exames, vacinas e vitaminas', () => {
  const types = new Set(PRENATAL_STEPS.map((step) => step.type));
  assert.deepEqual(
    [...types].sort(),
    ['lab', 'prenatal', 'ultrasound', 'vaccine', 'vitamin'],
  );
  assert.ok(PRENATAL_STEPS.every((step) => step.from <= step.to));
  assert.ok(PRENATAL_STEPS.every((step) => step.title && step.note));
  assert.equal(new Set(PRENATAL_STEPS.map((step) => step.id)).size, PRENATAL_STEPS.length);
});

test('classifica cada etapa pela idade gestacional', () => {
  const plan = prenatalPlan(stateWith(), pregnantAt(22));
  const byId = Object.fromEntries(plan.map((step) => [step.id, step]));

  // janela 20–24: está acontecendo agora
  assert.equal(byId['usg-morfologico-2'].status, 'now');
  // janela 11–14: já passou e não foi agendado
  assert.equal(byId['usg-morfologico-1'].status, 'late');
  // janela 28–32: ainda vai chegar
  assert.equal(byId['usg-crescimento'].status, 'upcoming');
});

test('sugere o início da janela para o futuro e hoje para o que já venceu', () => {
  const preg = pregnantAt(22);
  const plan = prenatalPlan(stateWith(), preg);
  const future = plan.find((step) => step.id === 'usg-crescimento');
  const late = plan.find((step) => step.id === 'usg-morfologico-1');

  assert.equal(toKey(future.suggestedDate), toKey(addDays(addDays(preg.due, -280), 28 * 7)));
  assert.equal(toKey(late.suggestedDate), toKey(today()));
});

test('reconhece etapas já agendadas e concluídas', () => {
  const futureEvent = { id: 'e1', planId: 'usg-morfologico-2', phase: 'gravida', date: toKey(addDays(today(), 5)) };
  const pastEvent = { id: 'e2', planId: 'lab-1tri', phase: 'gravida', date: toKey(addDays(today(), -30)) };
  const plan = prenatalPlan(stateWith([futureEvent, pastEvent]), pregnantAt(22));
  const byId = Object.fromEntries(plan.map((step) => [step.id, step]));

  assert.equal(byId['usg-morfologico-2'].status, 'scheduled');
  assert.equal(byId['lab-1tri'].status, 'done');
});

test('ordena o plano pelo que precisa de atenção primeiro', () => {
  const plan = prenatalPlan(stateWith(), pregnantAt(22));
  const next = prenatalNextSteps(plan);
  assert.ok(next.length > 0);
  assert.ok(next.every((step) => step.status === 'late' || step.status === 'now'));
  assert.equal(plan[0].status, 'late');
});

test('o progresso considera apenas o que já era devido', () => {
  const vazio = prenatalProgress(prenatalPlan(stateWith(), pregnantAt(22)));
  assert.equal(vazio.handled, 0);
  assert.ok(vazio.due > 0);
  assert.ok(vazio.due < vazio.total, 'etapas futuras não entram no denominador');

  const comEvento = prenatalProgress(prenatalPlan(
    stateWith([{ id: 'e1', planId: 'usg-morfologico-2', phase: 'gravida', date: toKey(today()) }]),
    pregnantAt(22),
  ));
  assert.equal(comEvento.handled, 1);
});

test('converte a etapa em compromisso válido para a agenda', () => {
  const plan = prenatalPlan(stateWith(), pregnantAt(22));
  const step = plan.find((item) => item.id === 'usg-morfologico-2');
  const state = stateWith();

  const saved = saveScheduledEvent(state, prenatalStepToEvent(step));
  assert.equal(saved.planId, 'usg-morfologico-2');
  assert.equal(saved.type, 'ultrasound');
  assert.equal(saved.phase, 'gravida');
  assert.equal(saved.date, toKey(today()));
  assert.equal(state.calendarEvents.length, 1);
});

test('vitaminas viram lembrete diário com data final', () => {
  const plan = prenatalPlan(stateWith(), pregnantAt(22));
  const ferro = plan.find((item) => item.id === 'vit-ferro');
  const saved = saveScheduledEvent(stateWith(), prenatalStepToEvent(ferro));

  assert.equal(saved.recurrence, 'daily');
  assert.equal(saved.endDate, toKey(addDays(today(), 120)));
  assert.equal(saved.reminderDays, 0);
});

test('descreve a janela de cada etapa em linguagem simples', () => {
  assert.equal(prenatalWindowLabel({ from: 20, to: 24 }), 'Entre a 20ª e a 24ª semana');
  assert.equal(prenatalWindowLabel({ from: 4, to: 12 }), 'Até a 12ª semana');
  assert.equal(prenatalWindowLabel({ from: 20, to: 40 }), 'A partir da 20ª semana');
  assert.equal(prenatalWindowLabel({ from: 4, to: 40 }), 'Em qualquer fase da gestação');
});

test('sem gestação conhecida não há plano', () => {
  assert.deepEqual(prenatalPlan(stateWith(), { known: false }), []);
  assert.deepEqual(prenatalPlan(stateWith(), null), []);
  assert.equal(prenatalStepById('inexistente'), null);
});
