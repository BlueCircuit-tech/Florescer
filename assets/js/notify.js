/**
 * Lembretes locais.
 * Sem servidor de push: as notificações são agendadas no aparelho e disparam
 * enquanto o app estiver aberto ou instalado em segundo plano no sistema.
 */
import { getState, update } from './store.js';
import { cycleInfo, isFertileReminderEligible, toKey, today, diffDays, fmtShort, addDays } from './cycle.js';
import { missionProgress } from './missions.js';

const timers = [];

export const permission = () => (('Notification' in window) ? Notification.permission : 'unsupported');
export const supported = () => 'Notification' in window;

export async function requestPermission() {
  if (!supported()) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  try { return await Notification.requestPermission(); } catch { return 'denied'; }
}

async function show(title, body, tag) {
  if (permission() !== 'granted') return false;
  const opts = {
    body,
    tag,
    icon: 'icons/icon-192.png',
    badge: 'icons/badge.png',
    lang: 'pt-BR',
    data: { url: tag === 'missions' ? './#/missoes' : './#/home' },
  };
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) await reg.showNotification(title, opts);
    else new Notification(title, opts);
    return true;
  } catch {
    return false;
  }
}

/** Marca o lembrete como enviado hoje para não repetir. */
function alreadySent(kind) {
  const key = `${kind}:${toKey(today())}`;
  if (getState().notifyLog[key]) return true;
  update((s) => { s.notifyLog[key] = Date.now(); }, { silent: true });
  return false;
}

/** Mensagens de cada tipo de lembrete, personalizadas com o nome. */
function messages(state, info) {
  const nome = (state.profile.name || '').split(' ')[0];
  const oi = nome ? `${nome}, ` : '';
  return {
    fertile: ['Florescer 🌿', `${oi}você está na janela fértil. Um bom momento para o casal aproveitar junto, com leveza e sem pressão. 💛`],
    period: ['Florescer 🌷', `${oi}sua menstruação está prevista para amanhã (${info.known ? fmtShort(info.nextPeriod) : ''}).`],
    dailyLog: ['Como foi o seu dia? 📔', `${oi}dois toques para registrar humor, sintomas e fertilidade.`],
    tip: ['Sua sugestão de hoje ✨', 'Abra o Florescer para ver a dica escolhida para a sua fase.'],
    missions: ['Suas missões esperam por você 🎯', `${oi}ainda há pequenos cuidados para concluir hoje. Cada missão vale pontos!`],
  };
}

function dispatch(kind, title, body) {
  if (kind === 'fertile' && !isFertileReminderEligible(getState())) return;
  if (kind === 'missions' && missionProgress(getState()).done) return;
  if (!alreadySent(kind)) show(title, body, kind);
}

/** Agenda os lembretes do dia. Chamado ao abrir o app e ao mudar configurações. */
export function scheduleReminders() {
  timers.forEach(clearTimeout);
  timers.length = 0;

  const state = getState();
  const n = state.settings.notifications;
  if (permission() !== 'granted') return;

  const info = cycleInfo(state);
  const msg = messages(state, info);
  const [h, m] = (n.time || '09:00').split(':').map(Number);
  const at = new Date();
  at.setHours(h, m, 0, 0);

  const queue = [];

  if (n.dailyLog && !state.logs[toKey(today())]) queue.push(['dailyLog', at, msg.dailyLog]);
  if (n.tip && state.settings.tipsOptIn) queue.push(['tip', at, msg.tip]);
  if (n.missions && !missionProgress(state).done) queue.push(['missions', at, msg.missions]);

  if (info.known) {
    if (n.fertile && isFertileReminderEligible(state)) queue.push(['fertile', at, msg.fertile]);
    if (n.period && diffDays(info.nextPeriod, today()) === 1) queue.push(['period', at, msg.period]);
  }

  for (const [kind, when, [title, body]] of queue) {
    const delay = when - Date.now();
    if (delay > 0 && delay < 86400000) {
      timers.push(setTimeout(() => dispatch(kind, title, body), delay));
    } else if (delay <= 0 && delay > -3600000) {
      // horário já passou há menos de 1h: envia ao abrir o app
      dispatch(kind, title, body);
    }
  }
}

/** Notificação de teste, usada na tela de lembretes. */
export async function sendTestNotification() {
  const state = getState();
  if (!isFertileReminderEligible(state)) return false;
  const info = cycleInfo(state);
  const [title, body] = messages(state, info).fertile;
  return show(title, body, 'teste');
}

/** Limpa o histórico de lembretes antigos (mais de 30 dias). */
export function pruneNotifyLog() {
  const limit = addDays(today(), -30).getTime();
  update((s) => {
    for (const [k, v] of Object.entries(s.notifyLog)) if (v < limit) delete s.notifyLog[k];
  }, { silent: true });
}
