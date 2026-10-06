/**
 * Acolhimento depois de um teste negativo.
 * Além das contas, estes testes guardam as regras de conteúdo: o que a Flor
 * nunca pode dizer nesse momento é tão importante quanto o que ela diz.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.localStorage = { getItem: () => null, setItem: () => {} };

const { getState, update } = await import('../assets/js/store.js');
const { addDays, cycleInfo, diffDays, today, toKey } = await import('../assets/js/cycle.js');
const {
  appendToNotes,
  comfortGreeting,
  comfortMessage,
  COMFORT_MESSAGES,
  COMFORT_PATH_IDS,
  COMFORT_OPENING,
  COMFORT_SILENCE,
  nextCycleBriefing,
  nextFertileWindow,
} = await import('../assets/js/comfort.js');

const setTentante = (diasDesdeAMenstruacao, extra = {}) => update((state) => {
  state.onboarded = true;
  state.profile.phase = 'tentante';
  state.profile.name = '';
  state.profile.tryingFor = null;
  state.profile.cycleLength = 28;
  state.profile.periodLength = 5;
  state.profile.lastPeriodStart = toKey(addDays(today(), -diasDesdeAMenstruacao));
  state.logs = {};
  Object.assign(state.profile, extra);
});

/* ---------- abertura e caminhos ---------- */

test('a abertura usa o primeiro nome quando ele existe', () => {
  assert.equal(comfortGreeting({ name: 'Marcele Souza Lima' }), 'Oi, Marcele. Eu sou a Flor.');
  assert.equal(comfortGreeting({ name: '   ' }), 'Oi. Eu sou a Flor.');
  assert.equal(comfortGreeting(null), 'Oi. Eu sou a Flor.');
});

test('a abertura não pede reação nem promete resultado', () => {
  const texto = `${COMFORT_OPENING.text} ${COMFORT_OPENING.lead} ${COMFORT_OPENING.emphasis}`;
  assert.match(texto, /não está sozinha/i);
  assert.doesNotMatch(texto, /vai dar certo|próxima vez|tente de novo/i);
});

test('são oferecidos os quatro caminhos, sem repetição', () => {
  assert.deepEqual(COMFORT_PATH_IDS, ['acolhida', 'desabafo', 'proximo', 'silencio']);
  assert.equal(new Set(COMFORT_PATH_IDS).size, 4);
});

/* ---------- acolhimento ---------- */

test('as mensagens de acolhimento giram em ciclo e aceitam índice fora da faixa', () => {
  const total = COMFORT_MESSAGES.length;
  assert.equal(comfortMessage(0).id, COMFORT_MESSAGES[0].id);
  assert.equal(comfortMessage(total).id, COMFORT_MESSAGES[0].id);
  assert.equal(comfortMessage(-1).id, COMFORT_MESSAGES[total - 1].id);
  assert.equal(comfortMessage('texto').id, COMFORT_MESSAGES[0].id);
});

test('nenhuma mensagem promete resultado, culpa a usuária ou manda relaxar', () => {
  const tudo = [...COMFORT_MESSAGES, COMFORT_SILENCE]
    .map((m) => [m.title, m.text, ...(m.bullets || [])].join(' '))
    .join(' ')
    .toLowerCase();

  // "relaxa que acontece" aparece de propósito numa mensagem — para ser negado
  assert.doesNotMatch(tudo, /vai dar certo|no próximo ciclo você|com certeza vai|se você relaxar/);
  assert.doesNotMatch(tudo, /você deveria ter|culpa sua|a culpa é/);
  assert.doesNotMatch(tudo, /tome |comprimido|miligrama|dose de/);
});

/* ---------- desabafo ---------- */

test('o desabafo se soma às observações do dia em vez de substituí-las', () => {
  assert.equal(appendToNotes('já tinha escrito', 'hoje doeu'), 'já tinha escrito\n\nhoje doeu');
  assert.equal(appendToNotes('', 'hoje doeu'), 'hoje doeu');
  assert.equal(appendToNotes(null, '  hoje doeu  '), 'hoje doeu');
});

test('texto vazio não vira registro', () => {
  assert.equal(appendToNotes('algo', '   '), null);
  assert.equal(appendToNotes('algo', null), null);
});

/* ---------- próximo ciclo ---------- */

test('sem data de menstruação, diz que não sabe em vez de chutar', () => {
  update((state) => {
    state.profile.phase = 'tentante';
    state.profile.lastPeriodStart = null;
    state.logs = {};
  });

  const brief = nextCycleBriefing(getState());
  assert.equal(brief.known, false);
  assert.deepEqual(brief.facts, []);
  assert.equal(brief.link.to, 'perfil');
  assert.match(brief.warning, /prefiro não chutar/i);
});

test('com ciclo conhecido, traz menstruação, janela fértil e média', () => {
  setTentante(10);
  const brief = nextCycleBriefing(getState());

  assert.equal(brief.known, true);
  const rotulos = brief.facts.map((f) => f.label);
  assert.equal(rotulos[0], 'Próxima menstruação');
  assert.match(rotulos[1], /janela fértil/i);
  assert.equal(rotulos[2], 'Ciclo médio');
  assert.match(brief.facts[0].hint, /daqui a 18 dias/);
  assert.match(brief.warning, /estimativas/i);
  assert.equal(brief.link.to, 'ciclo');
});

test('a janela fértil oferecida é sempre a que ainda não terminou', () => {
  // dia 25 de um ciclo de 28: a ovulação do dia 15 já passou
  setTentante(24);
  const cycle = cycleInfo(getState());
  const janela = nextFertileWindow(cycle, today());

  assert.ok(diffDays(janela.end, today()) >= 0, 'a janela não pode estar no passado');
  assert.ok(diffDays(janela.ovulation, cycle.ovulation) > 0, 'deve projetar o ciclo seguinte');
  assert.equal(diffDays(janela.ovulation, janela.start), 5);
  assert.equal(diffDays(janela.end, janela.ovulation), 1);
  assert.equal(janela.current, false, 'uma janela projetada ainda não começou');
});

test('a janela que já começou é anunciada como em curso', () => {
  setTentante(10); // dia 11 de 28: a janela de 5 dias antes da ovulação já abriu
  const janela = nextFertileWindow(cycleInfo(getState()), today());
  assert.equal(janela.current, true);
  assert.equal(nextCycleBriefing(getState()).facts[1].label, 'Janela fértil em curso');
});

test('menstruação atrasada orienta repetir o teste em vez de concluir algo', () => {
  setTentante(35); // ciclo de 28 dias, 7 dias de atraso
  const brief = nextCycleBriefing(getState());

  assert.match(brief.facts[0].hint, /7 dias além da estimativa/);
  const texto = brief.bullets.join(' ');
  assert.match(texto, /repita o teste em 3 a 5 dias/i);
  assert.doesNotMatch(texto, /você está grávida|significa que/i);
});

test('quem tenta há mais de um ano recebe o encaminhamento para avaliação', () => {
  setTentante(10, { tryingFor: 'mais_1a' });
  const comAviso = nextCycleBriefing(getState()).bullets.join(' ');
  assert.match(comAviso, /avaliação de fertilidade/i);
  assert.match(comAviso, /não é desistir/i);

  setTentante(10, { tryingFor: 'ate_6m' });
  assert.doesNotMatch(nextCycleBriefing(getState()).bullets.join(' '), /avaliação de fertilidade/i);
});

test('o preparo encaminha ao médico em vez de indicar suplemento', () => {
  setTentante(10);
  const texto = nextCycleBriefing(getState()).bullets.join(' ');
  assert.match(texto, /conversados com o seu médico/i);
  assert.doesNotMatch(texto, /tome |comece a tomar|\d+\s?mcg|\d+\s?mg/i);
});

test('poucos ciclos registrados são admitidos como estimativa fraca', () => {
  setTentante(10);
  assert.match(nextCycleBriefing(getState()).bullets.join(' '), /ainda são um esboço/i);
});
