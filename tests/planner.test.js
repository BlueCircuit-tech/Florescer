import test from 'node:test';
import assert from 'node:assert/strict';

import {
  calendarTypesForPhase, deleteScheduledEvent, plannerReminders, saveScheduledEvent,
  scheduledEventsOnDate, upcomingScheduledEvents,
} from '../assets/js/planner.js';
import { fromKey } from '../assets/js/cycle.js';

const stateFor = (phase = 'tentante') => ({ profile: { phase }, calendarEvents: [] });

test('oferece categorias específicas para tentante, gestante e pós-parto', () => {
  const trying = calendarTypesForPhase('tentante').map((type) => type.id);
  const pregnant = calendarTypesForPhase('gravida').map((type) => type.id);
  const postpartum = calendarTypesForPhase('posparto').map((type) => type.id);

  assert.equal(trying.includes('ultrasound'), false);
  assert.equal(pregnant.includes('ultrasound'), true);
  assert.equal(postpartum.includes('vaccine'), true);
  assert.equal(pregnant.includes('vaccine'), false);
});

test('salva, edita e exclui um compromisso', () => {
  const state = stateFor('gravida');
  const saved = saveScheduledEvent(state, {
    phase: 'gravida', type: 'ultrasound', title: 'Ultrassom morfológico', date: '2026-09-10', time: '09:30', reminderDays: 2,
  }, 123);
  saveScheduledEvent(state, { ...saved, title: 'Ultrassom morfológico II', reminderDays: 1 }, 456);

  assert.equal(state.calendarEvents.length, 1);
  assert.equal(state.calendarEvents[0].title, 'Ultrassom morfológico II');
  assert.equal(deleteScheduledEvent(state, saved.id), true);
  assert.equal(state.calendarEvents.length, 0);
});

test('expande medicamento diário no intervalo escolhido', () => {
  const state = stateFor();
  saveScheduledEvent(state, {
    type: 'medication', date: '2026-08-28', time: '08:00', recurrence: 'daily', endDate: '2026-08-30', reminderDays: 0,
  });

  assert.equal(scheduledEventsOnDate(state, '2026-08-27').length, 0);
  assert.equal(scheduledEventsOnDate(state, '2026-08-29').length, 1);
  assert.equal(scheduledEventsOnDate(state, '2026-08-31').length, 0);
  assert.equal(upcomingScheduledEvents(state, '2026-08-29')[0].occurrenceDate, '2026-08-29');
});

test('gera lembrete na antecedência configurada', () => {
  const state = stateFor('posparto');
  saveScheduledEvent(state, {
    phase: 'posparto', type: 'vaccine', title: 'Pentavalente', person: 'Lia', date: '2026-08-29', reminderDays: 1,
  }, 123);

  const reminders = plannerReminders(state, fromKey('2026-08-28'));
  assert.equal(reminders.length, 1);
  assert.equal(reminders[0].occurrenceDate, '2026-08-29');
  assert.equal(plannerReminders(state, fromKey('2026-08-27')).length, 0);
});

test('rejeita categoria de outra fase e repetição inválida', () => {
  assert.throws(() => saveScheduledEvent(stateFor(), { type: 'ultrasound', date: '2026-09-10', reminderDays: 1 }), /tipo/);
  assert.throws(() => saveScheduledEvent(stateFor(), {
    type: 'vitamin', date: '2026-09-10', recurrence: 'daily', endDate: '2026-09-01', reminderDays: 0,
  }), /até quando/);
});
