import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.localStorage = { getItem: () => null, setItem: () => {} };

const { update } = await import('../assets/js/store.js');
const { addDays, today, toKey } = await import('../assets/js/cycle.js');
const screen = (await import('../assets/js/screens/babyFeeding.js')).default;

test('tela apresenta os cinco guias e conteúdo correspondente à idade', () => {
  update((state) => {
    state.profile.phase = 'posparto';
    state.profile.birthDate = toKey(addDays(today(), -210));
    state.profile.babyName = 'Lia';
    state.profile.babyNames = ['Lia'];
  });

  const output = screen.render({ params: { guia: 'receitas' } });
  assert.match(output.appbar.sub, /Lia/);
  assert.match(output.html, /De 6 a 8 meses/);
  assert.match(output.html, /Quando iniciar/);
  assert.match(output.html, /Introdução alimentar/);
  assert.match(output.html, /Receitinhas fáceis/);
  assert.match(output.html, /Alimentos liberados/);
  assert.match(output.html, /Alimentos proibidos/);
  assert.match(output.html, /Abóbora, feijão e frango/);
});

test('tela não mostra receitas sólidas antes de seis meses', () => {
  update((state) => {
    state.profile.phase = 'posparto';
    state.profile.birthDate = toKey(addDays(today(), -90));
  });

  const output = screen.render({ params: { guia: 'receitas' } });
  assert.match(output.html, /Receitas só depois do início alimentar/);
  assert.doesNotMatch(output.html, /Abóbora, feijão e frango/);
});

test('tela de alimentação fica indisponível fora do pós-parto', () => {
  update((state) => { state.profile.phase = 'gravida'; });
  const output = screen.render({ params: {} });

  assert.match(output.html, /Guia indisponível/);
  assert.doesNotMatch(output.html, /role="tablist"/);
});
