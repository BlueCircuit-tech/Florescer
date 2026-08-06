/**
 * Motor de datas, ciclo, gestação e pós-parto.
 * Regras clínicas usadas (as mesmas de apps de referência):
 *  - fase lútea considerada fixa em 14 dias (ajustável em configurações);
 *  - janela fértil = ovulação −5 dias até ovulação +1;
 *  - duração média do ciclo calculada a partir dos últimos 6 ciclos registrados;
 *  - DPP (data provável do parto) = DUM + 280 dias (regra de Naegele).
 * Nada aqui é diagnóstico — são estimativas estatísticas.
 */

export const DAY_MS = 86400000;

const MESES = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
const MESES_ABR = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
const SEMANAS = ['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'];
const SEMANAS_MIN = ['D','S','T','Q','Q','S','S'];

/* ---------- datas ---------- */
export const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
export const today = () => startOfDay(new Date());
export const addDays = (d, n) => { const x = startOfDay(d); x.setDate(x.getDate() + n); return x; };
export const diffDays = (a, b) => Math.round((startOfDay(a) - startOfDay(b)) / DAY_MS);
export const isSameDay = (a, b) => toKey(a) === toKey(b);

export function toKey(d) {
  const x = d instanceof Date ? d : new Date(d);
  const m = String(x.getMonth() + 1).padStart(2, '0');
  const day = String(x.getDate()).padStart(2, '0');
  return `${x.getFullYear()}-${m}-${day}`;
}
export function fromKey(key) {
  const [y, m, d] = String(key).split('-').map(Number);
  return new Date(y, m - 1, d);
}

export const fmtShort = (d) => { const x = fromAny(d); return `${String(x.getDate()).padStart(2,'0')}/${String(x.getMonth()+1).padStart(2,'0')}`; };
export const fmtFull = (d) => { const x = fromAny(d); return `${x.getDate()} de ${MESES[x.getMonth()]}`; };
export const fmtLong = (d) => { const x = fromAny(d); return `${x.getDate()} de ${MESES[x.getMonth()]} de ${x.getFullYear()}`; };
export const fmtMonth = (d) => { const x = fromAny(d); return `${MESES[x.getMonth()]} de ${x.getFullYear()}`; };
export const fmtMonthShort = (d) => { const x = fromAny(d); return `${MESES_ABR[x.getMonth()]}/${String(x.getFullYear()).slice(2)}`; };
export const fmtWeekday = (d) => SEMANAS[fromAny(d).getDay()];
export const weekdayLabels = SEMANAS_MIN;

function fromAny(d) { return d instanceof Date ? d : fromKey(d); }

/** "hoje", "ontem", "há 3 dias", "em 2 dias" */
export function relativeDay(d) {
  const n = diffDays(d, today());
  if (n === 0) return 'hoje';
  if (n === -1) return 'ontem';
  if (n === 1) return 'amanhã';
  if (n === -2) return 'anteontem';
  return n < 0 ? `há ${-n} dias` : `em ${n} dias`;
}

/** "agora", "há 5 min", "há 3 h", "há 2 d" — para a comunidade */
export function relativeTime(ts) {
  const s = Math.max(0, (Date.now() - ts) / 1000);
  if (s < 60) return 'agora';
  if (s < 3600) return `há ${Math.floor(s / 60)} min`;
  if (s < 86400) return `há ${Math.floor(s / 3600)} h`;
  const d = Math.floor(s / 86400);
  if (d < 7) return `há ${d} d`;
  return fmtShort(new Date(ts));
}

export const plural = (n, sing, plur) => `${n} ${n === 1 ? sing : plur}`;
/** Primeira letra maiúscula (nomes de mês e dia da semana vêm em minúsculas). */
export const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

/* ---------- períodos a partir dos registros ---------- */
const FLOWS = ['spotting', 'light', 'medium', 'heavy'];
export const hasFlow = (log) => !!log && FLOWS.includes(log.flow);

/**
 * Agrupa dias com fluxo em menstruações (início + duração).
 * Tolera 1 dia de intervalo dentro da mesma menstruação.
 * @returns {{start:string, end:string, length:number}[]} ordenado do mais antigo ao mais recente
 */
export function periodsFromLogs(logs) {
  const days = Object.keys(logs).filter((k) => hasFlow(logs[k])).sort();
  const out = [];
  let cur = null;
  for (const k of days) {
    if (cur && diffDays(fromKey(k), fromKey(cur.end)) <= 2) {
      cur.end = k;
    } else {
      if (cur) out.push(cur);
      cur = { start: k, end: k };
    }
  }
  if (cur) out.push(cur);
  return out.map((p) => ({ ...p, length: diffDays(fromKey(p.end), fromKey(p.start)) + 1 }));
}

/** Datas de início de menstruação conhecidas (registros + a informada no cadastro). */
export function periodStarts(state) {
  const set = new Set(periodsFromLogs(state.logs).map((p) => p.start));
  if (state.profile.lastPeriodStart) set.add(state.profile.lastPeriodStart);
  return [...set].sort();
}

/** Comprimentos dos ciclos concluídos (dias entre inícios consecutivos). */
export function cycleLengths(state) {
  const starts = periodStarts(state);
  const out = [];
  for (let i = 1; i < starts.length; i++) {
    const n = diffDays(fromKey(starts[i]), fromKey(starts[i - 1]));
    if (n >= 15 && n <= 60) out.push({ start: starts[i - 1], length: n });
  }
  return out;
}

const avg = (a) => (a.length ? a.reduce((s, n) => s + n, 0) / a.length : 0);
const round = (n) => Math.round(n);

/**
 * Estado completo do ciclo em uma data de referência.
 * @param {object} state
 * @param {Date} [ref] data de referência (padrão: hoje)
 */
export function cycleInfo(state, ref = today()) {
  const luteal = state.settings.lutealPhase || 14;
  const lengths = cycleLengths(state).slice(-6).map((c) => c.length);
  const declared = state.profile.cycleLength || 28;
  const avgLength = lengths.length ? clamp(round(avg(lengths)), 18, 45) : declared;
  const periodLength = state.profile.periodLength || median(periodsFromLogs(state.logs).map((p) => p.length)) || 5;

  const starts = periodStarts(state);
  const past = starts.filter((s) => diffDays(fromKey(s), ref) <= 0);
  const currentStart = past.length ? fromKey(past[past.length - 1]) : null;

  if (!currentStart) {
    return { known: false, avgLength, periodLength, luteal, cyclesTracked: lengths.length };
  }

  let cycleStart = currentStart;
  let dayOfCycle = diffDays(ref, cycleStart) + 1;
  // Se o ciclo passou muito do previsto sem registro, projeta ciclos teóricos
  let projected = false;
  while (dayOfCycle > avgLength + 15) {
    cycleStart = addDays(cycleStart, avgLength);
    dayOfCycle = diffDays(ref, cycleStart) + 1;
    projected = true;
  }

  const nextPeriod = addDays(cycleStart, avgLength);
  const ovulation = addDays(nextPeriod, -luteal);
  const fertileStart = addDays(ovulation, -5);
  const fertileEnd = addDays(ovulation, 1);

  const daysToPeriod = diffDays(nextPeriod, ref);
  const daysToOvulation = diffDays(ovulation, ref);
  const inPeriod = dayOfCycle <= periodLength;
  const inFertile = diffDays(ref, fertileStart) >= 0 && diffDays(fertileEnd, ref) >= 0;
  const isOvulation = isSameDay(ref, ovulation);

  let phase = 'follicular';
  if (inPeriod) phase = 'menstrual';
  else if (isOvulation) phase = 'ovulation';
  else if (inFertile) phase = 'fertile';
  else if (diffDays(ref, ovulation) > 0) phase = 'luteal';

  const variance = lengths.length > 1 ? Math.max(...lengths) - Math.min(...lengths) : null;
  const confidence = confidenceScore(lengths.length, variance, projected);

  return {
    known: true, projected,
    cycleStart, dayOfCycle, avgLength, periodLength, luteal,
    nextPeriod, ovulation, fertileStart, fertileEnd,
    daysToPeriod, daysToOvulation,
    inPeriod, inFertile, isOvulation, phase,
    cyclesTracked: lengths.length, variance, confidence,
    regular: variance === null ? null : variance <= 4,
  };
}

function confidenceScore(n, variance, projected) {
  if (!n) return 55;
  let score = 60 + Math.min(n, 6) * 5; // 65…90
  if (variance !== null) score -= Math.min(variance, 10) * 2;
  if (projected) score -= 10;
  return clamp(round(score), 35, 95);
}

export const PHASES = {
  menstrual: { label: 'Menstruação', color: 'var(--c-menst)', icon: 'drop', tone: 'rose' },
  follicular: { label: 'Fase folicular', color: 'var(--c-lut)', icon: 'seed', tone: 'lilac' },
  fertile: { label: 'Janela fértil', color: 'var(--c-fert)', icon: 'leaf', tone: 'leaf' },
  ovulation: { label: 'Ovulação', color: 'var(--c-ovul)', icon: 'flower', tone: 'leaf' },
  luteal: { label: 'Fase lútea', color: 'var(--c-lut)', icon: 'moon', tone: 'lilac' },
};

/**
 * Classificação de um dia para o calendário — considera registros reais e previsões.
 * @returns {{key:string, date:Date, menst:boolean, predPeriod:boolean, fertile:boolean, ovulation:boolean, future:boolean, log:object|null}}
 */
export function dayInfo(state, date, info = cycleInfo(state)) {
  const key = toKey(date);
  const log = state.logs[key] || null;
  const ref = today();
  const future = diffDays(date, ref) > 0;
  const base = { key, date, log, future, menst: hasFlow(log), predPeriod: false, fertile: false, ovulation: false };

  if (!info.known) return base;

  // ciclos passados e futuros projetados a partir do ciclo atual
  const anchor = info.cycleStart;
  const n = Math.floor(diffDays(date, anchor) / info.avgLength);
  for (const k of [n - 1, n, n + 1]) {
    const cStart = addDays(anchor, k * info.avgLength);
    const d = diffDays(date, cStart) + 1;
    if (d < 1 || d > info.avgLength) continue;
    const ovul = addDays(addDays(cStart, info.avgLength), -info.luteal);
    if (d <= info.periodLength && !base.menst) base.predPeriod = true;
    if (isSameDay(date, ovul)) base.ovulation = true;
    else if (diffDays(date, addDays(ovul, -5)) >= 0 && diffDays(addDays(ovul, 1), date) >= 0) base.fertile = true;
  }
  // menstruação registrada tem prioridade sobre previsão
  if (base.menst) base.predPeriod = false;
  return base;
}

/** Matriz do mês para o calendário (com células vazias no início). */
export function monthMatrix(year, month) {
  const first = new Date(year, month, 1);
  const total = new Date(year, month + 1, 0).getDate();
  const pad = first.getDay();
  const cells = [];
  for (let i = 0; i < pad; i++) cells.push(null);
  for (let d = 1; d <= total; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7) cells.push(null);
  return cells;
}

/* ---------- sequência de registros ---------- */
export function streak(state) {
  const ref = today();
  let cur = 0;
  // a sequência não quebra se o dia de hoje ainda não foi registrado
  let cursor = state.logs[toKey(ref)] ? ref : addDays(ref, -1);
  while (state.logs[toKey(cursor)]) { cur++; cursor = addDays(cursor, -1); }

  const keys = Object.keys(state.logs).sort();
  let best = 0, run = 0, prev = null;
  for (const k of keys) {
    run = prev && diffDays(fromKey(k), fromKey(prev)) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = k;
  }
  return { current: cur, best: Math.max(best, cur), total: keys.length };
}

/* ---------- gestação ---------- */
export function pregnancyInfo(state) {
  const p = state.profile;
  let due = p.dueDate ? fromKey(p.dueDate) : null;
  if (!due && p.lastPeriodStart) due = addDays(fromKey(p.lastPeriodStart), 280);
  if (!due) return { known: false };

  const conceptionRef = addDays(due, -280);
  const totalDays = clamp(diffDays(today(), conceptionRef), 0, 300);
  const weeks = Math.floor(totalDays / 7);
  const days = totalDays % 7;
  const daysLeft = diffDays(due, today());
  const trimester = weeks < 14 ? 1 : weeks < 28 ? 2 : 3;
  return {
    known: true, due, weeks, days, daysLeft, trimester,
    progress: clamp(totalDays / 280, 0, 1),
    size: babySize(weeks),
  };
}

const SIZES = [
  [4, 'semente de papoula', 'Do tamanho de uma semente de papoula.'],
  [5, 'semente de gergelim', 'O coração começa a se formar.'],
  [6, 'lentilha', 'Os batimentos já podem aparecer no ultrassom.'],
  [7, 'mirtilo', 'O cérebro cresce muito rápido nesta fase.'],
  [8, 'framboesa', 'Bracinhos e perninhas começam a se definir.'],
  [9, 'azeitona', 'Já se movimenta, mesmo que você não sinta.'],
  [10, 'ameixa', 'Órgãos vitais já estão formados.'],
  [12, 'limão', 'Unhas e cordas vocais começam a surgir.'],
  [14, 'pêssego', 'Consegue franzir a testa e fazer caretas.'],
  [16, 'abacate', 'Começa a ouvir sons do lado de fora.'],
  [18, 'pimentão', 'Os movimentos podem começar a ser sentidos.'],
  [20, 'banana', 'Metade do caminho! Já tem impressões digitais.'],
  [22, 'mamão pequeno', 'Os olhos já se abrem e fecham.'],
  [24, 'espiga de milho', 'Os pulmões se preparam para respirar.'],
  [26, 'alface', 'Reage à sua voz e a sons familiares.'],
  [28, 'berinjela', 'Terceiro trimestre: já sonha (fase REM).'],
  [30, 'repolho', 'Ganha peso rapidamente agora.'],
  [32, 'coco', 'Já reconhece a sua voz com clareza.'],
  [34, 'melão', 'Costuma se posicionar de cabeça para baixo.'],
  [36, 'alface romana', 'Considerado quase a termo.'],
  [38, 'abóbora pequena', 'Pronto para nascer a qualquer momento.'],
  [40, 'melancia pequena', 'Chegou a hora — respire, você consegue.'],
];
function babySize(weeks) {
  let found = SIZES[0];
  for (const s of SIZES) if (weeks >= s[0]) found = s;
  return { name: found[1], note: found[2] };
}

/* ---------- pós-parto ---------- */
export function postpartumInfo(state) {
  const b = state.profile.birthDate;
  if (!b) return { known: false };
  const days = diffDays(today(), fromKey(b));
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30.44);
  let age;
  if (days < 14) age = plural(days, 'dia', 'dias');
  else if (days < 84) age = plural(weeks, 'semana', 'semanas');
  else age = plural(months, 'mês', 'meses');
  return { known: true, birth: fromKey(b), days, weeks, months, age, quarantine: days <= 40 };
}

/* ---------- utilitários ---------- */
export function clamp(n, min, max) { return Math.min(max, Math.max(min, n)); }
export function median(arr) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
}
