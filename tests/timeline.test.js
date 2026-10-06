/**
 * Linha do tempo da jornada.
 * A exigência da tarefa é "reúne automaticamente": estes testes garantem que
 * cada marco aparece sem nenhum registro extra, na ordem certa e sem repetir.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.localStorage = { getItem: () => null, setItem: () => {} };

const { getState, update } = await import('../assets/js/store.js');
const { addDays, today, toKey } = await import('../assets/js/cycle.js');
const { TIMELINE_GROUPS, journeyTimeline } = await import('../assets/js/timeline.js');
const { DEVELOPMENT_MILESTONES } = await import('../assets/js/development.js');

const dia = (n) => toKey(addDays(today(), n));

/** Uma jornada inteira: começou a tentar, engravidou e o bebê nasceu. */
function jornadaCompleta() {
  const nascimento = dia(-200);
  const dum = dia(-480);
  update((state) => {
    state.onboarded = true;
    state.createdAt = addDays(today(), -520).getTime();
    state.profile = {
      ...state.profile,
      name: 'Marcele', phase: 'posparto',
      startedTryingAt: dia(-500),
      lastPeriodStart: dum,
      dueDate: dia(-200),
      birthDate: nascimento,
      babyName: 'Alice', babyNames: [],
      babySex: 'menina', babySexAt: dia(-340),
      pregnancyType: 'unica',
    };
    state.pregnancyTests = [{ id: 't1', date: dia(-470), result: 'positivo' }];
    state.calendarEvents = [
      { id: 'u1', phase: 'gravida', type: 'ultrasound', title: 'Ultrassom de datação', date: dia(-450), recurrence: 'none' },
      { id: 'u2', phase: 'gravida', type: 'ultrasound', title: 'Ultrassom morfológico', date: dia(-340), recurrence: 'none' },
      { id: 'c1', phase: 'gravida', type: 'prenatal', title: 'Consulta', date: dia(-430), recurrence: 'none' },
    ];
    state.logs = { [dia(-300)]: { bumpPhotos: ['data:image/jpeg;base64,AAA'] } };
    state.babyDevelopmentRecords = [
      { id: 'd1', milestoneType: 'first_bath', happenedOn: dia(-198), babyName: 'Alice' },
      { id: 'd2', milestoneType: 'first_smile', happenedOn: dia(-150), babyName: 'Alice' },
      { id: 'd3', milestoneType: 'first_steps', happenedOn: dia(-10), babyName: 'Alice' },
    ];
    state.journey = [];
  });
}

const ids = () => journeyTimeline(getState()).items.map((item) => item.id);
const titulos = () => journeyTimeline(getState()).items.map((item) => item.title);

/* ---------- reúne sozinha ---------- */

test('reúne os marcos pedidos sem nenhum registro extra', () => {
  jornadaCompleta();
  const t = titulos().join(' | ');

  assert.match(t, /O começo desta jornada/, 'tentativa');
  assert.match(t, /Teste positivo/, 'teste positivo');
  assert.match(t, /Ultrassom/, 'ultrassom');
  assert.match(t, /É uma menina/, 'sexo');
  assert.match(t, /Alice nasceu/, 'nascimento');
  assert.match(t, /Primeiro banho/, 'primeiro banho');
  assert.match(t, /Primeiro sorriso/, 'sorriso');
  assert.match(t, /Primeiros passos/, 'passos');
});

test('"primeiro banho" existe como marco registrável', () => {
  assert.ok(DEVELOPMENT_MILESTONES.some((m) => m.id === 'first_bath'));
});

test('os marcos saem em ordem cronológica', () => {
  jornadaCompleta();
  const datas = journeyTimeline(getState()).items.map((item) => item.at);
  assert.deepEqual([...datas].sort((a, b) => a - b), datas);
});

test('cada marco cai na fase certa', () => {
  jornadaCompleta();
  const porId = Object.fromEntries(journeyTimeline(getState()).items.map((i) => [i.id, i.group]));
  assert.equal(porId.inicio, 'tentativa');
  assert.equal(porId['teste-positivo'], 'tentativa');
  assert.equal(porId.sexo, 'gestacao');
  assert.equal(porId['usg-u2'], 'gestacao');
  assert.equal(porId.nascimento, 'bebe');
  assert.ok(Object.keys(TIMELINE_GROUPS).includes(porId.nascimento));
});

test('o resumo conta por fase e mede a jornada inteira', () => {
  jornadaCompleta();
  const { counts, span } = journeyTimeline(getState());
  assert.equal(counts.tentativa, 2);
  assert.ok(counts.gestacao >= 3);
  assert.ok(counts.bebe >= 4);
  assert.equal(span.days, 490);
});

/* ---------- o que não pode entrar ---------- */

test('só ultrassom entra; outras consultas não viram marco', () => {
  jornadaCompleta();
  assert.ok(!titulos().some((t) => t === 'Consulta'));
});

test('nada do futuro aparece na linha do tempo', () => {
  jornadaCompleta();
  update((state) => {
    state.calendarEvents.push({ id: 'u3', phase: 'gravida', type: 'ultrasound', title: 'Ultrassom futuro', date: dia(30), recurrence: 'none' });
    state.babyDevelopmentRecords.push({ id: 'd9', milestoneType: 'first_word', happenedOn: dia(15) });
  });
  const t = titulos().join(' | ');
  assert.doesNotMatch(t, /Ultrassom futuro/);
  assert.doesNotMatch(t, /Primeira palavra/);
});

test('"prefiro deixar surpresa" não vira marco de sexo', () => {
  jornadaCompleta();
  update((state) => { state.profile.babySex = 'surpresa'; });
  assert.ok(!ids().includes('sexo'));
});

test('um marco manual igual a um automático não duplica', () => {
  jornadaCompleta();
  const antes = ids().length;
  update((state) => {
    state.journey = [{ icon: 'pregnant', title: 'Teste positivo', note: 'registrado', at: Date.parse(dia(-470)) }];
  });
  assert.equal(ids().length, antes, 'o marco repetido não entra de novo');
});

test('um marco manual diferente entra e é classificado por fase', () => {
  jornadaCompleta();
  update((state) => {
    state.journey = [{ icon: 'heart', title: 'Primeira consulta de pré-natal', note: '', at: Date.parse(dia(-440)) }];
  });
  const item = journeyTimeline(getState()).items.find((i) => i.title === 'Primeira consulta de pré-natal');
  assert.ok(item);
  assert.equal(item.group, 'gestacao');
});

test('data inválida não derruba a linha do tempo', () => {
  jornadaCompleta();
  update((state) => {
    state.profile.birthDate = 'nao-e-data';
    state.babyDevelopmentRecords.push({ id: 'dx', milestoneType: 'first_smile', happenedOn: '2026-13-45' });
  });
  assert.doesNotThrow(() => journeyTimeline(getState()));
  assert.ok(!ids().includes('nascimento'));
});

/* ---------- jornada vazia ---------- */

test('sem nada registrado, a linha do tempo volta vazia', () => {
  update((state) => {
    state.createdAt = null;
    state.profile = { ...state.profile, phase: 'tentante', startedTryingAt: null, birthDate: null, dueDate: null, babySex: null, babySexAt: null };
    state.pregnancyTests = [];
    state.calendarEvents = [];
    state.logs = {};
    state.babyDevelopmentRecords = [];
    state.journey = [];
  });
  const { items, span } = journeyTimeline(getState());
  assert.deepEqual(items, []);
  assert.equal(span, null);
});

test('quem acabou de instalar já tem o começo da jornada', () => {
  update((state) => {
    state.createdAt = addDays(today(), -3).getTime();
    state.profile.startedTryingAt = null;
  });
  const primeiro = journeyTimeline(getState()).items[0];
  assert.equal(primeiro.id, 'inicio');
  assert.match(primeiro.note, /primeiro dia no Florescer/);
});

test('"Meu bebê nasceu" e o nascimento automático são o mesmo marco', () => {
  jornadaCompleta();
  update((state) => {
    state.journey = [{ icon: 'baby', title: 'Meu bebê nasceu', note: 'início do Florescer Baby', at: Date.parse(dia(-200)) + 36000000 }];
  });

  const nascimentos = titulos().filter((t) => /nasceu|nascimento/i.test(t));
  assert.deepEqual(nascimentos, ['Alice nasceu'], 'só o marco automático, com o nome do bebê');
});

test('gestação múltipla também não duplica o nascimento', () => {
  jornadaCompleta();
  update((state) => {
    state.profile.babyNames = ['Alice', 'Clara'];
    state.profile.pregnancyType = 'gemelar';
    state.journey = [{ icon: 'baby', title: 'Meus bebês nasceram', note: '', at: Date.parse(dia(-200)) + 36000000 }];
  });

  assert.equal(titulos().filter((t) => /nascer|nasceu|nasceram/i.test(t)).length, 1);
});
