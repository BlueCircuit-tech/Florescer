/**
 * Central de avisos — notificações dentro do próprio app.
 *
 * O Florescer não usa push nem notificação do sistema. Um PWA só entrega push
 * com servidor, chaves VAPID e permissão do navegador, e mesmo assim o aviso
 * depende do sistema não ter encerrado o app — na prática, lembrete que não
 * chega. Em vez disso, os avisos ficam guardados no aparelho e esperam por ela
 * no sininho da Home: quando ela abre o app, estão todos lá.
 *
 * Como funciona: a cada abertura, `syncNotices` recalcula o que vale para hoje
 * e guarda apenas o que ainda não existe. O identificador carrega o dia
 * (`fertile:2026-10-05`), então o mesmo aviso nunca entra duas vezes.
 *
 * Nada disso sai do aparelho e nenhuma permissão é pedida.
 */
import { getState, update } from './store.js';
import { addDays, cycleInfo, diffDays, fmtShort, isFertileReminderEligible, toKey, today } from './cycle.js';
import { babyReminder } from './babyStatus.js';
import { CALENDAR_TYPES, plannerReminders } from './planner.js';
import { achievementNotification } from './achievements.js';
import { dailyHandled, dailyMessage } from './florDaily.js';
import { momentOfDay } from './florMoments.js';

/** Avisos antigos saem sozinhos: a central é do agora, não um histórico. */
const KEEP_DAYS = 30;
const MAX_NOTICES = 60;

/**
 * Os avisos que valem para `ref`, já filtrados pelas preferências dela.
 * Função pura: não toca no estado, só diz o que deveria existir.
 */
export function collectNotices(state, ref = today()) {
  const n = state?.settings?.notifications || {};
  const day = toKey(ref);
  const nome = (state?.profile?.name || '').split(' ')[0];
  const oi = nome ? `${nome}, ` : '';
  const info = cycleInfo(state, ref);
  const out = [];

  const add = (kind, iconName, title, body, to) => out.push({
    id: `${kind}:${day}`, kind, icon: iconName, title, body, to, day,
  });

  if (n.fertile && isFertileReminderEligible(state, ref)) {
    add('fertile', 'flower', 'Você está na janela fértil',
      `${oi}este é um bom momento para o casal aproveitar junto, com leveza e sem pressão.`, 'ciclo');
  }

  if (n.period && info.known && diffDays(info.nextPeriod, ref) === 1) {
    add('period', 'drop', 'Sua menstruação está prevista para amanhã',
      `A estimativa é ${fmtShort(info.nextPeriod)}. Se ela vier, marque o primeiro dia para as próximas previsões continuarem certas.`, 'ciclo');
  }

  // a carta da Flor vem na frente de tudo, e no dia dela a pergunta
  // diária fica de fora: duas mensagens juntas tiram o peso das duas
  const moment = momentOfDay(state, ref);
  if (moment) {
    out.push({
      id: `florMoment:${moment.id}`,
      kind: 'florMoment',
      icon: 'flower',
      title: moment.title,
      body: 'Uma mensagem da Flor para você.',
      to: `momento/${moment.id}`,
      day,
    });
  }

  // a pergunta da Flor vem antes do lembrete de registro: uma pergunta pela
  // mãe não é a mesma coisa que uma cobrança de preenchimento
  if (n.florDaily && !moment && !dailyHandled(state, ref)) {
    const message = dailyMessage(state, ref);
    out.push({
      id: `florDaily:${day}`,
      kind: 'florDaily',
      icon: 'flower',
      title: message.heading,
      body: message.text,
      to: 'como-voce-esta',
      day,
    });
  }

  if (n.dailyLog && !state?.logs?.[day]) {
    add('dailyLog', 'note', 'Você ainda não registrou hoje',
      `${oi}dois toques para guardar humor, sintomas e como foi o seu dia.`, 'registro');
  }

  if (n.tip && state?.settings?.tipsOptIn) {
    add('tip', 'sparkle', 'Sua sugestão de hoje está pronta',
      'Escolhida para a fase em que você está. Abra quando quiser.', 'home');
  }

  const vaccine = n.babyVaccines && babyReminder(state, 'vaccine');
  if (vaccine) add('babyVaccine', 'shield', vaccine[0], vaccine[1], 'ciclo');

  const appointment = n.babyAppointments && babyReminder(state, 'appointment');
  if (appointment) add('babyAppointment', 'calendar', appointment[0], appointment[1], 'ciclo');

  if (n.calendarEvents) {
    for (const reminder of plannerReminders(state, ref)) {
      const { event } = reminder;
      const type = CALENDAR_TYPES[event.type];
      const person = event.person ? ` para ${event.person}` : '';
      const quando = event.reminderDays === 0
        ? `é hoje${event.time ? ` às ${event.time}` : ''}`
        : event.reminderDays === 1 ? 'é amanhã' : `será em ${event.reminderDays} dias`;
      out.push({
        // o id do lembrete já carrega a data da ocorrência: não repete
        id: `calendar:${reminder.id}`,
        kind: 'calendarEvents',
        icon: type?.icon || 'calendar',
        title: `${event.title}${person} ${quando}`,
        body: `${type?.label || 'Compromisso'} · confira os detalhes no calendário.`,
        to: 'ciclo',
        day,
      });
    }
  }

  return out;
}

function prune(state, ref) {
  const limit = addDays(ref, -KEEP_DAYS).getTime();
  state.notices = state.notices.filter((item) => item.at >= limit).slice(-MAX_NOTICES);
}

/**
 * Recalcula os avisos do dia e guarda os que ainda não existem.
 * @returns {number} quantos avisos novos entraram
 */
export function syncNotices(ref = today()) {
  const fresh = collectNotices(getState(), ref);
  let added = 0;

  update((state) => {
    if (!Array.isArray(state.notices)) state.notices = [];
    const existing = new Set(state.notices.map((item) => item.id));
    for (const notice of fresh) {
      if (existing.has(notice.id)) continue;
      state.notices.push({ ...notice, at: Date.now(), read: false });
      added += 1;
    }
    prune(state, ref);
  }, { silent: true });

  return added;
}

/** Guarda uma conquista recém-desbloqueada na central. */
export function noticeAchievements(achievements = []) {
  const state = getState();
  if (!achievements.length || !state.settings.notifications.achievements) return 0;

  const { title, body } = achievementNotification(state, achievements);
  const id = `achievement:${achievements.map((item) => item.id).join('+')}`;
  let added = 0;

  update((s) => {
    if (!Array.isArray(s.notices)) s.notices = [];
    if (s.notices.some((item) => item.id === id)) return;
    s.notices.push({
      id, kind: 'achievements', icon: 'sparkle', title, body,
      to: 'perfil', day: toKey(today()), at: Date.now(), read: false,
    });
    added = 1;
  }, { silent: true });

  return added;
}

/* ---------- leitura e limpeza ---------- */

export const allNotices = (state) => [...(state?.notices || [])].sort((a, b) => b.at - a.at);
export const unreadNotices = (state) => (state?.notices || []).filter((item) => !item.read);
export const unreadCount = (state) => unreadNotices(state).length;

export function markNoticesRead() {
  update((state) => {
    for (const notice of state.notices || []) notice.read = true;
  }, { silent: true });
}

export function removeNotice(id) {
  update((state) => { state.notices = (state.notices || []).filter((item) => item.id !== id); });
}

export function clearNotices() {
  update((state) => { state.notices = []; });
}
