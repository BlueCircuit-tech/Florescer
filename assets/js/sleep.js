export function saveSleepLog(state, input, now = Date.now()) {
  if (!validDate(input.date)) throw new Error('Informe a data do sono.');
  const nightMinutes = hoursToMinutes(input.nightHours, 18, 'Sono noturno');
  const napMinutes = hoursToMinutes(input.napHours, 12, 'Cochilos');
  if (!nightMinutes && !napMinutes) throw new Error('Informe o tempo de sono noturno ou de cochilos.');
  if (nightMinutes + napMinutes > 24 * 60) throw new Error('O total de sono não pode ultrapassar 24 horas.');
  const rawNapCount = input.napCount === '' || input.napCount == null ? null : Number(input.napCount);
  if (rawNapCount != null && (!Number.isInteger(rawNapCount) || rawNapCount < 0 || rawNapCount > 10)) {
    throw new Error('A quantidade de cochilos deve estar entre 0 e 10.');
  }
  const napCount = napMinutes ? rawNapCount || 1 : 0;
  const notes = String(input.notes || '').trim();
  if (notes.length > 500) throw new Error('As observações devem ter no máximo 500 caracteres.');

  const log = {
    id: `sleep:${input.date}`,
    date: input.date,
    nightMinutes,
    napMinutes,
    napCount,
    totalMinutes: nightMinutes + napMinutes,
    notes,
    updatedAt: now,
  };
  if (!Array.isArray(state.sleepLogs)) state.sleepLogs = [];
  const index = state.sleepLogs.findIndex((item) => item.id === log.id);
  if (index >= 0) state.sleepLogs[index] = log;
  else state.sleepLogs.unshift(log);
  return log;
}

export function sleepStats(state, limit = 7) {
  const recent = [...(state.sleepLogs || [])].sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
  const averageTotalMinutes = recent.length
    ? Math.round(recent.reduce((sum, log) => sum + log.totalMinutes, 0) / recent.length)
    : 0;
  return { recent, latest: recent[0] || null, averageTotalMinutes };
}

export function sleepTips(state, phase = state.profile?.phase) {
  const { recent, latest, averageTotalMinutes } = sleepStats(state);
  if (!recent.length) return ['Registre algumas noites e cochilos para receber dicas ajustadas à sua rotina.'];
  const tips = [];
  if (averageTotalMinutes < 6 * 60) {
    tips.push(phase === 'posparto'
      ? 'Seu descanso recente está curto. Se puder, divida cuidados e tarefas para criar um bloco maior de sono.'
      : 'Seu descanso recente está curto. Tente proteger um horário regular para desacelerar e dormir.');
  } else if (averageTotalMinutes <= 9 * 60) {
    tips.push('Sua média recente está entre 6 e 9 horas. Continue observando também como você se sente ao acordar.');
  } else {
    tips.push('Sua média recente está acima de 9 horas. Se o cansaço continuar mesmo após dormir, converse com um profissional de saúde.');
  }
  if (latest.napMinutes >= 3 * 60 && phase !== 'posparto') {
    tips.push('Cochilos longos ou muito tarde podem dificultar o sono noturno. Observe se isso acontece na sua rotina.');
  }
  const phaseTip = {
    tentante: 'Uma rotina consistente de horários pode ajudar o corpo a reconhecer melhor os momentos de descanso.',
    gravida: 'Na gestação, conforto e interrupções podem mudar ao longo das semanas. Use travesseiros de apoio e leve dúvidas ao pré-natal.',
    posparto: 'No pós-parto, o sono pode acontecer em blocos. Busque apoio e evite adormecer com o bebê em sofás ou poltronas.',
  }[phase];
  if (phaseTip) tips.push(phaseTip);
  if (averageTotalMinutes < 4 * 60) tips.push('Se essa redução intensa persistir ou afetar sua segurança e bem-estar, procure orientação profissional.');
  return tips.slice(0, 3);
}

export function formatSleepDuration(minutes) {
  const total = Math.max(0, Math.round(Number(minutes) || 0));
  const hours = Math.floor(total / 60);
  const remainder = total % 60;
  return `${hours}h${remainder ? ` ${remainder}min` : ''}`;
}

function hoursToMinutes(value, max, label) {
  if (value === '' || value == null) return 0;
  const number = Number(String(value).replace(',', '.'));
  if (!Number.isFinite(number) || number < 0 || number > max) throw new Error(`${label} fora do intervalo esperado.`);
  return Math.round(number * 60);
}

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}
