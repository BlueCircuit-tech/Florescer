/**
 * Guia de alimentação na gestação.
 *
 * Referências editoriais: Guia Alimentar para a População Brasileira e
 * Caderneta da Gestante (Ministério da Saúde), orientações de segurança
 * alimentar da Anvisa e recomendações do NHS para gestantes.
 *
 * Conteúdo educativo. Quantidades, suplementos e restrições individuais são
 * definidos por médico ou nutricionista que acompanhe a gestação.
 */

const STAGES = [
  {
    until: 13,
    period: '1º trimestre',
    status: 'Comer o que for possível, sem culpa',
    focus: 'Enjoo e aversões são comuns agora. O bebê ainda é pequeno e precisa de pouca energia extra: nesta fase, o foco é manter você hidratada e nutrida, não comer “perfeito”.',
    tips: [
      'Faça refeições menores a cada 2 ou 3 horas; o estômago vazio costuma piorar o enjoo.',
      'Deixe um lanche seco (biscoito água e sal, torrada) ao lado da cama para comer antes de levantar.',
      'Beba líquidos entre as refeições, e não durante, se o enjoo aumentar.',
      'Se algum alimento saudável está intolerável agora, troque por outro do mesmo grupo e volte a ele depois.',
      'Ácido fólico é a prioridade desta fase e vem da suplementação prescrita, não só da comida.',
    ],
  },
  {
    until: 27,
    period: '2º trimestre',
    status: 'Fase de mais apetite e disposição',
    focus: 'O enjoo costuma aliviar e o apetite volta. A necessidade de energia aumenta pouco — cerca de um lanche reforçado por dia — mas a de ferro e cálcio sobe bastante.',
    tips: [
      'Combine fontes de ferro (feijão, carnes, folhas escuras) com vitamina C (laranja, limão, acerola) na mesma refeição.',
      'Evite café, chá preto e chá mate junto das refeições: eles atrapalham a absorção do ferro.',
      'Inclua cálcio todos os dias: leite, iogurte, queijo, gergelim, tofu ou folhas verde-escuras.',
      'Fibras e água ajudam com a constipação, que fica mais comum nesta fase.',
      'Ganho de peso tem faixa própria para cada IMC inicial — quem define a sua é a sua equipe.',
    ],
  },
  {
    until: 40,
    period: '3º trimestre',
    status: 'Refeições menores, mais vezes ao dia',
    focus: 'O útero comprime o estômago e a azia aumenta. Comer pouco e com frequência costuma funcionar melhor do que três refeições grandes.',
    tips: [
      'Evite deitar logo após comer; espere cerca de uma hora e eleve a cabeceira à noite.',
      'Reduza frituras, alimentos muito gordurosos e condimentados se a azia apertar.',
      'Mantenha a hidratação: ela ajuda com inchaço, constipação e contrações de treinamento.',
      'Deixe lanches práticos preparados para os primeiros dias depois do parto.',
      'Continue o suplemento de ferro enquanto a sua equipe orientar, inclusive após o nascimento.',
    ],
  },
];

/** Grupos que devem aparecer no prato ao longo do dia. */
export const PREGNANCY_ALLOWED = [
  'Frutas, legumes e verduras bem lavados — variedade e cor no prato todos os dias.',
  'Feijão, lentilha, grão-de-bico e ervilha, boas fontes de ferro e fibras.',
  'Arroz, batata, mandioca, aveia e outros cereais e tubérculos como fonte de energia.',
  'Carnes, aves e ovos sempre bem cozidos, sem ponto rosado ou gema mole.',
  'Peixes de baixo teor de mercúrio, bem cozidos, cerca de duas vezes por semana (sardinha, tilápia, pescada).',
  'Leite e derivados pasteurizados: leite, iogurte e queijos de embalagem com rótulo.',
  'Castanhas, nozes e sementes como lanche prático.',
  'Água ao longo de todo o dia — a necessidade aumenta na gestação.',
];

export const PREGNANCY_AVOID = [
  'Carne, frango, peixe e frutos do mar crus ou malpassados, incluindo sushi e carpaccio.',
  'Ovo cru ou mole e preparações com ovo cru: maionese caseira, mousse, massa de bolo crua.',
  'Leite não pasteurizado e queijos moles de leite cru (tipo brie, camembert, gorgonzola artesanal).',
  'Embutidos e patês refrigerados consumidos sem aquecer — risco de listeria.',
  'Peixes com mais mercúrio: cação, tubarão, peixe-espada, cavala-real e atum em excesso.',
  'Fígado em grande quantidade, pelo excesso de vitamina A.',
  'Álcool em qualquer quantidade e em qualquer fase da gestação.',
  'Cafeína acima de cerca de 200 mg por dia (aproximadamente duas xícaras de café).',
  'Frutas e verduras mal lavadas e sucos não pasteurizados.',
  'Chás e suplementos “naturais” sem orientação: nem tudo que é de planta é seguro na gestação.',
];

export const PREGNANCY_SUPPLEMENTS = [
  { name: 'Ácido fólico', text: 'Reduz o risco de defeitos do tubo neural. Idealmente começa antes de engravidar e segue pelo menos até o fim do 1º trimestre.' },
  { name: 'Ferro', text: 'Costuma ser indicado a partir da 20ª semana e pode continuar no pós-parto. Pode escurecer as fezes e causar constipação.' },
  { name: 'Cálcio e vitamina D', text: 'Indicados conforme a alimentação e os exames de cada gestante — não são automáticos para todo mundo.' },
  { name: 'Iodo e ômega-3', text: 'Podem ser recomendados em situações específicas. Só use o que foi prescrito para você.' },
];

export const PREGNANCY_RECIPES = [
  {
    title: 'Vitamina de banana com aveia',
    ingredients: '1 banana, 200 ml de leite ou bebida vegetal fortificada, 2 colheres de sopa de aveia, canela a gosto.',
    preparation: 'Bata tudo no liquidificador. Rende um lanche com cálcio, fibras e energia — bom para a manhã de enjoo ou o lanche da tarde.',
    note: 'Fonte de cálcio e fibras',
  },
  {
    title: 'Feijão turbinado com couve',
    ingredients: '1 concha de feijão cozido, 1 punhado de couve picada fina, 1 dente de alho, azeite, gotas de limão.',
    preparation: 'Refogue o alho no azeite, junte a couve até murchar e misture ao feijão quente. Finalize com limão na hora de servir.',
    note: 'Ferro com vitamina C para melhor absorção',
  },
  {
    title: 'Omelete de forno com legumes',
    ingredients: '2 ovos, 2 colheres de sopa de legumes cozidos picados, 1 colher de sopa de queijo ralado, sal e cheiro-verde.',
    preparation: 'Misture tudo, despeje em forma pequena untada e asse por cerca de 20 minutos até firmar bem no centro.',
    note: 'Proteína com ovo bem cozido',
  },
  {
    title: 'Sopa cremosa de abóbora e lentilha',
    ingredients: '2 xícaras de abóbora em cubos, 1/2 xícara de lentilha, 1 cebola, caldo de legumes caseiro, azeite.',
    preparation: 'Cozinhe tudo até ficar macio e bata parte da sopa para dar cremosidade. Congele em porções para os dias sem disposição.',
    note: 'Prática para congelar',
  },
  {
    title: 'Overnight oats de iogurte e frutas',
    ingredients: '3 colheres de sopa de aveia, 1 pote de iogurte natural, 1 colher de chá de mel ou geleia, frutas picadas.',
    preparation: 'Misture a aveia com o iogurte, deixe na geladeira de um dia para o outro e acrescente as frutas na hora de comer.',
    note: 'Deixa o café da manhã pronto',
  },
];

export const PREGNANCY_HYDRATION =
  'A necessidade de água aumenta na gestação. Uma referência prática é manter a urina clara ao longo do dia e levar uma garrafa junto de você. Em caso de vômitos frequentes ou calor intenso, converse com sua equipe sobre a hidratação.';

/**
 * Guia da fase atual da gestação.
 * @param {number} week idade gestacional em semanas
 */
export function pregnancyNutritionGuide(week) {
  const safe = Math.max(1, Math.min(40, Math.floor(Number(week) || 1)));
  const stage = STAGES.find((item) => safe <= item.until) || STAGES.at(-1);
  return {
    week: safe,
    period: stage.period,
    status: stage.status,
    focus: stage.focus,
    tips: stage.tips,
    allowed: PREGNANCY_ALLOWED,
    avoid: PREGNANCY_AVOID,
    supplements: PREGNANCY_SUPPLEMENTS,
    recipes: PREGNANCY_RECIPES,
    hydration: PREGNANCY_HYDRATION,
  };
}
