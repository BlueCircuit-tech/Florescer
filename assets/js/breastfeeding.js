export const BREASTFEEDING_SIDES = {
  esquerdo: 'Esquerdo',
  direito: 'Direito',
  ambos: 'Ambos',
};

export function saveBreastfeeding(state, input, now = Date.now()) {
  if (!validDate(input.date)) throw new Error('Informe a data da amamentação.');
  const durationSeconds = Math.max(0, Math.min(4 * 60 * 60, Math.round(Number(input.durationSeconds) || 0)));
  const side = BREASTFEEDING_SIDES[input.side] ? input.side : null;
  const extractedMl = optionalMl(input.extractedMl, 'extraído');
  const storedMl = optionalMl(input.storedMl, 'em estoque');
  if (durationSeconds > 0 && !side) throw new Error('Informe o lado utilizado na amamentação.');
  if (!durationSeconds && extractedMl == null && storedMl == null) throw new Error('Cronometre a amamentação ou informe o leite extraído/guardado.');

  const entry = {
    id: `breastfeeding:${now}`,
    date: input.date,
    babyName: String(input.babyName || 'Bebê').trim() || 'Bebê',
    durationSeconds,
    side,
    extractedMl,
    storedMl,
    createdAt: now,
  };
  if (!Array.isArray(state.breastfeedingLogs)) state.breastfeedingLogs = [];
  state.breastfeedingLogs.unshift(entry);
  return entry;
}

export function formatBreastfeedingDuration(totalSeconds) {
  const seconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}

function optionalMl(value, label) {
  if (value === '' || value == null) return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0 || number > 5000) throw new Error(`Volume ${label} fora do intervalo esperado.`);
  return Math.round(number);
}

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}
