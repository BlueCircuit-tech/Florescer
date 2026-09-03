/**
 * Estado da aplicação + persistência local (localStorage).
 * Tudo fica no aparelho da usuária: nenhum dado sai daqui.
 */
import { achievementStats, unlockAchievements } from './achievements.js';
import { normalizeAllHomeShortcuts } from './features.js';

const KEY = 'florescer:v1';
const SCHEMA = 2;

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
    pregnancyType: null,        // unica | gemelar
    ultrasoundPhoto: null,      // última ultrassonografia, comprimida no aparelho
    birthDate: null,            // pós-parto
    babyName: '',
    babyNames: [],              // nomes dos bebês em gestações múltiplas
    startedTryingAt: null,
  },
  settings: {
    lutealPhase: 14,
    notifications: {
      fertile: true,
      period: true,
      dailyLog: true,
      tip: true,
      missions: true,
      achievements: true,
      babyVaccines: true,
      babyAppointments: true,
      calendarEvents: true,
      community: false,
      time: '09:00',
    },
    tipsOptIn: true,
    analytics: false,
    homeShortcuts: normalizeAllHomeShortcuts(),
  },
  logs: {},                     // 'YYYY-MM-DD' -> registro do dia
  pregnancyTests: [],           // testes de gravidez registrados pela tentante
  babyStatus: [],               // medidas e próximos cuidados dos bebês
  breastfeedingLogs: [],        // mamadas, extrações e estoque de leite
  babyHealthRecords: [],        // sintomas e histórico clínico dos bebês
  calendarEvents: [],           // agenda de consultas, exames e tratamentos
  diaperLogs: [],               // trocas com urina, fezes e frequência diária
  sleepLogs: [],                // sono noturno, cochilos e duração total
  babyVaccines: [],             // vacinas marcadas e tomadas por bebê
  babyDevelopmentRecords: [],   // marcos afetivos e motores por bebê
  savedTips: [],
  savedArticles: [],
  readArticles: [],
  posts: [],                    // posts criados pela usuária
  postState: {},                // id -> { liked, likes, comments:[] }
  hiddenPosts: [],              // publicações ocultadas pela moderação
  challengeDays: [],            // dias marcados no desafio da semana
  missionDays: {},              // 'YYYY-MM-DD' -> ids das missões concluídas
  journey: [],                  // marcos da jornada
  achievements: [],             // conquistas desbloqueadas, com deduplicação permanente
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
    const migrated = migrate(deepMerge(DEFAULTS(), parsed));
    if ((Number(parsed.schema) || 0) < SCHEMA) {
      try { localStorage.setItem(KEY, JSON.stringify(migrated)); }
      catch (err) { console.warn('[florescer] não foi possível persistir a migração:', err); }
    }
    return migrated;
  } catch (err) {
    console.warn('[florescer] não foi possível ler os dados salvos:', err);
    return DEFAULTS();
  }
}

function migrate(s) {
  s.settings.homeShortcuts = normalizeAllHomeShortcuts(s.settings.homeShortcuts);
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
  emotions: [],          // diário da gestante
  thoughts: '',
  accomplishments: '',    // conquistas do Diário da Mamãe no pós-parto
  gratitude: '',
  observations: '',       // observações do Diário da Mamãe no pós-parto
  bumpPhotos: [],        // imagens JPEG reduzidas no próprio aparelho
  examPhotos: [],
  systolicPressure: null, // controle de sintomas e medições
  diastolicPressure: null,
  weight: null,           // kg
  glucose: null,          // mg/dL
  symptomNotes: '',
  updatedAt: null,
});

export function logHasContent(log) {
  return !!log.flow || log.mood != null || !!log.symptoms?.length ||
    !!log.intercourse || !!log.temperature || !!log.mucus ||
    (!!log.ovTest && log.ovTest !== 'nao_fiz') || !!log.notes?.trim() ||
    !!log.emotions?.length || !!log.thoughts?.trim() || !!log.accomplishments?.trim() ||
    !!log.gratitude?.trim() || !!log.observations?.trim() ||
    !!log.bumpPhotos?.length || !!log.examPhotos?.length ||
    log.systolicPressure != null || log.diastolicPressure != null ||
    log.weight != null || log.glucose != null || !!log.symptomNotes?.trim();
}

export function getLog(key) {
  return state.logs[key] ? { ...emptyLog(), ...state.logs[key] } : emptyLog();
}

export function saveLog(key, log) {
  const before = achievementStats(state);
  const clean = { ...emptyLog(), ...log, updatedAt: Date.now() };
  const isEmpty = !logHasContent(clean);
  let achievements = [];
  update((s) => {
    if (isEmpty) delete s.logs[key];
    else s.logs[key] = clean;
    if (!isEmpty) achievements = unlockAchievements(s, before);
  });
  return { saved: !isEmpty, achievements };
}

/** Registra intimidade sem substituir os outros dados já salvos no dia. */
export function saveIntercourse(key, { protected: protectedValue = false } = {}) {
  return saveLog(key, { ...getLog(key), intercourse: true, protected: !!protectedValue });
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
