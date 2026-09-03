export const FEATURE_GROUPS = {
  fertility: { label: 'Ciclo e tentativas', order: 10 },
  pregnancy: { label: 'Gestação', order: 10 },
  babyRoutine: { label: 'Rotina do bebê', order: 10 },
  daily: { label: 'Meu cuidado', order: 20 },
  babyHealth: { label: 'Saúde e desenvolvimento', order: 20 },
  planning: { label: 'Organização', order: 30 },
  content: { label: 'Conteúdo e apoio', order: 40 },
};

export const FEATURE_TONES = {
  rose: { bg: 'var(--rose-50)', fg: 'var(--rose-700)' },
  lilac: { bg: 'var(--lilac-50)', fg: 'var(--lilac-600)' },
  leaf: { bg: 'var(--leaf-50)', fg: 'var(--leaf-600)' },
  amber: { bg: 'var(--amber-50)', fg: 'var(--amber-600)' },
};

const ALL_PHASES = ['tentante', 'gravida', 'posparto'];

export const FEATURES = [
  feature('calendar', ALL_PHASES, 'planning', 'ciclo', 'calendar', 'Calendário', 'Registros, previsões e compromissos em um só lugar.', ['home', 'resources'], 'rose'),
  feature('daily-log', ALL_PHASES, 'daily', 'registro', 'note', {
    tentante: 'Registrar', gravida: 'Diário', posparto: 'Diário',
  }, {
    tentante: 'Registre ciclo, sintomas e como foi o seu dia.',
    gravida: 'Guarde emoções, pensamentos e memórias da gestação.',
    posparto: 'Guarde emoções, conquistas e memórias da maternidade.',
  }, ['home', 'add', 'resources'], 'lilac', {
    addLabel: { tentante: 'Fazer um Registro', gravida: 'Adicionar um Registro', posparto: 'Diário da Mamãe' },
  }),
  feature('symptoms', ['gravida', 'posparto'], 'daily', 'registro?s=sintomas', 'thermometer', 'Controle de Sintomas', 'Sintomas, pressão arterial, peso e glicemia.', ['home', 'add', 'resources'], 'rose', {
    addLabel: 'Adicionar um Sintoma',
  }),
  feature('sleep', ALL_PHASES, 'daily', 'sono', 'moon', 'Meu sono', 'Sono noturno, cochilos, médias e dicas para sua fase.', ['home', 'add', 'resources'], 'lilac', {
    addLabel: 'Registrar Sono',
  }),
  feature('pregnancy-test', ['tentante'], 'fertility', 'teste-gravidez', 'test', 'Teste de gravidez', 'Registre o resultado e acompanhe seu histórico.', ['add', 'resources'], 'rose', {
    addLabel: 'Adicionar um Teste',
  }),
  feature('relationship', ['tentante'], 'fertility', 'relacao', 'heartFill', 'Registrar relação', 'Um registro simples e privado no calendário.', ['add', 'resources'], 'rose'),
  feature('reports', ['tentante', 'gravida'], 'planning', 'relatorios', 'chart', 'Relatórios', 'Visualize ciclos, sintomas e informações para consultas.', ['home', 'resources'], 'leaf'),
  feature('pregnancy-profile', ['gravida'], 'pregnancy', 'perfil', 'pregnant', 'Dados da gestação', 'DUM, DPP, tipo de gestação, nomes e ultrassonografia.', ['resources'], 'rose'),
  {
    id: 'birth', phases: ['gravida'], group: 'pregnancy', action: 'register-birth', icon: 'baby',
    label: 'Registrar nascimento', description: 'Inicie o Florescer Baby após o nascimento.', surfaces: ['add'], tone: 'rose',
  },
  feature('baby-status', ['posparto'], 'babyHealth', 'status-bebe', 'baby', 'Status do bebê', 'Peso, altura, perímetro cefálico e próximos cuidados.', ['home', 'add', 'resources'], 'lilac', {
    addLabel: 'Registrar Status do Bebê',
  }),
  feature('baby-growth', ['posparto'], 'babyHealth', 'crescimento-bebe', 'chart', 'Crescimento', 'Acompanhe a evolução das medidas de cada bebê.', ['home', 'resources'], 'leaf', {
    homeLabel: 'Relatórios',
  }),
  feature('baby-vaccines', ['posparto'], 'babyHealth', 'vacinas-bebe', 'shield', 'Vacinas', 'Vacinas marcadas, tomadas e próximos lembretes.', ['home', 'add', 'resources'], 'lilac', {
    addLabel: 'Vacinas do Bebê',
  }),
  feature('baby-development', ['posparto'], 'babyHealth', 'desenvolvimento-bebe', 'sparkle', 'Desenvolvimento', 'Primeiro sorriso, primeiros passos e outras descobertas.', ['home', 'add', 'resources'], 'amber', {
    addLabel: 'Registro de Desenvolvimento',
  }),
  feature('baby-health', ['posparto'], 'babyHealth', 'saude-bebe', 'shield', 'Saúde do bebê', 'Sintomas, medicamentos, consultas, exames e internações.', ['home', 'add', 'resources'], 'rose', {
    addLabel: 'Registro de Saúde',
  }),
  feature('breastfeeding', ['posparto'], 'babyRoutine', 'amamentacao', 'heart', 'Amamentação', 'Cronômetro, lado, extração e estoque de leite.', ['home', 'add', 'resources'], 'rose', {
    addLabel: 'Registrar Amamentação',
  }),
  feature('diapers', ['posparto'], 'babyRoutine', 'fraldas', 'drop', 'Fraldas', 'Urina, fezes e frequência diária de trocas.', ['home', 'add', 'resources'], 'amber', {
    addLabel: 'Registrar Fralda',
  }),
  feature('schedule', ALL_PHASES, 'planning', 'agenda', 'calendar', 'Agenda', 'Consultas, exames, tratamentos e lembretes.', ['home', 'resources'], 'leaf'),
  feature('reminders', ALL_PHASES, 'planning', 'lembretes', 'bell', 'Lembretes', 'Escolha quais avisos deseja receber e quando.', ['resources'], 'amber'),
  feature('missions', ALL_PHASES, 'daily', 'missoes', 'flag', 'Missões diárias', 'Pequenos cuidados para manter uma rotina possível.', ['home', 'resources'], 'amber'),
  feature('tips', ALL_PHASES, 'content', 'dicas', 'sparkle', 'Sugestões', 'Orientações curtas escolhidas para a sua fase.', ['resources'], 'rose'),
  feature('library', ALL_PHASES, 'content', 'biblioteca', 'book', 'Biblioteca', 'Artigos para acompanhar cada etapa da jornada.', ['home', 'resources'], 'amber'),
  feature('community', ALL_PHASES, 'content', 'comunidade', 'users', 'Comunidade', 'Troque experiências com outras mulheres.', ['home', 'resources'], 'lilac'),
  feature('premium', ALL_PHASES, 'content', 'premium', 'crown', 'Florescer Premium', 'Conheça conteúdos e recursos exclusivos.', ['resources'], 'lilac'),
];

export const HOME_SHORTCUT_DEFAULTS = {
  tentante: ['calendar', 'daily-log', 'reports', 'library'],
  gravida: ['calendar', 'daily-log', 'reports', 'library'],
  posparto: ['calendar', 'baby-vaccines', 'baby-growth', 'library'],
};

function feature(id, phases, group, to, icon, label, description, surfaces, tone, extra = {}) {
  return { id, phases, group, to, icon, label, description, surfaces, tone, ...extra };
}

function phaseValue(value, phase) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value[phase] : value;
}

export function featureById(id) {
  return FEATURES.find((item) => item.id === id) || null;
}

export function featureLabel(item, phase, surface = 'resources') {
  const value = surface === 'add' && item.addLabel ? item.addLabel
    : surface === 'home' && item.homeLabel ? item.homeLabel
      : item.label;
  return phaseValue(value, phase) || item.id;
}

export function featureDescription(item, phase, surface = 'resources') {
  return phaseValue(surface === 'add' && item.addDescription ? item.addDescription : item.description, phase) || '';
}

export function featuresFor(phase, surface) {
  return FEATURES.filter((item) => item.phases.includes(phase) && item.surfaces.includes(surface));
}

export function groupFeatures(items) {
  const groups = new Map();
  for (const item of items) {
    if (!groups.has(item.group)) groups.set(item.group, []);
    groups.get(item.group).push(item);
  }
  return [...groups.entries()]
    .map(([id, features]) => ({ id, ...FEATURE_GROUPS[id], features }))
    .sort((a, b) => a.order - b.order);
}

export function normalizeHomeShortcutIds(value, phase) {
  const eligible = new Set(featuresFor(phase, 'home').map((item) => item.id));
  const selected = [];
  for (const id of Array.isArray(value) ? value : []) {
    if (eligible.has(id) && !selected.includes(id)) selected.push(id);
  }
  for (const id of HOME_SHORTCUT_DEFAULTS[phase] || []) {
    if (eligible.has(id) && !selected.includes(id)) selected.push(id);
  }
  for (const item of featuresFor(phase, 'home')) {
    if (!selected.includes(item.id)) selected.push(item.id);
  }
  return selected.slice(0, 4);
}

export function normalizeAllHomeShortcuts(value = {}) {
  return Object.fromEntries(Object.keys(HOME_SHORTCUT_DEFAULTS).map((phase) => [
    phase,
    normalizeHomeShortcutIds(value?.[phase], phase),
  ]));
}

export function resolveHomeShortcuts(settings, phase) {
  return normalizeHomeShortcutIds(settings?.homeShortcuts?.[phase], phase)
    .map(featureById)
    .filter(Boolean);
}
