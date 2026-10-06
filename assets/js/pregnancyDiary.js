/**
 * Diário Gestacional — reúne tudo o que foi registrado durante a gestação
 * para virar um documento único, impresso ou salvo em PDF.
 *
 * O recorte vai da DUM (semana 0) até o nascimento, ou até hoje se o bebê
 * ainda não nasceu. Os registros ficam agrupados por semana gestacional,
 * porque é assim que ela viveu a gestação e é assim que vai querer reler.
 *
 * Este módulo só monta dados: não gera HTML e não sabe o que é uma página.
 * A tela `screens/pregnancyDiary.js` cuida da apresentação e da impressão.
 */
import { MOODS } from './content.js';
import { CALENDAR_TYPES } from './planner.js';
import { addDays, diffDays, fmtFull, fmtLong, fromKey, toKey, today } from './cycle.js';

/** Semana 0 começa na DUM; a DPP é o fim teórico das 40 semanas. */
export function pregnancyAnchor(profile = {}) {
  const due = profile.dueDate
    ? fromKey(profile.dueDate)
    : profile.lastPeriodStart ? addDays(fromKey(profile.lastPeriodStart), 280) : null;
  if (!due) return null;
  return { due, start: addDays(due, -280) };
}

export function gestationalWeek(date, anchor) {
  const days = diffDays(date, anchor.start);
  return { week: Math.floor(days / 7), day: ((days % 7) + 7) % 7, days };
}

export const trimesterOf = (week) => (week < 14 ? 1 : week < 28 ? 2 : 3);

const TRIMESTER_LABEL = { 1: '1º trimestre', 2: '2º trimestre', 3: '3º trimestre' };

function countBy(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) || 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'pt-BR'))
    .map(([label, count]) => ({ label, count }));
}

const num = (value) => (Number.isFinite(Number(value)) ? Number(value) : null);

/** Número no formato brasileiro: 74,5 e não 74.5. */
const br = (value) => String(value).replace('.', ',');

/** Um dia do diário, já com o que interessa e sem os campos vazios. */
function dayEntry(key, log, anchor) {
  const date = fromKey(key);
  const { week, day } = gestationalWeek(date, anchor);
  const measurements = [];

  const systolic = num(log.systolicPressure);
  const diastolic = num(log.diastolicPressure);
  if (systolic !== null && diastolic !== null) {
    measurements.push({ label: 'Pressão', value: `${systolic}/${diastolic} mmHg` });
  }
  const weight = num(log.weight);
  if (weight !== null) measurements.push({ label: 'Peso', value: `${br(weight)} kg` });
  const glucose = num(log.glucose);
  if (glucose !== null) measurements.push({ label: 'Glicemia', value: `${glucose} mg/dL` });

  const text = (value) => (typeof value === 'string' && value.trim() ? value.trim() : null);
  const list = (value) => (Array.isArray(value) ? value.filter((item) => typeof item === 'string' && item.trim()) : []);

  return {
    key,
    date,
    week,
    day,
    label: fmtFull(date),
    weekLabel: `${week}s${day ? ` e ${day}d` : ''}`,
    mood: Number.isInteger(log.mood) && MOODS[log.mood] ? MOODS[log.mood] : null,
    emotions: list(log.emotions),
    symptoms: list(log.symptoms),
    thoughts: text(log.thoughts),
    gratitude: text(log.gratitude),
    notes: text(log.observations) || text(log.notes),
    symptomNotes: text(log.symptomNotes),
    measurements,
    weight,
    bumpPhotos: list(log.bumpPhotos),
    examPhotos: list(log.examPhotos),
  };
}

const entryHasContent = (entry) => !!(entry.mood || entry.emotions.length || entry.symptoms.length
  || entry.thoughts || entry.gratitude || entry.notes || entry.symptomNotes
  || entry.measurements.length || entry.bumpPhotos.length || entry.examPhotos.length);

/**
 * Monta o diário completo.
 * @returns {{available:boolean, reason:string|null, cover:object, summary:object,
 *            weeks:Array, events:Array, tests:Array, journey:Array}}
 */
export function pregnancyDiary(state, ref = today()) {
  const profile = state?.profile || {};
  const anchor = pregnancyAnchor(profile);

  if (!anchor) {
    return { available: false, reason: 'sem_datas', cover: null, summary: null, weeks: [], events: [], tests: [], journey: [] };
  }

  const born = profile.birthDate ? fromKey(profile.birthDate) : null;
  const end = born || ref;
  const startKey = toKey(anchor.start);
  const endKey = toKey(end);

  const entries = Object.entries(state?.logs || {})
    .filter(([key]) => key >= startKey && key <= endKey)
    .map(([key, log]) => dayEntry(key, log || {}, anchor))
    .filter(entryHasContent)
    .sort((a, b) => a.key.localeCompare(b.key));

  // agrupa por semana gestacional: é como ela viveu e como vai querer reler
  const byWeek = new Map();
  for (const entry of entries) {
    if (!byWeek.has(entry.week)) byWeek.set(entry.week, []);
    byWeek.get(entry.week).push(entry);
  }
  const weeks = [...byWeek.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([week, days]) => ({
      week,
      trimester: trimesterOf(week),
      trimesterLabel: TRIMESTER_LABEL[trimesterOf(week)],
      title: `Semana ${week}`,
      range: `${fmtFull(addDays(anchor.start, week * 7))} a ${fmtFull(addDays(anchor.start, week * 7 + 6))}`,
      days,
    }));

  const events = (Array.isArray(state?.calendarEvents) ? state.calendarEvents : [])
    .filter((event) => event?.phase === 'gravida' && event.date >= startKey && event.date <= endKey)
    .map((event) => ({
      date: fromKey(event.date),
      label: fmtFull(fromKey(event.date)),
      title: event.title || CALENDAR_TYPES[event.type]?.label || 'Compromisso',
      type: CALENDAR_TYPES[event.type]?.label || 'Compromisso',
      person: event.person || '',
    }))
    .sort((a, b) => a.date - b.date);

  const tests = (Array.isArray(state?.pregnancyTests) ? state.pregnancyTests : [])
    .filter((test) => test?.date >= startKey && test.date <= endKey)
    .map((test) => ({ date: fromKey(test.date), label: fmtFull(fromKey(test.date)), result: test.result }))
    .sort((a, b) => a.date - b.date);

  const journeyStart = anchor.start.getTime();
  const journeyEnd = addDays(end, 1).getTime();
  const journey = (Array.isArray(state?.journey) ? state.journey : [])
    .filter((item) => item?.at >= journeyStart && item.at < journeyEnd)
    .map((item) => ({ title: item.title, note: item.note, label: fmtFull(new Date(item.at)), at: item.at }))
    .sort((a, b) => a.at - b.at);

  const weights = entries.map((entry) => entry.weight).filter((value) => value !== null);
  const photos = entries.reduce((total, entry) => total + entry.bumpPhotos.length, 0);
  const exams = entries.reduce((total, entry) => total + entry.examPhotos.length, 0);
  const lastWeek = gestationalWeek(end, anchor);

  const names = Array.isArray(profile.babyNames) && profile.babyNames.length
    ? profile.babyNames.filter(Boolean)
    : profile.babyName ? [profile.babyName] : [];

  return {
    available: entries.length > 0,
    reason: entries.length ? null : 'sem_registros',
    cover: {
      name: (profile.name || '').trim(),
      babyNames: names,
      multiple: profile.pregnancyType === 'gemelar' || names.length > 1,
      lastPeriodStart: anchor.start,
      lastPeriodLabel: fmtLong(anchor.start),
      due: anchor.due,
      dueLabel: fmtLong(anchor.due),
      birthDate: born,
      birthLabel: born ? fmtLong(born) : null,
      ultrasoundPhoto: typeof profile.ultrasoundPhoto === 'string' ? profile.ultrasoundPhoto : null,
      generatedAt: ref,
      generatedLabel: fmtLong(ref),
    },
    summary: {
      entries: entries.length,
      weeksWithEntries: weeks.length,
      weeksReached: Math.max(0, Math.min(lastWeek.week, 45)),
      firstEntry: entries[0]?.label || null,
      lastEntry: entries[entries.length - 1]?.label || null,
      photos,
      exams,
      appointments: events.length,
      topEmotions: countBy(entries.flatMap((entry) => entry.emotions)).slice(0, 4),
      topSymptoms: countBy(entries.flatMap((entry) => entry.symptoms)).slice(0, 4),
      weightStart: weights.length ? weights[0] : null,
      weightEnd: weights.length ? weights[weights.length - 1] : null,
      weightGain: weights.length > 1 ? Math.round((weights[weights.length - 1] - weights[0]) * 10) / 10 : null,
    },
    weeks,
    events,
    tests,
    journey,
  };
}

/**
 * Quando o app deve oferecer o diário sozinho, sem ela procurar.
 * Na reta final (a partir da semana 36) e durante todo o pós-parto.
 */
export function diaryOffer(state, ref = today()) {
  const phase = state?.profile?.phase;
  if (phase !== 'gravida' && phase !== 'posparto') return null;

  const anchor = pregnancyAnchor(state?.profile);
  if (!anchor) return null;

  const diary = pregnancyDiary(state, ref);
  if (!diary.available) return null;

  if (phase === 'posparto') {
    return { show: true, title: 'O diário da sua gestação está pronto', entries: diary.summary.entries };
  }

  const { week } = gestationalWeek(ref, anchor);
  if (week < 36) return null;
  return { show: true, title: 'Seu diário da gestação já pode ser gerado', entries: diary.summary.entries };
}
