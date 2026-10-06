/**
 * Acolhimento depois de um teste negativo.
 *
 * Um resultado negativo não é um dado a registrar e seguir em frente: é o fim
 * de um mês que ela já tinha imaginado inteiro. Esta tela existe para que o app
 * não responda a esse momento com um toast e uma volta para a home.
 *
 * Regras que valem para todo o texto daqui:
 *  - não prometer resultado ("vai dar certo no próximo", "é só relaxar");
 *  - não explicar a causa do negativo, nem sugerir o que ela deveria ter feito;
 *  - não indicar medicamento, suplemento, dose nem exame — só encaminhar;
 *  - não exigir nada dela: cada caminho pode terminar sem ação nenhuma.
 *
 * O conteúdo fica aqui, separado da tela, para ser revisado e testado sem DOM.
 */
import { addDays, cycleInfo, diffDays, fmtFull, plural, today } from './cycle.js';

/** Abertura da Flor. A ênfase é dado, não HTML: quem renderiza decide o estilo. */
export const COMFORT_OPENING = {
  text: 'Eu sei que o seu coração está apertado agora. Não vou pedir para você fingir que está tudo bem.',
  lead: 'Só quero te lembrar de uma coisa:',
  emphasis: 'Você não está sozinha.',
};

export function comfortGreeting(profile) {
  const first = String(profile?.name || '').trim().split(/\s+/)[0];
  return first ? `Oi, ${first}. Eu sou a Flor.` : 'Oi. Eu sou a Flor.';
}

/** Os quatro caminhos oferecidos depois da abertura. */
export const COMFORT_PATHS = [
  {
    id: 'acolhida',
    icon: 'heartFill',
    label: 'Quero ser acolhida',
    hint: 'Uma palavra sem pressa e sem cobrança.',
  },
  {
    id: 'desabafo',
    icon: 'note',
    label: 'Colocar meus sentimentos para fora',
    hint: 'Um espaço em branco só seu, para escrever.',
  },
  {
    id: 'proximo',
    icon: 'seed',
    label: 'Quero me preparar para o próximo ciclo',
    hint: 'O essencial, com as suas datas.',
  },
  {
    id: 'silencio',
    icon: 'moon',
    label: 'Só quero ficar quietinha por enquanto',
    hint: 'Tudo bem não querer nada agora.',
  },
];

export const COMFORT_PATH_IDS = COMFORT_PATHS.map((path) => path.id);

/* ---------------------------------------------------------------
   1. Acolhimento
   Várias mensagens porque o negativo se repete: na terceira vez,
   receber o mesmo texto de novo soa a automático.
   --------------------------------------------------------------- */
export const COMFORT_MESSAGES = [
  {
    id: 'luto',
    title: 'Isso que você sente tem nome',
    text: 'É luto. Não pelo que você perdeu, mas pelo que ainda não chegou — e a cada ciclo você se despede de novo de um mês que já tinha imaginado inteiro.',
    bullets: [
      'Uma dor não precisa ser comparada com a de ninguém para ter o direito de existir.',
      'Você não está exagerando. Você está triste, e isso faz sentido.',
    ],
  },
  {
    id: 'valor',
    title: 'Um teste não mede você',
    text: 'Ele responde uma pergunta só, sobre um ciclo só. Não diz nada sobre o seu valor, nem sobre o seu corpo ter falhado — porque ele não falhou.',
    bullets: [
      'Não existe o pensamento certo, a comida certa nem o repouso certo que teriam garantido outro resultado.',
      'Um resultado negativo é o resultado deste mês, não uma sentença sobre todos os outros.',
    ],
  },
  {
    id: 'forca',
    title: 'Você não precisa ser forte hoje',
    text: 'Pode chorar, pode não querer conversar, pode cancelar o que der para cancelar. Força também é deixar o dia ser difícil sem fingir que não é.',
    bullets: [
      '“Relaxa que acontece” não é conselho: é o desconforto de quem não soube o que dizer. Você não precisa aceitar isso como verdade.',
      'Se alguém perguntar, você pode simplesmente dizer que hoje não quer falar sobre isso.',
    ],
  },
  {
    id: 'companhia',
    title: 'Muita gente está nisso em silêncio',
    text: 'Essa espera costuma ser vivida escondida, entre perguntas em almoço de família e fotos de chá de bebê. Isso faz parecer que é só com você. Não é.',
    bullets: [
      'Se puder, procure uma pessoa que escute sem tentar resolver.',
      'Se a tristeza estiver tomando os seus dias sem dar trégua, procurar apoio psicológico é cuidado, não fraqueza.',
    ],
  },
];

/** Percorre as mensagens em ciclo, aceitando índice negativo. */
export function comfortMessage(index = 0) {
  const total = COMFORT_MESSAGES.length;
  const safe = Number.isFinite(Number(index)) ? Math.trunc(Number(index)) : 0;
  return COMFORT_MESSAGES[((safe % total) + total) % total];
}

/* ---------------------------------------------------------------
   2. Desabafo
   --------------------------------------------------------------- */
export const COMFORT_WRITING_PROMPTS = [
  'O que mais dói agora é…',
  'Hoje eu precisava ouvir que…',
  'O que eu queria ter dito e não disse…',
  'Uma coisa que me fez bem hoje…',
];

export const COMFORT_WRITING_MAX = 2000;

/**
 * Junta o desabafo às observações que já existirem no dia, sem apagar nada.
 * Devolve `null` quando não há texto novo, para o chamador não salvar à toa.
 */
export function appendToNotes(existing, text) {
  const novo = String(text || '').trim();
  if (!novo) return null;
  const antigo = String(existing || '').trim();
  return antigo ? `${antigo}\n\n${novo}` : novo;
}

/* ---------------------------------------------------------------
   3. Preparar o próximo ciclo
   --------------------------------------------------------------- */

/**
 * A janela fértil que ainda não terminou, projetando o ciclo seguinte se preciso.
 * `current` distingue a janela que já começou da que ainda vai chegar — são
 * duas frases diferentes para ela ler.
 */
export function nextFertileWindow(cycle, ref = today()) {
  if (!cycle?.known) return null;
  let ovulation = cycle.ovulation;
  let guard = 0;
  // a janela só interessa enquanto não terminou; passou, projeta a do ciclo seguinte
  while (diffDays(addDays(ovulation, 1), ref) < 0 && guard++ < 24) {
    ovulation = addDays(ovulation, cycle.avgLength);
  }
  const start = addDays(ovulation, -5);
  return { ovulation, start, end: addDays(ovulation, 1), current: diffDays(ref, start) >= 0 };
}

/**
 * O essencial do próximo ciclo, montado com os dados reais dela.
 * @returns {{known:boolean, facts:Array, bullets:string[], warning:string, link?:object}}
 */
export function nextCycleBriefing(state, ref = today()) {
  const cycle = cycleInfo(state, ref);

  if (!cycle.known) {
    return {
      known: false,
      facts: [],
      bullets: [
        'Assim que a próxima menstruação vier, marque o primeiro dia dela no app: é desse registro que saem todas as estimativas.',
        'Com dois ou três ciclos registrados, a previsão da janela fértil já fica bem mais firme.',
      ],
      warning: 'Sem a data da última menstruação eu não consigo calcular nada — e prefiro não chutar.',
      link: { label: 'Informar a última menstruação', to: 'perfil' },
    };
  }

  const facts = [];
  const atraso = -cycle.daysToPeriod;

  if (cycle.daysToPeriod > 0) {
    facts.push({
      label: 'Próxima menstruação',
      value: fmtFull(cycle.nextPeriod),
      hint: `estimativa: daqui a ${plural(cycle.daysToPeriod, 'dia', 'dias')}`,
    });
  } else if (cycle.daysToPeriod === 0) {
    facts.push({ label: 'Próxima menstruação', value: fmtFull(cycle.nextPeriod), hint: 'estimativa: é hoje' });
  } else {
    facts.push({
      label: 'Menstruação prevista',
      value: fmtFull(cycle.nextPeriod),
      hint: `${plural(atraso, 'dia', 'dias')} além da estimativa`,
    });
  }

  const fertil = nextFertileWindow(cycle, ref);
  if (fertil) {
    facts.push({
      label: fertil.current ? 'Janela fértil em curso' : 'Próxima janela fértil',
      value: `${fmtFull(fertil.start)} a ${fmtFull(fertil.end)}`,
      hint: `ovulação estimada em ${fmtFull(fertil.ovulation)}`,
    });
  }

  facts.push({
    label: 'Ciclo médio',
    value: plural(cycle.avgLength, 'dia', 'dias'),
    hint: cycle.cyclesTracked
      ? `calculado com ${plural(cycle.cyclesTracked, 'ciclo registrado', 'ciclos registrados')}`
      : 'ainda sem ciclos registrados — valor informado por você',
  });

  const bullets = [];

  if (atraso > 0) {
    bullets.push('Menstruação atrasada com teste negativo acontece, e o motivo mais comum é a ovulação ter vindo mais tarde do que a estimativa. Se o atraso continuar, repita o teste em 3 a 5 dias.');
  }

  bullets.push('Marque o primeiro dia da próxima menstruação assim que ela vier: é o registro que corrige todas as outras datas.');
  bullets.push('Anotar muco e temperatura basal por um ciclo inteiro deixa a janela fértil bem mais precisa do que a média sozinha.');
  bullets.push('Relações a cada 1 ou 2 dias dentro da janela é a orientação mais comum — sem transformar o calendário em obrigação.');

  if (cycle.cyclesTracked < 3) {
    bullets.push('Com menos de três ciclos registrados, estas datas ainda são um esboço. Elas melhoram sozinhas conforme você registra.');
  }

  if (state?.profile?.tryingFor === 'mais_1a') {
    bullets.push('Você marcou que tenta há mais de um ano. Esse costuma ser o momento de procurar avaliação de fertilidade — não é desistir, é trocar a espera por informação.');
  }

  bullets.push('Ácido fólico e os outros cuidados pré-concepcionais devem ser conversados com o seu médico, nunca iniciados por conta própria.');

  return {
    known: true,
    facts,
    bullets,
    warning: 'Todas as datas aqui são estimativas do seu próprio histórico. Elas não confirmam que a ovulação vai acontecer nesse dia.',
    link: { label: 'Ver no calendário', to: 'ciclo' },
  };
}

/* ---------------------------------------------------------------
   4. Silêncio
   --------------------------------------------------------------- */
export const COMFORT_SILENCE = {
  title: 'Tudo bem ficar quietinha',
  text: 'Você não precisa processar isso hoje, nem transformar em aprendizado, nem achar o lado bom. Pode só atravessar o dia.',
  bullets: [
    'Nada aqui precisa de resposta. Pode fechar o app agora, sem terminar nada.',
    'Quando você quiser voltar, a Flor está aqui — e não vai perguntar por que você demorou.',
  ],
};
