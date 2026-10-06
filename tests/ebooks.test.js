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

test('o catálogo nasce vazio: nada de estante falsa', () => {
  assert.deepEqual(EBOOKS, []);
  assert.deepEqual(cms.getEbooks(), []);
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
  cms.set('ebooks', [material()]);
  assert.equal(cms.getEbooks().length, 1);
  assert.equal(ebooksForPhase(cms.getEbooks(), 'gravida', false)[0].title, '100 nomes de meninas');
  cms.reset('ebooks');
  assert.deepEqual(cms.getEbooks(), []);
});
