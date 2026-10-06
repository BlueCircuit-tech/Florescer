/**
 * As cartas da Flor nos momentos da jornada.
 *
 * A essência do app é cuidar da MULHER. No pós-parto isso fica mais difícil
 * de sustentar, porque todo mundo passa a perguntar do bebê — então boa
 * parte destes testes guarda exatamente isso: nenhuma carta mede o bebê,
 * compara desenvolvimento ou cobra alguma coisa dela.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.localStorage = { getItem: () => null, setItem: () => {} };

const { getState, update } = await import('../assets/js/store.js');
const { addDays, today, toKey } = await import('../assets/js/cycle.js');
const { FLOR_FORBIDDEN } = await import('../assets/js/florVoice.js');
const {
  MOMENTS_ALL,
  MOMENT_IDS,
  markMomentSeen,
  momentById,
  momentOfDay,
  momentSeen,
} = await import('../assets/js/florMoments.js');
const { collectNotices } = await import('../assets/js/notify.js');

/** Pós-parto com o bebê nascido há `dias`. */
function setPosparto(dias) {
  update((state) => {
    state.onboarded = true;
    state.profile.phase = 'posparto';
    state.profile.name = 'Marcele';
    state.profile.birthDate = toKey(addDays(today(), -dias));
    state.profile.dueDate = null;
    state.profile.tryingFor = null;
    state.florMoments = { seen: [] };
    state.florDaily = { answers: {}, dismissed: [] };
    state.logs = {};
    state.journey = [];
  });
}

function setGestante(semana) {
  update((state) => {
    state.onboarded = true;
    state.profile.phase = 'gravida';
    state.profile.name = 'Marcele';
    state.profile.birthDate = null;
    state.profile.dueDate = toKey(addDays(today(), 280 - semana * 7));
    state.pregnancyTests = [];
    state.florMoments = { seen: [] };
    state.logs = {};
  });
}

const idDoDia = () => momentOfDay(getState())?.id ?? null;

/* ---------- os três momentos que a Marcele pediu ---------- */

test('no dia do nascimento, nasce também uma mãe', () => {
  setPosparto(0);
  const moment = momentOfDay(getState());
  assert.equal(moment.id, 'nascimento');
  assert.equal(moment.title, 'Hoje nasceu um bebê, mas também nasce uma mãe');
  assert.match(moment.text, /Você não precisa acertar tudo/);
  assert.match(moment.text, /ele precisa de você/);
});

test('nos primeiros dias em casa, a carta é sobre respirar', () => {
  setPosparto(2);
  const moment = momentOfDay(getState());
  assert.equal(moment.id, 'primeira-noite');
  assert.match(moment.text, /Talvez hoje tenha sido um dia difícil/);
  assert.match(moment.text, /Respire, um dia de cada vez/);
});

test('aos seis meses, a carta manda olhar para trás', () => {
  setPosparto(185);
  const moment = momentOfDay(getState());
  assert.equal(moment.id, 'seis-meses');
  assert.match(moment.text, /Veja tudo o que vocês já viveram juntos/);
  assert.match(moment.text, /Você conseguiu/);
});

/* ---------- janelas e alcance ---------- */

test('registrar o nascimento com atraso ainda alcança a carta certa', () => {
  // ela registra no quarto dia: a carta do nascimento já passou, mas a dos
  // primeiros dias ainda vale — nenhuma mulher fica sem mensagem nenhuma
  setPosparto(4);
  assert.equal(idDoDia(), 'primeira-noite');
});

test('cada carta tem a sua janela, sem buraco entre elas', () => {
  const vistos = [];
  for (let dia = 0; dia <= 400; dia += 1) {
    setPosparto(dia);
    const id = idDoDia();
    if (id && !vistos.includes(id)) vistos.push(id);
  }
  assert.deepEqual(vistos, ['nascimento', 'primeira-noite', 'primeira-semana', 'quarentena', 'seis-meses', 'um-ano']);
});

test('fora das janelas, nenhuma carta é forçada', () => {
  setPosparto(20);
  assert.equal(idDoDia(), null);
  setPosparto(90);
  assert.equal(idDoDia(), null);
});

test('as cartas da gestação seguem as semanas', () => {
  const esperado = { 13: 'fim-primeiro-tri', 20: 'metade', 28: 'terceiro-tri', 37: 'termo' };
  for (const [semana, id] of Object.entries(esperado)) {
    setGestante(Number(semana));
    assert.equal(idDoDia(), id, `semana ${semana}`);
  }
});

test('quando a DPP passa, a Flor fala sobre a espera', () => {
  setGestante(41);
  const moment = momentOfDay(getState());
  assert.equal(moment.id, 'passou-da-dpp');
  assert.match(moment.text, /sempre foi uma estimativa/i);
});

test('a carta não cruza de fase', () => {
  setPosparto(0);
  update((state) => { state.profile.phase = 'tentante'; });
  assert.equal(idDoDia(), null, 'carta de pós-parto não aparece para tentante');
});

/* ---------- entregue uma vez só ---------- */

test('uma carta lida nunca volta', () => {
  setPosparto(0);
  assert.equal(idDoDia(), 'nascimento');

  update((state) => { markMomentSeen(state, 'nascimento'); });
  assert.equal(momentSeen(getState(), 'nascimento'), true);
  assert.notEqual(idDoDia(), 'nascimento');
});

test('marcar duas vezes não duplica o registro', () => {
  setPosparto(0);
  let primeira;
  let segunda;
  update((state) => { primeira = markMomentSeen(state, 'nascimento'); });
  update((state) => { segunda = markMomentSeen(state, 'nascimento'); });
  assert.equal(primeira, true);
  assert.equal(segunda, false);
  assert.equal(getState().florMoments.seen.filter((id) => id === 'nascimento').length, 1);
});

test('id desconhecido não entra no estado', () => {
  setPosparto(0);
  update((state) => { markMomentSeen(state, 'nao-existe'); });
  assert.ok(!getState().florMoments.seen.includes('nao-existe'));
  assert.equal(momentById('nao-existe'), null);
});

/* ---------- no sininho e na Home ---------- */

test('a carta entra no sininho apontando para ela mesma', () => {
  setPosparto(0);
  const aviso = collectNotices(getState()).find((item) => item.kind === 'florMoment');
  assert.ok(aviso, 'a carta precisa aparecer no sininho');
  assert.equal(aviso.to, 'momento/nascimento');
  assert.equal(aviso.title, 'Hoje nasceu um bebê, mas também nasce uma mãe');
});

test('no dia da carta, a pergunta diária fica de fora', () => {
  setPosparto(0);
  const tipos = collectNotices(getState()).map((item) => item.kind);
  assert.ok(tipos.includes('florMoment'));
  assert.ok(!tipos.includes('florDaily'), 'duas mensagens no mesmo dia tiram o peso das duas');

  update((state) => { markMomentSeen(state, 'nascimento'); });
  assert.ok(collectNotices(getState()).map((item) => item.kind).includes('florDaily'));
});

/* ---------- a essência ---------- */

test('nenhuma carta mede o bebê, compara ou cobra', () => {
  for (const moment of MOMENTS_ALL) {
    const corpo = `${moment.title} ${moment.text}`;
    assert.doesNotMatch(corpo, /\b(peso|gramas|cent[ií]metros|percentil)\b/i, `${moment.id}: não mede o bebê`);
    // "ainda não se sente a mesma" é sobre ela; o que não pode é cobrar o bebê
    assert.doesNotMatch(corpo, /(beb[êe]|ele|ela)\s+(j[áa] deveria|ainda n[ãa]o|deveria estar)/i, `${moment.id}: não cobra do bebê`);
    assert.doesNotMatch(corpo, /\b(outras m[ãa]es|comparad|normal para a idade)\b/i, `${moment.id}: não compara`);
    assert.doesNotMatch(corpo, /\b(registre|preencha|não esqueça|você precisa)\b/i, `${moment.id}: não cobra dela`);
  }
});

test('as cartas respeitam a voz da Flor', () => {
  for (const moment of MOMENTS_ALL) {
    const corpo = `${moment.title} ${moment.text}`;
    for (const [regra, padrao] of Object.entries(FLOR_FORBIDDEN)) {
      assert.doesNotMatch(corpo, padrao, `${moment.id}: ${regra}`);
    }
  }
});

test('no pós-parto a Flor continua falando com ela, não com o bebê', () => {
  const posparto = MOMENTS_ALL.filter((moment) => moment.phases.includes('posparto'));
  assert.ok(posparto.length >= 4);
  for (const moment of posparto) {
    const corpo = `${moment.title} ${moment.text}`.toLowerCase();
    // sem \b no fim: "ê" não é caractere de palavra, então /você\b/ nunca casa
    assert.match(corpo, /voc[êe]|\bsua\b|seu corpo/, `${moment.id} precisa falar com ela`);
  }
});

test('toda carta tem título, texto e fase', () => {
  assert.equal(new Set(MOMENT_IDS).size, MOMENT_IDS.length, 'ids únicos');
  for (const moment of MOMENTS_ALL) {
    assert.ok(moment.title && moment.text, `${moment.id} precisa de texto`);
    assert.ok(Array.isArray(moment.phases) && moment.phases.length, `${moment.id} precisa de fase`);
    assert.equal(typeof moment.window, 'function', `${moment.id} precisa de janela`);
  }
});

test('uma janela que quebra não derruba a Home', () => {
  setPosparto(0);
  update((state) => { state.profile.birthDate = 'data-invalida'; });
  assert.doesNotThrow(() => momentOfDay(getState()));
});
