import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.localStorage = { getItem: () => null, setItem: () => {} };
globalThis.sessionStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };

const { getState, update } = await import('../assets/js/store.js');
const {
  canAccessCommunityPost,
  communityPath,
  createCommunityPost,
} = await import('../assets/js/communities.js');
const communityModule = await import('../assets/js/screens/community.js');
const communityScreen = communityModule.default;
const { communityPosts, findAccessiblePost, newPostScreen, postScreen } = communityModule;

test('cada fase possui uma rota canônica própria de comunidade', () => {
  assert.equal(communityPath('tentante'), 'comunidade/tentantes');
  assert.equal(communityPath('gravida'), 'comunidade/gestantes');
  assert.equal(communityPath('posparto'), 'comunidade/pos-parto');
});

/** O feed não tem mais conteúdo semeado: só existe o que a usuária escreveu. */
const comMeusPosts = () => update((state) => {
  state.profile.phase = 'gravida';
  state.postState = {};
  state.hiddenPosts = [];
  state.posts = [
    { id: 'meu-g', author: 'Ana', avatar: '🌷', phase: 'gravida', text: 'Hoje ouvi o coração do meu bebê.', likes: 0, comments: [], ts: 2000 },
    { id: 'meu-t', author: 'Ana', avatar: '🌷', phase: 'tentante', text: 'Ciclo novo começando.', likes: 0, comments: [], ts: 1000 },
  ];
});

test('o feed não traz nenhuma publicação de gente inventada', () => {
  update((state) => {
    state.profile.phase = 'gravida';
    state.posts = [];
    state.postState = {};
    state.hiddenPosts = [];
  });

  assert.deepEqual(communityPosts(getState()), []);
  const output = communityScreen.render({ arg: 'gestantes', params: {} });
  assert.match(output.html, /Seu espaço ainda está em branco/);
  assert.match(output.html, /quando a comunidade for conectada ao servidor/i);
});

test('Comunidade Gestantes mostra somente publicações da gestação', () => {
  comMeusPosts();

  const posts = communityPosts(getState());
  assert.equal(posts.length, 1);
  assert.equal(posts.every((post) => post.phase === 'gravida'), true);

  const output = communityScreen.render({ arg: 'gestantes', params: {} });
  assert.equal(output.appbar.title, 'Comunidade Gestantes');
  assert.match(output.html, /espaço exclusivo para contar o que você está vivendo/i);
  assert.match(output.html, /Hoje ouvi o coração do meu bebê/);
  assert.doesNotMatch(output.html, /Todas|data-filter|Ciclo novo começando/);
});

test('o desafio não anuncia um número de participantes', () => {
  comMeusPosts();
  assert.doesNotMatch(communityScreen.render({ arg: 'gestantes', params: {} }).html, /mulheres participando/);
});

test('post de outra comunidade ou oculto não pode ser acessado', () => {
  comMeusPosts();
  update((state) => { state.hiddenPosts = ['meu-g']; });

  assert.equal(findAccessiblePost(getState(), 'meu-t'), null, 'outra fase');
  assert.equal(findAccessiblePost(getState(), 'meu-g'), null, 'ocultado pela moderação');
  assert.equal(canAccessCommunityPost(getState(), { id: 'x', phase: 'gravida' }), true);

  update((state) => { state.hiddenPosts = []; });
  assert.match(postScreen.render({ arg: 'meu-t' }).html, /Publicação não disponível/);
  assert.match(postScreen.render({ arg: 'meu-g' }).html, /Comentários/);
});

test('nova publicação pertence obrigatoriamente à fase ativa', () => {
  const state = { profile: { phase: 'gravida', name: 'Ana' }, posts: [] };
  const post = createCommunityPost(state, { expectedPhase: 'gravida', text: 'Hoje senti o bebê se mexer.' }, 123);

  assert.equal(post.phase, 'gravida');
  assert.equal(post.author, 'Ana');
  assert.throws(() => createCommunityPost(state, { expectedPhase: 'tentante', text: 'Tentativa cruzada.' }, 124), /fase mudou/);
  assert.equal(state.posts.length, 1);
});

test('formulário informa a comunidade ativa e não permite escolher outra fase', () => {
  update((state) => { state.profile.phase = 'gravida'; });
  const output = newPostScreen.render();

  assert.equal(output.appbar.sub, 'Comunidade Gestantes');
  assert.match(output.html, /Publicando em Comunidade Gestantes/);
  assert.match(output.html, /Como você está vivendo esta gestação/);
  assert.doesNotMatch(output.html, /Publicar como|data-phase/);
});
