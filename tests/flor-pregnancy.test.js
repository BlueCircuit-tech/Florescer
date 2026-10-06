/**
 * A Flor na gestação, e a personalização que ela faz a partir dos dados dela.
 *
 * Boa parte destes testes guarda o que a Flor NÃO pode dizer. Numa assistente
 * de saúde, essa é a parte que precisa quebrar quando alguém reescrever o
 * conteúdo sem perceber o limite.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.localStorage = { getItem: () => null, setItem: () => {} };

const { getState, update } = await import('../assets/js/store.js');
const { addDays, today, toKey } = await import('../assets/js/cycle.js');
const { askFlor, florSuggestions } = await import('../assets/js/florAssistant.js');
const { florNudge, florProfile } = await import('../assets/js/florProfile.js');
const { PREGNANCY_INTENTS, PREGNANCY_SUGGESTIONS, PREGNANCY_URGENT } = await import('../assets/js/florPregnancy.js');
const { cycleContext } = await import('../assets/js/florClient.js');

/** Gestante na semana pedida: a DPP fica a (280 − semana×7) dias daqui. */
function setGestante(semana, extra = {}) {
  update((state) => {
    state.onboarded = true;
    state.profile.phase = 'gravida';
    state.profile.name = 'Marcele Souza';
    state.profile.pregnancyType = 'unica';
    state.profile.babyName = '';
    state.profile.dueDate = toKey(addDays(today(), 280 - semana * 7));
    state.profile.birthDate = null;
    state.logs = {};
    state.calendarEvents = [];
    state.florChat = [];
    state.readArticles = [];
    Object.assign(state.profile, extra);
  });
}

function setTentante(dia) {
  update((state) => {
    state.onboarded = true;
    state.profile.phase = 'tentante';
    state.profile.cycleLength = 28;
    state.profile.periodLength = 5;
    state.profile.lastPeriodStart = toKey(addDays(today(), -(dia - 1)));
    state.profile.dueDate = null;
    state.logs = {};
    state.florChat = [];
  });
}

const ask = (q) => askFlor(q, getState());
const texto = (r) => [r.title, r.answer, ...(r.bullets || []), r.warning || ''].join(' ');

/* ---------- segurança ---------- */

test('os sinais de alerta da gestação vêm antes de qualquer tema educativo', () => {
  setGestante(30);

  const movimentos = ask('o bebe nao mexe desde ontem, estou com medo');
  assert.equal(movimentos.kind, 'alert');
  assert.match(texto(movimentos), /maternidade/i);

  const pressao = ask('estou com dor de cabeca forte e a vista embacada');
  assert.equal(pressao.kind, 'alert');

  const parto = ask('acho que a bolsa estourou');
  assert.equal(parto.kind, 'alert');
});

test('o alerta vale mesmo quando a pergunta parece educativa', () => {
  setGestante(24);
  // "movimentos do bebê" é um tema normal; "diminuiu os movimentos" não é
  assert.equal(ask('quando vou sentir os movimentos do bebe').kind, 'answer');
  assert.equal(ask('diminuiu os movimentos do bebe hoje').kind, 'alert');
});

test('cada alerta da gestação encaminha para atendimento no mesmo dia', () => {
  for (const alerta of PREGNANCY_URGENT) {
    const corpo = [alerta.answer, ...alerta.bullets].join(' ').toLowerCase();
    assert.match(corpo, /maternidade|avalia[çc]/, `${alerta.id} precisa encaminhar`);
  }
});

/* ---------- desempate por fase ---------- */

test('a mesma palavra responde diferente conforme a fase', () => {
  setTentante(24);
  const tentante = ask('estou com muita colica');
  assert.equal(tentante.id, 'colica');
  assert.match(texto(tentante), /endométrio|menstrua/i);

  setGestante(24);
  const gravida = ask('estou com muita colica');
  assert.equal(gravida.id, 'desconfortos-gestacao');
  assert.match(texto(gravida), /útero cresce/i);
});

test('temas de gestação não são oferecidos a quem está tentando', () => {
  setTentante(10);
  const r = ask('quais sao os sinais de trabalho de parto');
  assert.notEqual(r.id, 'parto-sinais');
});

/* ---------- respostas com os dados dela ---------- */

test('a Flor responde com a semana real da gestante', () => {
  setGestante(22);
  const r = ask('em que semana eu estou');
  assert.equal(r.id, 'gestacao-semana');
  assert.match(r.answer, /22 semanas/);
  assert.match(r.answer, /2º trimestre/);
  assert.equal(r.link.to, 'semana/22');
});

test('a resposta sobre consultas aponta a etapa atrasada dela', () => {
  setGestante(26); // a 1ª consulta (semana 8) já passou da janela
  const r = ask('como funcionam as consultas de pre natal');
  assert.equal(r.id, 'pre-natal-consultas');
  assert.match(r.answer, /já passou da janela recomendada/i);
});

test('a resposta sobre consultas reconhece o que ela já agendou', () => {
  setGestante(9);
  update((state) => {
    state.calendarEvents = [{
      id: 'ev', planId: 'consulta-8', phase: 'gravida', type: 'prenatal',
      title: '1ª consulta de pré-natal', date: toKey(addDays(today(), 3)), recurrence: 'none',
    }];
  });
  assert.match(ask('quando e minha proxima consulta').answer, /já marcada para/);
});

test('o aviso de trabalho de parto muda antes das 37 semanas', () => {
  setGestante(30);
  assert.match(ask('quais sao os sinais de trabalho de parto').answer, /Antes de 37 semanas/);

  setGestante(39);
  assert.doesNotMatch(ask('quais sao os sinais de trabalho de parto').answer, /Antes de 37 semanas/);
});

/* ---------- os limites do conteúdo ---------- */

test('nenhuma resposta da gestação indica dose, marca ou posologia', () => {
  setGestante(20);
  for (const intent of PREGNANCY_INTENTS) {
    const r = ask(intent.terms[0]);
    const corpo = texto(r).toLowerCase();
    assert.doesNotMatch(corpo, /\d+\s?(mg|mcg|ml|ui)\b/, `${intent.id} não pode trazer dose`);
    assert.doesNotMatch(corpo, /tome \d|comprimidos? por dia|duas vezes ao dia/, `${intent.id} não pode prescrever`);
  }
});

test('a Flor explica para que o exame serve e se recusa a ler o resultado', () => {
  setGestante(10);
  const beta = ask('o que significa o meu beta hcg');
  assert.equal(beta.id, 'beta-hcg');
  assert.match(texto(beta), /não interpreto|não digo se está/i);

  const exames = ask('quais exames do pre natal');
  assert.match(texto(exames), /não leio resultado|quem interpreta/i);
});

test('remédio na gestação é sempre devolvido para a equipe', () => {
  setGestante(18);
  const r = ask('posso tomar dipirona');
  assert.equal(r.id, 'remedios-gestacao');
  assert.match(texto(r), /equipe de pré-natal|plantão/i);
  assert.doesNotMatch(texto(r), /pode tomar sim|é seguro tomar/i);
});

test('ganho de peso não vira número sem o IMC dela', () => {
  setGestante(26);
  const r = ask('quantos quilos eu devo engordar');
  assert.match(texto(r), /depende do seu IMC/i);
  assert.doesNotMatch(r.answer, /\d+\s?(kg|quilos)/);
});

test('toda resposta da gestação mantém a Flor fora do lugar do médico', () => {
  setGestante(24);
  // 'gestacao-semana' só conta as semanas: mandar para a consulta ali seria ruído
  const clinicos = PREGNANCY_INTENTS.filter((intent) => intent.id !== 'gestacao-semana');
  const semEncaminhar = clinicos.filter((intent) => {
    const corpo = texto(ask(intent.terms[0])).toLowerCase();
    return !/consulta|equipe|m[eé]dic|maternidade|profissional|laborat[óo]rio/.test(corpo);
  });
  assert.deepEqual(semEncaminhar.map((i) => i.id), [], 'cada tema precisa apontar para a equipe');
});

/* ---------- personalização ---------- */

test('as sugestões mudam com o trimestre', () => {
  // o bloco do trimestre pode perder um item para uma etapa atrasada,
  // que entra na frente; o que importa é que o bloco certo foi escolhido
  const marcadores = {
    8: [PREGNANCY_SUGGESTIONS.primeiro, /ácido fólico/i],
    22: [PREGNANCY_SUGGESTIONS.segundo, /morfológico/i],
    38: [PREGNANCY_SUGGESTIONS.terceiro, /mala da maternidade/i],
  };

  for (const [semana, [bloco, marcador]] of Object.entries(marcadores)) {
    setGestante(Number(semana));
    const sugestoes = florSuggestions(getState());
    assert.ok(sugestoes.some((s) => marcador.test(s)), `semana ${semana}: bloco do trimestre`);
    assert.ok(sugestoes.filter((s) => bloco.includes(s)).length >= 5, `semana ${semana}: quase todo o bloco`);
    assert.equal(sugestoes.length, 6);
  }
});

test('uma etapa atrasada entra na frente das sugestões', () => {
  setGestante(26);
  const sugestoes = florSuggestions(getState());
  assert.match(sugestoes[0], /me fala sobre/i);
  assert.equal(sugestoes.length, 6);
});

test('a Flor não sugere de volta o assunto que acabou de responder', () => {
  setGestante(38);
  assert.ok(florSuggestions(getState()).some((s) => /trabalho de parto/i.test(s)));

  update((state) => {
    state.florChat = [{ role: 'flor', id: 'parto-sinais', kind: 'answer', text: 'ok', at: Date.now() }];
  });
  assert.ok(!florSuggestions(getState()).some((s) => /trabalho de parto/i.test(s)));
});

test('quem tenta há mais de um ano recebe o tema na frente', () => {
  setTentante(12);
  update((state) => { state.profile.tryingFor = 'mais_1a'; });
  assert.match(florSuggestions(getState())[0], /quanto tempo é esperado demorar/i);
});

test('o retrato dela reúne fase, semana, pré-natal, histórico e objetivos', () => {
  setGestante(20, { challenge: 'ansiedade' });
  update((state) => {
    state.logs[toKey(addDays(today(), -1))] = { symptoms: ['Azia'], emotions: ['Ansiosa'], thoughts: 'hoje foi difícil' };
    state.logs[toKey(addDays(today(), -2))] = { symptoms: ['Azia'], emotions: ['Grata'] };
  });

  const me = florProfile(getState());
  assert.equal(me.phase, 'gravida');
  assert.equal(me.firstName, 'Marcele');
  assert.equal(me.preg.weeks, 20);
  assert.equal(me.prenatal.known, true);
  assert.equal(me.history.entries, 2);
  assert.equal(me.history.symptoms[0].label, 'Azia');
  assert.equal(me.history.writes, true);
  assert.equal(me.goals.challengeLabel, 'lidar com a ansiedade da espera');
});

test('o convite da abertura muda conforme a semana e o pré-natal', () => {
  setGestante(26);
  assert.match(florNudge(getState()).text, /janela recomendada.*já passou/i);

  setGestante(38);
  update((state) => {
    // tudo em dia: nenhuma etapa atrasada
    state.calendarEvents = [];
    state.profile.dueDate = toKey(addDays(today(), 14));
  });
  const reta = florNudge(getState());
  assert.ok(reta.text && reta.ask, 'na reta final sempre há algo a oferecer');

  setTentante(12);
  assert.match(florNudge(getState()).text, /janela fértil/i);
});

/* ---------- o que viaja para a IA ---------- */

test('a gestante envia semana e trimestre, e nada pessoal', () => {
  setGestante(31, { babyName: 'Alice' });
  update((state) => {
    state.logs[toKey(today())] = { symptoms: ['Azia'], thoughts: 'segredo meu' };
    state.readArticles = ['a1'];
  });

  const ctx = cycleContext(getState());
  const enviado = JSON.stringify(ctx);

  assert.equal(ctx.phase, 'gravida');
  assert.equal(ctx.weeks, 31);
  assert.equal(ctx.trimester, 3);
  assert.match(ctx.due, /^\d{4}-\d{2}-\d{2}$/);

  assert.doesNotMatch(enviado, /Marcele|Alice/, 'nomes não podem ser enviados');
  assert.doesNotMatch(enviado, /segredo meu|Azia/, 'diário e sintomas não podem ser enviados');
  assert.ok(!('readArticles' in ctx) && !('history' in ctx), 'leituras e histórico ficam no aparelho');
});
