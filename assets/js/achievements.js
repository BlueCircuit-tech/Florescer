import { cycleLengths, toKey, today } from './cycle.js';

const DEFINITIONS = [
  { id: 'first-log', metric: 'logs', threshold: 1, icon: 'note', title: 'Meu primeiro registro', note: 'o primeiro passo de uma rotina de cuidado' },
  { id: 'logs-7', metric: 'logs', threshold: 7, icon: 'sparkle', title: '7 registros no Florescer', note: 'cada registro ajuda a conhecer melhor o seu corpo' },
  { id: 'logs-30', metric: 'logs', threshold: 30, icon: 'crown', title: '30 registros no Florescer', note: 'uma jornada construída com constância' },
  { id: 'first-intercourse', metric: 'relationships', threshold: 1, icon: 'heart', title: 'Primeira relação registrada', note: 'mais um detalhe importante do seu ciclo', private: true },
  { id: 'relationships-5', metric: 'relationships', threshold: 5, icon: 'heart', title: '5 relações registradas', note: 'seu acompanhamento está cada vez mais completo', private: true },
  { id: 'relationships-10', metric: 'relationships', threshold: 10, icon: 'heart', title: '10 relações registradas', note: 'constância para compreender a sua jornada', private: true },
  { id: 'first-cycle', metric: 'cycles', threshold: 1, icon: 'flower', title: 'Completei um ciclo de acompanhamento', note: 'um ciclo inteiro registrado no Florescer' },
  { id: 'cycles-3', metric: 'cycles', threshold: 3, icon: 'crown', title: '3 ciclos acompanhados', note: 'mais história para tornar as previsões precisas' },
];

export function achievementStats(state, ref = today()) {
  const limit = toKey(ref);
  const logs = Object.fromEntries(Object.entries(state.logs || {}).filter(([key]) => key <= limit));
  return {
    logs: Object.keys(logs).length,
    relationships: Object.values(logs).filter((log) => log?.intercourse).length,
    cycles: cycleLengths({ ...state, logs }).length,
  };
}

/** Registra somente conquistas cujo limiar foi cruzado pela ação atual. */
export function unlockAchievements(state, before, now = Date.now(), ref = today()) {
  const after = achievementStats(state, ref);
  if (!Array.isArray(state.achievements)) state.achievements = [];
  if (!Array.isArray(state.journey)) state.journey = [];
  const unlocked = DEFINITIONS.filter((item) =>
    before[item.metric] < item.threshold && after[item.metric] >= item.threshold &&
    !state.achievements.some((entry) => entry.id === item.id));

  for (const item of unlocked) {
    state.achievements.push({ id: item.id, at: now });
    if (!state.journey.some((entry) => entry.title === item.title)) {
      state.journey.unshift({ icon: item.icon, title: item.title, note: item.note, at: now });
    }
  }
  return unlocked;
}
