/**
 * Conteúdo editorial do Florescer.
 * As "dicas do dia" são geradas por um motor de regras local (sem servidor):
 * escolhem-se sugestões compatíveis com a fase do ciclo, o momento da usuária
 * e o que ela registrou — de forma determinística por dia.
 */

export const MOODS = [
  { emoji: '😞', label: 'Triste' },
  { emoji: '😟', label: 'Ansiosa' },
  { emoji: '😐', label: 'Neutra' },
  { emoji: '🙂', label: 'Bem' },
  { emoji: '🥰', label: 'Radiante' },
];

export const SYMPTOMS = [
  'Cólicas', 'Seios sensíveis', 'Inchaço', 'Dor de cabeça', 'Acne',
  'Sono', 'Energia alta', 'Enjoo', 'Dor lombar', 'TPM', 'Libido alta', 'Cansaço',
];

export const CONTROL_SYMPTOMS = [
  'Náusea', 'Vômitos', 'Azia', 'Dor nas costas', 'Cólica', 'Sangramento',
  'Inchaço', 'Dor de cabeça', 'Tontura', 'Cansaço', 'Sono', 'Cãibras',
  'Seios sensíveis', 'Falta de ar', 'Constipação', 'Febre', 'Contrações',
];

export const PREGNANCY_EMOTIONS = [
  'Feliz', 'Ansiosa', 'Sensível', 'Confiante', 'Preocupada', 'Animada', 'Cansada', 'Grata',
];

export const POSTPARTUM_EMOTIONS = [
  'Feliz', 'Sensível', 'Cansada', 'Sobrecarregada', 'Confiante', 'Ansiosa', 'Acolhida', 'Grata',
];

export const FLOWS = [
  { id: 'spotting', label: 'Escape', drops: 1 },
  { id: 'light', label: 'Leve', drops: 1 },
  { id: 'medium', label: 'Médio', drops: 2 },
  { id: 'heavy', label: 'Intenso', drops: 3 },
];

export const MUCUS = [
  { id: 'seco', label: 'Seco' },
  { id: 'pegajoso', label: 'Pegajoso' },
  { id: 'cremoso', label: 'Cremoso' },
  { id: 'aquoso', label: 'Aquoso' },
  { id: 'clara_ovo', label: 'Clara de ovo' },
];

export const OV_TESTS = [
  { id: 'nao_fiz', label: 'Não fiz' },
  { id: 'positivo', label: 'Positivo' },
  { id: 'negativo', label: 'Negativo' },
];

export const PHASE_LABELS = {
  tentante: { label: 'Tentante', icon: 'seed', emoji: '🌱' },
  gravida: { label: 'Grávida', icon: 'pregnant', emoji: '🤰' },
  posparto: { label: 'Pós-parto', icon: 'baby', emoji: '🍼' },
};

/* ---------------- sugestões diárias ----------------
 * cycle: momentos do ciclo em que a sugestão faz sentido
 *        (menstrual, follicular, fertile, ovulation, luteal ou 'any')
 * phases: fases da usuária (tentante, gravida, posparto)
 * Editáveis pelo painel da administradora — ver assets/js/cms.js
 */
export const TIPS = [
  { id: 't01', c: 'bem', phases: ['tentante'], cycle: ['menstrual'], txt: 'Menstruação pede menos cobrança. Bolsa de água morna no abdômen e um alongamento leve ajudam mais que qualquer meta de produtividade hoje.' },
  { id: 't02', c: 'nutri', phases: ['tentante'], cycle: ['menstrual'], txt: 'Nesta fase o ferro cai. Feijão, lentilha e folhas escuras com um pouco de vitamina C (limão, laranja) melhoram a absorção.' },
  { id: 't03', c: 'bem', phases: ['tentante'], cycle: ['menstrual'], txt: 'Registrar o fluxo dos primeiros dias é o que mais melhora a precisão das previsões. Dois toques e pronto.' },
  { id: 't04', c: 'bem', phases: ['tentante'], cycle: ['follicular'], txt: 'A energia costuma subir agora. É um bom momento para retomar o exercício que você gosta — sem exageros.' },
  { id: 't05', c: 'nutri', phases: ['tentante'], cycle: ['follicular'], txt: 'Gorduras boas (abacate, azeite, castanhas) participam da produção hormonal. Meia unidade de abacate por dia já é um ótimo começo.' },
  { id: 't06', c: 'fert', phases: ['tentante'], cycle: ['fertile'], txt: 'Você está na janela fértil. Relações a cada 1 ou 2 dias nesse período são a recomendação mais comum — e tiram o peso do "dia certo".' },
  { id: 't07', c: 'fert', phases: ['tentante'], cycle: ['fertile'], txt: 'Muco com aparência de clara de ovo é um dos sinais mais confiáveis de fertilidade. Se aparecer, registre: entra na sua análise de padrões.' },
  { id: 't08', c: 'bem', phases: ['tentante'], cycle: ['fertile'], txt: 'Na janela fértil, o descanso importa tanto quanto a tentativa. Um chá morno e dormir 30 minutos mais cedo já muda o seu dia.' },
  { id: 't09', c: 'fert', phases: ['tentante'], cycle: ['ovulation'], txt: 'Dia estimado da ovulação. A temperatura basal costuma subir de 0,2 a 0,5 °C só depois que ela acontece — por isso ela confirma, não antecipa.' },
  { id: 't10', c: 'bem', phases: ['tentante'], cycle: ['luteal'], txt: 'A espera entre a ovulação e o teste é a parte mais difícil. Combine com você mesma uma data para testar e proteja os dias até lá.' },
  { id: 't11', c: 'bem', phases: ['tentante'], cycle: ['luteal'], txt: 'Ansiedade na espera é esperada. Experimente a respiração 4-7-8: inspire por 4s, segure 7s, solte em 8s. Três rodadas.' },
  { id: 't12', c: 'nutri', phases: ['tentante'], cycle: ['luteal'], txt: 'Se a TPM aperta, reduza cafeína e ultraprocessados nesta semana e aumente magnésio: banana, aveia, sementes de abóbora.' },
  { id: 't13', c: 'nutri', phases: ['tentante'], cycle: ['any'], txt: 'Ácido fólico antes da gestação reduz risco de malformações no bebê. Converse com seu médico sobre a suplementação certa para você.' },
  { id: 't14', c: 'bem', phases: ['tentante'], cycle: ['any'], txt: 'Sono curto altera hormônios do ciclo. Sete a oito horas por noite é uma das mudanças com maior impacto na fertilidade.' },
  { id: 't15', c: 'fert', phases: ['tentante'], cycle: ['any'], txt: 'Meça a temperatura basal sempre no mesmo horário, ao acordar, antes de levantar. É a constância que faz a curva contar a história.' },
  { id: 't16', c: 'bem', phases: ['tentante'], cycle: ['any'], txt: 'Anotar três coisas boas do dia reduz o cortisol — e o cortisol influencia o ciclo. Use o campo de observações do seu registro.' },
  { id: 't17', c: 'nutri', phases: ['tentante'], cycle: ['any'], txt: 'Ômega-3 duas vezes por semana (sardinha, salmão) apoia a qualidade dos óvulos e ajuda a reduzir inflamação.' },
  { id: 't18', c: 'fert', phases: ['tentante'], cycle: ['any'], txt: 'Ciclos entre 21 e 35 dias são considerados regulares. Variações de até 4 dias entre um ciclo e outro são normais.' },

  { id: 'g01', c: 'bem', phases: ['gravida'], cycle: ['any'], txt: 'Beba água ao longo do dia: a hidratação ajuda com inchaço, cansaço e contrações de treinamento.' },
  { id: 'g02', c: 'nutri', phases: ['gravida'], cycle: ['any'], txt: 'Refeições menores e mais frequentes costumam aliviar o enjoo e a azia da gestação.' },
  { id: 'g03', c: 'bem', phases: ['gravida'], cycle: ['any'], txt: 'Caminhadas leves e alongamento liberado pelo seu médico ajudam com sono e dor lombar.' },
  { id: 'g04', c: 'fert', phases: ['gravida'], cycle: ['any'], txt: 'Anote as dúvidas que surgirem durante a semana e leve a lista para a consulta — ninguém lembra de tudo na hora.' },
  { id: 'g05', c: 'fert', phases: ['gravida'], cycle: ['any'], txt: 'Contar os movimentos do bebê no mesmo horário do dia, a partir do 3º trimestre, é um cuidado simples e valioso.' },

  { id: 'p01', c: 'bem', phases: ['posparto'], cycle: ['any'], txt: 'Durma quando o bebê dormir sempre que possível. Não é preguiça: é recuperação.' },
  { id: 'p02', c: 'nutri', phases: ['posparto'], cycle: ['any'], txt: 'Amamentar aumenta a necessidade de água e de calorias. Deixe uma garrafa e um lanche por perto na poltrona.' },
  { id: 'p03', c: 'bem', phases: ['posparto'], cycle: ['any'], txt: 'Tristeza e choro nas primeiras semanas são comuns. Se durarem mais de duas semanas ou pesarem demais, procure ajuda — isso é cuidado, não fraqueza.' },
  { id: 'p04', c: 'fert', phases: ['posparto'], cycle: ['any'], txt: 'A menstruação pode demorar a voltar durante a amamentação, mas a ovulação pode acontecer antes dela. Converse sobre contracepção na consulta.' },
  { id: 'p05', c: 'bem', phases: ['posparto'], cycle: ['any'], txt: 'Aceite ajuda concreta: alguém que segure o bebê 40 minutos enquanto você toma banho e come com calma muda o dia.' },
];

export const CYCLE_PHASE_OPTIONS = [
  ['any', 'Qualquer momento'],
  ['menstrual', 'Menstruação'],
  ['follicular', 'Fase folicular'],
  ['fertile', 'Janela fértil'],
  ['ovulation', 'Ovulação'],
  ['luteal', 'Fase lútea'],
];

export const CHALLENGE = {
  title: '7 dias de autocuidado',
  description: 'Um gesto de carinho por você a cada dia.',
  days: 7,
};

/* Os valores precisam ser coerentes entre si: `tests/plans.test.js` confere
   que a economia anunciada bate com a conta (12 mensais vs. o preço anual) e
   que o valor por mês do anual está certo. Mudou um, confira os três. */
export const PLANS = [
  { id: 'mensal', label: 'Mensal', price: 'R$ 49,90', per: '/mês', months: 1, amount: 49.9, note: 'cancele quando quiser', best: false },
  { id: 'anual', label: 'Anual', price: 'R$ 377,24', per: '/ano', months: 12, amount: 377.24, note: 'economize 37% · R$ 31,44 por mês', best: true },
];

export const TIP_CATEGORIES = {
  nutri: { label: 'Nutrição & fertilidade', icon: 'leaf', color: 'var(--leaf-50)', fg: 'var(--leaf-600)' },
  bem: { label: 'Bem-estar emocional', icon: 'moon', color: 'var(--lilac-50)', fg: 'var(--lilac-600)' },
  fert: { label: 'Ciclo & ovulação', icon: 'flower', color: 'var(--amber-50)', fg: 'var(--amber-600)' },
};

/** Título da categoria conforme a fase da usuária. */
const CATEGORY_BY_PHASE = {
  tentante: { nutri: 'Nutrição & fertilidade', bem: 'Bem-estar emocional', fert: 'Ciclo & ovulação' },
  gravida: { nutri: 'Nutrição na gestação', bem: 'Bem-estar emocional', fert: 'Gestação e consultas' },
  posparto: { nutri: 'Nutrição e amamentação', bem: 'Bem-estar emocional', fert: 'Corpo e recuperação' },
};
export function categoryLabel(cat, phase) {
  return (CATEGORY_BY_PHASE[phase] || CATEGORY_BY_PHASE.tentante)[cat];
}

/** Hash estável — mesma entrada, mesma sugestão do dia. */
function seed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return Math.abs(h);
}

/**
 * Sugestão do dia, coerente com a fase da usuária e a fase do ciclo.
 * @param {object} state
 * @param {object} info resultado de cycleInfo()
 * @param {string} dayKey chave do dia (para o sorteio determinístico)
 * @param {number} offset avança para a próxima sugestão da lista
 * @param {Array} tips banco de sugestões (o painel pode substituir o padrão)
 */
export function tipOfDay(state, info, dayKey, offset = 0, tips = TIPS) {
  const pool = poolFor(state, info, tips);
  if (!pool.length) return { c: 'bem', txt: 'Cuide de você hoje.' };
  const i = (seed(dayKey + state.profile.phase) + offset) % pool.length;
  return pool[i];
}

export function poolFor(state, info, tips = TIPS) {
  const phase = state.profile.phase;
  const list = tips.filter((t) => (t.phases || ['tentante']).includes(phase));
  if (phase !== 'tentante') return list;
  const cp = info?.phase || 'any';
  const matched = list.filter((t) => (t.cycle || ['any']).includes(cp));
  const general = list.filter((t) => (t.cycle || ['any']).includes('any'));
  return matched.concat(general.filter((t) => !matched.includes(t)));
}

/** Sugestões por categoria para a tela de Dicas. */
export function tipsByCategory(state, info, tips = TIPS) {
  const preferred = poolFor(state, info, tips);
  const pool = preferred.concat(tips.filter((t) => !preferred.includes(t)));
  const out = { nutri: [], bem: [], fert: [] };
  for (const t of pool) if (out[t.c] && out[t.c].length < 6) out[t.c].push(t);
  return out;
}

/* ---------------- biblioteca ---------------- */
export const ARTICLES = [
  {
    id: 'segundo-trimestre',
    cat: 'Gestação',
    topic: 'pregnancy',
    icon: 'pregnant',
    grad: 'var(--grad-rose)',
    title: 'Segundo trimestre: o trimestre que costuma dar trégua',
    time: 6,
    phases: ['gravida'],
    excerpt: 'Entre a 14ª e a 27ª semana muita coisa melhora — e alguns desconfortos novos aparecem.',
    body: [
      ['p', 'O segundo trimestre tem fama de ser o mais tranquilo da gestação, e para muita gente é mesmo: o enjoo costuma ceder, a energia volta um pouco e a barriga ainda não pesa tanto. Isso não é regra, e não ter essa trégua não significa que algo esteja errado.'],
      ['h2', 'O que costuma melhorar'],
      ['li', 'Enjoo e vômito tendem a diminuir entre a 14ª e a 16ª semana.'],
      ['li', 'O sono costuma ficar mais contínuo do que no primeiro trimestre.'],
      ['li', 'O risco de perda cai bastante depois do primeiro trimestre, o que alivia a cabeça de muita gente.'],
      ['h2', 'O que costuma aparecer'],
      ['li', 'Dor nas laterais da barriga ao levantar ou virar na cama: é o estiramento dos ligamentos que sustentam o útero.'],
      ['li', 'Congestão nasal e sangramento de gengiva, pelo aumento da circulação.'],
      ['li', 'Manchas na pele e a linha escura no meio da barriga, que costumam clarear depois do parto.'],
      ['li', 'Azia, principalmente no fim do trimestre.'],
      ['h2', 'Os movimentos do bebê'],
      ['p', 'Na primeira gestação, a maioria começa a sentir entre 18 e 22 semanas; quem já teve bebê costuma perceber antes. No começo parecem bolhas ou um peixinho, não chutes. Não existe número certo de movimentos nesta fase — o padrão só fica definido mais para frente.'],
      ['h2', 'O exame mais importante da fase'],
      ['p', 'O ultrassom morfológico do segundo trimestre, entre 20 e 24 semanas, avalia em detalhe a formação dos órgãos do bebê. É o ultrassom mais completo da gestação e tem janela própria: fora dela, algumas estruturas já não são bem visualizadas.'],
      ['p', 'Entre 24 e 28 semanas entra também o teste de tolerância à glicose, que investiga diabetes gestacional. Ele é feito em todo mundo porque a condição costuma não dar sintoma nenhum.'],
      ['note', 'Sangramento, perda de líquido, dor forte que não passa ou febre alta pedem avaliação no mesmo dia, em qualquer trimestre.'],
    ],
  },
  {
    id: 'terceiro-trimestre',
    cat: 'Gestação',
    topic: 'pregnancy',
    icon: 'clock',
    grad: 'var(--grad-rose)',
    title: 'Terceiro trimestre: a reta final sem susto',
    time: 7,
    phases: ['gravida'],
    excerpt: 'O que muda da 28ª semana em diante, o que observar e quando procurar a maternidade.',
    body: [
      ['p', 'A partir da 28ª semana o bebê ganha peso rápido e o seu corpo passa a acomodar um volume que cresce toda semana. Cansaço nesta fase não é falta de preparo: é o que está acontecendo com você.'],
      ['h2', 'Desconfortos comuns'],
      ['li', 'Falta de ar ao subir escadas: o útero empurra o diafragma para cima.'],
      ['li', 'Azia que piora deitada, inchaço nos pés no fim do dia e vontade frequente de urinar.'],
      ['li', 'Dor lombar e pélvica, que melhora com postura, calor local e alternar posições.'],
      ['li', 'Insônia, entre o desconforto e a cabeça acelerada.'],
      ['h2', 'Os movimentos passam a ser o seu termômetro'],
      ['p', 'A partir de 28 semanas o padrão de movimento fica reconhecível: você aprende os horários em que ele se mexe mais. O que importa não é um número de chutes, e sim o que é habitual para o seu bebê.'],
      ['note', 'Se os movimentos ficarem claramente menores ou diferentes do habitual, procure a maternidade no mesmo dia. Isso nunca é exagero, e é o sinal que mais merece atenção nesta fase.'],
      ['h2', 'As consultas ficam mais próximas'],
      ['p', 'O ritmo mais usado é quinzenal até a 36ª semana e semanal a partir daí. Entre 35 e 37 semanas é feita a pesquisa de estreptococo B, uma coleta simples com swab: saber antes permite usar antibiótico durante o trabalho de parto, protegendo o bebê.'],
      ['h2', 'Quando ir para a maternidade'],
      ['li', 'Contrações regulares, que ficam mais fortes e não passam com repouso ou banho morno.'],
      ['li', 'Perda de líquido, mesmo pouca e clara — é diferente de corrimento.'],
      ['li', 'Qualquer sangramento vivo.'],
      ['p', 'Antes de 37 semanas, qualquer um desses sinais é urgente. Combine na consulta os critérios da sua maternidade para sair de casa: eles mudam de serviço para serviço.'],
      ['note', 'Dor de cabeça forte com alteração na visão, inchaço súbito no rosto ou nas mãos e dor na boca do estômago precisam de avaliação imediata — são sinais que a equipe investiga com urgência.'],
    ],
  },
  {
    id: 'plano-de-parto',
    cat: 'Parto',
    topic: 'vaginal-birth',
    icon: 'note',
    grad: 'var(--grad-rose)',
    title: 'Plano de parto: o que é e como montar o seu',
    time: 6,
    phases: ['gravida'],
    excerpt: 'Um documento curto que organiza as suas preferências — e que não é um contrato.',
    body: [
      ['p', 'O plano de parto é um documento simples em que você registra as suas preferências para o trabalho de parto, o parto e as primeiras horas com o bebê. Ele serve para organizar a sua cabeça e para conversar com a equipe antes do dia.'],
      ['h2', 'O que ele é e o que ele não é'],
      ['p', 'Ele não garante que tudo acontecerá como está escrito. O parto é um evento imprevisível e a conduta pode mudar por segurança — sua ou do bebê. O plano continua valendo como registro do que importa para você, e a equipe deve explicar sempre que precisar mudar de rota.'],
      ['h2', 'O que costuma entrar'],
      ['li', 'Quem você quer como acompanhante. A presença de acompanhante de sua escolha é um direito garantido por lei.'],
      ['li', 'Preferências sobre alívio da dor, incluindo métodos não farmacológicos e analgesia.'],
      ['li', 'Liberdade de posição e de movimento durante o trabalho de parto.'],
      ['li', 'Contato pele a pele logo após o nascimento e amamentação na primeira hora, quando possível.'],
      ['li', 'Clampeamento oportuno do cordão.'],
      ['li', 'Quem corta o cordão, se isso for importante para você.'],
      ['h2', 'Como escrever'],
      ['p', 'Uma página basta. Frases curtas, em tópicos, com o que é prioridade para você e o que é indiferente. Leve em uma consulta do terceiro trimestre para discutir com a equipe, ajuste o que não for viável no seu serviço e leve uma cópia impressa na mala.'],
      ['note', 'Converse sobre o plano com a sua equipe de pré-natal antes do dia. Um plano discutido na consulta funciona muito melhor do que um plano apresentado na recepção da maternidade.'],
    ],
  },
  {
    id: 'exercicios-dores',
    cat: 'Exercícios',
    topic: 'exercises',
    icon: 'heart',
    grad: 'var(--grad-leaf)',
    title: 'Dor nas costas e assoalho pélvico na gestação',
    time: 5,
    phases: ['gravida'],
    excerpt: 'O que costuma aliviar o desconforto e por que o assoalho pélvico merece atenção.',
    body: [
      ['p', 'Dor lombar e pélvica estão entre os desconfortos mais comuns da gestação. O centro de gravidade muda, a barriga puxa a coluna para frente e os ligamentos ficam mais frouxos por ação hormonal.'],
      ['h2', 'O que costuma aliviar'],
      ['li', 'Alternar posições: evitar ficar muito tempo em pé ou sentada na mesma postura.'],
      ['li', 'Calor local na lombar e banho morno.'],
      ['li', 'Dormir de lado com um travesseiro entre as pernas.'],
      ['li', 'Caminhada leve e hidroginástica, que tiram peso das articulações.'],
      ['li', 'Sentar com apoio na lombar e subir da cama rolando de lado, em vez de dobrar o tronco.'],
      ['h2', 'O assoalho pélvico'],
      ['p', 'É o conjunto de músculos que sustenta bexiga, útero e intestino. Na gestação ele aguenta mais peso e, no parto, participa diretamente. Exercitá-lo está associado a menos perda de urina durante a gestação e no pós-parto.'],
      ['p', 'O exercício mais citado consiste em contrair esses músculos como se fosse segurar a urina, sem apertar glúteos nem prender a respiração, e depois relaxar completamente. Relaxar é parte do exercício, não um detalhe.'],
      ['note', 'A orientação sobre quantas repetições, com que frequência e se o exercício é indicado para você deve vir de um profissional — idealmente um fisioterapeuta pélvico. Fazer errado pode atrapalhar em vez de ajudar.'],
      ['h2', 'Quando parar e procurar avaliação'],
      ['li', 'Sangramento, perda de líquido ou contrações durante ou após a atividade.'],
      ['li', 'Dor forte na pelve que dificulta andar.'],
      ['li', 'Tontura, falta de ar fora do normal ou palpitação.'],
      ['p', 'Atividade física é recomendada em gestações de baixo risco, mas algumas situações pedem repouso relativo. Confirme com a sua equipe antes de começar ou mudar a sua rotina.'],
    ],
  },
  {
    id: 'insonia-gestacao',
    cat: 'Sono',
    topic: 'sleep',
    icon: 'moon',
    grad: 'var(--grad-lilac)',
    title: 'A insônia do terceiro trimestre',
    time: 5,
    phases: ['gravida'],
    excerpt: 'Por que o sono some na reta final e o que costuma ajudar a atravessar a noite.',
    body: [
      ['p', 'Dormir mal no terceiro trimestre é tão comum que muita gente trata como inevitável. Entre o xixi, a azia, a falta de ar e a cabeça acelerada, a noite vira uma sucessão de pedaços.'],
      ['h2', 'Por que acontece'],
      ['li', 'O útero pressiona a bexiga e o diafragma.'],
      ['li', 'A progesterona relaxa a válvula do estômago, e deitar piora a azia.'],
      ['li', 'Cãibras noturnas e síndrome das pernas inquietas ficam mais frequentes.'],
      ['li', 'A ansiedade pelo parto costuma aparecer justamente quando a casa silencia.'],
      ['h2', 'O que costuma ajudar'],
      ['li', 'Dormir de lado, de preferência o esquerdo, com um travesseiro entre as pernas e outro apoiando a barriga.'],
      ['li', 'Elevar a cabeceira da cama ajuda na azia e na falta de ar.'],
      ['li', 'Jantar mais cedo e evitar deitar logo depois de comer.'],
      ['li', 'Concentrar os líquidos durante o dia, reduzindo perto de dormir — sem deixar de se hidratar.'],
      ['li', 'Cochilos curtos durante o dia, se a rotina permitir. Dormir fragmentado é melhor do que não dormir.'],
      ['p', 'Acordar de barriga para cima acontece e não é motivo para pânico: só vire de lado e siga dormindo.'],
      ['note', 'Insônia que está pesando no seu dia merece ser levada para a consulta. Não comece nenhum remédio ou chá para dormir por conta própria: muitos não são seguros na gestação.'],
    ],
  },
  {
    id: 'recuperacao-cesarea',
    cat: 'Pós-parto',
    topic: 'cesarean',
    icon: 'shield',
    grad: 'var(--grad-lilac)',
    title: 'Recuperação da cesárea em casa',
    time: 6,
    phases: ['gravida', 'posparto'],
    excerpt: 'Os primeiros dias depois de uma cirurgia de grande porte — com um recém-nascido junto.',
    body: [
      ['p', 'A cesárea é uma cirurgia abdominal de grande porte, e a recuperação acontece enquanto você cuida de um recém-nascido. Precisar de ajuda não é fraqueza: é o que a situação pede.'],
      ['h2', 'Os primeiros dias'],
      ['li', 'Levantar da cama rolando de lado e usando os braços poupa a musculatura abdominal.'],
      ['li', 'Apoiar um travesseiro sobre a barriga ao tossir, rir ou espirrar reduz muito o desconforto.'],
      ['li', 'Caminhar devagar pela casa, assim que liberada, ajuda o intestino a voltar e reduz o risco de trombose.'],
      ['li', 'Evitar pegar peso além do bebê nas primeiras semanas.'],
      ['h2', 'Cuidados com o corte'],
      ['p', 'Mantenha a região limpa e seca, seguindo exatamente a orientação que você recebeu na alta — ela varia conforme o tipo de curativo e de sutura. Observe a cicatriz todos os dias quando trocar de roupa.'],
      ['note', 'Procure atendimento se houver vermelhidão que aumenta, calor local, saída de secreção ou pus, cheiro forte, abertura do corte ou febre. Dor que piora em vez de melhorar também precisa ser avaliada.'],
      ['h2', 'Amamentar depois da cesárea'],
      ['p', 'É possível e comum. Posições que não apoiam peso sobre o corte, como a invertida (bola de futebol americano) e deitada de lado, costumam ser mais confortáveis nos primeiros dias.'],
      ['h2', 'A recuperação emocional'],
      ['p', 'Nem toda cesárea é planejada, e algumas acontecem depois de horas de trabalho de parto. É comum sentir alívio e frustração ao mesmo tempo. Se a lembrança do parto estiver pesando, isso merece espaço — e profissional, se persistir.'],
      ['p', 'Sobre dirigir, subir escadas, voltar a exercícios e ter relação: quem libera cada coisa, e quando, é a sua equipe na consulta de revisão.'],
    ],
  },
  {
    id: 'corpo-depois-do-parto',
    cat: 'Pós-parto',
    topic: 'postpartum',
    icon: 'flower',
    grad: 'var(--grad-rose)',
    title: 'O corpo depois do parto: o que esperar',
    time: 7,
    phases: ['posparto'],
    excerpt: 'Sangramento, cólicas, suor, queda de cabelo — o que é esperado e o que precisa de avaliação.',
    body: [
      ['p', 'O puerpério é o período em que o corpo desfaz, aos poucos, tudo o que levou nove meses para construir. Ninguém avisa que isso é quase tão trabalhoso quanto a gestação.'],
      ['h2', 'Sangramento (lóquios)'],
      ['p', 'Nos primeiros dias é vermelho vivo e volumoso, depois vai clareando para rosado e amarelado ao longo de semanas. Pode aumentar quando você se esforça ou amamenta.'],
      ['note', 'Encharcar um absorvente por hora durante duas horas seguidas, eliminar coágulos grandes, ter cheiro forte, febre ou voltar a sangrar vivo depois de ter clareado pedem avaliação no mesmo dia.'],
      ['h2', 'Cólicas depois do parto'],
      ['p', 'O útero continua contraindo para voltar ao tamanho normal, e isso dói — principalmente durante as mamadas e a partir do segundo filho. É esperado nos primeiros dias.'],
      ['h2', 'Períneo e assoalho pélvico'],
      ['p', 'Dor, inchaço e desconforto para sentar são comuns, com ou sem ponto. Compressa fria nas primeiras 24 horas e banhos de assento costumam aliviar. Perda de urina ao tossir ou espirrar é frequente no começo, mas não é algo para aceitar como definitivo: fisioterapia pélvica trata.'],
      ['h2', 'Suor, queda de cabelo e pele'],
      ['p', 'Suor noturno intenso nas primeiras semanas é o corpo eliminando líquido. A queda de cabelo costuma começar por volta do terceiro mês e assusta pela quantidade — é o fim do ciclo prolongado que a gestação criou, e costuma se normalizar ao longo do primeiro ano.'],
      ['h2', 'O que não é só cansaço'],
      ['li', 'Febre, calafrios ou mal-estar importante.'],
      ['li', 'Dor de cabeça forte, alteração visual ou inchaço súbito: pré-eclâmpsia também acontece depois do parto.'],
      ['li', 'Dor, calor ou inchaço em uma panturrilha só, ou falta de ar súbita.'],
      ['li', 'Mama com área vermelha, quente e dolorida junto com febre.'],
      ['p', 'A consulta de revisão costuma ser marcada entre 30 e 42 dias, mas você não precisa esperar por ela se algo não parecer certo.'],
      ['note', 'Tristeza que não passa, angústia constante, dificuldade de se ligar ao bebê ou pensamentos de machucar a si mesma precisam de ajuda profissional. Não é frescura, não é falta de amor e tem tratamento. Em sofrimento intenso, o CVV atende de graça pelo 188, 24 horas.'],
    ],
  },
  {
    id: 'sono-do-bebe-e-o-seu',
    cat: 'Sono',
    topic: 'sleep',
    icon: 'moon',
    grad: 'var(--grad-lilac)',
    title: 'O sono do bebê e o seu',
    time: 6,
    phases: ['posparto'],
    excerpt: 'Por que o recém-nascido acorda tanto, o que é sono seguro e como você sobrevive a isso.',
    body: [
      ['p', 'Recém-nascido acorda à noite porque precisa: o estômago é pequeno, o leite é digerido rápido e as mamadas noturnas sustentam a produção. Não é um problema a ser corrigido nas primeiras semanas.'],
      ['h2', 'O que é esperado'],
      ['li', 'Ciclos de sono curtos, de 40 a 60 minutos, com despertares frequentes.'],
      ['li', 'Confusão entre dia e noite nas primeiras semanas: o relógio biológico ainda está se formando.'],
      ['li', 'Dormir muito durante o dia e ficar mais desperto à noite por um período.'],
      ['h2', 'Sono seguro'],
      ['li', 'De barriga para cima para dormir, sempre, em todas as sonecas.'],
      ['li', 'Colchão firme, sem travesseiro, protetor de berço, almofadas ou bichos de pelúcia.'],
      ['li', 'No mesmo quarto que você, mas na superfície dele.'],
      ['li', 'Ambiente sem fumaça e sem calor excessivo.'],
      ['note', 'Essas recomendações reduzem o risco de morte súbita do lactente. Se você tem dúvida sobre cama compartilhada, converse com o pediatra: a orientação depende de fatores que só uma avaliação individual considera.'],
      ['h2', 'E o seu sono'],
      ['p', 'Privação de sono não é só cansaço: ela afeta humor, memória, paciência e a sua saúde. Cuidar do seu sono é cuidar do bebê também.'],
      ['li', 'Dormir quando ele dorme funciona mal na prática, mas uma soneca por dia já muda muita coisa.'],
      ['li', 'Dividir as noites com alguém, mesmo que seja só o turno em que você consegue dormir três horas seguidas.'],
      ['li', 'Aceitar ajuda com a casa para usar o tempo livre dormindo, não limpando.'],
      ['p', 'Se você está exausta a ponto de não conseguir dormir nem quando tem oportunidade, isso pode ser mais do que cansaço. Vale levar para a consulta.'],
    ],
  },
  {
    id: 'alimentacao-tentante',
    cat: 'Alimentação',
    topic: 'nutrition',
    icon: 'leaf',
    grad: 'var(--grad-leaf)',
    title: 'Comer bem enquanto você tenta engravidar',
    time: 5,
    phases: ['tentante'],
    excerpt: 'O que vale a pena ajustar, o que é mito e por que nenhuma dieta garante resultado.',
    body: [
      ['p', 'Alimentação influencia a saúde reprodutiva, mas nenhum alimento engravida ninguém. Essa diferença importa: a ideia de que existe uma dieta certa costuma virar mais uma cobrança numa jornada que já tem cobrança demais.'],
      ['h2', 'O que a evidência apoia'],
      ['li', 'Um padrão alimentar variado, com vegetais, frutas, grãos integrais, leguminosas e gorduras boas, está associado a melhores desfechos reprodutivos.'],
      ['li', 'Reduzir ultraprocessados e açúcar ajuda no controle da glicemia e do peso, que têm relação com a ovulação.'],
      ['li', 'Álcool e tabaco têm impacto conhecido na fertilidade — dos dois lados do casal.'],
      ['li', 'Cafeína em excesso costuma ser desaconselhada; o limite combinado com a sua equipe vale mais do que um número da internet.'],
      ['h2', 'Antes mesmo do positivo'],
      ['p', 'O ácido fólico é recomendado desde antes de engravidar porque reduz o risco de defeitos do tubo neural, que se forma nas primeiras semanas — muitas vezes antes de a gravidez ser descoberta.'],
      ['note', 'Qual suplemento, qual dose e por quanto tempo é decisão da sua equipe. Polivitamínicos de farmácia não são todos iguais, e alguns trazem vitamina A em excesso, que faz mal ao bebê. Leve o frasco para a consulta antes de começar.'],
      ['h2', 'O que é mito'],
      ['li', 'Não existe alimento, chá ou receita que garanta gravidez naquele ciclo.'],
      ['li', 'Dietas muito restritivas podem atrapalhar a ovulação em vez de ajudar.'],
      ['li', 'Inhame, maca peruana e similares não têm evidência que sustente as promessas que circulam.'],
      ['p', 'Se você tem SOP, endometriose, diabetes, tireoide alterada ou qualquer condição que influencie o ciclo, a orientação alimentar precisa ser individual. Um nutricionista que trabalhe com saúde reprodutiva faz diferença real aqui.'],
    ],
  },
  {
    id: 'ciclo-irregular',
    cat: 'Ciclo',
    topic: 'cycle',
    icon: 'refresh',
    grad: 'var(--grad-rose)',
    title: 'Quando o ciclo é irregular',
    time: 6,
    phases: ['tentante', 'posparto'],
    excerpt: 'O que conta como irregular, o que costuma estar por trás e quando investigar.',
    body: [
      ['p', 'Ciclos entre 21 e 35 dias são considerados dentro do esperado para adultas, e variar alguns dias de um mês para o outro é normal. Irregular costuma descrever uma variação maior do que 7 a 9 dias entre ciclos, ou ciclos que fogem bastante dessa faixa.'],
      ['h2', 'O que costuma mexer com o ciclo'],
      ['li', 'Estresse importante, perda ou ganho de peso rápido e exercício muito intenso.'],
      ['li', 'Noites mal dormidas por períodos longos e mudanças de fuso.'],
      ['li', 'Os primeiros meses depois de parar um contraceptivo, principalmente o injetável trimestral.'],
      ['li', 'Amamentação: a menstruação pode demorar a voltar, e os primeiros ciclos costumam ser irregulares.'],
      ['li', 'Condições como síndrome dos ovários policísticos e alterações da tireoide.'],
      ['h2', 'Por que isso complica as previsões'],
      ['p', 'As estimativas de ovulação e de janela fértil partem da duração média dos seus ciclos. Quanto maior a variação, menos confiável fica a previsão — e é justamente aí que observar os sinais do corpo, como muco e temperatura basal, ajuda mais do que o calendário.'],
      ['h2', 'Quando procurar avaliação'],
      ['li', 'Ciclos que somem por três meses ou mais, sem gravidez.'],
      ['li', 'Ciclos que vêm a cada menos de 21 dias ou mais de 35 dias com frequência.'],
      ['li', 'Sangramento muito intenso, muito prolongado ou entre as menstruações.'],
      ['li', 'Irregularidade junto com acne importante, queda de cabelo, aumento de pelos ou mudança de peso sem explicação.'],
      ['p', 'Registrar os seus ciclos por alguns meses é o que transforma uma queixa vaga em informação útil na consulta. O relatório do app foi feito para isso.'],
      ['note', 'Ciclo irregular não significa infertilidade, e também não é algo para simplesmente aceitar. É um sinal que merece ser investigado com a sua equipe.'],
    ],
  },
  {
    id: 'volta-ao-trabalho',
    cat: 'Direitos',
    topic: 'rights',
    icon: 'shield',
    grad: 'var(--grad-leaf)',
    title: 'Voltar a trabalhar e continuar amamentando',
    time: 6,
    phases: ['gravida', 'posparto'],
    excerpt: 'Licença, estabilidade, pausas para amamentar e como organizar o estoque de leite.',
    body: [
      ['p', 'A volta ao trabalho costuma ser um dos momentos mais tensos do pós-parto. Saber o que a lei garante tira parte do peso da negociação.'],
      ['h2', 'O que a legislação brasileira prevê'],
      ['li', 'Licença-maternidade de 120 dias, que pode chegar a 180 em empresas participantes do Programa Empresa Cidadã e em boa parte do serviço público.'],
      ['li', 'Estabilidade no emprego desde a confirmação da gravidez até cinco meses após o parto, para trabalhadoras com carteira assinada.'],
      ['li', 'Dois descansos especiais de meia hora cada durante a jornada, até o bebê completar seis meses — e esse prazo pode ser estendido por indicação médica.'],
      ['li', 'Dispensa do horário de trabalho para consultas e exames do pré-natal, mediante comprovação.'],
      ['li', 'Direito a transferência de função quando as condições de trabalho forem incompatíveis com a gestação, sem prejuízo do salário.'],
      ['note', 'As regras variam conforme o vínculo (CLT, servidora pública, autônoma, MEI) e podem ser ampliadas por convenção coletiva. Vale conferir a sua convenção e, em caso de dúvida ou conflito, procurar o sindicato da categoria ou orientação jurídica.'],
      ['h2', 'Organizar o estoque de leite'],
      ['li', 'Comece a extrair algumas semanas antes da volta, sem pressa, para formar estoque e treinar a rotina.'],
      ['li', 'Guarde em recipiente de vidro esterilizado com tampa plástica, identificado com data e horário.'],
      ['li', 'Leite cru refrigerado dura até 12 horas; congelado, até 15 dias no congelador comum.'],
      ['li', 'Descongele na geladeira e aqueça em banho-maria morno, nunca no micro-ondas nem fervendo.'],
      ['h2', 'No trabalho'],
      ['p', 'Converse antes com a chefia sobre onde e quando você vai extrair. Um local limpo, privado e com tomada resolve a maior parte do problema. Extrair nos horários em que o bebê mamaria ajuda a manter a produção.'],
      ['p', 'Se a amamentação não seguir depois da volta, isso não apaga o que já foi oferecido. A decisão é sua, e ela não precisa de justificativa para ninguém.'],
    ],
  },
  {
    id: 'periodo-fertil',
    cat: 'Ciclo',
    topic: 'cycle',
    icon: 'leaf',
    grad: 'var(--grad-leaf)',
    title: 'Como identificar o seu período fértil',
    time: 6,
    phases: ['tentante'],
    excerpt: 'Os três sinais que o corpo dá — e como combiná-los para acertar a janela.',
    body: [
      ['p', 'A janela fértil são os cinco dias antes da ovulação mais o dia dela e o seguinte. Os espermatozoides sobrevivem até cinco dias no corpo; o óvulo, cerca de 24 horas. Por isso a chance de gravidez começa antes da ovulação, não depois.'],
      ['h2', '1. Muco cervical'],
      ['p', 'É o sinal mais acessível e não custa nada. Ao longo do ciclo o muco muda de seco para pegajoso, depois cremoso, aquoso e finalmente elástico e transparente, parecido com clara de ovo. Esse último é o muco fértil: ele nutre e transporta os espermatozoides.'],
      ['h2', '2. Temperatura basal'],
      ['p', 'Medida ao acordar, antes de qualquer atividade, sempre no mesmo horário. Depois da ovulação ela sobe entre 0,2 e 0,5 °C e permanece alta até a menstruação. Atenção: a temperatura confirma que a ovulação aconteceu, ela não avisa antes. Serve para entender o padrão dos seus ciclos.'],
      ['h2', '3. Teste de ovulação'],
      ['p', 'Detecta o pico do hormônio LH, que antecede a ovulação em 24 a 36 horas. Faça entre 10h e 20h, com pelo menos duas horas sem urinar. Comece alguns dias antes da ovulação estimada pelo app.'],
      ['h2', 'Juntando tudo'],
      ['li', 'Muco tipo clara de ovo + teste positivo = melhores dias para tentar.'],
      ['li', 'Relações a cada 1 ou 2 dias durante a janela, sem transformar em obrigação.'],
      ['li', 'Registre tudo no app: com 3 ciclos as previsões já ficam bem mais precisas.'],
      ['note', 'Se você tem menos de 35 anos e está há mais de 12 meses tentando (ou mais de 6 meses, acima de 35), procure um especialista em reprodução humana.'],
    ],
  },
  {
    id: 'alimentacao-fertilidade',
    cat: 'Nutrição',
    topic: 'nutrition',
    icon: 'leaf',
    grad: 'var(--grad-leaf)',
    title: 'Alimentação e fertilidade: o que a ciência apoia',
    time: 7,
    phases: ['tentante'],
    premium: true,
    excerpt: 'Nutrientes, padrões alimentares e o que realmente faz diferença antes de engravidar.',
    body: [
      ['p', 'Não existe alimento mágico, mas existe padrão alimentar associado a melhores desfechos: mais vegetais, grãos integrais, gorduras boas e proteínas variadas; menos ultraprocessados, açúcar e gordura trans.'],
      ['h2', 'Ácido fólico'],
      ['p', 'A recomendação é iniciar a suplementação pelo menos um a três meses antes de engravidar, porque o tubo neural do bebê se fecha nas primeiras semanas — muitas vezes antes de a gravidez ser descoberta. A dose certa é indicada pelo seu médico.'],
      ['h2', 'Ferro, cálcio e vitamina D'],
      ['li', 'Ferro: carnes, feijão, lentilha e folhas escuras, sempre com vitamina C junto.'],
      ['li', 'Cálcio: laticínios, gergelim, brócolis e tofu.'],
      ['li', 'Vitamina D: exposição solar orientada e dosagem no exame de sangue.'],
      ['h2', 'Cafeína e álcool'],
      ['p', 'Estudos sugerem manter a cafeína abaixo de 200 mg por dia (cerca de duas xícaras de café) e evitar o álcool no período de tentativa.'],
      ['note', 'Este conteúdo é educativo. Ajustes de dieta e suplementos devem ser feitos com nutricionista ou médico.'],
    ],
  },
  {
    id: 'ansiedade-espera',
    cat: 'Bem-estar',
    topic: 'emotional-health',
    icon: 'moon',
    grad: 'var(--grad-lilac)',
    title: 'A espera de duas semanas sem se perder na ansiedade',
    time: 5,
    phases: ['tentante'],
    excerpt: 'O que fazer entre a ovulação e o teste, quando cada sintoma vira suspeita.',
    body: [
      ['p', 'O período entre a ovulação e o dia do teste é conhecido como "espera de duas semanas". É a fase em que a ansiedade costuma aparecer com mais força, porque os sintomas iniciais da gravidez e da TPM são praticamente os mesmos.'],
      ['h2', 'Combine uma data para testar'],
      ['p', 'Testar cedo demais gera resultados falsos negativos e frustração. O ideal é esperar o primeiro dia de atraso. Marque a data no app e trate-a como um compromisso com você.'],
      ['h2', 'Três práticas simples'],
      ['li', 'Respiração 4-7-8, três rodadas, sempre que a espiral de pensamento começar.'],
      ['li', 'Movimento leve diário: 20 minutos de caminhada mudam o humor e o sono.'],
      ['li', 'Reduza a busca por sintomas na internet a uma vez por dia, em horário definido.'],
      ['h2', 'Quando pedir ajuda'],
      ['p', 'Se a ansiedade atrapalha o sono, o trabalho ou a relação, psicoterapia faz diferença real. Buscar apoio faz parte do cuidado com a fertilidade — não é exagero.'],
    ],
  },
  {
    id: 'entender-ciclo',
    cat: 'Ciclo',
    topic: 'cycle',
    icon: 'flower',
    grad: 'var(--grad-rose)',
    title: 'As quatro fases do ciclo menstrual',
    time: 5,
    phases: ['tentante', 'posparto'],
    excerpt: 'O que acontece com os hormônios, a energia e o humor em cada etapa.',
    body: [
      ['p', 'O ciclo começa no primeiro dia da menstruação e termina no dia anterior à menstruação seguinte. A duração típica vai de 21 a 35 dias.'],
      ['h2', 'Menstrual (dias 1 a 5)'],
      ['p', 'O endométrio descama. Energia mais baixa, possível cólica. É a fase de acolher o próprio ritmo.'],
      ['h2', 'Folicular (dias 6 a 13)'],
      ['p', 'O estrogênio sobe, os folículos amadurecem. Disposição, humor e libido tendem a melhorar.'],
      ['h2', 'Ovulatória (por volta do dia 14)'],
      ['p', 'O pico de LH libera o óvulo. É a fase de maior fertilidade, com muco elástico e transparente.'],
      ['h2', 'Lútea (dias 15 a 28)'],
      ['p', 'A progesterona domina e prepara o útero. Se não houver implantação, ela cai e a menstruação vem. Sintomas de TPM aparecem aqui.'],
    ],
  },
  {
    id: 'primeiro-trimestre',
    cat: 'Gestação',
    topic: 'pregnancy',
    icon: 'pregnant',
    grad: 'var(--grad-rose)',
    title: 'Primeiro trimestre: o que esperar',
    time: 6,
    phases: ['gravida'],
    excerpt: 'Exames, sintomas comuns e sinais que pedem contato com o obstetra.',
    body: [
      ['p', 'As primeiras 13 semanas concentram a formação dos órgãos do bebê e boa parte dos sintomas mais intensos da gestação.'],
      ['h2', 'Sintomas comuns'],
      ['li', 'Enjoo e sensibilidade a cheiros, especialmente pela manhã.'],
      ['li', 'Sono e cansaço fora do comum — o corpo está trabalhando muito.'],
      ['li', 'Seios doloridos e vontade frequente de urinar.'],
      ['h2', 'Consultas e exames'],
      ['p', 'A primeira consulta idealmente acontece até a 8ª semana, com exames de sangue, tipagem, sorologias e a primeira ultrassonografia para datar a gestação.'],
      ['note', 'Procure atendimento imediato em caso de sangramento com cólica forte, febre alta ou dor abdominal intensa.'],
    ],
  },
  {
    id: 'alimentacao-na-gestacao',
    cat: 'Alimentação',
    topic: 'nutrition',
    icon: 'leaf',
    grad: 'var(--grad-leaf)',
    title: 'Alimentação na gestação: escolhas seguras no dia a dia',
    time: 6,
    phases: ['gravida'],
    excerpt: 'Como montar refeições variadas e reduzir riscos sem transformar a alimentação em uma lista de proibições.',
    body: [
      ['p', 'Na gestação, variedade e regularidade costumam ser mais importantes que buscar uma dieta perfeita. Combine verduras e legumes, frutas, feijões, cereais, proteínas e fontes de cálcio de acordo com sua realidade e com a orientação do pré-natal.'],
      ['h2', 'Cuidados com a segurança'],
      ['li', 'Higienize frutas, verduras, mãos, utensílios e superfícies antes do preparo.'],
      ['li', 'Evite carnes, ovos e pescados crus ou malpassados e leite ou derivados não pasteurizados.'],
      ['li', 'Mantenha alimentos crus separados dos prontos e refrigere as sobras rapidamente.'],
      ['h2', 'Cafeína e suplementos'],
      ['p', 'Café, chá, energéticos e chocolate entram na conta diária de cafeína. Suplementos, inclusive vitaminas e produtos naturais, só devem ser usados na dose indicada pela equipe que acompanha você.'],
      ['note', 'Enjoos intensos, perda de peso, dificuldade para beber líquidos ou restrições alimentares importantes precisam ser avaliados no pré-natal.'],
    ],
  },
  {
    id: 'exercicios-na-gestacao',
    cat: 'Exercícios',
    topic: 'exercises',
    icon: 'heart',
    grad: 'var(--grad-rose)',
    title: 'Movimento seguro durante a gestação',
    time: 5,
    phases: ['gravida'],
    excerpt: 'Princípios para manter o corpo ativo, respeitando condicionamento, trimestre e orientação profissional.',
    body: [
      ['p', 'Para muitas gestantes sem contraindicações, atividade física regular ajuda no bem-estar, no sono e no condicionamento. O tipo e a intensidade devem considerar o que você já praticava, sua saúde e a evolução da gestação.'],
      ['h2', 'Como começar com segurança'],
      ['li', 'Converse sobre exercícios nas consultas de pré-natal, especialmente se estava sedentária.'],
      ['li', 'Prefira progressão gradual, hidratação e ambientes sem calor excessivo.'],
      ['li', 'Evite atividades com risco de queda, choque no abdome ou mergulho com cilindro.'],
      ['h2', 'Escute os sinais do corpo'],
      ['p', 'Pare a atividade e procure orientação diante de sangramento, perda de líquido, falta de ar antes do esforço, dor no peito, tontura, dor forte, contrações regulares ou redução dos movimentos do bebê.'],
      ['note', 'Condições como placenta prévia, risco de parto prematuro e algumas doenças cardíacas ou pulmonares podem mudar completamente a recomendação.'],
    ],
  },
  {
    id: 'sono-na-gestacao',
    cat: 'Sono',
    topic: 'sleep',
    icon: 'moon',
    grad: 'var(--grad-lilac)',
    title: 'Dormir melhor com as mudanças da gestação',
    time: 5,
    phases: ['gravida'],
    excerpt: 'Posições, rotina e pequenos ajustes para lidar com azia, idas ao banheiro e desconforto.',
    body: [
      ['p', 'Sono leve, despertares e dificuldade para encontrar posição são comuns. Uma rotina previsível e adaptações simples podem ajudar, mas cansaço incapacitante também merece investigação.'],
      ['h2', 'Ajustes que podem ajudar'],
      ['li', 'Use travesseiros entre os joelhos, sob a barriga ou apoiando as costas.'],
      ['li', 'Reduza telas e cafeína perto do horário de dormir e mantenha o quarto fresco.'],
      ['li', 'Para a azia, evite deitar logo após comer e converse com a equipe antes de usar medicamentos.'],
      ['h2', 'Posição para dormir'],
      ['p', 'No final da gestação, começar o sono de lado é geralmente recomendado. Se acordar de costas, apenas volte para o lado; não há motivo para pânico. Escolha o lado mais confortável, salvo orientação específica.'],
      ['note', 'Ronco intenso novo, pausas na respiração, falta de ar importante ou insônia persistente devem ser relatados no pré-natal.'],
    ],
  },
  {
    id: 'preparacao-parto-normal',
    cat: 'Parto normal',
    topic: 'vaginal-birth',
    icon: 'pregnant',
    grad: 'var(--grad-rose)',
    title: 'Parto normal: informação para se preparar',
    time: 7,
    phases: ['gravida'],
    excerpt: 'Fases do trabalho de parto, formas de conforto e decisões para conversar com a equipe.',
    body: [
      ['p', 'O trabalho de parto costuma evoluir com contrações que ficam mais regulares, intensas e próximas, além de mudanças no colo do útero. Cada experiência tem ritmo próprio e pode exigir adaptações no plano inicial.'],
      ['h2', 'Recursos de conforto'],
      ['li', 'Movimento, banho morno, respiração, massagem e posições escolhidas por você podem ajudar.'],
      ['li', 'Analgesia é uma opção e pode ser discutida sem julgamento com a equipe.'],
      ['li', 'Um acompanhante de confiança pode apoiar, observar suas preferências e ajudar na comunicação.'],
      ['h2', 'Plano de parto'],
      ['p', 'O plano registra preferências sobre ambiente, mobilidade, alívio da dor, contato pele a pele e cuidados com o bebê. Ele orienta a conversa, mas pode mudar se surgir uma necessidade clínica.'],
      ['note', 'Peça à maternidade instruções claras sobre quando ir. Sangramento, perda de líquido, dor intensa contínua ou redução dos movimentos do bebê exigem avaliação.'],
    ],
  },
  {
    id: 'entender-parto-cesarea',
    cat: 'Parto cesárea',
    topic: 'cesarean',
    icon: 'shield',
    grad: 'var(--grad-lilac)',
    title: 'Cesárea: indicação, preparo e recuperação',
    time: 7,
    phases: ['gravida'],
    excerpt: 'O que perguntar antes da cirurgia e como participar das decisões quando a cesárea é necessária ou escolhida.',
    body: [
      ['p', 'A cesárea é uma cirurgia que pode ser essencial para a segurança da mãe e do bebê em diferentes situações. Conhecer indicação, benefícios, riscos e alternativas ajuda a construir uma decisão compartilhada.'],
      ['h2', 'Antes do nascimento'],
      ['li', 'Pergunte por que a cesárea está sendo recomendada e se a decisão precisa ser imediata.'],
      ['li', 'Converse sobre anestesia, presença de acompanhante, contato pele a pele e início da amamentação.'],
      ['li', 'Siga as orientações da maternidade sobre jejum, medicamentos e horário de chegada.'],
      ['h2', 'Recuperação'],
      ['p', 'Mobilização orientada, controle adequado da dor e cuidado com a incisão favorecem a recuperação. Organizar apoio para as tarefas e para segurar o bebê reduz sobrecarga nos primeiros dias.'],
      ['note', 'Febre, falta de ar, dor ou vermelhidão crescente na incisão, secreção, sangramento intenso ou dor/inchaço em uma perna pedem avaliação rápida.'],
    ],
  },
  {
    id: 'preparo-amamentacao',
    cat: 'Amamentação',
    topic: 'breastfeeding',
    icon: 'bottle',
    grad: 'var(--grad-lilac)',
    title: 'Amamentação começa com informação, não com preparo do mamilo',
    time: 6,
    phases: ['gravida'],
    excerpt: 'O que vale aprender antes do nascimento sobre pega, livre demanda e rede de apoio.',
    body: [
      ['p', 'Não é necessário esfregar, puxar ou expor os mamilos ao sol. A preparação mais útil é entender como funciona a produção de leite, saber onde buscar ajuda e alinhar apoio para os primeiros dias.'],
      ['h2', 'O começo'],
      ['li', 'Quando mãe e bebê estão bem, contato pele a pele e primeira mamada podem acontecer logo após o nascimento.'],
      ['li', 'Colostro vem em pequena quantidade e é adequado ao estômago do recém-nascido.'],
      ['li', 'Mamadas frequentes ajudam a estabelecer a produção; horários rígidos raramente refletem a necessidade do bebê.'],
      ['h2', 'Monte sua rede'],
      ['p', 'Descubra antes do parto como acessar a equipe da maternidade, a unidade de saúde e o banco de leite humano. Apoio qualificado cedo evita que dor e insegurança se acumulem.'],
      ['note', 'Dor persistente, fissuras, febre, mama muito vermelha ou preocupação com mamadas e peso do bebê precisam de avaliação profissional.'],
    ],
  },
  {
    id: 'planejar-puerperio',
    cat: 'Puerpério',
    topic: 'postpartum',
    icon: 'baby',
    grad: 'var(--grad-rose)',
    title: 'Puerpério: prepare cuidado para quem acabou de nascer mãe',
    time: 6,
    phases: ['gravida'],
    excerpt: 'Recuperação física, apoio prático e sinais de alerta para planejar antes do nascimento.',
    body: [
      ['p', 'O puerpério começa após o parto e envolve recuperação física, mudanças hormonais, adaptação emocional e uma nova rotina. Ter ajuda concreta é cuidado de saúde, não luxo.'],
      ['h2', 'Um plano possível'],
      ['li', 'Defina quem pode ajudar com refeições, casa, compras e contatos, sem concentrar tudo em você.'],
      ['li', 'Organize retorno de saúde, transporte e contatos para dúvidas sobre você e o bebê.'],
      ['li', 'Combine limites para visitas e períodos protegidos de descanso.'],
      ['h2', 'Observe sua recuperação'],
      ['p', 'Sangramento e desconforto mudam ao longo dos dias. A equipe deve explicar o que esperar conforme o tipo de parto e quais cuidados fazer com períneo ou incisão.'],
      ['note', 'Sangramento muito intenso, febre, falta de ar, dor no peito, dor de cabeça forte, alteração visual, desmaio ou piora súbita exigem atendimento urgente.'],
    ],
  },
  {
    id: 'saude-emocional-gestacao',
    cat: 'Saúde emocional',
    topic: 'emotional-health',
    icon: 'heart',
    grad: 'var(--grad-lilac)',
    title: 'Saúde emocional também faz parte do pré-natal',
    time: 5,
    phases: ['gravida'],
    excerpt: 'Como acolher sentimentos ambivalentes e reconhecer quando ansiedade ou tristeza precisam de ajuda.',
    body: [
      ['p', 'Alegria, medo, irritação e ambivalência podem coexistir na gestação. Não sentir felicidade o tempo todo não significa falta de amor nem incapacidade para maternar.'],
      ['h2', 'Cuidado cotidiano'],
      ['li', 'Compartilhe o que sente com alguém seguro, sem minimizar seu desconforto.'],
      ['li', 'Proteja sono, alimentação, movimento possível e pausas de notícias ou relatos que aumentam a ansiedade.'],
      ['li', 'Leve saúde emocional às consultas como qualquer outro sintoma.'],
      ['h2', 'Quando buscar apoio'],
      ['p', 'Procure ajuda quando tristeza, ansiedade, pânico, pensamentos repetitivos ou dificuldade para funcionar persistem, pioram ou afetam o cuidado consigo. Psicoterapia e tratamentos médicos podem ser adaptados à gestação.'],
      ['note', 'Pensamentos de se machucar, de morrer ou sensação de risco imediato exigem ajuda urgente. Procure a emergência ou o SAMU 192; o CVV atende pelo 188.'],
    ],
  },
  {
    id: 'direitos-da-gestante',
    cat: 'Direitos da gestante',
    topic: 'rights',
    icon: 'shield',
    grad: 'var(--grad-leaf)',
    title: 'Direitos da gestante no cuidado e no trabalho',
    time: 7,
    phases: ['gravida'],
    excerpt: 'Pontos essenciais para buscar atendimento respeitoso, acompanhante e proteção no trabalho no Brasil.',
    body: [
      ['p', 'Informação ajuda você a participar das decisões sobre o próprio corpo. No atendimento, você deve receber explicações compreensíveis sobre procedimentos, benefícios, riscos e alternativas, com respeito à privacidade e à dignidade.'],
      ['h2', 'No pré-natal e no parto'],
      ['li', 'Você pode fazer perguntas, registrar preferências e consentir ou recusar procedimentos após receber informação adequada.'],
      ['li', 'A legislação brasileira garante acompanhante escolhido pela mulher durante trabalho de parto, parto e pós-parto imediato nos serviços abrangidos pela norma.'],
      ['li', 'Peça orientações por escrito à maternidade e saiba qual canal usar se um direito não for respeitado.'],
      ['h2', 'No trabalho'],
      ['p', 'Há proteções relacionadas a consultas e exames, licença-maternidade, estabilidade e condições de saúde e segurança. Regras concretas variam conforme vínculo e situação, por isso confirme com RH, sindicato, Defensoria Pública ou orientação jurídica.'],
      ['note', 'Este artigo traz informação geral, não aconselhamento jurídico. Normas e procedimentos podem mudar; consulte canais oficiais para o seu caso.'],
    ],
  },
  {
    id: 'amamentacao',
    cat: 'Pós-parto',
    topic: 'breastfeeding',
    icon: 'bottle',
    grad: 'var(--grad-lilac)',
    title: 'Amamentação nas primeiras semanas',
    time: 6,
    phases: ['posparto'],
    excerpt: 'Pega correta, livre demanda e quando procurar um banco de leite.',
    body: [
      ['p', 'A amamentação é aprendida — por você e pelo bebê. Dor persistente e fissuras quase sempre indicam problema de pega, e não "peito fraco".'],
      ['h2', 'Sinais de pega correta'],
      ['li', 'Boca bem aberta, abocanhando também a aréola, não só o mamilo.'],
      ['li', 'Queixo encostado na mama e lábio inferior virado para fora.'],
      ['li', 'Deglutição audível e ritmada, sem estalos.'],
      ['h2', 'Livre demanda'],
      ['p', 'Nas primeiras semanas o bebê mama de 8 a 12 vezes por dia. A produção funciona por estímulo: quanto mais ele mama, mais leite o corpo produz.'],
      ['note', 'Bancos de leite humano oferecem orientação gratuita. Procure o mais próximo se a dor não passar ou se houver dúvida sobre o ganho de peso do bebê.'],
    ],
  },
  {
    id: 'saude-mental-posparto',
    cat: 'Pós-parto',
    topic: 'emotional-health',
    icon: 'heart',
    grad: 'var(--grad-lilac)',
    title: 'Baby blues ou depressão pós-parto?',
    time: 5,
    phases: ['posparto'],
    premium: true,
    excerpt: 'Como diferenciar e por que pedir ajuda cedo muda tudo.',
    body: [
      ['p', 'Cerca de 8 em cada 10 mulheres sentem tristeza, choro fácil e irritabilidade nos primeiros dias após o parto. Isso é o baby blues, ligado à queda hormonal, e costuma passar em até duas semanas.'],
      ['h2', 'Quando é mais que blues'],
      ['li', 'Sintomas que passam de duas semanas ou pioram com o tempo.'],
      ['li', 'Desinteresse pelo bebê, culpa intensa ou sensação de incapacidade.'],
      ['li', 'Alterações importantes de sono e apetite além do esperado com recém-nascido.'],
      ['h2', 'O que fazer'],
      ['p', 'Fale com o obstetra ou com a equipe da maternidade. Depressão pós-parto tem tratamento eficaz, inclusive compatível com a amamentação. Contar para alguém de confiança é o primeiro passo.'],
      ['note', 'Em caso de pensamentos de morte ou de machucar a si mesma ou ao bebê, procure ajuda imediatamente — no Brasil, CVV pelo 188, 24 horas.'],
    ],
  },
  {
    id: 'quando-procurar-especialista',
    cat: 'Ciclo',
    topic: 'cycle',
    icon: 'shield',
    grad: 'var(--grad-rose)',
    title: 'Quando procurar um especialista em fertilidade',
    time: 4,
    phases: ['tentante'],
    excerpt: 'Os prazos aceitos pelas sociedades médicas e os sinais que antecipam a consulta.',
    body: [
      ['p', 'A recomendação geral é investigar após 12 meses de tentativas sem sucesso para mulheres com menos de 35 anos, e após 6 meses a partir dos 35.'],
      ['h2', 'Antecipe a consulta se'],
      ['li', 'Seus ciclos são muito irregulares ou ausentes.'],
      ['li', 'Você tem diagnóstico de endometriose, SOP ou já fez cirurgia pélvica.'],
      ['li', 'Houve dois ou mais abortos espontâneos.'],
      ['li', 'Há histórico de tratamento oncológico ou doença da tireoide.'],
      ['h2', 'O que levar'],
      ['p', 'Leve o histórico dos seus ciclos — o relatório do Florescer pode ser exportado e mostrado na consulta. Dados de vários meses ajudam muito o especialista.'],
    ],
  },
];

/* ---------------- e-books e materiais ----------------
   Os arquivos ficam em /ebooks/ e são servidos junto com o app. Para publicar
   outro material, coloque o PDF lá e cadastre aqui — ou, sem mexer em código,
   pelo Painel da administradora › E-books e materiais.

   `file` é o nome do arquivo dentro de /ebooks/. */
export const EBOOKS = [
  {
    id: 'nomes-meninas',
    title: '100 nomes de meninas',
    excerpt: 'Nomes delicados e fortes, com origem e significado, para inspirar a escolha.',
    file: '100-nomes-de-meninas.pdf',
    pages: 8,
    premium: false,
    phases: ['tentante', 'gravida', 'posparto'],
  },
  {
    id: 'nomes-meninos',
    title: '100 nomes de meninos',
    excerpt: 'Nomes fortes e bonitos, com origem e significado, para inspirar a escolha.',
    file: '100-nomes-de-meninos.pdf',
    pages: 8,
    premium: false,
    phases: ['tentante', 'gravida', 'posparto'],
  },
  {
    id: 'guia-ansiedade',
    title: 'Guia Florescer: gestão da ansiedade e a espera',
    excerpt: 'Como cuidar das emoções enquanto você espera pelo seu positivo — com a Pausa Florescer e um diário para preencher.',
    file: 'guia-de-ansiedade.pdf',
    pages: 5,
    premium: false,
    phases: ['tentante'],
  },
];

export const COMMUNITY_RULES = [
  'Acolhimento em primeiro lugar: aqui ninguém julga a jornada de ninguém.',
  'Sem indicação de medicamentos, dosagens ou tratamentos.',
  'Nada de venda de produtos, serviços ou consultas.',
  'Respeite quem está em luto gestacional — use aviso de conteúdo sensível.',
];

export const FAQ = [
  { q: 'As previsões do app são exatas?', a: 'São estimativas estatísticas com base nos seus registros. Quanto mais ciclos você registrar, mais precisas ficam. Elas não servem como método contraceptivo nem substituem avaliação médica.' },
  { q: 'Meus dados vão para algum servidor?', a: 'Os seus registros não. Tudo é salvo apenas no armazenamento deste aparelho — se você limpar os dados do navegador ou desinstalar o app, as informações são perdidas, por isso existe a exportação em Configurações. A única exceção é a IA da Flor: se você ativá-la, a sua pergunta e os números do seu ciclo são enviados para gerar a resposta. Os detalhes estão em Configurações › Privacidade e dados.' },
  { q: 'Como faço backup?', a: 'Em Configurações › Privacidade e dados, use "Exportar meus dados". Um arquivo .json é baixado e pode ser importado depois, inclusive em outro aparelho.' },
  { q: 'Posso usar o Florescer como contraceptivo?', a: 'Não. O app foi feito para quem quer engravidar ou acompanhar o ciclo. Métodos baseados em calendário têm alta taxa de falha para evitar gravidez.' },
  { q: 'Como o app calcula a ovulação?', a: 'Usamos a duração média dos seus últimos ciclos e uma fase lútea de 14 dias (ajustável). A janela fértil vai de 5 dias antes da ovulação até 1 dia depois.' },
  { q: 'O que acontece se eu mudar de fase?', a: 'No perfil você pode mudar entre tentante, grávida e pós-parto a qualquer momento. A tela inicial e o conteúdo se adaptam, e o histórico do ciclo é preservado.' },
];

export const PREMIUM_BENEFITS = [
  { icon: 'flower', title: 'Análises avançadas do ciclo', text: 'Curva de temperatura basal, padrões de sintomas e relatório para levar à consulta.' },
  { icon: 'leaf', title: 'Alimentação e fertilidade', text: 'Guias completos por fase do ciclo, com listas de compras.' },
  { icon: 'moon', title: 'Gestão da ansiedade', text: 'Meditações guiadas e exercícios de respiração para a espera.' },
  { icon: 'chart', title: 'Relatório para a consulta', text: 'Histórico completo dos seus ciclos, exportável para levar ao médico.' },
  { icon: 'users', title: 'Comunidade VIP', text: 'Conteúdo exclusivo e rodas de conversa moderadas por especialistas.' },
  { icon: 'book', title: 'Biblioteca completa', text: 'Todos os artigos, inclusive os exclusivos de cada fase.' },
];
