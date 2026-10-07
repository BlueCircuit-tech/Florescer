/**
 * Biblioteca: equilíbrio do acervo e o ponto de entrada.
 *
 * A queixa era concreta — tema com um artigo só, e nenhuma pista de por onde
 * começar. Estes testes travam as duas coisas: nenhum tema pode ficar vazio
 * para a fase em que aparece, e sempre há uma sugestão enquanto houver algo
 * não lido.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.localStorage = { getItem: () => null, setItem: () => {} };

const { ARTICLES } = await import('../assets/js/content.js');
const { FLOR_FORBIDDEN } = await import('../assets/js/florVoice.js');
const {
  articlesForLibrary,
  articlesForPhase,
  readingProgress,
  suggestedArticle,
  topicsForPhase,
} = await import('../assets/js/libraries.js');

const FASES = ['tentante', 'gravida', 'posparto'];

/* ---------- acervo ---------- */

test('nenhum tema aparece vazio na fase em que é oferecido', () => {
  const vazios = [];
  for (const fase of FASES) {
    for (const tema of topicsForPhase(fase)) {
      if (!articlesForLibrary(ARTICLES, fase, tema.id).length) vazios.push(`${fase}/${tema.id}`);
    }
  }
  assert.deepEqual(vazios, [], 'tema sem conteúdo é um beco sem saída para a usuária');
});

test('cada fase tem acervo suficiente para não parecer vazia', () => {
  for (const fase of FASES) {
    const total = articlesForPhase(ARTICLES, fase).length;
    assert.ok(total >= 7, `${fase} tem só ${total} artigos`);
  }
});

test('todo artigo tem id único, resumo, tempo de leitura e fase', () => {
  const ids = ARTICLES.map((a) => a.id);
  assert.equal(new Set(ids).size, ids.length, 'ids repetidos quebram a rota do artigo');
  for (const a of ARTICLES) {
    assert.ok(a.title && a.excerpt, `${a.id} precisa de título e resumo`);
    assert.ok(a.time > 0, `${a.id} precisa de tempo de leitura`);
    assert.ok(Array.isArray(a.phases) && a.phases.length, `${a.id} precisa de fase`);
    assert.ok(Array.isArray(a.body) && a.body.length >= 4, `${a.id} precisa de conteúdo`);
  }
});

test('o conteúdo dos artigos só usa blocos que a tela sabe desenhar', () => {
  const aceitos = new Set(['p', 'h2', 'li', 'note']);
  for (const a of ARTICLES) {
    for (const [tipo] of a.body) {
      assert.ok(aceitos.has(tipo), `${a.id}: bloco "${tipo}" não é renderizado`);
    }
  }
});

test('nenhum artigo promete, julga, minimiza ou prescreve', () => {
  for (const a of ARTICLES) {
    const corpo = [a.title, a.excerpt, ...a.body.map(([, texto]) => texto)].join(' ');
    for (const [regra, padrao] of Object.entries(FLOR_FORBIDDEN)) {
      assert.doesNotMatch(corpo, padrao, `${a.id}: ${regra}`);
    }
  }
});

/* ---------- por onde começar ---------- */

test('a sugestão acompanha a semana da gestação', () => {
  const porSemana = (weeks) => suggestedArticle(ARTICLES, { phase: 'gravida', weeks })?.article.id;
  assert.equal(porSemana(8), 'primeiro-trimestre');
  assert.equal(porSemana(22), 'segundo-trimestre');
  assert.equal(porSemana(32), 'terceiro-trimestre');
  assert.equal(porSemana(38), 'plano-de-parto');
});

test('a sugestão acompanha os dias do bebê', () => {
  const porDia = (babyDays) => suggestedArticle(ARTICLES, { phase: 'posparto', babyDays })?.article.id;
  assert.equal(porDia(3), 'corpo-depois-do-parto');
  assert.equal(porDia(45), 'sono-do-bebe-e-o-seu');
  assert.equal(porDia(300), 'volta-ao-trabalho');
});

test('quem tenta há mais de um ano recebe outra porta de entrada', () => {
  assert.equal(suggestedArticle(ARTICLES, { phase: 'tentante' })?.article.id, 'periodo-fertil');
  assert.equal(
    suggestedArticle(ARTICLES, { phase: 'tentante', longTrying: true })?.article.id,
    'quando-procurar-especialista',
  );
});

test('o que já foi lido não é sugerido de novo', () => {
  const read = ['primeiro-trimestre'];
  const sugerido = suggestedArticle(ARTICLES, { phase: 'gravida', weeks: 8, read });
  assert.ok(!read.includes(sugerido.article.id));
});

test('com tudo lido, não há sugestão em vez de uma repetida', () => {
  const read = articlesForPhase(ARTICLES, 'tentante').map((a) => a.id);
  assert.equal(suggestedArticle(ARTICLES, { phase: 'tentante', read }), null);
});

test('toda sugestão aponta para um artigo da fase dela', () => {
  for (const fase of FASES) {
    const s = suggestedArticle(ARTICLES, { phase: fase, weeks: 20, babyDays: 20 });
    assert.ok(s, `${fase} precisa ter por onde começar`);
    assert.ok(s.article.phases.includes(fase), `${fase}: sugeriu artigo de outra fase`);
    assert.ok(s.reason, 'a sugestão precisa dizer por que foi escolhida');
  }
});

/* ---------- progresso ---------- */

test('o progresso conta só os artigos da fase dela', () => {
  const vazio = readingProgress(ARTICLES, 'gravida', []);
  assert.equal(vazio.read, 0);
  assert.equal(vazio.percent, 0);
  assert.ok(vazio.total > 0);

  // um artigo de outra fase não pode contar como lido aqui
  const comOutraFase = readingProgress(ARTICLES, 'gravida', ['periodo-fertil']);
  assert.equal(comOutraFase.read, 0);

  const comUm = readingProgress(ARTICLES, 'gravida', ['primeiro-trimestre']);
  assert.equal(comUm.read, 1);
});

test('ler tudo chega a 100%', () => {
  const todos = articlesForPhase(ARTICLES, 'posparto').map((a) => a.id);
  assert.equal(readingProgress(ARTICLES, 'posparto', todos).percent, 100);
});

test('lista de lidos inválida não quebra a conta', () => {
  assert.doesNotThrow(() => readingProgress(ARTICLES, 'gravida', null));
  assert.equal(readingProgress(ARTICLES, 'gravida', null).read, 0);
});

/* ---------- foto de perfil e termos ---------- */

test('o avatar mostra a foto dela quando existe, e o ícone da fase quando não', async () => {
  const { avatarContent, avatarIcon, hasAvatarPhoto } = await import('../assets/js/avatar.js');

  const semFoto = avatarContent({ phase: 'gravida', name: 'Marcele' });
  assert.doesNotMatch(semFoto, /<img/, 'sem foto, usa ícone');
  assert.match(semFoto, /<svg/);
  assert.equal(avatarIcon('gravida'), 'pregnant');
  assert.equal(avatarIcon('posparto'), 'baby');
  assert.equal(avatarIcon(undefined), 'flower');

  const comFoto = avatarContent({ phase: 'gravida', name: 'Marcele', avatarPhoto: 'data:image/jpeg;base64,AAA' });
  assert.match(comFoto, /<img class="avatar__img"/);
  assert.match(comFoto, /alt="Foto de Marcele"/);
});

test('valor que não é imagem não vira avatar', async () => {
  const { avatarContent, hasAvatarPhoto } = await import('../assets/js/avatar.js');
  for (const ruim of ['https://exemplo.com/foto.jpg', 'javascript:alert(1)', '', null]) {
    assert.equal(hasAvatarPhoto({ avatarPhoto: ruim }), false, String(ruim));
    assert.doesNotMatch(avatarContent({ avatarPhoto: ruim }), /<img/);
  }
});

test('o perfil nasce sem foto', async () => {
  const { DEFAULTS } = await import('../assets/js/store.js');
  assert.equal(DEFAULTS().profile.avatarPhoto, null);
});

test('os termos de uso existem e dizem o que o app não é', async () => {
  const { termsScreen } = await import('../assets/js/screens/settings.js');
  const html = termsScreen.render().html;
  assert.match(html, /não faz diagnóstico, não substitui consulta/i);
  assert.match(html, /não serve como método contraceptivo/i);
  assert.match(html, /dados pessoais sensíveis/i);
  assert.match(html, /data-nav="privacidade"/);
});
