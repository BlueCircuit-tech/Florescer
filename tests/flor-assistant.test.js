import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.localStorage = { getItem: () => null, setItem: () => {} };

const { getState, update } = await import('../assets/js/store.js');
const { addDays, today, toKey } = await import('../assets/js/cycle.js');
const {
  FLOR_SUGGESTIONS,
  askFlor,
  normalize,
} = await import('../assets/js/florAssistant.js');

/** Tentante no dia pedido de um ciclo de 28 dias. */
const setCycle = (dayOfCycle) => update((state) => {
  state.onboarded = true;
  state.profile.phase = 'tentante';
  state.profile.cycleLength = 28;
  state.profile.periodLength = 5;
  state.profile.lastPeriodStart = toKey(addDays(today(), -(dayOfCycle - 1)));
  state.logs = {};
});

const ask = (q) => askFlor(q, getState());

test('normaliza acentos, maiúsculas e pontuação', () => {
  assert.equal(normalize('Quando é meu PERÍODO fértil?'), 'quando e meu periodo fertil');
  assert.equal(normalize('  Cólica!!  '), 'colica');
});

test('sinais de alerta vêm antes de qualquer resposta educativa', () => {
  setCycle(10);
  const emocional = ask('ando pensando em me machucar');
  assert.equal(emocional.kind, 'alert');
  assert.match(emocional.bullets.join(' '), /188/);

  const sangramento = ask('estou com sangramento intenso e muito sangue');
  assert.equal(sangramento.kind, 'alert');

  // mesmo misturado com um tema que a Flor domina, o alerta prevalece
  const misto = ask('meu periodo fertil e agora mas estou sangrando muito');
  assert.equal(misto.kind, 'alert');
});

test('responde a janela fértil com as datas reais da usuária', () => {
  setCycle(10);
  const r = ask('quando é meu período fértil?');

  assert.equal(r.kind, 'answer');
  assert.equal(r.id, 'janela-fertil');
  // ciclo de 28 com fase lútea de 14: ovulação no dia 15, janela 10–16
  assert.ok(/\d{2}\/\d{2}/.test(r.answer), 'a resposta precisa trazer datas');
  assert.ok(r.bullets.length >= 2);
});

test('sem data de menstruação, orienta em vez de inventar', () => {
  update((state) => { state.profile.lastPeriodStart = null; state.logs = {}; });
  const r = ask('qual meu período fértil');
  assert.equal(r.id, 'janela-fertil');
  assert.match(r.answer, /não tenho a data/i);
  assert.equal(r.link.to, 'perfil');
});

test('usa o histórico para dizer se o ciclo é regular', () => {
  update((state) => {
    state.onboarded = true;
    state.profile.phase = 'tentante';
    state.profile.cycleLength = 28;
    state.profile.periodLength = 5;
    state.profile.lastPeriodStart = toKey(addDays(today(), -10));
    state.logs = {};
    // três menstruações espaçadas de 28 dias
    for (const offset of [66, 38, 10]) {
      for (let i = 0; i < 3; i++) {
        state.logs[toKey(addDays(today(), -offset + i))] = { flow: 'medium', symptoms: [] };
      }
    }
  });

  const r = ask('meu ciclo é normal?');
  assert.equal(r.id, 'ciclo-normal');
  assert.match(r.answer, /regular|irregular/);
});

test('cobre os temas pedidos: ciclo, menstruação, hormônios e fertilidade', () => {
  setCycle(10);
  const casos = [
    ['quais sao as fases do ciclo menstrual', 'fases-ciclo'],
    ['o que o estrogenio faz', 'hormonios'],
    ['quando vem minha menstruacao', 'proxima-menstruacao'],
    ['como funciona a temperatura basal', 'temperatura'],
    ['o que e muco clara de ovo', 'muco'],
    ['por que tenho colica', 'colica'],
    ['minha menstruacao atrasou', 'atraso'],
    ['da para engravidar fora do periodo fertil', 'engravidar-menstruada'],
    ['como usar teste de ovulacao', 'teste-ovulacao'],
    ['o que e tpm', 'tpm'],
  ];
  for (const [pergunta, esperado] of casos) {
    assert.equal(ask(pergunta).id, esperado, `falhou para: ${pergunta}`);
  }
});

test('admite que não sabe em vez de arriscar palpite', () => {
  setCycle(10);
  const r = ask('qual a dose de clomifeno que devo tomar');
  assert.equal(r.kind, 'fallback');
  assert.match(r.answer, /não sei responder/i);
  assert.ok(r.suggestions.length > 0);
});

test('pergunta vazia devolve convite, não erro', () => {
  const r = ask('   ');
  assert.equal(r.kind, 'fallback');
  assert.equal(r.id, 'vazio');
});

test('explica com honestidade o que ela é', () => {
  const r = ask('voce e medica?');
  assert.equal(r.id, 'como-funciona');
  assert.match(r.bullets.join(' '), /não faço diagnóstico/i);
});

test('toda sugestão da tela tem resposta de verdade', () => {
  setCycle(10);
  for (const sugestao of FLOR_SUGGESTIONS) {
    const r = ask(sugestao);
    assert.equal(r.kind, 'answer', `sugestão sem resposta: ${sugestao}`);
    assert.ok(r.answer.length > 30);
  }
});
