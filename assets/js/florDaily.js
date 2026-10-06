/**
 * A mensagem diária da Flor.
 *
 * A ideia veio de uma observação simples e certeira: todo mundo manda
 * mensagem perguntando do bebê, e quase ninguém pergunta dela. Então uma vez
 * por dia a Flor pergunta — e, diferente das outras telas do app, essa
 * pergunta não quer dado nenhum. Ela só quer saber como a mãe está.
 *
 * Regras que vêm junto:
 *  - responder é opcional e dispensar não tem custo nenhum;
 *  - nenhuma resposta é cobrada, celebrada demais ou corrigida;
 *  - humor baixo não vira alerta nem sermão: vira acolhimento e um caminho.
 */
import { MOODS } from './content.js';
import { toKey, today } from './cycle.js';

/* ---------------------------------------------------------------
   As mensagens
   A primeira de cada fase é a âncora: é a pergunta que o app existe
   para fazer. As outras evitam que ela vire papel de parede.
   --------------------------------------------------------------- */
const MESSAGES = {
  gravida: [
    {
      id: 'como-voce-esta',
      title: 'Mamãe, como você está hoje?',
      text: 'Essa pergunta pode parecer simples, mas faz toda a diferença. Muitas mães recebem mensagem perguntando do bebê, e quase ninguém pergunta por elas.',
    },
    {
      id: 'descanso',
      title: 'Você conseguiu descansar?',
      text: 'Não estou perguntando se você dormiu as oito horas. Estou perguntando se teve algum momento no seu dia que foi só seu.',
    },
    {
      id: 'medo',
      title: 'Tem algum medo rondando?',
      text: 'Medo na gestação é mais comum do que as pessoas contam. Falar sobre ele não atrai nada de ruim — costuma aliviar.',
    },
    {
      id: 'corpo',
      title: 'Como o seu corpo está hoje?',
      text: 'Ele está fazendo uma coisa enorme. É esperado que peça mais calma em alguns dias do que em outros.',
    },
    {
      id: 'rede',
      title: 'Tem alguém olhando por você?',
      text: 'Não só pelo bebê: por você. Se a resposta for não, isso também é importante de perceber.',
    },
  ],
  posparto: [
    {
      id: 'como-voce-esta',
      title: 'Mamãe, como você está hoje?',
      text: 'Essa pergunta pode parecer simples, mas faz toda a diferença. Todo mundo quer saber do bebê, e quase ninguém pergunta por você.',
    },
    {
      id: 'comer',
      title: 'Você comeu hoje?',
      text: 'Sem julgamento nenhum na pergunta. Nos primeiros meses, essa é das primeiras coisas que somem da rotina.',
    },
    {
      id: 'ajuda',
      title: 'Você pediu ajuda esta semana?',
      text: 'Pedir não é fraqueza nem falta de amor. É o que torna possível seguir.',
    },
    {
      id: 'voce-tambem',
      title: 'Como você está se sentindo?',
      text: 'Não é sobre as mamadas, o sono ou o peso dele. É sobre você — e não existe resposta errada.',
    },
  ],
  tentante: [
    {
      id: 'como-voce-esta',
      title: 'E você, como está hoje?',
      text: 'Nessa espera, quase toda conversa acaba virando "e aí, alguma novidade?". Aqui a pergunta é outra: como você está?',
    },
    {
      id: 'cansaco',
      title: 'Como está o seu cansaço?',
      text: 'Tentar é cansativo de um jeito que nem sempre aparece. Pode ser um dia leve, pode ser um dia pesado — os dois valem.',
    },
    {
      id: 'expectativa',
      title: 'A espera está pesando?',
      text: 'Tem dia em que dá para levar. Tem dia em que não dá. Você não precisa estar bem para merecer um dia tranquilo.',
    },
    {
      id: 'voce-alem',
      title: 'O que te fez bem hoje?',
      text: 'Pode ser pequeno. Uma música, um banho demorado, uma conversa. Nem tudo no seu dia precisa ser sobre o ciclo.',
    },
  ],
};

/** Mesma mensagem o dia inteiro, mensagem diferente a cada dia. */
function pick(list, key) {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) hash = (hash * 31 + key.charCodeAt(i)) % 100000;
  return list[hash % list.length];
}

export function dailyMessage(state, ref = today()) {
  const phase = state?.profile?.phase || 'tentante';
  const list = MESSAGES[phase] || MESSAGES.tentante;
  const day = toKey(ref);
  const first = String(state?.profile?.name || '').trim().split(/\s+/)[0];

  // Na estreia, a pergunta âncora: é ela que explica o porquê de tudo isso.
  // O corte é por DIA ANTERIOR, não por "já respondeu": responder de manhã
  // não pode trocar a pergunta que ela vê de tarde.
  const daily = state?.florDaily || {};
  const antes = [...Object.keys(daily.answers || {}), ...(daily.dismissed || [])];
  const estreia = !antes.some((key) => key < day);
  const message = estreia ? list[0] : pick(list, day);

  return { ...message, day, phase, greeting: first || null, heading: heading(message.title, first) };
}

/**
 * O título já com o nome dela, montado num lugar só.
 * Quando o título começa por "Mamãe", o nome entra NO LUGAR dele: juntar os
 * dois daria "Marcele, mamãe, como você está hoje?".
 */
export function heading(title, first) {
  if (!first) return title;
  const semMamae = title.replace(/^Mam[ãa]e,\s*/i, '');
  if (semMamae !== title) {
    return `${first}, ${semMamae.charAt(0).toLowerCase()}${semMamae.slice(1)}`;
  }
  return `${first}, ${title.charAt(0).toLowerCase()}${title.slice(1)}`;
}

/** Já respondeu ou dispensou a de hoje? */
export function dailyHandled(state, ref = today()) {
  const day = toKey(ref);
  const daily = state?.florDaily || {};
  return !!daily.answers?.[day] || (daily.dismissed || []).includes(day);
}

export const dailyAnswer = (state, ref = today()) => state?.florDaily?.answers?.[toKey(ref)] || null;

/* ---------------------------------------------------------------
   A resposta da Flor ao que ela contou
   Sem promessa, sem correção, sem "que bom, isso ajuda o bebê".
   --------------------------------------------------------------- */
const REPLIES = [
  {
    mood: 0,
    title: 'Obrigada por contar',
    text: 'Dia triste é dia triste, e você não precisa transformar isso em aprendizado agora. Pode só atravessar.',
    bullets: ['Se quiser colocar para fora, eu guardo aqui com você — sem ninguém lendo.'],
    link: { label: 'Escrever o que estou sentindo', to: 'acolhimento' },
  },
  {
    mood: 1,
    title: 'A ansiedade cansa',
    text: 'Ela ocupa espaço mesmo quando nada está acontecendo. Perceber que ela está aí já é diferente de ser levada por ela.',
    bullets: ['Se isso estiver tomando os seus dias sem trégua, procurar apoio psicológico é cuidado, não exagero.'],
    link: { label: 'Falar com a Flor', to: 'flor' },
  },
  {
    mood: 2,
    title: 'Dia neutro também conta',
    text: 'Nem todo dia precisa ser bom ou ruim. Atravessar sem grandes acontecimentos é um resultado legítimo.',
    bullets: [],
  },
  {
    mood: 3,
    title: 'Que bom saber',
    text: 'Fico contente que hoje esteja indo bem. Guardei aqui — nos dias difíceis, ajuda lembrar que este também existiu.',
    bullets: [],
  },
  {
    mood: 4,
    title: 'Guardei esse dia',
    text: 'Dias assim merecem ser registrados do mesmo jeito que os difíceis. Eles contam a sua história inteira.',
    bullets: [],
    link: { label: 'Ver a minha jornada', to: 'perfil' },
  },
];

/** A resposta da Flor para o humor escolhido. */
export function dailyReply(mood) {
  const index = Number.isInteger(mood) && mood >= 0 && mood < MOODS.length ? mood : 2;
  return REPLIES[index];
}

export const DAILY_MESSAGE_IDS = Object.fromEntries(
  Object.entries(MESSAGES).map(([phase, list]) => [phase, list.map((item) => item.id)]),
);

export const DAILY_MESSAGES = MESSAGES;
