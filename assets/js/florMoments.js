/**
 * Os momentos da Flor — mensagens que chegam quando algo acontece.
 *
 * Diferente da pergunta diária, que é rotina, estas são raras: existem para
 * os dias que a mulher vai lembrar. E todas obedecem à essência do app, que
 * precisa sobreviver até o fim da jornada: **o Florescer nasceu para cuidar
 * da mulher**, não do bebê. No pós-parto isso fica mais difícil e mais
 * importante — é o período em que todo mundo passa a perguntar dele.
 *
 * Por isso nenhuma mensagem daqui mede o bebê, compara desenvolvimento ou
 * sugere o que ela deveria estar fazendo. Elas falam com ela.
 *
 * Cada momento tem uma JANELA, não um dia exato: se ela registrar o
 * nascimento quatro dias depois, a mensagem do nascimento ainda a alcança.
 * E cada uma aparece uma vez só, para sempre.
 */
import { diffDays, fromKey, pregnancyInfo, postpartumInfo, today, toKey } from './cycle.js';

/**
 * Os momentos, do mais específico para o mais geral.
 * `window(ctx)` devolve true enquanto a mensagem ainda faz sentido.
 */
const MOMENTS = [
  /* ---------- nascimento e primeiros dias ---------- */
  {
    id: 'nascimento',
    phases: ['posparto'],
    title: 'Hoje nasceu um bebê, mas também nasce uma mãe',
    text: 'Você não precisa acertar tudo. Seu bebê não precisa de uma mãe perfeita — ele precisa de você.',
    window: (ctx) => ctx.pp.known && ctx.pp.days <= 1,
    journey: ['baby', 'A Flor me disse que também nasceu uma mãe'],
  },
  {
    id: 'primeira-noite',
    phases: ['posparto'],
    title: 'Respire. Um dia de cada vez',
    text: 'Talvez hoje tenha sido um dia difícil. Talvez você tenha chorado. Talvez esteja cansada. Respire, um dia de cada vez.',
    window: (ctx) => ctx.pp.known && ctx.pp.days >= 2 && ctx.pp.days <= 5,
  },
  {
    id: 'primeira-semana',
    phases: ['posparto'],
    title: 'Uma semana',
    text: 'Sete dias que provavelmente não pareceram sete. Você atravessou cada um deles, inclusive os que ninguém viu.',
    window: (ctx) => ctx.pp.known && ctx.pp.days >= 7 && ctx.pp.days <= 11,
  },
  {
    id: 'quarentena',
    phases: ['posparto'],
    title: 'Quarenta dias',
    text: 'É o tempo que costumam dar para o seu corpo se recuperar. Se você ainda não se sente a mesma, não é atraso seu — é que esse prazo nunca coube em todo mundo.',
    window: (ctx) => ctx.pp.known && ctx.pp.days >= 40 && ctx.pp.days <= 46,
    link: { label: 'Falar com a Flor', to: 'flor' },
  },
  {
    id: 'seis-meses',
    phases: ['posparto'],
    title: 'Olhe para trás',
    text: 'Veja tudo o que vocês já viveram juntos. Você conseguiu.',
    window: (ctx) => ctx.pp.known && ctx.pp.months >= 6 && ctx.pp.months < 7,
    journey: ['heart', 'Seis meses de maternidade'],
  },
  {
    id: 'um-ano',
    phases: ['posparto'],
    title: 'Um ano',
    text: 'Faz um ano que você virou mãe. Hoje a festa costuma ser dele — mas quem atravessou esse ano inteiro foi você também.',
    window: (ctx) => ctx.pp.known && ctx.pp.months >= 12 && ctx.pp.months < 13,
    journey: ['heart', 'Um ano de maternidade'],
  },

  /* ---------- gestação ---------- */
  {
    id: 'fim-primeiro-tri',
    phases: ['gravida'],
    title: 'Primeiro trimestre atravessado',
    text: 'Foi provavelmente o trimestre mais silencioso: enjoo, cansaço e medo que muita gente vive sem contar a ninguém. Você chegou até aqui.',
    window: (ctx) => ctx.preg.known && ctx.preg.weeks >= 13 && ctx.preg.weeks <= 14,
  },
  {
    id: 'metade',
    phases: ['gravida'],
    title: 'Metade do caminho',
    text: 'Vinte semanas. Daqui para a frente as pessoas vão perguntar cada vez mais do bebê. Eu continuo perguntando de você.',
    window: (ctx) => ctx.preg.known && ctx.preg.weeks >= 20 && ctx.preg.weeks <= 21,
    journey: ['pregnant', 'Metade da gestação'],
  },
  {
    id: 'terceiro-tri',
    phases: ['gravida'],
    title: 'Último trimestre',
    text: 'O corpo começa a pedir mais calma, e tudo bem diminuir o ritmo. Cansaço nesta fase não é falta de preparo: é o que está acontecendo com você.',
    window: (ctx) => ctx.preg.known && ctx.preg.weeks >= 28 && ctx.preg.weeks <= 29,
  },
  {
    id: 'termo',
    phases: ['gravida'],
    title: 'A partir de agora pode ser a qualquer momento',
    text: 'Você chegou nas 37 semanas. Não existe dia certo nem jeito certo de esperar — e estar com medo não significa que você não está pronta.',
    window: (ctx) => ctx.preg.known && ctx.preg.weeks >= 37 && ctx.preg.weeks <= 38,
  },
  {
    id: 'passou-da-dpp',
    phases: ['gravida'],
    title: 'A data passou, e isso acontece',
    text: 'A DPP sempre foi uma estimativa, não um compromisso. A maioria dos partos acontece entre 37 e 42 semanas — e a espera depois da data é a parte mais longa de todas.',
    window: (ctx) => ctx.preg.known && ctx.preg.daysLeft < 0 && ctx.preg.daysLeft >= -10,
    link: { label: 'Sinais de trabalho de parto', to: 'flor' },
  },

  /* ---------- tentante ---------- */
  {
    id: 'positivo',
    phases: ['gravida'],
    title: 'Era você quem estava esperando por isso',
    text: 'Antes de virar notícia para os outros, esse resultado é seu. Pode sentir o que vier: alegria, alívio, susto, tudo junto.',
    window: (ctx) => ctx.preg.known && ctx.preg.weeks <= 12 && ctx.positiveDays !== null && ctx.positiveDays <= 3,
  },
  {
    id: 'um-ano-tentando',
    phases: ['tentante'],
    title: 'Faz um tempo que você está nessa espera',
    text: 'Quero dizer uma coisa que talvez ninguém tenha dito: isso não é culpa sua, e cansar não é desistir. Procurar ajuda agora é trocar a espera por informação.',
    window: (ctx) => ctx.state?.profile?.tryingFor === 'mais_1a' && ctx.appDays >= 30,
    link: { label: 'Falar com a Flor', to: 'flor' },
  },
];

export const MOMENT_IDS = MOMENTS.map((item) => item.id);

function context(state, ref) {
  const positive = (state?.pregnancyTests || [])
    .filter((test) => test?.result === 'positivo')
    .map((test) => test.date)
    .sort()
    .pop();

  return {
    state,
    ref,
    phase: state?.profile?.phase || 'tentante',
    preg: pregnancyInfo(state, ref),
    pp: postpartumInfo(state, ref),
    positiveDays: positive ? diffDays(ref, fromKey(positive)) : null,
    appDays: state?.createdAt ? Math.max(0, diffDays(ref, new Date(state.createdAt))) : 0,
  };
}

const seenList = (state) => (Array.isArray(state?.florMoments?.seen) ? state.florMoments.seen : []);

/**
 * O momento que vale para hoje e que ela ainda não viu, ou `null`.
 * Só um por dia: duas cartas no mesmo dia tiram o peso das duas.
 */
export function momentOfDay(state, ref = today()) {
  const ctx = context(state, ref);
  const seen = new Set(seenList(state));

  for (const moment of MOMENTS) {
    if (seen.has(moment.id)) continue;
    if (!moment.phases.includes(ctx.phase)) continue;
    let aplica = false;
    try { aplica = !!moment.window(ctx); } catch { aplica = false; }
    if (aplica) return { ...moment, day: toKey(ref) };
  }
  return null;
}

export const momentById = (id) => MOMENTS.find((item) => item.id === id) || null;
export const momentSeen = (state, id) => seenList(state).includes(id);

/** Marca como vista. Uma vez só, para sempre — não existe repetir um momento. */
export function markMomentSeen(state, id) {
  if (!momentById(id)) return false;
  if (!state.florMoments || typeof state.florMoments !== 'object') state.florMoments = { seen: [] };
  if (!Array.isArray(state.florMoments.seen)) state.florMoments.seen = [];
  if (state.florMoments.seen.includes(id)) return false;
  state.florMoments.seen.push(id);
  return true;
}

export const MOMENTS_ALL = MOMENTS;
