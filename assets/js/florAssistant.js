/**
 * IA Flor — assistente de dúvidas sobre ciclo, menstruação, hormônios e fertilidade.
 *
 * Como funciona: a pergunta é normalizada e comparada com uma base de intenções.
 * Cada resposta é escrita e revisada previamente e, quando faz sentido, é
 * completada com os dados reais do ciclo da usuária (datas, médias, variação).
 *
 * Decisões de projeto:
 *  - conteúdo de saúde não é gerado na hora: nada de texto inventado sobre
 *    fertilidade, sintomas ou medicação;
 *  - sinais de alerta têm prioridade sobre qualquer outra intenção e sempre
 *    encaminham para atendimento;
 *  - a Flor nunca diagnostica, não interpreta exames e não indica medicamento.
 *
 * Para plugar um modelo de linguagem depois, troque apenas `askFlor` por uma
 * chamada ao servidor mantendo o mesmo formato de resposta — a camada de
 * segurança e de personalização continua valendo.
 */
import { cycleInfo, fmtShort, plural, relativeDay, today } from './cycle.js';
import { PREGNANCY_INTENTS, PREGNANCY_SUGGESTIONS, PREGNANCY_URGENT } from './florPregnancy.js';
import { florProfile } from './florProfile.js';

/* ---------------------------------------------------------------
   Normalização e pontuação
   --------------------------------------------------------------- */
export function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/* ---------------------------------------------------------------
   Sinais de alerta — sempre vêm antes de qualquer resposta educativa
   --------------------------------------------------------------- */
const URGENT = [
  {
    id: 'urgente-emocional',
    terms: ['me matar', 'suicidio', 'me machucar', 'tirar minha vida', 'nao quero mais viver', 'sumir do mundo'],
    title: 'Você não precisa passar por isso sozinha',
    answer: 'Sinto muito que você esteja carregando algo tão pesado. Isso merece acolhimento agora, não uma resposta de aplicativo.',
    bullets: [
      'No Brasil, o CVV atende de graça pelo 188, 24 horas por dia, e também por chat no site cvv.org.br.',
      'Em emergência, procure o pronto-socorro mais próximo ou ligue 192 (SAMU).',
      'Se puder, conte agora para alguém de confiança que esteja por perto.',
    ],
  },
  {
    id: 'urgente-sangramento',
    terms: ['sangramento intenso', 'hemorragia', 'muito sangue', 'sangrando muito', 'perda de liquido', 'desmaiei', 'desmaio'],
    title: 'Isso precisa de avaliação presencial',
    answer: 'Pelo que você descreveu, o caminho não é uma resposta aqui: procure atendimento.',
    bullets: [
      'Sangramento intenso, perda de líquido, desmaio ou dor forte precisam de avaliação no mesmo dia.',
      'Se estiver grávida, procure a maternidade de referência, não a UPA comum.',
      'Vá acompanhada se puder e leve seus registros do app.',
    ],
  },
  {
    id: 'urgente-dor',
    terms: ['dor muito forte', 'dor insuportavel', 'nao aguento de dor', 'dor que nao passa', 'febre alta'],
    title: 'Dor assim não deve ser suportada em casa',
    answer: 'Cólica que incapacita, dor que não cede com o que você costuma usar ou febre alta pedem avaliação médica — não são “normais”.',
    bullets: [
      'Procure atendimento hoje, principalmente se houver febre, vômito ou desmaio junto.',
      'Anote quando começou, onde dói e o que você já tomou: isso ajuda muito no atendimento.',
    ],
  },
];

/* ---------------------------------------------------------------
   Base de conhecimento
   Cada intenção pode usar `ctx` para personalizar com os dados reais.
   --------------------------------------------------------------- */
const INTENTS = [
  {
    id: 'janela-fertil',
    terms: ['periodo fertil', 'janela fertil', 'quando sou fertil', 'dias ferteis', 'meu fertil', 'estou fertil'],
    title: 'Seu período fértil',
    build: (ctx) => {
      if (!ctx.cycle.known) {
        return {
          answer: 'Ainda não tenho a data da sua última menstruação, então não consigo calcular a sua janela. Assim que você registrar, eu mostro os dias aqui.',
          bullets: ['A janela fértil vai de 5 dias antes da ovulação até 1 dia depois dela.'],
          link: { label: 'Informar a última menstruação', to: 'perfil' },
        };
      }
      const c = ctx.cycle;
      return {
        answer: `A sua janela fértil estimada vai de ${fmtShort(c.fertileStart)} a ${fmtShort(c.fertileEnd)}, com a ovulação prevista para ${fmtShort(c.ovulation)} (${relativeDay(c.ovulation)}).`,
        bullets: [
          'Os espermatozoides sobrevivem até 5 dias no corpo e o óvulo cerca de 24 horas — por isso a chance começa antes da ovulação.',
          'Relações a cada 1 ou 2 dias dentro da janela são a recomendação mais comum, sem transformar o dia certo em obrigação.',
          'É uma estimativa do seu histórico, não uma confirmação de que a ovulação vai acontecer nessa data.',
        ],
        link: { label: 'Ver no calendário', to: 'ciclo' },
      };
    },
  },
  {
    id: 'ovulacao-quando',
    terms: ['quando vou ovular', 'dia da ovulacao', 'quando ovulo', 'ja ovulei', 'ovulacao prevista'],
    title: 'Quando você deve ovular',
    build: (ctx) => {
      if (!ctx.cycle.known) {
        return {
          answer: 'Preciso da data da sua última menstruação para estimar a ovulação.',
          link: { label: 'Informar no perfil', to: 'perfil' },
        };
      }
      const c = ctx.cycle;
      const passou = c.daysToOvulation < 0;
      return {
        answer: passou
          ? `A ovulação estimada foi em ${fmtShort(c.ovulation)}, ${relativeDay(c.ovulation)}. Agora você está na fase lútea, a espera até a próxima menstruação.`
          : `A ovulação está prevista para ${fmtShort(c.ovulation)} — ${relativeDay(c.ovulation)}.`,
        bullets: [
          'O cálculo usa a sua duração média de ciclo menos a fase lútea, hoje configurada em ' + ctx.luteal + ' dias.',
          'Teste de ovulação positivo indica que o pico de LH aconteceu e a ovulação costuma vir em 24 a 36 horas.',
          'A temperatura basal só sobe depois que a ovulação ocorreu — ela confirma, não antecipa.',
        ],
      };
    },
  },
  {
    id: 'proxima-menstruacao',
    terms: ['quando vem minha menstruacao', 'proxima menstruacao', 'quando menstruo', 'vai descer', 'quando desce'],
    title: 'Sua próxima menstruação',
    build: (ctx) => {
      if (!ctx.cycle.known) {
        return { answer: 'Assim que você registrar a última menstruação, eu passo a estimar a próxima.', link: { label: 'Informar no perfil', to: 'perfil' } };
      }
      const c = ctx.cycle;
      return {
        answer: `A previsão é ${fmtShort(c.nextPeriod)}, ${relativeDay(c.nextPeriod)}. Hoje você está no dia ${c.dayOfCycle} de um ciclo médio de ${c.avgLength} dias.`,
        bullets: [
          c.cyclesTracked
            ? `Esse número vem dos seus ${plural(c.cyclesTracked, 'ciclo registrado', 'ciclos registrados')} — quanto mais você registra, mais a previsão acerta.`
            : 'Ainda estou usando o valor que você informou no cadastro. Com dois ciclos registrados a previsão melhora bastante.',
          'Variações de alguns dias são normais: estresse, sono, doença e viagem mexem com o ciclo.',
        ],
      };
    },
  },
  {
    id: 'ciclo-normal',
    terms: ['meu ciclo e normal', 'ciclo irregular', 'ciclo regular', 'ciclo desregulado', 'variacao do ciclo', 'ciclo normal'],
    title: 'Seu ciclo está dentro do esperado?',
    build: (ctx) => {
      const c = ctx.cycle;
      const base = [
        'Ciclos entre 21 e 35 dias são considerados dentro do esperado para adultas.',
        'Variação de até 7 a 9 dias entre um ciclo e outro ainda é comum; acima disso costuma ser chamado de irregular.',
        'Ciclos que somem por 3 meses ou mais, ou que vêm a cada menos de 21 dias, merecem investigação.',
      ];
      if (!c.known || !c.cyclesTracked) {
        return { answer: 'Ainda não tenho ciclos completos registrados para comparar o seu padrão.', bullets: base };
      }
      const diag = c.variance === null
        ? `Você tem ${plural(c.cyclesTracked, 'ciclo registrado', 'ciclos registrados')}. Com mais um eu já consigo calcular a sua variação.`
        : c.variance <= 4
          ? `Pelos seus registros, a média é de ${c.avgLength} dias e a variação entre ciclos é de ${plural(c.variance, 'dia', 'dias')} — um padrão regular.`
          : `Pelos seus registros, a média é de ${c.avgLength} dias e a variação chega a ${plural(c.variance, 'dia', 'dias')}, o que indica um ciclo mais irregular.`;
      return { answer: diag, bullets: base, link: { label: 'Ver meus relatórios', to: 'relatorios' } };
    },
  },
  {
    id: 'fases-ciclo',
    terms: ['fases do ciclo', 'como funciona o ciclo', 'o que e o ciclo menstrual', 'etapas do ciclo', 'fase folicular', 'fase lutea'],
    title: 'As fases do ciclo',
    build: () => ({
      answer: 'O ciclo começa no primeiro dia da menstruação e termina na véspera da próxima. Ele tem quatro fases encadeadas.',
      bullets: [
        'Menstrual: o endométrio descama porque estrogênio e progesterona caíram.',
        'Folicular: o FSH faz folículos amadurecerem e o estrogênio sobe, reconstruindo o endométrio.',
        'Ovulatória: o pico de LH libera o óvulo. É a fase de maior fertilidade.',
        'Lútea: a progesterona domina e prepara o útero. Se não houver implantação, ela cai e a menstruação vem.',
      ],
      link: { label: 'Ver a linha do tempo do meu ciclo', to: 'linha-do-tempo' },
    }),
  },
  {
    id: 'hormonios',
    terms: ['hormonio', 'hormonios', 'estrogenio', 'progesterona', 'lh', 'fsh', 'prolactina'],
    title: 'Os hormônios do ciclo',
    build: () => ({
      answer: 'Quatro hormônios conduzem o ciclo, cada um com um papel e um momento.',
      bullets: [
        'FSH: estimula os folículos a amadurecer no início do ciclo.',
        'Estrogênio: sobe na primeira metade, engrossa o endométrio e deixa o muco mais fértil.',
        'LH: tem um pico que dispara a ovulação — é ele que o teste de ovulação detecta.',
        'Progesterona: sobe depois da ovulação e segura o endométrio. A queda dela traz a menstruação e boa parte dos sintomas de TPM.',
      ],
    }),
  },
  {
    id: 'muco',
    terms: ['muco', 'corrimento', 'clara de ovo', 'secrecao', 'muco cervical'],
    title: 'Muco cervical',
    build: () => ({
      answer: 'O muco muda ao longo do ciclo e é o sinal de fertilidade mais acessível, porque não custa nada observar.',
      bullets: [
        'Depois da menstruação costuma ser seco ou pegajoso.',
        'Conforme a ovulação se aproxima fica cremoso, depois aquoso.',
        'No auge da fertilidade fica transparente e elástico, parecido com clara de ovo — ele ajuda os espermatozoides a sobreviverem e se moverem.',
        'Depois da ovulação volta a ficar espesso e escasso.',
      ],
      bullets2: 'Corrimento com cheiro forte, cor amarelada ou esverdeada, coceira ou ardência não é muco fértil e merece avaliação.',
    }),
  },
  {
    id: 'temperatura',
    terms: ['temperatura basal', 'tbc', 'medir temperatura', 'termometro'],
    title: 'Temperatura basal',
    build: () => ({
      answer: 'A temperatura basal sobe de 0,2 a 0,5 °C depois que a ovulação acontece, por ação da progesterona, e fica alta até a menstruação.',
      bullets: [
        'Meça ao acordar, antes de levantar, falar ou beber, sempre no mesmo horário.',
        'Serve para confirmar que você ovulou e entender o seu padrão — não para avisar antes.',
        'Noite mal dormida, álcool, febre e horário diferente alteram a medida daquele dia.',
      ],
    }),
  },
  {
    id: 'teste-ovulacao',
    terms: ['teste de ovulacao', 'teste de lh', 'bastao', 'teste ovulatorio'],
    title: 'Teste de ovulação',
    build: () => ({
      answer: 'O teste detecta o pico de LH, que antecede a ovulação em cerca de 24 a 36 horas.',
      bullets: [
        'Faça entre 10h e 20h, com pelo menos duas horas sem urinar e sem beber muito líquido antes.',
        'Comece alguns dias antes da ovulação estimada e repita todo dia até positivar.',
        'Positivo é quando a segunda linha fica igual ou mais forte que a de controle — diferente do teste de gravidez.',
        'Positivo indica que o pico aconteceu, não que a ovulação está garantida.',
      ],
    }),
  },
  {
    id: 'colica',
    terms: ['colica', 'dor na menstruacao', 'dor abdominal', 'dismenorreia', 'dor no periodo'],
    title: 'Cólica menstrual',
    build: () => ({
      answer: 'A cólica vem das contrações do útero para eliminar o endométrio, estimuladas por substâncias chamadas prostaglandinas.',
      bullets: [
        'Calor local, movimento leve e repouso costumam aliviar.',
        'Analgésico e anti-inflamatório ajudam, mas quem indica qual e quanto é o seu médico.',
        'Registrar a intensidade ajuda a mostrar o padrão na consulta.',
      ],
      bullets2: 'Cólica que impede você de trabalhar ou estudar, que piora a cada ciclo ou que não cede com o de sempre não é normal — pode ser endometriose e merece investigação.',
    }),
  },
  {
    id: 'tpm',
    terms: ['tpm', 'tensao pre menstrual', 'sintomas antes da menstruacao', 'inchaco antes'],
    title: 'TPM',
    build: () => ({
      answer: 'Os sintomas aparecem na fase lútea, na semana ou duas antes da menstruação, e costumam passar nos primeiros dias do fluxo.',
      bullets: [
        'São comuns: inchaço, seios doloridos, irritabilidade, choro fácil, vontade de doce, sono irregular e dor de cabeça.',
        'Sono, movimento e reduzir cafeína e ultraprocessados nessa semana costumam ajudar.',
        'Registrar os sintomas mostra se eles seguem mesmo o seu ciclo.',
      ],
      bullets2: 'Quando os sintomas emocionais são intensos a ponto de atrapalhar a vida todo mês, pode ser TDPM — tem nome, tem tratamento e merece avaliação.',
    }),
  },
  {
    id: 'atraso',
    terms: ['atraso', 'atrasada', 'nao desceu', 'menstruacao atrasou', 'quando fazer o teste', 'teste de gravidez'],
    title: 'Atraso menstrual',
    build: (ctx) => {
      const c = ctx.cycle;
      const atraso = c.known && c.daysToPeriod < 0 ? Math.abs(c.daysToPeriod) : null;
      return {
        answer: atraso
          ? `Pelos meus cálculos, a menstruação está ${plural(atraso, 'dia', 'dias')} além da data prevista. Lembre que a previsão é uma estimativa e atrasos pequenos são comuns.`
          : 'Atrasos de poucos dias são comuns e nem sempre significam gravidez: estresse, sono, viagem, exercício intenso, doença e mudanças de peso mexem com o ciclo.',
        bullets: [
          'O teste de gravidez fica mais confiável a partir do primeiro dia de atraso, com a primeira urina do dia.',
          'Teste negativo com atraso que continua: repita em 3 a 5 dias.',
          'Dois ou mais ciclos sem menstruar, sem gravidez, merecem avaliação.',
        ],
        link: { label: 'Registrar um teste', to: 'teste-gravidez' },
      };
    },
  },
  {
    id: 'engravidar-menstruada',
    terms: ['engravidar menstruada', 'gravida menstruada', 'engravidar fora do periodo fertil', 'chance de engravidar'],
    title: 'Dá para engravidar fora da janela?',
    build: () => ({
      answer: 'A chance é bem menor, mas não é zero — e é por isso que o calendário não serve como método contraceptivo.',
      bullets: [
        'Os espermatozoides sobrevivem até 5 dias: uma relação no fim da menstruação pode alcançar uma ovulação precoce.',
        'Em ciclos curtos ou irregulares a ovulação pode acontecer bem antes do esperado.',
        'A janela do app é uma estimativa estatística, não uma garantia nos dois sentidos.',
      ],
    }),
  },
  {
    id: 'escape',
    terms: ['escape', 'spotting', 'sangramento no meio', 'borra', 'sangramento fora'],
    title: 'Sangramento de escape',
    build: () => ({
      answer: 'É um sangramento leve fora da menstruação, em geral marrom ou rosado, que não enche um absorvente.',
      bullets: [
        'Pode acontecer perto da ovulação, pela variação do estrogênio.',
        'Também é comum nos primeiros meses de anticoncepcional novo.',
        'Alguns casos ocorrem após relação, exame ou esforço.',
      ],
      bullets2: 'Escape que se repete todo mês, vem depois da relação com frequência ou vira sangramento volumoso precisa de avaliação.',
    }),
  },
  {
    id: 'fluxo',
    terms: ['fluxo intenso', 'quanto dura a menstruacao', 'duracao da menstruacao', 'muito fluxo', 'coagulos'],
    title: 'Duração e volume da menstruação',
    build: () => ({
      answer: 'A menstruação costuma durar de 2 a 7 dias, com volume maior nos primeiros dias.',
      bullets: [
        'Trocar o absorvente a cada 3 ou 4 horas é o esperado.',
        'Coágulos pequenos nos dias de fluxo intenso são comuns.',
      ],
      bullets2: 'Precisar trocar de hora em hora, ter coágulos maiores que uma moeda, sangrar mais de 7 dias ou sentir falta de ar e tontura pede avaliação — pode levar a anemia.',
    }),
  },
  {
    id: 'frequencia-relacao',
    terms: ['frequencia de relacao', 'quantas vezes transar', 'relacao todo dia', 'melhor dia para transar'],
    title: 'Frequência das tentativas',
    build: () => ({
      answer: 'A recomendação mais comum é relação a cada 1 ou 2 dias ao longo da janela fértil, em vez de mirar um único dia.',
      bullets: [
        'Isso mantém espermatozoides disponíveis quando a ovulação acontecer, mesmo que ela saia do previsto.',
        'Abstinência longa antes do dia "certo" não melhora as chances.',
        'Transformar a janela em tarefa costuma cobrar caro do casal — combinar expectativas ajuda tanto quanto o calendário.',
      ],
    }),
  },
  {
    id: 'quanto-tempo',
    terms: ['quanto tempo para engravidar', 'demorando para engravidar', 'nao consigo engravidar', 'procurar especialista', 'infertilidade'],
    title: 'Quanto tempo é esperado demorar',
    build: () => ({
      answer: 'A maioria dos casais que tentam engravidam no primeiro ano. Demorar alguns meses é o padrão, não a exceção.',
      bullets: [
        'Até 35 anos: investigar após 12 meses de tentativas sem sucesso.',
        'A partir dos 35 anos: investigar após 6 meses.',
        'Antecipe a consulta se houver ciclos muito irregulares ou ausentes, endometriose, SOP, cirurgia pélvica ou dois ou mais abortos.',
      ],
      link: { label: 'Ver o relatório para a consulta', to: 'relatorios' },
    }),
  },
  {
    id: 'anticoncepcional',
    terms: ['anticoncepcional', 'parei a pilula', 'diu', 'implante', 'volta da fertilidade'],
    title: 'Depois de parar o contraceptivo',
    build: () => ({
      answer: 'A fertilidade costuma voltar rápido na maioria dos métodos, mas o ciclo pode levar alguns meses para encontrar o próprio ritmo.',
      bullets: [
        'Pílula, DIU e implante: a fertilidade em geral retorna logo após a retirada ou a parada.',
        'Injetável trimestral é o que mais costuma demorar, podendo levar vários meses.',
        'Nos primeiros ciclos as previsões do app ficam menos precisas até aparecer um padrão.',
      ],
      bullets2: 'Se a menstruação não voltar em 3 meses após parar, vale procurar avaliação.',
    }),
  },
  {
    id: 'como-funciona',
    terms: ['quem e voce', 'como voce funciona', 'voce e um robo', 'voce e medica', 'de onde vem'],
    title: 'Como eu funciono',
    build: (ctx) => ({
      answer: 'Eu sou a Flor, a assistente do Florescer. Eu combino um conteúdo escrito e revisado antes com os seus próprios registros do app — por isso as minhas respostas usam as suas datas e a sua semana.',
      bullets: [
        ctx.phase === 'gravida'
          ? 'Eu respondo dúvidas sobre a gestação, consultas, exames, vitaminas e o que você está sentindo.'
          : 'Eu respondo dúvidas gerais sobre ciclo, menstruação, hormônios e fertilidade.',
        'Eu não faço diagnóstico, não leio resultado de exame e não indico medicamento nem dose. Isso é da sua equipe de saúde — eu não substituo consulta.',
        'Com a IA desligada, nada sai do aparelho. Com a IA ligada, viajam só a sua pergunta e um resumo em números: nunca o seu nome, o seu diário, os seus sintomas ou as suas fotos.',
      ],
      link: { label: 'Ver o que é enviado', to: 'privacidade' },
    }),
  },
];

/* ---------------------------------------------------------------
   Perguntas sugeridas
   --------------------------------------------------------------- */
export const FLOR_SUGGESTIONS = [
  'Quando é meu período fértil?',
  'Quando vem minha menstruação?',
  'Meu ciclo é normal?',
  'Quais são as fases do ciclo?',
  'Como funciona a temperatura basal?',
  'O que é o muco tipo clara de ovo?',
  'Por que eu tenho cólica?',
  'Minha menstruação atrasou, e agora?',
  'Dá para engravidar fora do período fértil?',
  'O que fazem os hormônios do ciclo?',
];

/* ---------------------------------------------------------------
   Busca
   --------------------------------------------------------------- */
function scoreTerms(question, terms) {
  let score = 0;
  for (const term of terms) {
    if (question.includes(term)) score += term.includes(' ') ? term.split(' ').length + 1 : 1;
  }
  return score;
}

/**
 * Responde a uma pergunta.
 * @param {string} question pergunta escrita pela usuária
 * @param {object} state estado do app (para personalizar com os dados reais)
 * @returns {{kind:string,id:string,title:string,answer:string,bullets:string[],warning?:string,link?:object}}
 */
/* Ciclo e gestação vivem em listas separadas, mas competem na mesma busca. */
const ALL_INTENTS = [...INTENTS, ...PREGNANCY_INTENTS];
const ALL_URGENT = [...URGENT, ...PREGNANCY_URGENT];

/**
 * Desempate por fase. "Enjoo" é TPM para quem está tentando e é enjoo de
 * gestação para quem está grávida — sem esse peso, ela recebe a resposta
 * errada com as mesmas palavras.
 */
function phaseBonus(intent, phase) {
  if (!Array.isArray(intent.phases)) return 0;
  return intent.phases.includes(phase) ? 2 : -3;
}

export function askFlor(question, state, ref = today()) {
  const q = normalize(question);
  const me = florProfile(state, ref);

  if (!q || q.length < 2) {
    return {
      kind: 'fallback',
      id: 'vazio',
      title: 'Me conta a sua dúvida',
      answer: me.phase === 'gravida'
        ? 'Escreva a sua dúvida sobre a gestação, as consultas, os exames ou o que você está sentindo que eu respondo.'
        : 'Escreva a sua pergunta sobre ciclo, menstruação, hormônios ou período fértil que eu respondo.',
      bullets: [],
      suggestions: florSuggestions(state, ref).slice(0, 4),
    };
  }

  // segurança primeiro: antes de qualquer tema educativo, em qualquer fase
  for (const alert of ALL_URGENT) {
    if (scoreTerms(q, alert.terms) > 0) {
      return { kind: 'alert', id: alert.id, title: alert.title, answer: alert.answer, bullets: alert.bullets };
    }
  }

  const ctx = {
    state,
    phase: me.phase,
    cycle: me.cycle,
    preg: me.preg,
    prenatal: me.prenatal.steps,
    me,
    luteal: state?.settings?.lutealPhase ?? 14,
  };

  let best = null;
  let bestScore = 0;
  for (const intent of ALL_INTENTS) {
    const score = scoreTerms(q, intent.terms);
    if (score <= 0) continue;
    const total = score + phaseBonus(intent, me.phase);
    if (total > bestScore) { best = intent; bestScore = total; }
  }

  if (!best) {
    return {
      kind: 'fallback',
      id: 'sem-resposta',
      title: 'Ainda não sei responder isso',
      answer: 'Essa eu não sei responder com segurança. Prefiro dizer que não sei a arriscar um palpite sobre a sua saúde.',
      bullets: [
        'Anote a pergunta e leve para a próxima consulta — vale mais do que qualquer busca.',
        'Você também pode procurar na biblioteca do app ou perguntar na comunidade.',
      ],
      link: { label: 'Abrir a biblioteca', to: 'biblioteca' },
      suggestions: florSuggestions(state, ref).slice(0, 4),
    };
  }

  const built = best.build(ctx);
  return {
    kind: 'answer',
    id: best.id,
    title: best.title,
    answer: built.answer,
    bullets: built.bullets || [],
    warning: built.bullets2 || null,
    link: built.link || null,
  };
}

/**
 * As perguntas sugeridas, escolhidas para o momento dela.
 * Gestante recebe o bloco do trimestre; quem já conversou não recebe de
 * volta o assunto que acabou de ver.
 */
export function florSuggestions(state, ref = today()) {
  const me = florProfile(state, ref);

  let base = FLOR_SUGGESTIONS;
  if (me.phase === 'gravida') {
    const trimestre = me.preg.known ? me.preg.trimester : 1;
    base = PREGNANCY_SUGGESTIONS[trimestre === 3 ? 'terceiro' : trimestre === 2 ? 'segundo' : 'primeiro'];
  }

  const sugestoes = [...base];

  // etapa atrasada entra na frente: é o que mais importa para ela hoje
  if (me.prenatal.late.length) {
    sugestoes.unshift(`Me fala sobre ${me.prenatal.late[0].title.toLowerCase()}`);
  }
  if (me.goals.longTrying && me.phase === 'tentante') {
    sugestoes.unshift('Quanto tempo é esperado demorar para engravidar?');
  }

  // tira o que ela acabou de perguntar, para a lista não repetir a conversa
  const visto = me.conversation.lastTopic;
  const intent = visto ? ALL_INTENTS.find((item) => item.id === visto) : null;
  const filtradas = intent
    ? sugestoes.filter((texto) => scoreTerms(normalize(texto), intent.terms) === 0)
    : sugestoes;

  return [...new Set(filtradas)].slice(0, 6);
}

export const FLOR_INTENT_IDS = ALL_INTENTS.map((intent) => intent.id);
export const FLOR_URGENT_IDS = ALL_URGENT.map((intent) => intent.id);
