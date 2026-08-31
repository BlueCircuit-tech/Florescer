export const BABY_HEALTH_FIELDS = {
  symptoms: 'Sintomas',
  medications: 'Medicamentos administrados',
  allergies: 'Alergias',
  hospitalizations: 'Internações',
  appointments: 'Consultas',
  exams: 'Exames',
};

export function saveBabyHealthRecord(state, input, now = Date.now()) {
  if (!validDate(input.recordedOn)) throw new Error('Informe a data do registro.');
  const recordedAt = validTime(input.recordedAt) ? input.recordedAt : null;
  if (input.recordedAt && !recordedAt) throw new Error('Informe um horário válido.');

  const details = Object.fromEntries(Object.keys(BABY_HEALTH_FIELDS).map((field) => [field, cleanText(input[field], BABY_HEALTH_FIELDS[field])]));
  if (!Object.values(details).some(Boolean)) throw new Error('Informe ao menos um dado de saúde para salvar.');

  const record = {
    id: `baby-health:${now}`,
    babyName: String(input.babyName || 'Bebê').trim() || 'Bebê',
    recordedOn: input.recordedOn,
    recordedAt,
    ...details,
    createdAt: now,
  };
  if (!Array.isArray(state.babyHealthRecords)) state.babyHealthRecords = [];
  state.babyHealthRecords.unshift(record);
  return record;
}

export function babyHealthSummary(record) {
  return Object.entries(BABY_HEALTH_FIELDS)
    .filter(([field]) => record[field])
    .map(([, label]) => label);
}

function cleanText(value, label) {
  const text = String(value || '').trim();
  if (text.length > 1200) throw new Error(`${label} deve ter no máximo 1200 caracteres.`);
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
