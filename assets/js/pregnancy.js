/**
 * Guia educativo semanal da gestação.
 * Comprimento e peso são aproximações populacionais, não medidas clínicas.
 * Referências editoriais: guia semana a semana do NHS, INTERGROWTH-21st e
 * Linha de Cuidado do Pré-natal de Baixo Risco do Ministério da Saúde.
 */

const GROWTH = [
  [4, .2, 0, 'semente de morango', '🍓'], [5, .3, 0, 'semente de maçã', '🍎'],
  [6, .6, 0, 'grão de romã', '🍎'], [7, 1, 0, 'mirtilo', '🫐'],
  [8, 1.6, 1, 'framboesa', '🍓'], [9, 2.3, 2, 'cereja', '🍒'],
  [10, 3.1, 4, 'morango', '🍓'], [11, 4.1, 7, 'figo', '🍈'],
  [12, 5.4, 14, 'limão', '🍋'], [13, 7.4, 23, 'pêssego', '🍑'],
  [14, 8.5, 43, 'nectarina', '🍑'], [15, 10.1, 70, 'maçã', '🍎'],
  [16, 11.6, 100, 'abacate', '🥑'], [17, 13, 140, 'pera', '🍐'],
  [18, 14.2, 190, 'maracujá', '🍋'], [19, 15.3, 240, 'manga', '🥭'],
  [20, 25.6, 300, 'banana', '🍌'], [21, 26.7, 360, 'romã', '🍎'],
  [22, 27.8, 430, 'mamão pequeno', '🍈'], [23, 28.9, 500, 'toranja', '🍊'],
  [24, 30, 600, 'melão pequeno', '🍈'], [25, 34.6, 660, 'mamão', '🍈'],
  [26, 35.6, 760, 'coco', '🥥'], [27, 36.6, 875, 'mamão', '🍈'],
  [28, 37.6, 1005, 'abacaxi pequeno', '🍍'], [29, 38.6, 1153, 'melão médio', '🍈'],
  [30, 39.9, 1319, 'coco grande', '🥥'], [31, 41.1, 1502, 'abacaxi', '🍍'],
  [32, 42.4, 1702, 'melão', '🍈'], [33, 43.7, 1918, 'abacaxi', '🍍'],
  [34, 45, 2146, 'melão cantalupo', '🍈'], [35, 46.2, 2383, 'melão amarelo', '🍈'],
  [36, 47.4, 2622, 'mamão grande', '🍈'], [37, 48.6, 2859, 'jaca pequena', '🍈'],
  [38, 49.8, 3083, 'melão grande', '🍈'], [39, 50.7, 3288, 'melancia pequena', '🍉'],
  [40, 51.2, 3462, 'melancia', '🍉'],
];

const MILESTONES = [
  [5, 'O tubo neural e as estruturas que darão origem ao coração estão começando a se formar.', 'Os hormônios podem trazer sono, seios sensíveis e mais vontade de urinar.', 'Inicie o pré-natal e confirme com sua equipe a suplementação indicada para você.'],
  [7, 'Cérebro, medula, coração, fígado e rins avançam rapidamente; os brotos dos membros aparecem.', 'Enjoo, cansaço, sensibilidade a cheiros e oscilações de humor são comuns.', 'Faça refeições menores ao longo do dia e mantenha água por perto.'],
  [9, 'Braços, pernas, dedos e traços do rosto ganham definição enquanto os órgãos continuam se formando.', 'O útero cresce, mesmo que a barriga ainda quase não apareça; o enjoo pode estar mais intenso.', 'Descanse quando puder e não use medicamentos sem orientação profissional.'],
  [11, 'Os principais órgãos estão formados e entram em uma longa fase de crescimento e amadurecimento.', 'O volume de sangue aumenta e podem surgir tontura, calor e constipação.', 'Levante-se devagar, priorize fibras e leve seus sintomas para a consulta.'],
  [13, 'Rins já produzem urina, reflexos se desenvolvem e órgãos reprodutivos continuam a diferenciação.', 'A placenta assume a produção hormonal e o enjoo pode começar a diminuir.', 'Retome atividades leves somente conforme a orientação da sua equipe de pré-natal.'],
  [15, 'Fígado e baço trabalham, as articulações se movem e os músculos do rosto ficam mais ativos.', 'A barriga começa a aparecer; gengivas sensíveis e nariz congestionado podem ocorrer.', 'Cuide da saúde bucal e avise o dentista de que está gestante.'],
  [17, 'O sistema nervoso coordena movimentos, os ossos endurecem e a audição começa a se desenvolver.', 'O crescimento do útero pode causar desconforto nos ligamentos laterais da barriga.', 'Mude de posição com calma e converse com a equipe se a dor for forte ou persistente.'],
  [19, 'Conexões cerebrais dos sentidos avançam e os pulmões formam estruturas respiratórias.', 'Você pode perceber os primeiros movimentos, além de dor lombar e alterações na pele.', 'Observe os movimentos sem comparar com outras gestações: cada bebê tem seu ritmo.'],
  [21, 'O sistema digestivo pratica a deglutição e o exame morfológico consegue observar os principais órgãos.', 'Os movimentos tendem a ficar mais claros e o centro de gravidade começa a mudar.', 'Anote perguntas para o ultrassom morfológico e para a próxima consulta.'],
  [23, 'Pulmões formam vasos e iniciam a produção de substâncias importantes para respirar após o nascimento.', 'Azia, cãibras, calor e contrações de treinamento podem aparecer.', 'Alongamentos leves e boa hidratação podem ajudar, se estiverem liberados para você.'],
  [25, 'Ouvido interno amadurece, pálpebras se definem e pulmões seguem em intenso desenvolvimento.', 'O peso da barriga pode aumentar o desconforto nas costas, costelas e pelve.', 'Alterne posições e use apoio para dormir de forma confortável.'],
  [27, 'Cérebro e pulmões amadurecem rapidamente; os olhos podem abrir e responder à luz.', 'Sono fragmentado, inchaço leve e falta de ar aos esforços podem surgir.', 'Observe inchaço súbito, dor de cabeça forte ou alteração visual e procure avaliação.'],
  [29, 'O cérebro forma novos sulcos, a medula produz células do sangue e os pulmões continuam amadurecendo.', 'Azia, dor nas costas e cansaço podem aumentar com o início do terceiro trimestre.', 'Reserve pausas no dia e mantenha o calendário de consultas do terceiro trimestre.'],
  [31, 'A maioria dos órgãos funciona, enquanto cérebro e pulmões ainda precisam amadurecer e o bebê ganha gordura.', 'A barriga maior pode dificultar o sono e causar mais pressão na bexiga.', 'Experimente uma rotina de desaceleração antes de dormir e apoios entre as pernas.'],
  [33, 'Anticorpos passam pela placenta e os ossos endurecem, embora o crânio permaneça flexível para o parto.', 'Falta de ar, refluxo e inchaço leve podem ficar mais presentes.', 'Comece a organizar documentos, rede de apoio e itens essenciais para a maternidade.'],
  [35, 'Rins estão maduros e os pulmões se aproximam da maturidade; o ganho de gordura acelera.', 'Pode haver pressão pélvica, cansaço e contrações de treinamento mais perceptíveis.', 'Converse sobre plano de parto e sinais que indicam quando procurar a maternidade.'],
  [37, 'O bebê pratica sugar, engolir e respirar; os pulmões estão quase maduros.', 'Quando o bebê desce, respirar pode ficar mais fácil, mas a vontade de urinar aumenta.', 'Deixe contatos e trajeto da maternidade acessíveis e mantenha as consultas semanais.'],
  [40, 'Os órgãos estão preparados para a vida fora do útero, embora cérebro e pulmões continuem se desenvolvendo.', 'Pressão pélvica, contrações e mudanças no corrimento podem indicar aproximação do parto.', 'Siga as orientações da sua maternidade sobre contrações, perda de líquido e movimentos do bebê.'],
];

function prenatalStep(week) {
  if (week < 8) return { name: 'Primeira consulta de pré-natal', when: 'O quanto antes', note: 'Avaliação inicial e solicitação dos exames de rotina.' };
  if (week < 11) return { name: 'Exames iniciais e ultrassom de datação', when: 'Entre 8 e 12 semanas', note: 'A agenda depende da avaliação da sua equipe.' };
  if (week < 14) return { name: 'Ultrassom do 1º trimestre', when: 'Entre 11 e 13 semanas + 6 dias', note: 'Converse sobre rastreamento e translucência nucal.' };
  if (week < 18) return { name: 'Consulta de pré-natal', when: 'Até a 28ª semana, em geral mensal', note: 'Revisão de sintomas, pressão, peso e exames.' };
  if (week < 23) return { name: 'Ultrassom morfológico do 2º trimestre', when: 'Em geral entre 18 e 22 semanas', note: 'Avalia estruturas e desenvolvimento fetal.' };
  if (week < 28) return { name: 'Rastreamento de diabetes gestacional', when: 'Em geral entre 24 e 28 semanas', note: 'Pode incluir glicemia ou teste de tolerância, conforme indicação.' };
  if (week < 31) return { name: 'Exames do 3º trimestre', when: 'Por volta de 28 a 30 semanas', note: 'A equipe pode repetir hemograma, sorologias e urocultura.' };
  if (week < 36) return { name: 'Consulta de pré-natal', when: 'Da 28ª à 36ª semana, em geral quinzenal', note: 'A frequência pode mudar conforme cada gestação.' };
  if (week < 37) return { name: 'Avaliação da posição do bebê', when: 'Por volta da 36ª semana', note: 'Também é um bom momento para revisar o plano de parto.' };
  if (week <= 40) return { name: 'Consulta de pré-natal', when: 'No termo, em geral semanal', note: 'Inclui bem-estar materno, movimentos e sinais de trabalho de parto.' };
  return { name: 'Avaliação da gestação prolongada', when: 'Conforme orientação da equipe', note: 'O acompanhamento após a DPP deve ser individualizado.' };
}

const formatLength = (cm) => cm < 1 ? `${Math.round(cm * 10)} mm` : `${String(cm).replace('.', ',')} cm`;
const formatWeight = (g) => g < 1 ? 'menos de 1 g' : g < 1000 ? `${g} g` : `${(g / 1000).toFixed(1).replace('.', ',')} kg`;

export function pregnancyCountdown(daysLeft, multiple = false) {
  const days = Math.trunc(Number(daysLeft));
  const love = multiple ? 'os amores da sua vida' : 'o amor da sua vida';
  if (days > 1) return `Faltam ${days} dias para você conhecer ${love}!`;
  if (days === 1) return `Falta 1 dia para você conhecer ${love}!`;
  if (days === 0) return `Hoje é a data prevista para você conhecer ${love}!`;
  return multiple ? 'A data prevista chegou — seus bebês podem chegar a qualquer momento!' : 'A data prevista chegou — seu bebê pode chegar a qualquer momento!';
}

export function pregnancyWeekGuide(inputWeek) {
  const week = Math.max(4, Math.min(40, Math.floor(Number(inputWeek) || 4)));
  const growth = GROWTH.find((row) => row[0] === week) || GROWTH[0];
  const milestone = MILESTONES.find((row) => week <= row[0]) || MILESTONES.at(-1);
  return {
    week,
    fruit: growth[3],
    emoji: growth[4],
    length: formatLength(growth[1]),
    weight: formatWeight(growth[2]),
    development: milestone[1],
    mother: milestone[2],
    tip: milestone[3],
    nextExam: prenatalStep(inputWeek),
  };
}

/** Valida medições informadas pela usuária; não interpreta nem diagnostica resultados. */
export function validateSymptomMeasurements({ systolicPressure, diastolicPressure, weight, glucose }) {
  const values = [systolicPressure, diastolicPressure, weight, glucose].filter((value) => value != null);
  if (values.some((value) => !Number.isFinite(value))) return 'Use somente números válidos nas medições.';
  const hasSystolic = systolicPressure != null;
  const hasDiastolic = diastolicPressure != null;
  if (hasSystolic !== hasDiastolic) return 'Informe os dois valores da pressão arterial.';
  if (hasSystolic && (systolicPressure < 60 || systolicPressure > 250 || diastolicPressure < 40 || diastolicPressure > 150)) {
    return 'Pressão arterial fora do intervalo aceito para registro.';
  }
  if (hasSystolic && systolicPressure <= diastolicPressure) return 'A pressão sistólica deve ser maior que a diastólica.';
  if (weight != null && (weight < 25 || weight > 300)) return 'Peso fora do intervalo aceito (25–300 kg).';
  if (glucose != null && (glucose < 20 || glucose > 600)) return 'Glicemia fora do intervalo aceito (20–600 mg/dL).';
  return null;
}
