import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.localStorage = { getItem: () => null, setItem: () => {} };
globalThis.sessionStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };

const { update } = await import('../assets/js/store.js');
const profile = (await import('../assets/js/screens/profile.js')).default;

const entries = Array.from({ length: 6 }, (_, index) => ({
  icon: 'flower',
  title: `Marco ${index + 1}`,
  note: `Detalhe ${index + 1}`,
  at: new Date(2026, 7, 20 - index).getTime(),
}));

test('Minha jornada mantém três eventos visíveis e recolhe os anteriores', () => {
  update((state) => {
    state.onboarded = true;
    state.profile.phase = 'tentante';
    state.journey = entries.map((entry) => ({ ...entry }));
  });

  const output = profile.render({ arg: null });
  const preview = output.html.indexOf('data-journey-preview');
  const more = output.html.indexOf('data-journey-more');

  assert.ok(preview >= 0);
  assert.ok(more > preview);
  assert.ok(output.html.indexOf('Marco 1') < more);
  assert.ok(output.html.indexOf('Marco 2') < more);
  assert.ok(output.html.indexOf('Marco 3') < more);
  assert.ok(output.html.indexOf('Marco 4') > more);
  assert.match(output.html, /<details class="journey-more" data-journey-more>/);
  assert.doesNotMatch(output.html, /data-journey-more open/);
  assert.match(output.html, /Expandir jornada/);
  assert.match(output.html, /Recolher jornada/);
  assert.match(output.html, /3 detalhes anteriores/);
});

test('Minha jornada não mostra expansão quando possui até três eventos', () => {
  update((state) => { state.journey = entries.slice(0, 3).map((entry) => ({ ...entry })); });

  const output = profile.render({ arg: null });
  assert.match(output.html, /data-journey-preview/);
  assert.doesNotMatch(output.html, /data-journey-more/);
});
