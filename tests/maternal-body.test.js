import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.localStorage = { getItem: () => null, setItem: () => {} };

const { update } = await import('../assets/js/store.js');
const { addDays, today, toKey } = await import('../assets/js/cycle.js');
const { pregnancyWeekGuide } = await import('../assets/js/pregnancy.js');
const screen = (await import('../assets/js/screens/maternalBody.js')).default;
const weekScreen = (await import('../assets/js/screens/weekDetail.js')).default;

/** Deixa o perfil grávido com a idade gestacional pedida. */
const setPregnancy = (weeks) => update((state) => {
  state.onboarded = true;
  state.profile.phase = 'gravida';
  state.profile.pregnancyType = 'unica';
  state.profile.dueDate = toKey(addDays(today(), (40 - weeks) * 7));
});

test('todas as fases da gestação descrevem as alterações emocionais', () => {
  for (let week = 4; week <= 40; week++) {
    const guide = pregnancyWeekGuide(week);
    assert.ok(guide.emotional, `semana ${week} sem conteúdo emocional`);
    assert.ok(guide.emotional.length > 40, `semana ${week} com texto emocional curto demais`);
  }
});

test('a tela reúne os quatro blocos pedidos', () => {
  setPregnancy(22);
  const output = screen.render({ params: {} });

  assert.match(output.html, /Sintomas esperados/);
  assert.match(output.html, /Alterações hormonais/);
  assert.match(output.html, /Desenvolvimento da barriga/);
  assert.match(output.html, /Alterações emocionais/);
  assert.match(output.html, /Quando procurar ajuda/);
});

test('mostra a fase atual e permite voltar às anteriores', () => {
  setPregnancy(30);
  const atual = screen.render({ params: {} });
  assert.match(atual.appbar.sub, /30ª semana · fase atual/);
  assert.match(atual.html, /Da 28ª à 32ª semana/);

  const anterior = screen.render({ params: { fase: '1' } });
  assert.match(anterior.html, /Da 7ª à 10ª semana/);
  assert.match(anterior.appbar.sub, /Da 7ª à 10ª semana/);
});

test('não oferece fases que a gestante ainda não viveu', () => {
  setPregnancy(10);
  const output = screen.render({ params: { fase: '8' } });
  // pedido fora do alcance cai na fase atual
  assert.match(output.html, /Da 7ª à 10ª semana/);
  assert.doesNotMatch(output.html, /data-fase="3"/);
});

test('fora da gestação a tela não expõe conteúdo', () => {
  update((state) => { state.profile.phase = 'tentante'; });
  const output = screen.render({ params: {} });
  assert.match(output.html, /Acompanhamento indisponível/);
  assert.doesNotMatch(output.html, /Alterações emocionais/);
});

test('a página da semana traz desenvolvimento, órgãos, habilidade e curiosidade', () => {
  setPregnancy(24);
  const output = weekScreen.render({ arg: '20' });

  assert.equal(output.appbar.title, '20ª semana');
  assert.match(output.html, /Como está crescendo/);
  assert.match(output.html, /Quais órgãos estão se formando/);
  assert.match(output.html, /O que já consegue fazer/);
  assert.match(output.html, /Curiosidade/);
  assert.match(output.html, /data-nav="semana\/19"/);
  assert.match(output.html, /data-nav="semana\/21"/);
});

test('a página da semana não avança além da semana atual', () => {
  setPregnancy(12);
  const output = weekScreen.render({ arg: '30' });
  assert.equal(output.appbar.title, '12ª semana');
  assert.doesNotMatch(output.html, /data-nav="semana\/13"/);
});
