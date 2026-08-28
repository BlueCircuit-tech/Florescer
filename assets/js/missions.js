import { addDays, toKey, today } from './cycle.js';

export const DAILY_MISSIONS = [
  { id: 'water', icon: 'drop', title: 'Hidratação', text: 'Beba água ao longo do dia e mantenha sua garrafinha por perto.', points: 10 },
  { id: 'sleep', icon: 'moon', title: 'Sono', text: 'Reserve tempo para desacelerar e cuidar da qualidade do sono.', points: 10 },
  { id: 'food', icon: 'leaf', title: 'Alimentação', text: 'Faça uma refeição equilibrada e coma com atenção.', points: 10 },
  { id: 'vitamins', icon: 'heart', title: 'Vitaminas', text: 'Tome apenas as vitaminas orientadas pela sua equipe de saúde.', points: 10 },
  { id: 'activity', icon: 'sparkle', title: 'Atividade física', text: 'Movimente o corpo de uma forma segura e liberada para você.', points: 10 },
];

export const POSTPARTUM_MISSIONS = [
  { id: 'baby-hug', icon: 'heart', title: 'Abraço demorado', text: 'Abrace seu bebê por um minuto e aproveite esse momento de proximidade.', points: 10 },
  { id: 'baby-photo', icon: 'sparkle', title: 'Uma foto juntos', text: 'Tire uma foto de vocês para guardar uma lembrança deste dia.', points: 10 },
  { id: 'baby-story', icon: 'book', title: 'Hora da história', text: 'Leia uma história curta para o seu bebê, mesmo que ele ainda seja bem pequeno.', points: 10 },
  { id: 'baby-eye-contact', icon: 'heart', title: 'Olhos nos olhos', text: 'Faça contato visual durante a amamentação, mamadeira ou um momento de colo.', points: 10 },
  { id: 'baby-dance', icon: 'sparkle', title: 'Dancem juntos', text: 'Coloque uma música tranquila e dance suavemente com seu bebê.', points: 10 },
  { id: 'baby-song', icon: 'heart', title: 'Cante para o bebê', text: 'Cante uma música ou invente uma canção só de vocês.', points: 10 },
  { id: 'baby-talk', icon: 'message', title: 'Conversa carinhosa', text: 'Conte ao bebê como foi seu dia usando uma voz calma e carinhosa.', points: 10 },
  { id: 'baby-smile', icon: 'sparkle', title: 'Observe um detalhe', text: 'Pare por um instante e observe uma expressão ou um gesto novo do bebê.', points: 10 },
  { id: 'baby-walk', icon: 'leaf', title: 'Um pouco de ar fresco', text: 'Se for seguro para vocês, passe alguns minutos com o bebê ao ar livre.', points: 10 },
  { id: 'baby-massage', icon: 'heart', title: 'Toque de carinho', text: 'Faça um carinho ou uma massagem suave no bebê durante a troca.', points: 10 },
  { id: 'baby-memory', icon: 'note', title: 'Guarde uma memória', text: 'Anote uma pequena descoberta ou um momento especial de hoje.', points: 10 },
  { id: 'baby-name-love', icon: 'heart', title: 'Palavras de amor', text: 'Chame seu bebê pelo nome e diga algo carinhoso olhando para ele.', points: 10 },
  { id: 'mom-water', icon: 'drop', title: 'Cuide da hidratação', text: 'Beba um copo de água e deixe sua garrafinha ao alcance.', points: 10 },
  { id: 'mom-meal', icon: 'leaf', title: 'Refeição com cuidado', text: 'Faça uma refeição nutritiva, respeitando seu ritmo e suas necessidades.', points: 10 },
  { id: 'mom-rest', icon: 'moon', title: 'Pausa para descansar', text: 'Reserve alguns minutos para sentar ou deitar sem outras tarefas.', points: 10 },
  { id: 'mom-help', icon: 'message', title: 'Aceite ajuda', text: 'Peça ou aceite ajuda em uma tarefa para aliviar um pouco o seu dia.', points: 10 },
  { id: 'mom-breathe', icon: 'leaf', title: 'Respirem juntos', text: 'Com o bebê seguro no colo ou por perto, faça cinco respirações lentas.', points: 10 },
  { id: 'mom-pride', icon: 'crown', title: 'Reconheça seu cuidado', text: 'Pense em algo que você fez bem hoje e reconheça seu esforço.', points: 10 },
];

const dailyIds = new Set(DAILY_MISSIONS.map((mission) => mission.id));
const postpartumIds = new Set(POSTPARTUM_MISSIONS.map((mission) => mission.id));

export function missionsForDay(state, key = toKey(today())) {
  const recorded = state.missionDays?.[key] || [];
  if (recorded.some((id) => dailyIds.has(id))) return DAILY_MISSIONS;
  const postpartum = recorded.some((id) => postpartumIds.has(id)) || state.profile?.phase === 'posparto';
  return postpartum ? seededSample(POSTPARTUM_MISSIONS, key, 5) : DAILY_MISSIONS;
}

export function completedMissions(state, key = toKey(today())) {
  const selected = new Set(missionsForDay(state, key).map((mission) => mission.id));
  return [...new Set(state.missionDays?.[key] || [])].filter((id) => selected.has(id));
}

export function missionProgress(state, key = toKey(today())) {
  const missions = missionsForDay(state, key);
  const completed = completedMissions(state, key);
  return {
    completed,
    count: completed.length,
    total: missions.length,
    remaining: missions.length - completed.length,
    done: completed.length === missions.length,
    points: completed.reduce((sum, id) => sum + missions.find((mission) => mission.id === id).points, 0),
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
  if (!missionsForDay(state, key).some((mission) => mission.id === missionId)) return false;
  state.missionDays ||= {};
  const completed = completedMissions(state, key);
  const index = completed.indexOf(missionId);
  if (index >= 0) completed.splice(index, 1); else completed.push(missionId);
  if (completed.length) state.missionDays[key] = completed;
  else delete state.missionDays[key];
  return index < 0;
}

function seededSample(items, key, count) {
  let seed = [...key].reduce((value, char) => Math.imul(value ^ char.charCodeAt(0), 16777619), 2166136261) >>> 0;
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index--) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const swap = seed % (index + 1);
    [shuffled[index], shuffled[swap]] = [shuffled[swap], shuffled[index]];
  }
  return shuffled.slice(0, count);
}
