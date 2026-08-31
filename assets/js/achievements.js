import { cycleLengths, toKey, today } from './cycle.js';

const DEFINITIONS = [
  { id: 'first-log', metric: 'logs', threshold: 1, icon: 'note', title: 'Meu primeiro registro', note: 'o primeiro passo de uma rotina de cuidado' },
  { id: 'logs-7', metric: 'logs', threshold: 7, icon: 'sparkle', title: '7 registros no Florescer', note: 'cada registro ajuda a conhecer melhor o seu corpo' },
  { id: 'logs-30', metric: 'logs', threshold: 30, icon: 'crown', title: '30 registros no Florescer', note: 'uma jornada construída com constância' },
  { id: 'first-intercourse', metric: 'relationships', threshold: 1, icon: 'heart', title: 'Primeira relação registrada', note: 'mais um detalhe importante do seu ciclo', private: true, phases: ['tentante'] },
  { id: 'relationships-5', metric: 'relationships', threshold: 5, icon: 'heart', title: '5 relações registradas', note: 'seu acompanhamento está cada vez mais completo', private: true, phases: ['tentante'] },
  { id: 'relationships-10', metric: 'relationships', threshold: 10, icon: 'heart', title: '10 relações registradas', note: 'constância para compreender a sua jornada', private: true, phases: ['tentante'] },
  { id: 'first-cycle', metric: 'cycles', threshold: 1, icon: 'flower', title: 'Completei um ciclo de acompanhamento', note: 'um ciclo inteiro registrado no Florescer', phases: ['tentante'] },
  { id: 'cycles-3', metric: 'cycles', threshold: 3, icon: 'crown', title: '3 ciclos acompanhados', note: 'mais história para tornar as previsões precisas', phases: ['tentante'] },
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
    (!item.phases || !state.profile?.phase || item.phases.includes(state.profile.phase)) &&
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

export function achievementNotification(state, achievements) {
  const phase = state.profile?.phase || 'tentante';
  const privateAchievement = achievements.some((item) => item.private);
  const phaseCopy = {
    tentante: {
      title: 'Uma conquista na sua jornada tentante ✨',
      multiple: 'Seu acompanhamento do ciclo ganhou novos marcos.',
      first: 'Seu primeiro registro começou uma rotina de conhecimento e cuidado.',
      seven: 'Você já reuniu 7 registros para compreender melhor o seu ciclo.',
      thirty: 'São 30 registros construindo um acompanhamento cada vez mais completo.',
      private: 'Um novo marco privado foi adicionado à sua jornada.',
    },
    gravida: {
      title: 'Uma conquista na sua gestação ✨',
      multiple: 'Novas memórias desta fase foram adicionadas à sua jornada.',
      first: 'Você guardou o primeiro registro desta fase tão especial.',
      seven: 'Você já guardou 7 registros da sua jornada gestacional.',
      thirty: 'São 30 registros acompanhando as mudanças e memórias da gestação.',
      private: 'Uma nova conquista foi adicionada à sua jornada.',
    },
    posparto: {
      title: 'Uma conquista no Florescer Baby ✨',
      multiple: 'Novos marcos da sua rotina de cuidado foram guardados.',
      first: 'Você fez o primeiro registro da sua rotina no Florescer Baby.',
      seven: 'Você já guardou 7 registros de cuidado e acolhimento no pós-parto.',
      thirty: 'São 30 registros construindo a história desta nova fase.',
      private: 'Uma nova conquista foi adicionada à sua jornada.',
    },
  }[phase];
  if (achievements.length > 1) return { title: phaseCopy.title, body: phaseCopy.multiple };
  const achievement = achievements[0];
  if (privateAchievement) return { title: phaseCopy.title, body: phaseCopy.private };
  const bodies = {
    'first-log': phaseCopy.first,
    'logs-7': phaseCopy.seven,
    'logs-30': phaseCopy.thirty,
    'first-cycle': 'Você completou um ciclo inteiro de acompanhamento. Seu histórico está florescendo.',
    'cycles-3': 'Três ciclos acompanhados: mais dados para conhecer seus padrões com confiança.',
  };
  return { title: phaseCopy.title, body: bodies[achievement.id] || achievement.note };
}
