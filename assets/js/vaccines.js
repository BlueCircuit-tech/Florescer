import { diffDays, fromKey, today } from './cycle.js';

export function saveBabyVaccine(state, input, now = Date.now(), ref = today()) {
  if (!validDate(input.date)) throw new Error('Informe a data da vacina.');
  const status = ['scheduled', 'taken'].includes(input.status) ? input.status : null;
  if (!status) throw new Error('Informe se a vacina está marcada ou já foi tomada.');
  if (status === 'taken' && diffDays(fromKey(input.date), ref) > 0) throw new Error('A data de uma vacina tomada não pode estar no futuro.');
  const name = clean(input.name, 100);
  if (!name) throw new Error('Informe o nome da vacina.');
  const id = input.id || `vaccine:${now}`;
  const vaccine = {
    id,
    babyName: clean(input.babyName, 80) || 'Bebê',
    name,
    dose: clean(input.dose, 80),
    status,
    date: input.date,
    notes: clean(input.notes, 500),
    updatedAt: now,
  };
  if (!Array.isArray(state.babyVaccines)) state.babyVaccines = [];
  const index = state.babyVaccines.findIndex((item) => item.id === id);
  if (index >= 0) state.babyVaccines[index] = vaccine;
  else state.babyVaccines.unshift(vaccine);
  return vaccine;
}

export function listBabyVaccines(state, babyName = null) {
  const explicit = (state.babyVaccines || []).filter((vaccine) => !babyName || vaccine.babyName === babyName);
  const keys = new Set(explicit.map(vaccineKey));
  const legacy = (state.babyStatus || []).filter((status) => status.nextVaccineDate && (!babyName || status.babyName === babyName)).flatMap((status) => {
    const vaccine = {
      id: `legacy-vaccine:${status.id}`,
      babyName: status.babyName,
      name: status.nextVaccine || 'Vacina',
      dose: '',
      status: 'scheduled',
      date: status.nextVaccineDate,
      notes: '',
      legacy: true,
    };
    return keys.has(vaccineKey(vaccine)) ? [] : [vaccine];
  });
  return [...explicit, ...legacy].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'scheduled' ? -1 : 1;
    return a.status === 'scheduled' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date);
  });
}

export function markVaccineTaken(state, id, date, now = Date.now()) {
  if (!validDate(date)) throw new Error('Informe a data em que a vacina foi tomada.');
  if (diffDays(fromKey(date), today()) > 0) throw new Error('A data de uma vacina tomada não pode estar no futuro.');
  const vaccine = (state.babyVaccines || []).find((item) => item.id === id);
  if (!vaccine) return false;
  vaccine.status = 'taken';
  vaccine.date = date;
  vaccine.updatedAt = now;
  return true;
}

export function deleteBabyVaccine(state, id) {
  const index = (state.babyVaccines || []).findIndex((item) => item.id === id);
  if (index < 0) return false;
  state.babyVaccines.splice(index, 1);
  return true;
}

function vaccineKey(vaccine) {
  return `${vaccine.babyName}|${vaccine.date}|${vaccine.name}`.toLocaleLowerCase('pt-BR');
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
