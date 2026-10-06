/**
 * Diário Gestacional — montagem dos dados.
 * O que importa aqui: nada do que ela registrou pode sumir, nada de fora da
 * gestação pode entrar, e a semana gestacional precisa bater com a DPP.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.localStorage = { getItem: () => null, setItem: () => {} };

const { getState, update } = await import('../assets/js/store.js');
const { addDays, fromKey, toKey, today } = await import('../assets/js/cycle.js');
const {
  diaryOffer,
  gestationalWeek,
  pregnancyAnchor,
  pregnancyDiary,
  trimesterOf,
} = await import('../assets/js/pregnancyDiary.js');

/** DPP daqui a `faltam` dias: a DUM fica em DPP − 280. */
function setGestante(faltam, extra = {}) {
  update((state) => {
    state.onboarded = true;
    state.profile.phase = 'gravida';
    state.profile.name = 'Marcele';
    state.profile.babyName = 'Alice';
    state.profile.babyNames = [];
    state.profile.birthDate = null;
    state.profile.pregnancyType = 'unica';
    state.profile.ultrasoundPhoto = null;
    state.profile.dueDate = toKey(addDays(today(), faltam));
    state.logs = {};
    state.calendarEvents = [];
    state.pregnancyTests = [];
    state.journey = [];
    Object.assign(state.profile, extra);
  });
}

const diaDaSemana = (semana, dia = 0) => {
  const anchor = pregnancyAnchor(getState().profile);
  return toKey(addDays(anchor.start, semana * 7 + dia));
};

const log = (key, patch) => update((state) => {
  state.logs[key] = { ...patch };
});

/* ---------- âncora e semanas ---------- */

test('a âncora sai da DPP ou, na falta dela, da DUM', () => {
  const comDpp = pregnancyAnchor({ dueDate: '2026-12-25' });
  assert.equal(toKey(comDpp.start), '2026-03-20');

  const comDum = pregnancyAnchor({ lastPeriodStart: '2026-03-20' });
  assert.equal(toKey(comDum.due), '2026-12-25');

  assert.equal(pregnancyAnchor({}), null);
});

test('a semana gestacional conta a partir da DUM', () => {
  const anchor = pregnancyAnchor({ lastPeriodStart: '2026-01-01' });
  assert.deepEqual(gestationalWeek(fromKey('2026-01-01'), anchor), { week: 0, day: 0, days: 0 });
  assert.deepEqual(gestationalWeek(fromKey('2026-01-15'), anchor), { week: 2, day: 0, days: 14 });
  assert.deepEqual(gestationalWeek(fromKey('2026-01-18'), anchor), { week: 2, day: 3, days: 17 });
  assert.equal(gestationalWeek(fromKey('2026-10-08'), anchor).week, 40);
});

test('os trimestres seguem o mesmo corte do resto do app', () => {
  assert.equal(trimesterOf(13), 1);
  assert.equal(trimesterOf(14), 2);
  assert.equal(trimesterOf(27), 2);
  assert.equal(trimesterOf(28), 3);
});

/* ---------- recorte ---------- */

test('sem datas da gestação o diário não é montado', () => {
  setGestante(100);
  update((state) => { state.profile.dueDate = null; state.profile.lastPeriodStart = null; });
  const diary = pregnancyDiary(getState());
  assert.equal(diary.available, false);
  assert.equal(diary.reason, 'sem_datas');
});

test('com datas mas sem registros, diz que falta registrar', () => {
  setGestante(100);
  const diary = pregnancyDiary(getState());
  assert.equal(diary.available, false);
  assert.equal(diary.reason, 'sem_registros');
});

test('registros fora da janela da gestação ficam de fora', () => {
  setGestante(100);
  const anchor = pregnancyAnchor(getState().profile);

  log(toKey(addDays(anchor.start, -3)), { thoughts: 'antes da DUM' });
  log(toKey(addDays(today(), 5)), { thoughts: 'no futuro' });
  log(diaDaSemana(10), { thoughts: 'dentro da gestação' });

  const diary = pregnancyDiary(getState());
  const textos = diary.weeks.flatMap((w) => w.days.map((d) => d.thoughts));
  assert.deepEqual(textos, ['dentro da gestação']);
});

test('registros vazios não viram páginas', () => {
  setGestante(100);
  log(diaDaSemana(8), { thoughts: '   ', emotions: [], symptoms: [], bumpPhotos: [] });
  log(diaDaSemana(9), { mood: 3 });

  const diary = pregnancyDiary(getState());
  assert.equal(diary.summary.entries, 1);
  assert.equal(diary.weeks[0].week, 9);
});

/* ---------- conteúdo ---------- */

test('o dia carrega tudo o que foi registrado, sem perder campo', () => {
  setGestante(100);
  const key = diaDaSemana(20, 3);
  log(key, {
    mood: 4,
    emotions: ['Feliz', 'Grata'],
    symptoms: ['Enjoo'],
    thoughts: 'senti o primeiro chute',
    gratitude: 'pela paciência do meu companheiro',
    notes: 'dia tranquilo',
    symptomNotes: 'enjoo só de manhã',
    systolicPressure: 110,
    diastolicPressure: 70,
    weight: 64.5,
    glucose: 88,
    bumpPhotos: ['data:image/jpeg;base64,AAA'],
    examPhotos: ['data:image/jpeg;base64,BBB'],
  });

  const diary = pregnancyDiary(getState());
  const dia = diary.weeks[0].days[0];

  assert.equal(diary.weeks[0].week, 20);
  assert.equal(diary.weeks[0].trimester, 2);
  assert.equal(dia.weekLabel, '20s e 3d');
  assert.equal(dia.mood.label, 'Radiante');
  assert.deepEqual(dia.emotions, ['Feliz', 'Grata']);
  assert.deepEqual(dia.symptoms, ['Enjoo']);
  assert.equal(dia.thoughts, 'senti o primeiro chute');
  assert.equal(dia.gratitude, 'pela paciência do meu companheiro');
  assert.equal(dia.notes, 'dia tranquilo');
  assert.equal(dia.symptomNotes, 'enjoo só de manhã');
  assert.deepEqual(dia.measurements.map((m) => m.value), ['110/70 mmHg', '64,5 kg', '88 mg/dL']);
  assert.equal(dia.bumpPhotos.length, 1);
  assert.equal(dia.examPhotos.length, 1);
});

test('observações do pós-parto têm prioridade sobre as da tentante no mesmo dia', () => {
  setGestante(100);
  log(diaDaSemana(12), { observations: 'texto novo', notes: 'texto antigo' });
  assert.equal(pregnancyDiary(getState()).weeks[0].days[0].notes, 'texto novo');
});

test('os dias ficam agrupados por semana e em ordem', () => {
  setGestante(100);
  log(diaDaSemana(14, 2), { thoughts: 'b' });
  log(diaDaSemana(14, 0), { thoughts: 'a' });
  log(diaDaSemana(9), { thoughts: 'antes' });

  const diary = pregnancyDiary(getState());
  assert.deepEqual(diary.weeks.map((w) => w.week), [9, 14]);
  assert.deepEqual(diary.weeks[1].days.map((d) => d.thoughts), ['a', 'b']);
});

/* ---------- resumo ---------- */

test('o resumo conta registros, fotos e variação de peso', () => {
  setGestante(100);
  log(diaDaSemana(10), { weight: 60, bumpPhotos: ['a'], emotions: ['Ansiosa'] });
  log(diaDaSemana(20), { weight: 66, bumpPhotos: ['b', 'c'], emotions: ['Ansiosa', 'Feliz'], examPhotos: ['d'] });

  const s = pregnancyDiary(getState()).summary;
  assert.equal(s.entries, 2);
  assert.equal(s.weeksWithEntries, 2);
  assert.equal(s.photos, 3);
  assert.equal(s.exams, 1);
  assert.equal(s.weightStart, 60);
  assert.equal(s.weightEnd, 66);
  assert.equal(s.weightGain, 6);
  assert.equal(s.topEmotions[0].label, 'Ansiosa');
  assert.equal(s.topEmotions[0].count, 2);
});

test('um peso só não vira ganho de peso inventado', () => {
  setGestante(100);
  log(diaDaSemana(10), { weight: 60 });
  assert.equal(pregnancyDiary(getState()).summary.weightGain, null);
});

/* ---------- compromissos, testes e marcos ---------- */

test('consultas da gestação entram; as de outra fase, não', () => {
  setGestante(100);
  log(diaDaSemana(10), { thoughts: 'oi' });
  update((state) => {
    state.calendarEvents = [
      { id: '1', phase: 'gravida', type: 'ultrasound', title: 'Morfológico', date: diaDaSemana(20), person: 'Dra. Ana' },
      { id: '2', phase: 'posparto', type: 'appointment', title: 'Puericultura', date: diaDaSemana(21) },
      { id: '3', phase: 'gravida', type: 'prenatal', title: '', date: diaDaSemana(12) },
    ];
  });

  const eventos = pregnancyDiary(getState()).events;
  assert.deepEqual(eventos.map((e) => e.title), ['Consulta pré-natal', 'Morfológico']);
  assert.equal(eventos[1].person, 'Dra. Ana');
});

test('o teste positivo da gestação é guardado no diário', () => {
  setGestante(100);
  log(diaDaSemana(10), { thoughts: 'oi' });
  update((state) => {
    state.pregnancyTests = [{ id: 'a', date: diaDaSemana(5), result: 'positivo' }];
  });
  assert.equal(pregnancyDiary(getState()).tests[0].result, 'positivo');
});

/* ---------- capa ---------- */

test('a capa traz nome, bebê e as três datas quando já nasceu', () => {
  setGestante(10);
  log(diaDaSemana(12), { thoughts: 'oi' });
  update((state) => {
    state.profile.birthDate = toKey(addDays(today(), -2));
    state.profile.phase = 'posparto';
  });

  const { cover } = pregnancyDiary(getState());
  assert.equal(cover.name, 'Marcele');
  assert.deepEqual(cover.babyNames, ['Alice']);
  assert.ok(cover.birthLabel, 'a data de nascimento deve aparecer');
  assert.ok(cover.dueLabel && cover.lastPeriodLabel);
});

test('depois do nascimento o recorte para no dia do parto', () => {
  setGestante(10);
  const nascimento = addDays(today(), -5);
  log(toKey(addDays(nascimento, -1)), { thoughts: 'véspera' });
  log(toKey(addDays(nascimento, 3)), { thoughts: 'já no pós-parto' });
  update((state) => {
    state.profile.birthDate = toKey(nascimento);
    state.profile.phase = 'posparto';
  });

  const textos = pregnancyDiary(getState()).weeks.flatMap((w) => w.days.map((d) => d.thoughts));
  assert.deepEqual(textos, ['véspera']);
});

/* ---------- quando o app oferece sozinho ---------- */

test('o convite só aparece na reta final da gestação', () => {
  setGestante(100); // ~semana 25
  log(diaDaSemana(12), { thoughts: 'oi' });
  assert.equal(diaryOffer(getState()), null);

  setGestante(20); // ~semana 37
  log(diaDaSemana(12), { thoughts: 'oi' });
  assert.equal(diaryOffer(getState()).show, true);
});

test('no pós-parto o convite aparece sempre que houver registros', () => {
  setGestante(10);
  log(diaDaSemana(12), { thoughts: 'oi' });
  update((state) => {
    state.profile.phase = 'posparto';
    state.profile.birthDate = toKey(today());
  });
  assert.match(diaryOffer(getState()).title, /está pronto/);
});

test('tentante não recebe convite de diário gestacional', () => {
  setGestante(20);
  log(diaDaSemana(12), { thoughts: 'oi' });
  update((state) => { state.profile.phase = 'tentante'; });
  assert.equal(diaryOffer(getState()), null);
});

test('sem nenhum registro, o app não oferece um diário vazio', () => {
  setGestante(20);
  assert.equal(diaryOffer(getState()), null);
});
