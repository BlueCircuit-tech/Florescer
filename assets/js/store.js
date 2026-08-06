/**
 * Estado da aplicação + persistência local (localStorage).
 * Tudo fica no aparelho da usuária: nenhum dado sai daqui.
 */

const KEY = 'florescer:v1';
const SCHEMA = 1;

export const DEFAULTS = () => ({
  schema: SCHEMA,
  createdAt: Date.now(),
  onboarded: false,
  premium: false,
  premiumSince: null,
  profile: {
    name: '',
    phase: 'tentante',          // tentante | gravida | posparto
    tryingFor: null,            // nao_comecei | ate_6m | 6m_1a | mais_1a
    regularity: null,           // regular | irregular | nao_sei
    challenge: null,            // fertil | ansiedade | informacao | organizar | outro
    lastPeriodStart: null,      // 'YYYY-MM-DD'
    cycleLength: 28,
    periodLength: 5,
    dueDate: null,              // gestação
    birthDate: null,            // pós-parto
    babyName: '',
    startedTryingAt: null,
  },
  settings: {
    lutealPhase: 14,
    notifications: {
      fertile: true,
      period: true,
      dailyLog: true,
      tip: true,
      community: false,
      time: '09:00',
    },
    tipsOptIn: true,
    analytics: false,
  },
  logs: {},                     // 'YYYY-MM-DD' -> registro do dia
  savedTips: [],
  savedArticles: [],
  readArticles: [],
  posts: [],                    // posts criados pela usuária
  postState: {},                // id -> { liked, likes, comments:[] }
  hiddenPosts: [],              // publicações ocultadas pela moderação
  challengeDays: [],            // dias marcados no desafio da semana
  journey: [],                  // marcos da jornada
  notifyLog: {},                // controle de lembretes já enviados
  lastSeen: Date.now(),
});

let state = load();
const listeners = new Set();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS();
    const parsed = JSON.parse(raw);
    return migrate(deepMerge(DEFAULTS(), parsed));
  } catch (err) {
    console.warn('[florescer] não foi possível ler os dados salvos:', err);
    return DEFAULTS();
  }
}

function migrate(s) {
  // ponto de extensão para versões futuras do schema
  s.schema = SCHEMA;
  return s;
}

function deepMerge(base, patch) {
  if (!patch || typeof patch !== 'object') return base;
  const out = Array.isArray(base) ? [...base] : { ...base };
  for (const [k, v] of Object.entries(patch)) {
    if (v && typeof v === 'object' && !Array.isArray(v) && base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])) {
      out[k] = deepMerge(base[k], v);
    } else if (v !== undefined) {
      out[k] = v;
    }
  }
  return out;
}

let saveTimer;
function persist() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (err) {
      console.warn('[florescer] falha ao salvar:', err);
    }
  }, 120);
}

export function getState() { return state; }

/** Aplica uma mutação no estado, salva e notifica quem estiver ouvindo. */
export function update(mutator, { silent = false } = {}) {
  mutator(state);
  persist();
  if (!silent) listeners.forEach((fn) => fn(state));
  return state;
}

export function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }

/* ---------- registros diários ---------- */
export const emptyLog = () => ({
  flow: null,            // null | spotting | light | medium | heavy
  mood: null,            // 0..4
  symptoms: [],
  intercourse: false,
  protected: false,
  temperature: null,     // °C
  mucus: null,           // seco | pegajoso | cremoso | aquoso | clara_ovo
  ovTest: null,          // nao_fiz | positivo | negativo
  notes: '',
  updatedAt: null,
});

export function getLog(key) {
  return state.logs[key] ? { ...emptyLog(), ...state.logs[key] } : emptyLog();
}

export function saveLog(key, log) {
  const clean = { ...emptyLog(), ...log, updatedAt: Date.now() };
  const isEmpty = !clean.flow && clean.mood === null && !clean.symptoms.length &&
    !clean.intercourse && !clean.temperature && !clean.mucus &&
    (!clean.ovTest || clean.ovTest === 'nao_fiz') && !clean.notes.trim();
  update((s) => {
    if (isEmpty) delete s.logs[key];
    else s.logs[key] = clean;
  });
  return !isEmpty;
}

export function hasLog(key) { return !!state.logs[key]; }

/* ---------- jornada ---------- */
export function addJourney(icon, title, note) {
  update((s) => {
    const exists = s.journey.some((j) => j.title === title);
    if (!exists) s.journey.unshift({ icon, title, note, at: Date.now() });
  });
}

/* ---------- exportar / importar / apagar ---------- */
export function exportData() {
  return JSON.stringify({ app: 'florescer', schema: SCHEMA, exportedAt: new Date().toISOString(), data: state }, null, 2);
}

export function importData(json) {
  const parsed = JSON.parse(json);
  const data = parsed.data || parsed;
  if (!data || typeof data !== 'object' || !data.profile) throw new Error('Arquivo inválido');
  state = migrate(deepMerge(DEFAULTS(), data));
  persist();
  listeners.forEach((fn) => fn(state));
}

export function resetAll() {
  state = DEFAULTS();
  try { localStorage.removeItem(KEY); } catch { /* ignorado */ }
  persist();
  listeners.forEach((fn) => fn(state));
}

/* ---------- tema ----------
   O Florescer é um app de tema claro: ignoramos o modo escuro do sistema
   para manter a identidade da marca em todos os aparelhos. */
export function applyTheme() {
  document.documentElement.dataset.theme = 'light';
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = '#FBF7F8';
}
