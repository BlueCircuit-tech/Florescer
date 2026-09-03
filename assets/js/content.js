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
  { id: 'clara_ovo', label: 'Clara de ovo 🌿' },
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
  participants: 214,
};

export const PLANS = [
  { id: 'mensal', label: 'Mensal', price: 'R$ 19,90', per: '/mês', note: 'cancele quando quiser', best: false },
  { id: 'anual', label: 'Anual', price: 'R$ 149,90', per: '/ano', note: 'economize 37% · R$ 12,49 por mês', best: true },
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
  if (!pool.length) return { c: 'bem', txt: 'Cuide de você hoje. 💛' };
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

/* ---------------- comunidade (conteúdo inicial) ---------------- */
export const SEED_POSTS = [
  {
    id: 'p1', author: 'Camila S.', avatar: '🌻', phase: 'tentante', hoursAgo: 1,
    text: 'Positivo no teste de ovulação pela primeira vez em 4 meses acompanhando por aqui! Entender o meu ciclo mudou tudo. 🥹🌿',
    likes: 86,
    comments: [
      { author: 'Renata M.', avatar: '🤰', text: 'Que notícia boa, Camila! Torcendo muito por você 💛', hoursAgo: 0.6 },
      { author: 'Aline B.', avatar: '🌷', text: 'Você usou o teste em qual horário? Ainda me perco nisso.', hoursAgo: 0.3 },
    ],
  },
  {
    id: 'p2', author: 'Renata M.', avatar: '🤰', phase: 'gravida', hoursAgo: 3,
    text: 'Meninas, depois de 1 ano e 2 meses de tentativas... estou grávida! Não desistam. Cada ciclo é um recomeço. 💛',
    likes: 342,
    comments: [
      { author: 'Paty L.', avatar: '🍼', text: 'Chorei aqui lendo. Felicidades!! 🫶', hoursAgo: 2 },
    ],
  },
  {
    id: 'p3', author: 'Aline B.', avatar: '🌷', phase: 'tentante', hoursAgo: 5,
    text: 'A dica de ontem sobre temperatura basal me fez finalmente entender o meu gráfico. Alguém mais mede todo dia às 6h? 😅',
    likes: 54, comments: [],
  },
  {
    id: 'p4', author: 'Paty L.', avatar: '🍼', phase: 'posparto', hoursAgo: 8,
    text: '3 meses da Cecília hoje! Para quem está na madrugada amamentando: passa. E vale cada segundo. 🫶',
    likes: 198, comments: [],
  },
  {
    id: 'p5', author: 'Júlia R.', avatar: '🌸', phase: 'tentante', hoursAgo: 26,
    text: 'Ciclo 7 acompanhando aqui. Ainda sem positivo, mas hoje quero registrar outra coisa: aprendi a não me culpar. Isso também é avanço.',
    likes: 121, comments: [],
  },
  {
    id: 'p6', author: 'Marina C.', avatar: '🤰', phase: 'gravida', hoursAgo: 6,
    text: 'Hoje ouvi o coração do meu bebê e ainda estou tentando colocar em palavras o que senti. Foi uma mistura linda de alívio, amor e gratidão. Como foi esse momento para vocês?',
    likes: 174,
    comments: [
      { author: 'Bianca T.', avatar: '🌷', text: 'Também chorei muito! Parece que naquele instante tudo fica mais real. 💛', hoursAgo: 4.5 },
    ],
  },
  {
    id: 'p7', author: 'Bianca T.', avatar: '🌷', phase: 'gravida', hoursAgo: 12,
    text: 'Estou no segundo trimestre e tenho vivido dias de muita energia e outros de puro cansaço. Estou aprendendo a respeitar o meu ritmo sem culpa.',
    likes: 97, comments: [],
  },
  {
    id: 'p8', author: 'Nath S.', avatar: '🌼', phase: 'gravida', hoursAgo: 20,
    text: 'Alguém mais fica ansiosa antes das consultas? O que tem ajudado vocês a chegar mais tranquilas e lembrar das perguntas que querem fazer?',
    likes: 68,
    comments: [
      { author: 'Marina C.', avatar: '🤰', text: 'Eu anoto tudo durante a semana e levo a lista no celular. Tem me ajudado bastante.', hoursAgo: 18 },
    ],
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
  { q: 'Meus dados vão para algum servidor?', a: 'Não. Tudo é salvo apenas no armazenamento deste aparelho. Se você limpar os dados do navegador ou desinstalar o app, as informações são perdidas — por isso existe a exportação em Configurações.' },
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
  { icon: 'book', title: 'E-books de nomes', text: '100 nomes de meninas e 100 de meninos, com significados.' },
];
