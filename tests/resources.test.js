import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.localStorage = { getItem: () => null, setItem: () => {} };
globalThis.sessionStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };

const { update } = await import('../assets/js/store.js');
const resources = (await import('../assets/js/screens/resources.js')).default;

test('Central de Recursos mostra somente os grupos da fase atual', () => {
  update((state) => { state.profile.phase = 'posparto'; });
  const output = resources.render({ params: {} });

  assert.match(output.html, /Rotina do bebê/);
  assert.match(output.html, /Saúde e desenvolvimento/);
  assert.match(output.html, /data-nav="amamentacao"/);
  assert.match(output.html, /data-nav="desenvolvimento-bebe"/);
  assert.doesNotMatch(output.html, /data-nav="teste-gravidez"/);
});

test('modo de personalização seleciona quatro atalhos sem navegar pelos cards', () => {
  update((state) => { state.profile.phase = 'gravida'; });
  const output = resources.render({ params: { modo: 'atalhos' } });
  const selected = output.html.match(/class="item shortcut-option"[^>]*aria-pressed="true"/g) || [];

  assert.equal(selected.length, 4);
  assert.match(output.html, /4 de 4 selecionados/);
  assert.match(output.html, /data-shortcut-count role="status" aria-live="polite"/);
  assert.match(output.html, /data-shortcut-id="calendar"/);
  assert.doesNotMatch(output.html, /data-shortcut-id=[^>]*data-nav/);
});

test('Central da gestante aponta para a comunidade exclusiva', () => {
  update((state) => { state.profile.phase = 'gravida'; });
  const output = resources.render({ params: {} });
  assert.match(output.html, /data-nav="comunidade\/gestantes"/);
  assert.match(output.html, /Comunidade Gestantes/);
  assert.doesNotMatch(output.html, /comunidade\/tentantes|comunidade\/pos-parto/);
});
