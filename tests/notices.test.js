/**
 * Central de avisos.
 * O app não usa push: estes testes garantem que o aviso certo aparece,
 * que ele não se repete a cada abertura e que nada do sistema é chamado.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

globalThis.localStorage = { getItem: () => null, setItem: () => {} };

const { getState, update } = await import('../assets/js/store.js');
const { addDays, toKey, today } = await import('../assets/js/cycle.js');
const {
  allNotices,
  clearNotices,
  collectNotices,
  markNoticesRead,
  noticeAchievements,
  removeNotice,
  syncNotices,
  unreadCount,
} = await import('../assets/js/notify.js');

const ligarTudo = (patch = {}) => update((state) => {
  Object.assign(state.settings.notifications, {
    fertile: true, period: true, dailyLog: true, tip: true,
    achievements: true, babyVaccines: true, babyAppointments: true,
    calendarEvents: true, community: false, ...patch,
  });
});

/** Tentante no dia `dia` do ciclo, com tudo limpo. */
function setTentante(dia) {
  update((state) => {
    state.onboarded = true;
    state.profile.phase = 'tentante';
    state.profile.name = 'Marcele';
    state.profile.cycleLength = 28;
    state.profile.periodLength = 5;
    state.profile.lastPeriodStart = toKey(addDays(today(), -(dia - 1)));
    state.logs = {};
    state.notices = [];
    state.calendarEvents = [];
  });
  ligarTudo();
}

const kinds = (state) => allNotices(state).map((item) => item.kind).sort();

/* ---------- o que entra ---------- */

test('na janela fértil o aviso de fertilidade aparece', () => {
  setTentante(12); // ciclo de 28: janela de 10 a 16
  assert.ok(collectNotices(getState()).some((item) => item.kind === 'fertile'));
});

test('fora da janela fértil ele não aparece', () => {
  setTentante(3);
  assert.ok(!collectNotices(getState()).some((item) => item.kind === 'fertile'));
});

test('a véspera da menstruação gera aviso, os outros dias não', () => {
  setTentante(28); // dia 28 de 28: a próxima menstruação é amanhã
  assert.ok(collectNotices(getState()).some((item) => item.kind === 'period'));

  setTentante(20);
  assert.ok(!collectNotices(getState()).some((item) => item.kind === 'period'));
});

test('o lembrete de registro some depois de ela registrar o dia', () => {
  setTentante(8);
  assert.ok(collectNotices(getState()).some((item) => item.kind === 'dailyLog'));

  update((state) => { state.logs[toKey(today())] = { mood: 3 }; });
  assert.ok(!collectNotices(getState()).some((item) => item.kind === 'dailyLog'));
});

test('cada preferência desligada tira o aviso correspondente', () => {
  setTentante(12);
  const comTudo = new Set(collectNotices(getState()).map((item) => item.kind));
  assert.ok(comTudo.has('fertile') && comTudo.has('tip') && comTudo.has('dailyLog'));

  ligarTudo({ fertile: false, tip: false, dailyLog: false });
  const semNada = new Set(collectNotices(getState()).map((item) => item.kind));
  assert.ok(!semNada.has('fertile') && !semNada.has('tip') && !semNada.has('dailyLog'));
});

test('compromissos da agenda viram aviso com a data por extenso', () => {
  setTentante(8);
  update((state) => {
    state.calendarEvents = [{
      id: 'e1', phase: 'tentante', type: 'lab', title: 'Hemograma',
      date: toKey(addDays(today(), 1)), reminderDays: 1, person: 'Dra. Ana', recurrence: 'none',
    }];
  });

  const aviso = collectNotices(getState()).find((item) => item.kind === 'calendarEvents');
  assert.ok(aviso, 'o compromisso de amanhã deveria gerar aviso');
  assert.match(aviso.title, /Hemograma para Dra\. Ana é amanhã/);
  assert.equal(aviso.to, 'ciclo');
});

/* ---------- não repetir ---------- */

test('abrir o app duas vezes no mesmo dia não duplica avisos', () => {
  setTentante(12);
  const primeira = syncNotices();
  assert.ok(primeira > 0);

  const segunda = syncNotices();
  assert.equal(segunda, 0, 'nada novo na segunda abertura');
  assert.equal(new Set(allNotices(getState()).map((item) => item.id)).size, allNotices(getState()).length);
});

test('no dia seguinte os avisos do dia entram de novo', () => {
  setTentante(12);
  syncNotices();
  const antes = allNotices(getState()).length;

  const amanha = addDays(today(), 1);
  assert.ok(syncNotices(amanha) > 0);
  assert.ok(allNotices(getState()).length > antes);
});

test('avisos com mais de 30 dias saem sozinhos', () => {
  setTentante(12);
  update((state) => {
    state.notices = [{ id: 'velho', kind: 'tip', title: 'antigo', body: '', to: 'home', at: addDays(today(), -40).getTime(), read: true }];
  });
  syncNotices();
  assert.ok(!allNotices(getState()).some((item) => item.id === 'velho'));
});

/* ---------- lidos, dispensar, limpar ---------- */

test('a contagem de novos zera ao abrir a central', () => {
  setTentante(12);
  syncNotices();
  assert.ok(unreadCount(getState()) > 0);

  markNoticesRead();
  assert.equal(unreadCount(getState()), 0);
  assert.ok(allNotices(getState()).length > 0, 'ler não apaga');
});

test('dispensar tira um aviso e limpar tira todos', () => {
  setTentante(12);
  syncNotices();
  const alvo = allNotices(getState())[0].id;

  removeNotice(alvo);
  assert.ok(!allNotices(getState()).some((item) => item.id === alvo));

  clearNotices();
  assert.deepEqual(allNotices(getState()), []);
});

test('uma conquista entra na central uma vez só', () => {
  setTentante(12);
  update((state) => { state.notices = []; });
  const conquista = [{ id: 'c1', title: 'Primeiro registro', note: 'bem-vinda' }];

  assert.equal(noticeAchievements(conquista), 1);
  assert.equal(noticeAchievements(conquista), 0);
  assert.equal(allNotices(getState()).filter((item) => item.kind === 'achievements').length, 1);

  ligarTudo({ achievements: false });
  assert.equal(noticeAchievements([{ id: 'c2', title: 'Outra', note: '' }]), 0);
});

/* ---------- nada de push ---------- */

test('o módulo de avisos não toca na API de notificação do sistema', async () => {
  const fonte = await readFile(new URL('../assets/js/notify.js', import.meta.url), 'utf8');
  assert.doesNotMatch(fonte, /new Notification|requestPermission|showNotification|pushManager/);
});

test('o service worker não registra handler de push nem de notificação', async () => {
  const sw = await readFile(new URL('../sw.js', import.meta.url), 'utf8');
  assert.doesNotMatch(sw, /addEventListener\('(push|notificationclick)'/);
});

test('todo aviso tem destino, título e ícone para a tela conseguir desenhar', () => {
  setTentante(12);
  for (const aviso of collectNotices(getState())) {
    assert.ok(aviso.id && aviso.kind, 'id e tipo');
    assert.ok(aviso.title && aviso.body, `texto de ${aviso.kind}`);
    assert.ok(aviso.icon && aviso.to, `ícone e destino de ${aviso.kind}`);
  }
  assert.ok(kinds(getState()).length >= 0);
});
