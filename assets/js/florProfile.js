/**
 * O que a Flor sabe sobre a usuária.
 *
 * Reúne, num único objeto, tudo o que o app já guardou sobre ela: fase,
 * semana da gestação, situação do pré-natal, o que ela registra no diário,
 * o objetivo que escolheu no cadastro, o que já leu e o assunto da última
 * conversa. A partir disso a Flor escolhe o que sugerir, o que destacar e
 * como responder.
 *
 * Tudo aqui é calculado NO APARELHO e usado localmente. O que viaja para a
 * IA continua sendo só o resumo em números montado por `florClient.js` —
 * diário, sintomas, humor e leituras nunca saem daqui.
 */
import { cycleInfo, pregnancyInfo, postpartumInfo, streak, today } from './cycle.js';
import { prenatalPlan } from './prenatal.js';
import { articleTopic } from './libraries.js';
import * as cms from './cms.js';

const GOAL_LABELS = {
  fertil: 'entender a janela fértil',
  ansiedade: 'lidar com a ansiedade da espera',
  informacao: 'ter informação confiável',
  organizar: 'manter tudo organizado',
  outro: null,
};

/** Os itens mais frequentes de uma lista, do mais comum para o menos. */
function top(values, limit = 3) {
  const counts = new Map();
  for (const value of values) {
    if (typeof value !== 'string' || !value.trim()) continue;
    counts.set(value, (counts.get(value) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'pt-BR'))
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }));
}

/** Resume o pré-natal em algo que cabe numa frase. */
function prenatalSummary(plan) {
  if (!plan.length) return { known: false, steps: [], late: [], now: [], next: null, scheduled: 0, done: 0 };
  const late = plan.filter((step) => step.status === 'late');
  const now = plan.filter((step) => step.status === 'now');
  return {
    known: true,
    steps: plan,
    late,
    now,
    next: late[0] || now[0] || plan.find((step) => step.status === 'scheduled') || null,
    scheduled: plan.filter((step) => step.status === 'scheduled').length,
    done: plan.filter((step) => step.status === 'done').length,
  };
}

/** O assunto da última resposta local — serve para encadear a conversa. */
function lastTopic(chat) {
  if (!Array.isArray(chat)) return null;
  for (let i = chat.length - 1; i >= 0; i -= 1) {
    const message = chat[i];
    if (message?.role === 'flor' && message.id && message.kind !== 'alert') return message.id;
  }
  return null;
}

/**
 * O retrato completo da usuária para a Flor.
 * @returns {object} fase, gestação, pré-natal, histórico, objetivos e leituras
 */
export function florProfile(state, ref = today()) {
  const profile = state?.profile || {};
  const phase = profile.phase || 'tentante';

  const cycle = cycleInfo(state, ref);
  const preg = phase === 'gravida' ? pregnancyInfo(state, ref) : { known: false };
  const pp = phase === 'posparto' ? postpartumInfo(state, ref) : { known: false };
  const prenatal = prenatalSummary(preg.known ? prenatalPlan(state, preg, ref) : []);

  const logs = Object.values(state?.logs || {});
  const chat = Array.isArray(state?.florChat) ? state.florChat : [];

  const readIds = Array.isArray(state?.readArticles) ? state.readArticles : [];
  const articles = readIds.length ? cms.getArticles() : [];
  const readTopics = top(readIds
    .map((id) => articles.find((article) => article.id === id))
    .filter(Boolean)
    .map(articleTopic), 3).map((item) => item.label);

  return {
    phase,
    firstName: String(profile.name || '').trim().split(/\s+/)[0] || '',
    cycle,
    preg,
    pp,
    prenatal,

    history: {
      entries: logs.length,
      streak: streak(state).current,
      symptoms: top(logs.flatMap((log) => log.symptoms || [])),
      emotions: top(logs.flatMap((log) => log.emotions || [])),
      // escreve no diário? muda o tom de quem recebe a resposta
      writes: logs.some((log) => (log.thoughts || log.notes || log.gratitude || '').trim()),
      tests: (state?.pregnancyTests || []).length,
    },

    goals: {
      challenge: profile.challenge || null,
      challengeLabel: GOAL_LABELS[profile.challenge] || null,
      tryingFor: profile.tryingFor || null,
      // mais de um ano tentando muda o que vale dizer e o que não vale
      longTrying: profile.tryingFor === 'mais_1a',
    },

    read: {
      articles: readIds.length,
      topics: readTopics,
      savedTips: (state?.savedTips || []).length,
    },

    conversation: {
      messages: chat.length,
      returning: chat.length > 0,
      lastTopic: lastTopic(chat),
    },
  };
}

/**
 * Uma frase sobre o que mais importa para ela agora, ou `null`.
 * Aparece na abertura da Flor e muda conforme os dados dela mudam.
 */
export function florNudge(state, ref = today()) {
  const me = florProfile(state, ref);

  if (me.phase === 'gravida' && me.preg.known) {
    if (me.prenatal.late.length) {
      const etapa = me.prenatal.late[0];
      return { text: `A janela recomendada para "${etapa.title}" já passou. Quer entender para que serve?`, ask: `Me fala sobre ${etapa.title.toLowerCase()}` };
    }
    if (me.prenatal.now.length) {
      const etapa = me.prenatal.now[0];
      return { text: `Esta é a semana de ${etapa.title.toLowerCase()}.`, ask: `Me fala sobre ${etapa.title.toLowerCase()}` };
    }
    if (me.preg.weeks >= 36) {
      return { text: 'Você está na reta final. Posso falar sobre sinais de trabalho de parto.', ask: 'Quais são os sinais de trabalho de parto?' };
    }
    return { text: `Você está com ${me.preg.weeks} semanas. Posso explicar o que acontece agora.`, ask: 'Em que semana eu estou?' };
  }

  if (me.phase === 'tentante') {
    if (!me.cycle.known) {
      return { text: 'Ainda não sei a data da sua última menstruação — com ela eu acerto as suas datas.', ask: 'Quando vem minha menstruação?' };
    }
    if (me.cycle.inFertile) {
      return { text: 'Você está na janela fértil estimada agora.', ask: 'Quando é meu período fértil?' };
    }
    if (me.goals.longTrying) {
      return { text: 'Você marcou que tenta há mais de um ano. Posso falar sobre quando procurar avaliação.', ask: 'Quanto tempo é esperado demorar para engravidar?' };
    }
  }

  return null;
}
