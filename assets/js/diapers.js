export function saveDiaperLog(state, input, now = Date.now()) {
  if (!validDate(input.date)) throw new Error('Informe a data da troca.');
  if (input.time && !validTime(input.time)) throw new Error('Informe um horário válido.');
  const urine = Boolean(input.urine);
  const stool = Boolean(input.stool);
  if (!urine && !stool) throw new Error('Marque urina, fezes ou ambos.');
  const notes = String(input.notes || '').trim();
  if (notes.length > 300) throw new Error('As observações devem ter no máximo 300 caracteres.');

  const log = {
    id: `diaper:${now}`,
    babyName: String(input.babyName || 'Bebê').trim() || 'Bebê',
    date: input.date,
    time: input.time || null,
    urine,
    stool,
    notes,
    createdAt: now,
  };
  if (!Array.isArray(state.diaperLogs)) state.diaperLogs = [];
  state.diaperLogs.unshift(log);
  return log;
}

export function diaperSummary(state, date, babyName = null) {
  const logs = (state.diaperLogs || []).filter((log) => log.date === date && (!babyName || log.babyName === babyName));
  return {
    total: logs.length,
    urine: logs.filter((log) => log.urine).length,
    stool: logs.filter((log) => log.stool).length,
  };
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
