const STAGES = [
  {
    from: 0,
    fromMonths: 0,
    period: 'Antes dos 6 meses',
    status: 'Ainda não é hora dos alimentos sólidos',
    when: 'A introdução alimentar costuma começar por volta dos 6 meses, quando o bebê reúne sinais de prontidão. A idade e o desenvolvimento devem ser avaliados com o pediatra.',
    introduction: [
      'Até lá, leite materno e/ou fórmula infantil adequada à idade oferecem a nutrição principal.',
      'Não antecipe alimentos para fazer o bebê dormir mais ou ganhar peso sem avaliação profissional.',
      'Prematuros podem precisar de orientação pela idade corrigida e por seu desenvolvimento individual.',
    ],
    signs: ['Sustenta a cabeça e o tronco com bom controle.', 'Consegue sentar com pouco apoio.', 'Leva objetos à boca e demonstra interesse pela comida.', 'Perdeu boa parte do reflexo de empurrar alimentos com a língua.'],
    allowed: ['Leite materno em livre demanda.', 'Fórmula infantil preparada exatamente conforme o rótulo e a orientação recebida.', 'Medicamentos ou suplementos somente quando orientados por profissional.'],
    avoid: ['Comidas, papinhas, mingaus e frutas antes da prontidão.', 'Mel, açúcar, sucos, chás e outras bebidas.', 'Leite de vaca como substituto do leite materno ou da fórmula.', 'Engrossantes na mamadeira sem indicação profissional.'],
    recipes: [],
  },
  {
    from: 180,
    fromMonths: 6,
    period: 'De 6 a 8 meses',
    status: 'Primeiros alimentos e novas texturas',
    when: 'Com cerca de 6 meses e sinais de prontidão, o bebê pode começar a receber alimentos enquanto o leite materno ou a fórmula continuam importantes.',
    introduction: [
      'Ofereça alimentos amassados com garfo ou em pedaços grandes e macios que o bebê consiga segurar, sempre sentado e supervisionado.',
      'Comece com pequenas porções e aumente conforme a aceitação, sem forçar e respeitando sinais de fome e saciedade.',
      'Apresente sabores variados. Ovo e outros alergênicos não precisam ser adiados, mas devem estar em forma segura; casos de alergia ou eczema importante exigem orientação.',
    ],
    signs: ['Mantém cabeça e tronco firmes durante a refeição.', 'Pega alimentos e tenta levá-los à boca.', 'Engole melhor e participa da refeição.', 'Mostra saciedade virando o rosto ou fechando a boca.'],
    allowed: ['Frutas macias, legumes e verduras cozidos.', 'Arroz, aveia, batata, mandioca e outros cereais ou tubérculos.', 'Feijão, lentilha e grão-de-bico bem cozidos e amassados.', 'Carnes desfiadas, peixe sem espinhas e ovo completamente cozido.', 'Água potável em copo durante e entre as refeições.'],
    avoid: ['Mel antes de 1 ano, pelo risco de botulismo.', 'Açúcar, doces, sucos e ultraprocessados.', 'Leite de vaca como bebida principal antes de 1 ano.', 'Uvas inteiras, castanhas inteiras, pipoca, pedaços duros ou redondos e outros riscos de engasgo.', 'Ovos, carnes e pescados crus ou malpassados; leite e derivados não pasteurizados.'],
    recipes: [
      { title: 'Banana com aveia macia', ingredients: 'Banana madura e aveia bem cozida.', preparation: 'Amasse a banana com o garfo e misture uma pequena porção de aveia cozida, mantendo textura espessa.' },
      { title: 'Abóbora, feijão e frango', ingredients: 'Abóbora cozida, feijão e frango bem cozido e desfiado.', preparation: 'Amasse os alimentos separadamente com o garfo e sirva juntos, sem liquidificar ou peneirar.' },
      { title: 'Batata-doce com lentilha', ingredients: 'Batata-doce e lentilha bem cozidas.', preparation: 'Amasse grosseiramente até ficar macio e úmido, deixando pequenos grumos seguros.' },
    ],
  },
  {
    from: 270,
    fromMonths: 9,
    period: 'De 9 a 11 meses',
    status: 'Mais variedade e participação',
    when: 'Nesta fase, a alimentação complementar avança em variedade e textura. O bebê pode participar das refeições da família com preparações adaptadas.',
    introduction: [
      'Passe gradualmente de amassados para alimentos picados e pedaços macios, favorecendo mastigação e autonomia.',
      'Ofereça combinações de grupos alimentares e mantenha leite materno ou fórmula conforme a rotina do bebê.',
      'Permita que toque a comida e tente usar colher ou copo, aceitando a bagunça como parte da aprendizagem.',
    ],
    signs: ['Faz movimento de pinça e pega pedaços menores.', 'Mastiga alimentos macios mesmo com poucos dentes.', 'Demonstra preferências e imita pessoas à mesa.', 'Começa a beber em copo com ajuda.'],
    allowed: ['Comida da família macia, picada e com pouco sal.', 'Frutas em pedaços seguros, legumes, verduras e cereais.', 'Feijões, carnes, peixe sem espinhas e ovo bem cozido.', 'Iogurte natural integral pasteurizado e sem açúcar.', 'Água potável oferecida em copo.'],
    avoid: ['Mel até completar 1 ano.', 'Açúcar, refrigerantes, sucos, biscoitos e ultraprocessados.', 'Leite de vaca como bebida principal antes de 1 ano.', 'Pipoca, castanhas inteiras, uvas inteiras, salsicha em rodelas e alimentos duros ou pegajosos.', 'Alimentos crus ou malpassados e produtos não pasteurizados.'],
    recipes: [
      { title: 'Omelete macia de legumes', ingredients: 'Ovo e legumes cozidos bem picados.', preparation: 'Misture e cozinhe completamente dos dois lados. Corte em tiras macias que desmanchem com facilidade.' },
      { title: 'Bolinho macio de arroz e feijão', ingredients: 'Arroz, feijão amassado e cenoura cozida.', preparation: 'Misture, modele discos macios e asse ou doure em frigideira sem deixar formar crosta dura.' },
      { title: 'Iogurte com mamão', ingredients: 'Iogurte natural integral sem açúcar e mamão maduro.', preparation: 'Amasse o mamão e misture ao iogurte pasteurizado pouco antes de servir.' },
    ],
  },
  {
    from: 365,
    fromMonths: 12,
    period: 'De 1 a 2 anos',
    status: 'Comida da família com adaptações',
    when: 'Depois de 1 ano, a criança pode compartilhar cada vez mais a alimentação da família, com variedade, consistência segura e horários previsíveis.',
    introduction: [
      'Mantenha três refeições principais e lanches conforme fome, rotina e orientação profissional.',
      'Sirva a mesma comida saudável da família antes de acrescentar excesso de sal, molhos ou condimentos prontos.',
      'A oscilação de apetite é comum. Adultos escolhem o que e quando oferecer; a criança decide quanto comer, sem pressão ou distrações.',
    ],
    signs: ['Usa os dedos e começa a praticar com colher.', 'Bebe em copo com menos ajuda.', 'Mastiga texturas variadas e participa das refeições.', 'Pode recusar alimentos já aceitos e precisar de novas exposições.'],
    allowed: ['Arroz, feijão, legumes, verduras, frutas, ovos, carnes e peixes bem preparados.', 'Leite e derivados pasteurizados conforme orientação e restante da alimentação.', 'Pães, massas e cereais com preparações simples.', 'Água como bebida principal.'],
    avoid: ['Açúcar e produtos açucarados antes dos 2 anos.', 'Refrigerantes, sucos, bebidas lácteas açucaradas e ultraprocessados.', 'Pipoca, castanhas inteiras, balas, uvas inteiras e outros formatos de alto risco de engasgo.', 'Carnes, ovos ou pescados crus e produtos não pasteurizados.', 'Excesso de sal e temperos industrializados.'],
    recipes: [
      { title: 'Panquequinha de banana', ingredients: 'Banana madura, ovo e aveia.', preparation: 'Amasse, misture e cozinhe pequenas porções completamente dos dois lados, sem açúcar.' },
      { title: 'Ensopado da família', ingredients: 'Carne ou lentilha, batata, cenoura, tomate e cheiro-verde.', preparation: 'Cozinhe até tudo ficar macio. Separe a porção da criança antes de ajustar o sal da família.' },
      { title: 'Macarrão com molho de legumes', ingredients: 'Macarrão curto, tomate, abobrinha e carne moída ou lentilha.', preparation: 'Cozinhe bem e corte quando necessário. Use molho caseiro e deixe a textura úmida.' },
    ],
  },
  {
    from: 730,
    fromMonths: 24,
    period: 'A partir de 2 anos',
    status: 'Variedade e hábitos em família',
    when: 'A criança já participa da alimentação da família, mas ainda precisa de porções, cortes e supervisão adequados ao desenvolvimento.',
    introduction: [
      'Continue oferecendo alimentos variados, mesmo quando houver fases de seletividade.',
      'Faça refeições sentadas e sem telas sempre que possível, valorizando conversa e exemplo dos adultos.',
      'Evite usar comida como prêmio ou castigo e respeite os sinais de fome e saciedade.',
    ],
    signs: ['Usa colher e copo com autonomia crescente.', 'Expressa preferências e participa de escolhas simples.', 'Consegue mastigar melhor, mas ainda pode se engasgar com formatos perigosos.', 'Aprende hábitos observando as refeições da família.'],
    allowed: ['Todos os grupos de alimentos em preparações caseiras variadas.', 'Frutas, legumes e verduras em diferentes cores e texturas.', 'Água como bebida principal e leite conforme a rotina alimentar.', 'Pequenas quantidades de açúcar e sal, sem fazer deles parte habitual da alimentação.'],
    avoid: ['Álcool, café, energéticos e bebidas açucaradas.', 'Pipoca e castanhas inteiras enquanto ainda houver risco de engasgo, em geral até 4 ou 5 anos.', 'Uvas e tomates-cereja inteiros, salsicha em rodelas e pedaços muito duros.', 'Alimentos crus ou malpassados e produtos não pasteurizados.', 'Ultraprocessados como rotina.'],
    recipes: [
      { title: 'Arroz colorido', ingredients: 'Arroz, feijão, cenoura, brócolis e ovo bem cozido.', preparation: 'Pique os ingredientes em tamanho seguro e misture ao arroz e feijão já cozidos.' },
      { title: 'Bolinhos assados de peixe', ingredients: 'Peixe sem espinhas, batata, cheiro-verde e ovo.', preparation: 'Misture o peixe cozido à batata, modele e asse até cozinhar por completo, mantendo o interior macio.' },
      { title: 'Frutas com iogurte e aveia', ingredients: 'Frutas macias, iogurte natural e aveia.', preparation: 'Corte as frutas em formatos seguros e sirva com iogurte pasteurizado e aveia macia.' },
    ],
  },
];

export function babyFeedingGuide(days, completedMonths = null) {
  const ageDays = Number.isFinite(days) ? Math.max(0, Math.floor(days)) : 0;
  const ageMonths = Number.isFinite(completedMonths) ? Math.max(0, Math.floor(completedMonths)) : null;
  let stage = STAGES[0];
  for (const candidate of STAGES) {
    if (ageMonths === null ? ageDays < candidate.from : ageMonths < candidate.fromMonths) break;
    stage = candidate;
  }
  return {
    ...stage,
    introduction: [...stage.introduction],
    signs: [...stage.signs],
    allowed: [...stage.allowed],
    avoid: [...stage.avoid],
    recipes: stage.recipes.map((recipe) => ({ ...recipe })),
  };
}
