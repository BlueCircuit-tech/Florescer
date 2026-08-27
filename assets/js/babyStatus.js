import { diffDays, fromKey, today } from './cycle.js';

export function saveBabyStatus(state, input, now = Date.now()) {
  const recordedOn = validDate(input.recordedOn) ? input.recordedOn : null;
  if (!recordedOn) throw new Error('Informe a data do registro.');

  const babyName = String(input.babyName || 'Bebê').trim() || 'Bebê';
  const id = `${recordedOn}:${babyName}`;
  if (!Array.isArray(state.babyStatus)) state.babyStatus = [];
  const index = state.babyStatus.findIndex((item) => item.id === id);
  const existing = index >= 0 ? state.babyStatus[index] : null;

  const weight = optionalNumber(input.weight, .5, 40, 'Peso') ?? existing?.weight ?? null;
  const height = optionalNumber(input.height, 20, 150, 'Altura') ?? existing?.height ?? null;
  const nextVaccineDate = optionalDate(input.nextVaccineDate, 'vacina') ?? existing?.nextVaccineDate ?? null;
  const nextAppointmentDate = optionalDate(input.nextAppointmentDate, 'consulta') ?? existing?.nextAppointmentDate ?? null;
  if (weight == null && height == null && !nextVaccineDate && !nextAppointmentDate) {
    throw new Error('Informe uma medida, vacina ou consulta para salvar.');
  }

  const status = {
    id,
    babyName,
    recordedOn,
    weight,
    height,
    nextVaccineDate,
    nextVaccine: String(input.nextVaccine || existing?.nextVaccine || '').trim(),
    nextAppointmentDate,
    nextAppointment: String(input.nextAppointment || existing?.nextAppointment || '').trim(),
    updatedAt: now,
  };

  if (index >= 0) state.babyStatus[index] = status;
  else state.babyStatus.unshift(status);
  return status;
}

export function babyEvents(state) {
  return (state.babyStatus || []).flatMap((status) => [
    status.nextVaccineDate ? {
      id: `vaccine:${status.id}`,
      type: 'vaccine',
      date: status.nextVaccineDate,
      babyName: status.babyName,
      label: status.nextVaccine || 'Vacina',
    } : null,
    status.nextAppointmentDate ? {
      id: `appointment:${status.id}`,
      type: 'appointment',
      date: status.nextAppointmentDate,
      babyName: status.babyName,
      label: status.nextAppointment || 'Consulta',
    } : null,
  ].filter(Boolean)).sort((a, b) => a.date.localeCompare(b.date));
}

export function babyCareOnDate(state, key) {
  return {
    statuses: (state.babyStatus || []).filter((status) => status.recordedOn === key),
    events: babyEvents(state).filter((event) => event.date === key),
  };
}

export function babyReminder(state, type, ref = today()) {
  const matching = babyEvents(state).filter((event) => event.type === type && [0, 1].includes(diffDays(fromKey(event.date), ref)));
  const todayEvents = matching.filter((event) => diffDays(fromKey(event.date), ref) === 0);
  const events = todayEvents.length ? todayEvents : matching;
  if (!events.length) return null;
  const when = todayEvents.length ? 'hoje' : 'amanhã';
  if (events.length > 1) {
    return type === 'vaccine'
      ? ['Vacinas dos bebês 💉', `${events.length} vacinas estão marcadas para ${when}. Confira o calendário do Florescer Baby.`]
      : ['Consultas dos bebês 🩺', `${events.length} consultas estão marcadas para ${when}. Confira o calendário do Florescer Baby.`];
  }
  const event = events[0];
  return type === 'vaccine'
    ? ['Vacina do bebê 💉', `${event.label} de ${event.babyName} está marcada para ${when}.`]
    : ['Consulta do bebê 🩺', `${event.label} de ${event.babyName} está marcada para ${when}.`];
}

function optionalNumber(value, min, max, label) {
  if (value === '' || value == null) return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < min || number > max) throw new Error(`${label} fora do intervalo esperado.`);
  return number;
}

function optionalDate(value, label) {
  if (!value) return null;
  if (!validDate(value)) throw new Error(`Informe uma data válida para a ${label}.`);
  return value;
}

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}
