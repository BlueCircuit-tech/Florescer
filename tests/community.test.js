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

test('Comunidade Gestantes mostra somente publicações da gestação', () => {
  update((state) => {
    state.profile.phase = 'gravida';
    state.posts = [];
    state.postState = {};
    state.hiddenPosts = [];
  });

  const state = getState();
  const posts = communityPosts(state);
  assert.equal(posts.length > 1, true);
  assert.equal(posts.every((post) => post.phase === 'gravida'), true);

  const output = communityScreen.render({ arg: 'gestantes', params: {} });
  assert.equal(output.appbar.title, 'Comunidade Gestantes');
  assert.match(output.html, /espaço exclusivo para contar o que você está vivendo/i);
  assert.match(output.html, /Hoje ouvi o coração do meu bebê/);
  assert.doesNotMatch(output.html, /Todas|data-filter|Positivo no teste de ovulação/);
});

test('post de outra comunidade ou oculto não pode ser acessado', () => {
  const state = {
    profile: { phase: 'gravida' }, posts: [], postState: {}, hiddenPosts: ['p6'],
  };

  assert.equal(findAccessiblePost(state, 'p1'), null);
  assert.equal(findAccessiblePost(state, 'p6'), null);
  assert.equal(canAccessCommunityPost(state, { id: 'x', phase: 'gravida' }), true);

  update((current) => { current.profile.phase = 'gravida'; current.hiddenPosts = []; });
  assert.match(postScreen.render({ arg: 'p1' }).html, /Publicação não disponível/);
  assert.match(postScreen.render({ arg: 'p6' }).html, /Comentários/);
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
