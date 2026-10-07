/**
 * E-books e materiais.
 * O catálogo começa vazio de propósito — os arquivos ainda não chegaram.
 * Estes testes garantem que a estante só mostra material que existe de verdade.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.localStorage = { getItem: () => null, setItem: () => {} };

const { EBOOKS } = await import('../assets/js/content.js');
const cms = await import('../assets/js/cms.js');
const { ebooksForPhase } = await import('../assets/js/screens/ebooks.js');

const material = (patch = {}) => ({
  id: 'e1', title: '100 nomes de meninas', excerpt: 'Nomes e significados.',
  file: '100-nomes-de-meninas.pdf', pages: 48, premium: false,
  phases: ['tentante', 'gravida'], ...patch,
});

test('todo material do catálogo tem arquivo de verdade em /ebooks/', async () => {
  const { existsSync } = await import('node:fs');
  assert.ok(EBOOKS.length >= 3, 'os materiais entregues pela cliente estão publicados');
  for (const item of EBOOKS) {
    const caminho = new URL(`../ebooks/${item.file}`, import.meta.url);
    assert.ok(existsSync(caminho), `${item.title}: falta o arquivo ${item.file}`);
    assert.ok(item.title && item.excerpt, `${item.file} precisa de título e resumo`);
    assert.ok(Array.isArray(item.phases) && item.phases.length, `${item.file} precisa de fase`);
  }
});

test('os e-books de nomes são gratuitos, como a cliente pediu', () => {
  const nomes = EBOOKS.filter((e) => e.id.startsWith('nomes-'));
  assert.equal(nomes.length, 2);
  assert.ok(nomes.every((e) => e.premium === false));
});

test('o Premium não anuncia como exclusivo o que é gratuito', async () => {
  const { PREMIUM_BENEFITS } = await import('../assets/js/content.js');
  const vitrine = PREMIUM_BENEFITS.map((b) => `${b.title} ${b.text}`).join(' ').toLowerCase();

  for (const item of EBOOKS.filter((e) => !e.premium)) {
    // compara pelo começo do título, que é o que apareceria na vitrine
    const marca = item.title.slice(0, 18).toLowerCase();
    assert.ok(!vitrine.includes(marca),
      `"${item.title}" é gratuito e não pode aparecer como benefício do Premium`);
  }
});

test('material sem arquivo não aparece', () => {
  assert.equal(ebooksForPhase([material({ file: '' })], 'tentante', false).length, 0);
  assert.equal(ebooksForPhase([material({ title: '' })], 'tentante', false).length, 0);
});

test('cada material aparece só nas fases cadastradas', () => {
  const lista = [material()];
  assert.equal(ebooksForPhase(lista, 'tentante', false).length, 1);
  assert.equal(ebooksForPhase(lista, 'gravida', false).length, 1);
  assert.equal(ebooksForPhase(lista, 'posparto', false).length, 0);
});

test('sem fases definidas, o material vale para todas', () => {
  const lista = [material({ phases: [] })];
  for (const fase of ['tentante', 'gravida', 'posparto']) {
    assert.equal(ebooksForPhase(lista, fase, false).length, 1, fase);
  }
});

test('material Premium fica trancado para quem não tem', () => {
  const lista = [material({ premium: true })];
  assert.equal(ebooksForPhase(lista, 'tentante', false)[0].locked, true);
  assert.equal(ebooksForPhase(lista, 'tentante', true)[0].locked, false);
});

test('material comum nunca fica trancado', () => {
  assert.equal(ebooksForPhase([material()], 'tentante', false)[0].locked, false);
});

test('entrada quebrada não derruba a estante', () => {
  assert.doesNotThrow(() => ebooksForPhase([null, undefined, {}, 'texto'], 'tentante', false));
  assert.deepEqual(ebooksForPhase(null, 'tentante', false), []);
});

test('o painel publica no mesmo lugar que a tela lê', () => {
  cms.set('ebooks', [material({ id: 'novo', title: 'Material novo' })]);
  assert.equal(cms.getEbooks().length, 1);
  assert.equal(ebooksForPhase(cms.getEbooks(), 'gravida', false)[0].title, 'Material novo');

  // restaurar o padrão devolve o catálogo que vem no código
  cms.reset('ebooks');
  assert.deepEqual(cms.getEbooks(), EBOOKS);
});
