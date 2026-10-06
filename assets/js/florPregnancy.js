/**
 * Base de conhecimento da Flor para a gestação.
 *
 * Mesmo formato das intenções do ciclo (`florAssistant.js`): cada tema tem
 * termos de busca e um `build(ctx)` que pode usar os dados reais dela —
 * semana, DPP, próxima consulta, etapas atrasadas.
 *
 * Limites que valem para cada linha deste arquivo:
 *  - explicar PARA QUE serve um exame, nunca interpretar um resultado;
 *  - explicar PARA QUE serve uma vitamina, nunca dizer dose nem marca;
 *  - nunca afirmar que algo está normal, nem que algo é seguro para ela;
 *  - toda orientação termina onde começa a consulta: a Flor não substitui
 *    a equipe de pré-natal, e o texto precisa deixar isso explícito.
 */
import { fmtShort, plural, relativeDay } from './cycle.js';

/* ---------------------------------------------------------------
   Sinais de alerta da gestação.
   Entram antes de qualquer resposta educativa e nunca são enviados
   ao servidor: ficam resolvidos no aparelho.
   --------------------------------------------------------------- */
export const PREGNANCY_URGENT = [
  {
    id: 'urgente-movimentos',
    terms: [
      'bebe nao mexe', 'nao sinto o bebe', 'parou de mexer', 'nao mexe desde',
      'diminuiu os movimentos', 'bebe mexendo pouco', 'sem movimentos',
    ],
    title: 'Movimento reduzido precisa ser avaliado hoje',
    answer: 'Essa é uma das poucas coisas que não dá para esperar passar. Procure a maternidade hoje, mesmo que você ache que é bobagem.',
    bullets: [
      'Deite do lado esquerdo, em um lugar calmo, depois de comer algo, e preste atenção nos movimentos por duas horas.',
      'Se continuar diferente do habitual, vá à maternidade de referência agora — não espere a próxima consulta.',
      'Leve a sua caderneta ou o cartão de pré-natal.',
    ],
  },
  {
    id: 'urgente-preeclampsia',
    terms: [
      'dor de cabeca forte', 'vista embacada', 'enxergando pontos', 'pontos luminosos',
      'pressao alta', 'inchaco no rosto', 'inchei de repente', 'inchaco de repente',
      'dor embaixo das costelas', 'zumbido no ouvido',
    ],
    title: 'Esses sinais pedem avaliação imediata',
    answer: 'Dor de cabeça forte, alteração na visão, inchaço súbito no rosto ou nas mãos e dor na boca do estômago, juntos ou separados, precisam de avaliação no mesmo dia.',
    bullets: [
      'Procure a maternidade de referência, não uma UPA comum: é lá que medem a sua pressão e avaliam o bebê.',
      'Leve a caderneta de pré-natal e, se tiver anotado, os valores de pressão dos últimos dias.',
      'Vá acompanhada se puder.',
    ],
  },
  {
    id: 'urgente-trabalho-parto',
    terms: [
      'contracoes seguidas', 'contracoes regulares', 'bolsa estourou', 'bolsa rompeu',
      'perdi liquido', 'estou em trabalho de parto', 'contracao a cada',
    ],
    title: 'Hora de ir para a maternidade',
    answer: 'Perda de líquido ou contrações que vêm em intervalos regulares e vão ficando mais fortes pedem avaliação presencial agora.',
    bullets: [
      'Antes de 37 semanas, qualquer um desses sinais é urgente: vá imediatamente.',
      'Anote a hora em que começou e o intervalo entre as contrações — a equipe vai perguntar.',
      'Se houver líquido com cor esverdeada ou com sangue, avise na recepção assim que chegar.',
    ],
  },
];

/* ---------------------------------------------------------------
   Temas da gestação
   --------------------------------------------------------------- */
const semanaAtual = (ctx) => (ctx.preg?.known
  ? `${plural(ctx.preg.weeks, 'semana', 'semanas')}${ctx.preg.days ? ` e ${plural(ctx.preg.days, 'dia', 'dias')}` : ''}`
  : null);

/** A próxima etapa do pré-natal dela, se o plano já estiver montado. */
function proximaEtapa(ctx, tipos) {
  const plano = ctx.prenatal || [];
  const candidatas = plano.filter((step) => tipos.includes(step.type) && step.status !== 'done');
  const agora = candidatas.find((step) => step.status === 'now' || step.status === 'late');
  return agora || candidatas.find((step) => step.status === 'scheduled') || candidatas[0] || null;
}

export const PREGNANCY_INTENTS = [
  {
    id: 'gestacao-semana',
    phases: ['gravida'],
    terms: ['em que semana estou', 'em que semana eu estou', 'quantas semanas', 'semanas de gestacao', 'minha semana', 'quanto tempo de gestacao', 'quanto falta para o parto', 'quando nasce'],
    title: 'Onde você está na gestação',
    build: (ctx) => {
      if (!ctx.preg?.known) {
        return {
          answer: 'Preciso da data provável do parto ou da última menstruação para contar as semanas com você.',
          link: { label: 'Informar os dados da gestação', to: 'perfil' },
        };
      }
      const p = ctx.preg;
      return {
        answer: `Você está com ${semanaAtual(ctx)}, no ${p.trimester}º trimestre. A data provável do parto é ${fmtShort(p.due)} — ${relativeDay(p.due)}.`,
        bullets: [
          `Nesta semana o bebê tem mais ou menos o tamanho de ${p.size.name}. ${p.size.note}`,
          'A DPP é uma referência, não uma marcação: a maioria dos partos acontece entre 37 e 42 semanas.',
        ],
        link: { label: 'Ver a página desta semana', to: `semana/${p.weeks}` },
      };
    },
  },
  {
    id: 'pre-natal-consultas',
    phases: ['gravida'],
    terms: ['consulta de pre natal', 'consultas de pre natal', 'pre natal', 'quantas consultas', 'de quanto em quanto tempo consulta', 'proxima consulta', 'minha proxima consulta', 'quando devo ir ao medico'],
    title: 'As consultas de pré-natal',
    build: (ctx) => {
      const etapa = proximaEtapa(ctx, ['prenatal']);
      const base = [
        'O ritmo mais usado é mensal até a 28ª semana, quinzenal até a 36ª e semanal a partir daí.',
        'Em cada consulta a equipe avalia pressão, peso, altura uterina, batimentos do bebê e os exames já feitos.',
        'Leve as dúvidas anotadas: na hora ninguém lembra de tudo.',
      ];
      if (!etapa) {
        return { answer: 'O pré-natal acompanha você do começo ao parto, e começar cedo faz diferença no resultado.', bullets: base, link: { label: 'Abrir o calendário inteligente', to: 'pre-natal' } };
      }
      const situacao = etapa.status === 'late'
        ? `A sua ${etapa.title.toLowerCase()} já passou da janela recomendada (${etapa.window.toLowerCase()}). Vale remarcar o quanto antes.`
        : etapa.status === 'scheduled'
          ? `A sua próxima é a ${etapa.title.toLowerCase()}, já marcada para ${fmtShort(etapa.event.date)}.`
          : `A próxima pela sua semana é a ${etapa.title.toLowerCase()} — ${etapa.window.toLowerCase()}.`;
      return { answer: situacao, bullets: base, link: { label: 'Abrir o calendário inteligente', to: 'pre-natal' } };
    },
  },
  {
    id: 'vitaminas-gestacao',
    phases: ['gravida', 'tentante'],
    terms: ['acido folico', 'vitamina', 'suplemento', 'ferro', 'calcio', 'polivitaminico', 'dha', 'omega'],
    title: 'Vitaminas e suplementos',
    build: (ctx) => ({
      answer: ctx.phase === 'gravida'
        ? 'Posso te explicar para que serve cada um, mas a dose e o tempo de uso saem da sua consulta — nunca de um aplicativo.'
        : 'Quem planeja engravidar costuma começar o ácido fólico antes da gestação. Qual, quanto e por quanto tempo é a equipe que define.',
      bullets: [
        'Ácido fólico: reduz o risco de defeitos do tubo neural. É indicado desde antes de engravidar e costuma seguir pelo menos até o fim do 1º trimestre.',
        'Ferro: previne e trata anemia, comum na gestação. A indicação costuma vir junto com o resultado do hemograma.',
        'Cálcio e vitamina D: entram conforme a sua alimentação e os seus exames.',
        'Polivitamínicos de farmácia não são todos iguais e alguns têm vitamina A em excesso, que faz mal ao bebê.',
      ],
      bullets2: 'Nunca comece, troque ou aumente um suplemento por conta própria, nem os vendidos sem receita — leve o frasco para a consulta e pergunte.',
      link: { label: 'Ver vitaminas no calendário', to: 'pre-natal' },
    }),
  },
  {
    id: 'exames-gestacao',
    phases: ['gravida'],
    terms: ['exames da gravidez', 'que exames', 'exames do pre natal', 'exames de sangue', 'exame de urina'],
    title: 'Os exames do pré-natal',
    build: (ctx) => {
      const etapa = proximaEtapa(ctx, ['lab']);
      return {
        answer: etapa
          ? `Os exames são repetidos por trimestre. O bloco da sua fase é ${etapa.title.toLowerCase()} — ${etapa.window.toLowerCase()}.`
          : 'Os exames do pré-natal são repetidos a cada trimestre para acompanhar você e o bebê.',
        bullets: [
          '1º trimestre: hemograma, tipagem sanguínea e fator Rh, glicemia, sífilis, HIV, hepatite B, toxoplasmose, urina e urocultura.',
          '2º trimestre: repete hemograma e sorologias e inclui o teste de tolerância à glicose, entre 24 e 28 semanas.',
          '3º trimestre: repete os principais e acrescenta a pesquisa de estreptococo B, entre 35 e 37 semanas.',
        ],
        bullets2: 'Eu explico para que cada exame serve, mas não leio resultado: quem interpreta os seus números é a sua equipe, olhando o conjunto.',
        link: { label: 'Ver os exames no calendário', to: 'pre-natal' },
      };
    },
  },
  {
    id: 'ultrassom',
    phases: ['gravida'],
    terms: ['ultrassom', 'ultrassonografia', 'morfologico', 'translucencia nucal', 'usg', 'ecografia'],
    title: 'Os ultrassons da gestação',
    build: (ctx) => {
      const etapa = proximaEtapa(ctx, ['ultrasound']);
      return {
        answer: etapa
          ? `Cada ultrassom tem a sua janela. O próximo pela sua semana é o ${etapa.title.toLowerCase()} — ${etapa.window.toLowerCase()}.`
          : 'Cada ultrassom responde a uma pergunta diferente, e por isso tem uma janela própria.',
        bullets: [
          'Datação (6 a 12 semanas): confirma a idade gestacional, quantos bebês são e os batimentos.',
          'Morfológico do 1º trimestre (11 a 14 semanas): inclui a translucência nucal. Essa janela não se repete.',
          'Morfológico do 2º trimestre (20 a 24 semanas): avalia em detalhe a formação dos órgãos. É o mais completo.',
          'Crescimento (28 a 32) e avaliação final (36 a 38): acompanham peso, placenta, líquido e a posição do bebê.',
        ],
        bullets2: 'Imagem e laudo são leitura da equipe. Se algo no laudo te assustou, leve a dúvida para a consulta em vez de procurar na internet.',
      };
    },
  },
  {
    id: 'beta-hcg',
    phases: ['gravida', 'tentante'],
    terms: ['beta hcg', 'beta', 'hcg', 'dobrou', 'valor do beta'],
    title: 'O que é o beta-hCG',
    build: () => ({
      answer: 'É o hormônio produzido depois da implantação. O exame de sangue detecta valores bem baixos e por isso costuma positivar antes do teste de farmácia.',
      bullets: [
        'Nas primeiras semanas o valor costuma subir rápido, mas a faixa normal é larguíssima: números muito diferentes podem ser igualmente saudáveis.',
        'Um valor isolado diz pouco; a equipe costuma olhar a evolução entre duas coletas.',
        'A partir de certo ponto o ultrassom passa a informar mais do que o beta.',
      ],
      bullets2: 'Eu não interpreto o seu resultado e não digo se está bom ou ruim — só a sua equipe pode fazer isso, com o seu histórico na mão.',
    }),
  },
  {
    id: 'diabetes-gestacional',
    phases: ['gravida'],
    terms: ['curva glicemica', 'teste de tolerancia', 'totg', 'diabetes gestacional', 'exame do acucar', 'glicose'],
    title: 'O teste de tolerância à glicose',
    build: () => ({
      answer: 'É o exame que investiga diabetes gestacional, geralmente feito entre 24 e 28 semanas.',
      bullets: [
        'Você chega em jejum, coleta sangue, toma uma solução com glicose e coleta de novo depois de 1 e 2 horas.',
        'Reserve a manhã: são cerca de duas horas no laboratório, e você precisa ficar por lá entre as coletas.',
        'O diabetes gestacional costuma não dar sintoma nenhum — é por isso que o exame é feito em todo mundo.',
        'Quando aparece, o tratamento começa por alimentação e atividade física, com acompanhamento próximo.',
      ],
      bullets2: 'Se o seu resultado veio alterado, a conduta é da equipe. Não mude a sua alimentação por conta própria na gestação.',
    }),
  },
  {
    id: 'estreptococo',
    phases: ['gravida'],
    terms: ['estreptococo', 'strepto', 'gbs', 'exame do cotonete', 'swab vaginal'],
    title: 'A pesquisa de estreptococo B',
    build: () => ({
      answer: 'É uma coleta simples, com swab, feita entre 35 e 37 semanas para saber se a bactéria está presente na flora vaginal e retal.',
      bullets: [
        'Não é infecção nem doença: muita gente carrega essa bactéria sem nenhum sintoma.',
        'Saber antes permite que a equipe use antibiótico durante o trabalho de parto, protegendo o bebê.',
        'O resultado vale por poucas semanas, por isso a coleta é feita perto do fim.',
      ],
    }),
  },
  {
    id: 'vacinas-gestante',
    phases: ['gravida'],
    terms: ['vacina na gravidez', 'vacinas da gestante', 'dtpa', 'vacina da gripe', 'posso tomar vacina'],
    title: 'As vacinas da gestante',
    build: () => ({
      answer: 'Algumas vacinas são recomendadas justamente durante a gestação: além de proteger você, passam anticorpos para o bebê.',
      bullets: [
        'dTpa: protege contra coqueluche e é indicada a cada gestação, a partir da 20ª semana.',
        'Influenza (gripe): indicada em qualquer fase da gestação, na campanha anual.',
        'Hepatite B e outras entram conforme a sua situação vacinal e o calendário vigente.',
        'Vacinas de vírus vivo em geral não são usadas na gestação — a equipe confere isso na caderneta.',
      ],
      bullets2: 'Leve a caderneta em toda consulta: é ela que mostra o que falta.',
      link: { label: 'Ver vacinas no calendário', to: 'pre-natal' },
    }),
  },
  {
    id: 'enjoo-gestacao',
    phases: ['gravida'],
    terms: ['enjoo', 'nausea', 'vomito', 'enjoada', 'mal estar de manha'],
    title: 'Enjoo na gestação',
    build: () => ({
      answer: 'É um dos sintomas mais comuns do 1º trimestre e costuma melhorar perto das 14 a 16 semanas. Apesar do apelido, pode vir em qualquer hora do dia.',
      bullets: [
        'Comer pouco e com frequência, evitando ficar de estômago vazio, costuma ajudar mais do que grandes refeições.',
        'Alimentos secos antes de levantar, líquidos fora das refeições e cheiros fortes longe da cozinha são as estratégias mais citadas.',
        'Gengibre é um recurso caseiro comum, mas converse antes com a sua equipe.',
      ],
      bullets2: 'Vômito que impede você de beber água, perda de peso ou urina muito escura precisam de avaliação — existe tratamento e você não precisa aguentar.',
    }),
  },
  {
    id: 'azia-gestacao',
    phases: ['gravida'],
    terms: ['azia', 'refluxo', 'queimacao', 'estomago queimando'],
    title: 'Azia e refluxo',
    build: () => ({
      answer: 'A progesterona relaxa a válvula do estômago e, mais para o fim, o útero empurra tudo para cima. A combinação explica a azia que aparece tanto no 3º trimestre.',
      bullets: [
        'Refeições menores e mais frequentes costumam incomodar menos que poucas refeições grandes.',
        'Evitar deitar logo depois de comer e elevar a cabeceira da cama ajudam à noite.',
        'Frituras, café, refrigerante e comidas muito condimentadas costumam piorar.',
      ],
      bullets2: 'Antiácidos não são todos liberados na gestação. Pergunte na consulta qual você pode usar antes de comprar.',
    }),
  },
  {
    id: 'movimentos-bebe',
    phases: ['gravida'],
    terms: ['bebe mexer', 'movimentos do bebe', 'chutes', 'quando vou sentir o bebe', 'mexeu'],
    title: 'Os movimentos do bebê',
    build: (ctx) => {
      const semana = ctx.preg?.known ? ctx.preg.weeks : null;
      const inicio = semana !== null && semana < 20
        ? 'Na primeira gestação, a maioria começa a sentir entre 18 e 22 semanas; quem já teve bebê costuma perceber antes.'
        : 'A partir de 28 semanas o padrão fica mais definido e dá para reconhecer os horários em que ele se mexe mais.';
      return {
        answer: inicio,
        bullets: [
          'O que importa não é um número mágico de chutes, e sim o padrão: o que é habitual para o seu bebê.',
          'Ele tem ciclos de sono de 20 a 40 minutos — ficar parado um tempo é esperado.',
          'Deitar do lado esquerdo depois de comer costuma ser o melhor momento para prestar atenção.',
        ],
        bullets2: 'Se os movimentos ficarem claramente menores ou diferentes do habitual, procure a maternidade no mesmo dia. Isso nunca é exagero.',
      };
    },
  },
  {
    id: 'alimentacao-gestacao',
    phases: ['gravida'],
    terms: ['o que nao posso comer', 'alimentos proibidos', 'posso comer', 'alimentacao na gravidez', 'cafe na gravidez', 'peixe cru'],
    title: 'Alimentação na gestação',
    build: () => ({
      answer: 'A maior parte da sua comida continua a mesma. O cuidado se concentra em alguns alimentos de risco e no modo de preparo.',
      bullets: [
        'Fora: carne, peixe e ovo crus ou malpassados, leite e queijos não pasteurizados, embutidos sem aquecer e álcool em qualquer quantidade.',
        'Lave bem frutas, verduras e legumes — toxoplasmose entra com mais frequência por aí do que pelo gato.',
        'Cafeína costuma ser liberada com moderação; combine o limite na consulta.',
      ],
      link: { label: 'Abrir o guia de alimentação', to: 'alimentacao-gestante' },
    }),
  },
  {
    id: 'remedios-gestacao',
    phases: ['gravida'],
    terms: ['posso tomar remedio', 'remedio na gravidez', 'dipirona', 'paracetamol', 'antibiotico', 'analgesico'],
    title: 'Remédios na gestação',
    build: () => ({
      answer: 'Essa é uma pergunta que eu não respondo, e não é por falta de vontade: a resposta muda conforme a sua semana, os seus exames e o seu histórico.',
      bullets: [
        'Nem tudo que é vendido sem receita é seguro na gestação, incluindo chás e produtos naturais.',
        'Se você usava algum remédio contínuo antes de engravidar, não interrompa por conta própria — leve para a consulta.',
        'Guarde a caixa ou o nome do que você tomou antes de saber da gravidez e conte na consulta, sem culpa.',
      ],
      bullets2: 'Quem pode dizer o que você pode tomar é a sua equipe de pré-natal, ou um plantão da maternidade fora do horário.',
    }),
  },
  {
    id: 'exercicio-gestacao',
    phases: ['gravida'],
    terms: ['exercicio na gravidez', 'academia', 'posso malhar', 'caminhada', 'atividade fisica', 'pilates'],
    title: 'Atividade física na gestação',
    build: () => ({
      answer: 'Em gestações de baixo risco, manter-se ativa é recomendado: ajuda com dor lombar, sono, humor e o controle do ganho de peso.',
      bullets: [
        'Caminhada, hidroginástica, natação e exercícios de força leves são as escolhas mais comuns.',
        'O teste simples é conseguir conversar enquanto se exercita.',
        'Evite esportes com risco de queda ou impacto e exercícios deitada de barriga para cima na segunda metade.',
      ],
      bullets2: 'Antes de começar ou mudar a sua rotina, confirme com a equipe — algumas situações pedem repouso relativo.',
    }),
  },
  {
    id: 'peso-gestacao',
    phases: ['gravida'],
    terms: ['ganho de peso', 'quantos quilos', 'engordar na gravidez', 'peso na gestacao'],
    title: 'Ganho de peso na gestação',
    build: () => ({
      answer: 'Não existe um número único: a faixa recomendada depende do seu IMC antes de engravidar, e quem calcula a sua é a equipe na consulta.',
      bullets: [
        'O ganho é desigual ao longo do tempo: costuma ser pequeno no 1º trimestre e mais constante depois.',
        'O que a equipe acompanha é a curva, não o número de um dia.',
        'Registrar o peso no app ajuda a mostrar essa curva na consulta.',
      ],
      bullets2: 'Gestação não é momento para dieta de restrição por conta própria. Se o ganho preocupar você, leve isso para a consulta.',
      link: { label: 'Registrar meu peso', to: 'registro?s=sintomas' },
    }),
  },
  {
    id: 'sono-gestacao',
    phases: ['gravida'],
    terms: ['dormir na gravidez', 'posicao para dormir', 'insonia', 'nao consigo dormir', 'barriga para cima'],
    title: 'Sono e posição para dormir',
    build: () => ({
      answer: 'Na segunda metade da gestação, dormir de lado — de preferência o esquerdo — melhora o retorno do sangue para você e para o bebê.',
      bullets: [
        'Travesseiro entre as pernas e outro apoiando a barriga costuma resolver boa parte do desconforto.',
        'Acordar de barriga para cima acontece e não é motivo para pânico: só vire de lado e siga dormindo.',
        'Insônia no 3º trimestre é comum, entre xixi, azia e a cabeça acelerada.',
      ],
      bullets2: 'Se a insônia estiver pesando no seu dia, leve isso para a consulta — tem como ajudar, e não passa por se virar sozinha.',
    }),
  },
  {
    id: 'desconfortos-gestacao',
    phases: ['gravida'],
    terms: ['colica', 'dor na barriga', 'barriga endurece', 'barriga dura', 'dor lombar', 'dor nas costas', 'contracao de treinamento', 'braxton'],
    title: 'Dores e desconfortos da barriga',
    build: (ctx) => ({
      answer: 'Conforme o útero cresce, aparecem desconfortos novos: fisgadas nas laterais, peso embaixo da barriga, dor lombar e a barriga que endurece por alguns segundos e relaxa.',
      bullets: [
        'As fisgadas laterais costumam vir do estiramento dos ligamentos que sustentam o útero, principalmente ao levantar ou virar na cama.',
        'A barriga que endurece sem ritmo e sem dor é descrita como contração de treinamento, e costuma passar com repouso, banho morno e água.',
        'Dor lombar melhora com postura, calor local, alongamento e evitar ficar muito tempo na mesma posição.',
      ],
      bullets2: ctx.preg?.known && ctx.preg.weeks < 37
        ? 'Barriga que endurece em intervalos regulares, dor que não passa, sangramento ou perda de líquido antes de 37 semanas pedem avaliação imediata na maternidade — e nenhuma dor forte deve ser suportada em casa.'
        : 'Dor forte, dor que não passa, sangramento ou perda de líquido pedem avaliação na maternidade no mesmo dia. Nenhuma dor forte deve ser suportada em casa.',
    }),
  },
  {
    id: 'parto-sinais',
    phases: ['gravida'],
    terms: ['trabalho de parto', 'sinais de parto', 'quando ir para a maternidade', 'contracoes', 'tampao mucoso', 'bolsa'],
    title: 'Sinais de trabalho de parto',
    build: (ctx) => ({
      answer: ctx.preg?.known && ctx.preg.weeks < 37
        ? `Você está com ${semanaAtual(ctx)}. Antes de 37 semanas, contrações regulares ou perda de líquido não são "ensaio": procure a maternidade na hora.`
        : 'O trabalho de parto costuma se anunciar aos poucos, e nem todo desconforto é ele.',
      bullets: [
        'Contrações de trabalho de parto são regulares, ficam mais fortes e não passam com repouso ou banho morno.',
        'Perda de líquido, mesmo pouca e clara, pede avaliação — é diferente de corrimento.',
        'O tampão mucoso pode sair dias antes; sozinho, ele não indica que é hoje.',
      ],
      bullets2: 'Combine na consulta os critérios da sua maternidade para quando sair de casa — eles mudam de serviço para serviço.',
    }),
  },
  {
    id: 'mala-maternidade',
    phases: ['gravida'],
    terms: ['mala da maternidade', 'o que levar para o parto', 'bolsa da maternidade', 'o que levar para a maternidade'],
    title: 'A mala da maternidade',
    build: () => ({
      answer: 'A partir de 36 semanas vale deixar tudo pronto perto da porta. A lista varia conforme o serviço, mas o básico se repete.',
      bullets: [
        'Documentos, cartão de pré-natal, exames e carteirinha do convênio — essa parte é a que mais atrasa a entrada.',
        'Para você: roupa confortável, chinelo, absorvente pós-parto, itens de higiene e sutiã de amamentação.',
        'Para o bebê: roupinhas, fraldas, mantas e a saída da maternidade.',
        'Pergunte na consulta o que a sua maternidade já fornece: muita coisa não precisa ir.',
      ],
    }),
  },
  {
    id: 'sexo-gestacao',
    phases: ['gravida'],
    terms: ['sexo na gravidez', 'relacao na gestacao', 'transar gravida', 'faz mal transar'],
    title: 'Relação durante a gestação',
    build: () => ({
      answer: 'Na maioria das gestações sem complicação, a relação é liberada do começo ao fim e não machuca o bebê, protegido pelo líquido e pelo colo do útero.',
      bullets: [
        'Pequenas contrações depois do orgasmo são esperadas e passam.',
        'Desejo que aumenta, some e volta ao longo dos trimestres é comum nos dois sentidos.',
        'Posições mais confortáveis mudam conforme a barriga cresce.',
      ],
      bullets2: 'Existem situações em que a equipe orienta evitar — placenta prévia, sangramento, risco de parto prematuro, perda de líquido. Confirme a sua situação na consulta.',
    }),
  },
  {
    id: 'viagem-gestacao',
    phases: ['gravida'],
    terms: ['viajar gravida', 'viagem na gestacao', 'andar de aviao', 'posso viajar'],
    title: 'Viagens na gestação',
    build: () => ({
      answer: 'Em gestação sem complicação, o 2º trimestre costuma ser o período mais confortável para viajar.',
      bullets: [
        'Companhias aéreas costumam limitar o voo perto do fim e pedir declaração médica — confirme as regras antes de comprar.',
        'Em viagens longas, levante e caminhe a cada hora e beba bastante água: ficar parada aumenta o risco de trombose.',
        'Leve o cartão de pré-natal e descubra qual é a maternidade de referência do destino.',
      ],
      bullets2: 'Quem libera a viagem é a sua equipe, olhando a sua gestação.',
    }),
  },
];

export const PREGNANCY_SUGGESTIONS = {
  primeiro: [
    'Em que semana eu estou?',
    'Quais exames eu faço agora?',
    'Para que serve o ácido fólico?',
    'O que eu não posso comer?',
    'O enjoo passa quando?',
    'Como funcionam as consultas de pré-natal?',
  ],
  segundo: [
    'Em que semana eu estou?',
    'Para que serve o ultrassom morfológico?',
    'Quando vou sentir o bebê mexer?',
    'O que é o teste de tolerância à glicose?',
    'Quanto peso eu devo ganhar?',
    'Posso fazer exercício?',
  ],
  terceiro: [
    'Quais são os sinais de trabalho de parto?',
    'O que levar na mala da maternidade?',
    'Qual a melhor posição para dormir?',
    'Para que serve o exame de estreptococo B?',
    'Como sei se o bebê está mexendo bem?',
    'Quais vacinas eu preciso tomar?',
  ],
};
