export const COMMUNITIES = {
  tentante: {
    slug: 'tentantes',
    title: 'Comunidade Tentantes',
    shortLabel: 'Comunidade',
    eyebrow: 'Um espaço para quem está tentando',
    description: 'Compartilhe dúvidas, descobertas, expectativas e acolhimento durante a jornada para engravidar.',
    prompt: 'Conte uma vitória, uma dúvida ou como você está vivendo esta jornada...',
    icon: 'seed',
  },
  gravida: {
    slug: 'gestantes',
    title: 'Comunidade Gestantes',
    shortLabel: 'Comunidade',
    eyebrow: 'Entre gestantes, com acolhimento',
    description: 'Um espaço exclusivo para contar o que você está vivendo, trocar informações e caminhar junto com outras gestantes.',
    prompt: 'Como você está vivendo esta gestação? Compartilhe uma descoberta, uma dúvida ou um desabafo...',
    icon: 'pregnant',
  },
  posparto: {
    slug: 'pos-parto',
    title: 'Comunidade Pós-parto',
    shortLabel: 'Comunidade',
    eyebrow: 'Maternidade real, sem julgamentos',
    description: 'Troque experiências sobre recuperação, rotina, rede de apoio e os primeiros cuidados com o bebê.',
    prompt: 'Conte como estão os seus dias, uma descoberta ou uma dúvida desta fase...',
    icon: 'baby',
  },
};

export function communityForPhase(phase) {
  return COMMUNITIES[phase] || COMMUNITIES.tentante;
}

export function communityPhaseFromSlug(slug) {
  return Object.entries(COMMUNITIES).find(([, community]) => community.slug === slug)?.[0] || null;
}

export function communityPath(phase) {
  return `comunidade/${communityForPhase(phase).slug}`;
}

export function postsForCommunity(posts, phase) {
  return posts.filter((post) => post.phase === phase);
}

export function canAccessCommunityPost(state, post) {
  return !!post && post.phase === state.profile.phase && !(state.hiddenPosts || []).includes(post.id);
}

export function createCommunityPost(state, input, now = Date.now()) {
  const expectedPhase = input.expectedPhase;
  if (!COMMUNITIES[expectedPhase] || state.profile.phase !== expectedPhase) {
    throw new Error('Sua fase mudou. Abra novamente a comunidade correta para publicar.');
  }
  const text = String(input.text || '').trim();
  if (text.length < 5) throw new Error('Escreva um pouco mais para publicar.');
  if (text.length > 800) throw new Error('A publicação deve ter no máximo 800 caracteres.');
  if (!Array.isArray(state.posts)) state.posts = [];
  const post = {
    id: `u${now}`,
    author: state.profile.name || 'Você',
    avatar: '🌷',
    phase: expectedPhase,
    text,
    likes: 0,
    comments: [],
    ts: now,
  };
  state.posts.push(post);
  return post;
}
