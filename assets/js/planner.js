import { addDays, diffDays, fromKey, toKey, today } from './cycle.js';

export const CALENDAR_TYPES = {
  appointment: { label: 'Consulta', icon: 'calendar', phases: ['tentante', 'gravida', 'posparto'] },
  prenatal: { label: 'Consulta pré-natal', icon: 'pregnant', phases: ['gravida'] },
  ultrasound: { label: 'Ultrassom', icon: 'baby', phases: ['gravida'] },
  lab: { label: 'Exame laboratorial', icon: 'test', phases: ['tentante', 'gravida', 'posparto'] },
  vaccine: { label: 'Vacina', icon: 'shield', phases: ['posparto'] },
  medication: { label: 'Medicamento', icon: 'bottle', phases: ['tentante', 'gravida', 'posparto'] },
  vitamin: { label: 'Vitamina', icon: 'leaf', phases: ['tentante', 'gravida', 'posparto'] },
};

export function calendarTypesForPhase(phase) {
  return Object.entries(CALENDAR_TYPES)
    .filter(([, type]) => type.phases.includes(phase))
    .map(([id, type]) => ({ id, ...type }));
}

export function saveScheduledEvent(state, input, now = Date.now()) {
  const phase = ['tentante', 'gravida', 'posparto'].includes(input.phase) ? input.phase : state.profile?.phase;
  const type = CALENDAR_TYPES[input.type];
  if (!type?.phases.includes(phase)) throw new Error('Escolha um tipo de compromisso válido para esta fase.');
  if (!validDate(input.date)) throw new Error('Informe a data do compromisso.');
  if (input.time && !validTime(input.time)) throw new Error('Informe um horário válido.');
  const recurrence = input.recurrence === 'daily' ? 'daily' : 'once';
  const endDate = recurrence === 'daily' ? input.endDate : null;
  if (recurrence === 'daily' && (!validDate(endDate) || diffDays(fromKey(endDate), fromKey(input.date)) < 0)) {
    throw new Error('Informe até quando o lembrete diário deve se repetir.');
  }
  if (recurrence === 'daily' && diffDays(fromKey(endDate), fromKey(input.date)) > 366) {
    throw new Error('A repetição diária pode durar no máximo um ano.');
  }
  const reminderDays = Number(input.reminderDays);
  if (![-1, 0, 1, 2, 7].includes(reminderDays)) throw new Error('Escolha quando deseja receber o lembrete.');
  const title = clean(input.title, 100) || type.label;
  const notes = clean(input.notes, 800);
  const id = input.id || `calendar:${now}`;
  const event = {
    id,
    phase,
    type: input.type,
    title,
    person: clean(input.person, 80),
    date: input.date,
    time: input.time || null,
    recurrence,
    endDate,
    reminderDays,
    notes,
    updatedAt: now,
  };
  if (!Array.isArray(state.calendarEvents)) state.calendarEvents = [];
  const index = state.calendarEvents.findIndex((item) => item.id === id);
  if (index >= 0) state.calendarEvents[index] = event;
  else state.calendarEvents.unshift(event);
  return event;
}

export function deleteScheduledEvent(state, id) {
  if (!Array.isArray(state.calendarEvents)) return false;
  const index = state.calendarEvents.findIndex((event) => event.id === id);
  if (index < 0) return false;
  state.calendarEvents.splice(index, 1);
  return true;
}

export function scheduledEventsOnDate(state, key, phase = state.profile?.phase) {
  return (state.calendarEvents || [])
    .filter((event) => event.phase === phase && eventOccursOn(event, key))
    .sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'));
}

export function upcomingScheduledEvents(state, start = toKey(today()), limit = 5, horizon = 180) {
  const phase = state.profile?.phase;
  return (state.calendarEvents || []).filter((event) => event.phase === phase).flatMap((event) => {
    for (let offset = 0; offset <= horizon; offset++) {
      const date = toKey(addDays(fromKey(start), offset));
      if (eventOccursOn(event, date)) return [{ ...event, occurrenceDate: date }];
    }
    return [];
  }).sort((a, b) => a.occurrenceDate.localeCompare(b.occurrenceDate) || (a.time || '99:99').localeCompare(b.time || '99:99')).slice(0, limit);
}

export function plannerReminders(state, ref = today()) {
  const key = toKey(ref);
  return (state.calendarEvents || []).filter((event) => event.phase === state.profile?.phase && event.reminderDays >= 0).flatMap((event) => {
    const occurrenceDate = toKey(addDays(ref, event.reminderDays));
    if (!eventOccursOn(event, occurrenceDate)) return [];
    return [{
      id: `${event.id}:${occurrenceDate}:${event.reminderDays}`,
      event,
      occurrenceDate,
      reminderDate: key,
    }];
  });
}

export function eventOccursOn(event, key) {
  if (event.recurrence === 'daily') return key >= event.date && key <= event.endDate;
  return event.date === key;
}

function clean(value, max) {
  const text = String(value || '').trim();
  if (text.length > max) throw new Error(`O texto deve ter no máximo ${max} caracteres.`);
  return text;
}

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function validTime(value) {
  if (!/^\d{2}:\d{2}$/.test(value || '')) return false;
  const [hours, minutes] = value.split(':').map(Number);
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}
