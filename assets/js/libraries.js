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
  { id: 'sleep', label: 'Sono', icon: 'moon', phases: ['gravida'] },
  { id: 'vaginal-birth', label: 'Parto normal', icon: 'pregnant', phases: ['gravida'] },
  { id: 'cesarean', label: 'Parto cesárea', icon: 'shield', phases: ['gravida'] },
  { id: 'breastfeeding', label: 'Amamentação', icon: 'bottle', phases: ['gravida', 'posparto'] },
  { id: 'postpartum', label: 'Puerpério', icon: 'baby', phases: ['gravida', 'posparto'] },
  { id: 'emotional-health', label: 'Saúde emocional', icon: 'heart', phases: ['tentante', 'gravida', 'posparto'] },
  { id: 'rights', label: 'Direitos da gestante', icon: 'shield', phases: ['gravida'] },
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
