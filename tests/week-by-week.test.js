import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.localStorage = { getItem: () => null, setItem: () => {} };

const { update } = await import('../assets/js/store.js');
const { addDays, today, toKey } = await import('../assets/js/cycle.js');
const screen = (await import('../assets/js/screens/weekByWeek.js')).default;

test('Semana a Semana mostra somente a semana atual e as anteriores', () => {
  update((state) => {
    state.onboarded = true;
    state.profile.phase = 'gravida';
    state.profile.dueDate = toKey(addDays(today(), 252));
    state.profile.pregnancyType = 'unica';
  });

  const output = screen.render();
  assert.equal(output.appbar.sub, 'Até a 4ª semana');
  assert.match(output.html, /data-week="4" open/);
  assert.match(output.html, /data-week="3"/);
  assert.match(output.html, /data-week="2"/);
  assert.match(output.html, /data-week="1"/);
  assert.doesNotMatch(output.html, /data-week="5"/);
  assert.ok(output.html.indexOf('data-week="4"') < output.html.indexOf('data-week="3"'));
  assert.match(output.html, /Formação e desenvolvimento/);
  assert.match(output.html, /Curiosidade da semana/);
});

test('Semana a Semana não expõe o conteúdo fora da gestação', () => {
  update((state) => { state.profile.phase = 'tentante'; });

  const output = screen.render();
  assert.match(output.html, /Acompanhamento indisponível/);
  assert.doesNotMatch(output.html, /data-week=/);
});
