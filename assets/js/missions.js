import { addDays, toKey, today } from './cycle.js';

export const DAILY_MISSIONS = [
  { id: 'water', icon: 'drop', title: 'Hidratação', text: 'Beba água ao longo do dia e mantenha sua garrafinha por perto.', points: 10 },
  { id: 'sleep', icon: 'moon', title: 'Sono', text: 'Reserve tempo para desacelerar e cuidar da qualidade do sono.', points: 10 },
  { id: 'food', icon: 'leaf', title: 'Alimentação', text: 'Faça uma refeição equilibrada e coma com atenção.', points: 10 },
  { id: 'vitamins', icon: 'heart', title: 'Vitaminas', text: 'Tome apenas as vitaminas orientadas pela sua equipe de saúde.', points: 10 },
  { id: 'activity', icon: 'sparkle', title: 'Atividade física', text: 'Movimente o corpo de uma forma segura e liberada para você.', points: 10 },
];

const missionIds = new Set(DAILY_MISSIONS.map((mission) => mission.id));

export function completedMissions(state, key = toKey(today())) {
  return [...new Set(state.missionDays?.[key] || [])].filter((id) => missionIds.has(id));
}

export function missionProgress(state, key = toKey(today())) {
  const completed = completedMissions(state, key);
  return {
    completed,
    count: completed.length,
    total: DAILY_MISSIONS.length,
    remaining: DAILY_MISSIONS.length - completed.length,
    done: completed.length === DAILY_MISSIONS.length,
    points: completed.reduce((sum, id) => sum + DAILY_MISSIONS.find((mission) => mission.id === id).points, 0),
  };
}

export function missionStats(state, ref = today()) {
  const allDays = Object.keys(state.missionDays || {});
  const totalPoints = allDays.reduce((sum, key) => sum + missionProgress(state, key).points, 0);
  let cursor = missionProgress(state, toKey(ref)).done ? ref : addDays(ref, -1);
  let streak = 0;
  while (missionProgress(state, toKey(cursor)).done) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  const level = Math.floor(totalPoints / 250) + 1;
  return { totalPoints, streak, level, levelProgress: (totalPoints % 250) / 250 };
}

export function toggleMission(state, missionId, key = toKey(today())) {
  if (!missionIds.has(missionId)) return false;
  state.missionDays ||= {};
  const completed = completedMissions(state, key);
  const index = completed.indexOf(missionId);
  if (index >= 0) completed.splice(index, 1); else completed.push(missionId);
  if (completed.length) state.missionDays[key] = completed;
  else delete state.missionDays[key];
  return index < 0;
}
