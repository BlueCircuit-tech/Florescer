export const LIBRARIES = {
  tentante: {
    slug: 'tentantes',
    title: 'Biblioteca para tentantes',
    description: 'Ciclo, fertilidade e bem-estar para acompanhar suas tentativas.',
  },
  gravida: {
    slug: 'gestantes',
    title: 'Biblioteca da gestante',
    description: 'Informação segura para cuidar de você e se preparar para cada etapa.',
  },
  posparto: {
    slug: 'pos-parto',
    title: 'Biblioteca do pós-parto',
    description: 'Recuperação, amamentação e acolhimento para o começo da maternidade.',
  },
};

export const LIBRARY_TOPICS = [
  { id: 'cycle', label: 'Ciclo', icon: 'flower', phases: ['tentante', 'posparto'] },
  { id: 'nutrition', label: 'Alimentação', icon: 'leaf', phases: ['tentante', 'gravida'] },
  { id: 'exercises', label: 'Exercícios', icon: 'heart', phases: ['gravida'] },
  { id: 'sleep', label: 'Sono', icon: 'moon', phases: ['gravida', 'posparto'] },
  { id: 'vaginal-birth', label: 'Parto normal', icon: 'pregnant', phases: ['gravida'] },
  { id: 'cesarean', label: 'Parto cesárea', icon: 'shield', phases: ['gravida', 'posparto'] },
  { id: 'breastfeeding', label: 'Amamentação', icon: 'bottle', phases: ['gravida', 'posparto'] },
  { id: 'postpartum', label: 'Puerpério', icon: 'baby', phases: ['gravida', 'posparto'] },
  { id: 'emotional-health', label: 'Saúde emocional', icon: 'heart', phases: ['tentante', 'gravida', 'posparto'] },
  { id: 'rights', label: 'Direitos', icon: 'shield', phases: ['gravida', 'posparto'] },
  { id: 'pregnancy', label: 'Outros cuidados', icon: 'sparkle', phases: ['gravida'] },
];

const LEGACY_TOPICS = {
  Ciclo: 'cycle',
  Nutrição: 'nutrition',
  'Bem-estar': 'emotional-health',
  Gestação: 'pregnancy',
  'Pós-parto': 'postpartum',
};

export function libraryForPhase(phase) {
  return LIBRARIES[phase] || LIBRARIES.tentante;
}

export function libraryPath(phase, topic = '') {
  const base = `biblioteca/${libraryForPhase(phase).slug}`;
  return topic ? `${base}?tema=${encodeURIComponent(topic)}` : base;
}

export function articleTopic(article) {
  const topic = LIBRARY_TOPICS.find((item) => item.id === article?.topic);
  return topic || LIBRARY_TOPICS.find((item) => item.id === LEGACY_TOPICS[article?.cat]) || null;
}

export function articlesForPhase(articles, phase) {
  return articles.filter((article) => Array.isArray(article.phases) && article.phases.includes(phase));
}

export function topicsForPhase(phase) {
  return LIBRARY_TOPICS.filter((topic) => topic.phases.includes(phase));
}

export function articlesForLibrary(articles, phase, topic = 'todos') {
  const available = articlesForPhase(articles, phase);
  if (topic === 'todos') return available;
  return available.filter((article) => articleTopic(article)?.id === topic);
}

export function canAccessArticle(article, phase) {
  return Boolean(article && Array.isArray(article.phases) && article.phases.includes(phase));
}

/* ---------------------------------------------------------------
   Por onde começar
   Uma biblioteca de 28 artigos vira uma parede se a primeira coisa
   que ela vê é a lista de temas. Aqui o app escolhe UM artigo para
   o momento dela e indica a leitura por onde começar.
   --------------------------------------------------------------- */

/** O artigo que mais combina com o momento dela, do mais específico ao geral. */
const SUGGESTION_RULES = [
  // gestante: segue a semana
  { phase: 'gravida', upTo: 13, ids: ['primeiro-trimestre', 'alimentacao-na-gestacao', 'saude-emocional-gestacao'] },
  { phase: 'gravida', upTo: 27, ids: ['segundo-trimestre', 'exercicios-na-gestacao', 'exercicios-dores'] },
  { phase: 'gravida', upTo: 35, ids: ['terceiro-trimestre', 'insonia-gestacao', 'preparacao-parto-normal'] },
  { phase: 'gravida', upTo: 99, ids: ['plano-de-parto', 'terceiro-trimestre', 'planejar-puerperio'] },
  // pós-parto: segue os dias de vida do bebê
  { phase: 'posparto', upTo: 14, ids: ['corpo-depois-do-parto', 'amamentacao', 'sono-do-bebe-e-o-seu'] },
  { phase: 'posparto', upTo: 60, ids: ['sono-do-bebe-e-o-seu', 'saude-mental-posparto', 'corpo-depois-do-parto'] },
  { phase: 'posparto', upTo: 9999, ids: ['volta-ao-trabalho', 'ciclo-irregular', 'saude-mental-posparto'] },
];

/**
 * Sugere um artigo para o momento dela, pulando o que já foi lido.
 * @returns {{article:object, reason:string}|null}
 */
export function suggestedArticle(articles, { phase, weeks = null, babyDays = null, longTrying = false, read = [] }) {
  const lidos = new Set(Array.isArray(read) ? read : []);
  const disponiveis = articlesForPhase(articles, phase);
  const porId = (id) => disponiveis.find((article) => article.id === id);

  let preferidos = [];
  let reason = 'Escolhido para a sua fase';

  if (phase === 'gravida' && weeks !== null) {
    const regra = SUGGESTION_RULES.find((r) => r.phase === 'gravida' && weeks <= r.upTo);
    preferidos = (regra?.ids || []).map(porId).filter(Boolean);
    reason = `Para quem está na ${weeks}ª semana`;
  } else if (phase === 'posparto' && babyDays !== null) {
    const regra = SUGGESTION_RULES.find((r) => r.phase === 'posparto' && babyDays <= r.upTo);
    preferidos = (regra?.ids || []).map(porId).filter(Boolean);
    reason = babyDays <= 14 ? 'Para os primeiros dias' : 'Para o momento do seu bebê';
  } else if (phase === 'tentante') {
    preferidos = (longTrying
      ? ['quando-procurar-especialista', 'ciclo-irregular', 'ansiedade-espera']
      : ['periodo-fertil', 'entender-ciclo', 'alimentacao-tentante']).map(porId).filter(Boolean);
    reason = longTrying ? 'Para quem já tenta há um tempo' : 'Um bom ponto de partida';
  }

  const escolhido = preferidos.find((article) => !lidos.has(article.id))
    || disponiveis.find((article) => !lidos.has(article.id));

  return escolhido ? { article: escolhido, reason } : null;
}

/** Quantos artigos da fase dela já foram lidos. */
export function readingProgress(articles, phase, read = []) {
  const disponiveis = articlesForPhase(articles, phase);
  const lidos = new Set(Array.isArray(read) ? read : []);
  const total = disponiveis.length;
  const feitos = disponiveis.filter((article) => lidos.has(article.id)).length;
  return { total, read: feitos, percent: total ? Math.round((feitos / total) * 100) : 0 };
}
