/**
 * A personalidade da Flor e a mensagem diária.
 *
 * O teste mais importante deste arquivo é a varredura: ele passa as regras
 * de voz por TODO o conteúdo escrito do app. Se alguém escrever "vai dar
 * certo" ou "relaxa que" em qualquer texto novo, a suíte quebra antes de a
 * frase chegar numa mulher que está esperando há dois anos.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

globalThis.localStorage = { getItem: () => null, setItem: () => {} };

const { getState, update } = await import('../assets/js/store.js');
const { addDays, today, toKey } = await import('../assets/js/cycle.js');
const { FLOR_FORBIDDEN, FLOR_PERSONA_PROMPT, FLOR_VOICE } = await import('../assets/js/florVoice.js');
const {
  DAILY_MESSAGES,
  dailyAnswer,
  dailyHandled,
  dailyMessage,
  dailyReply,
} = await import('../assets/js/florDaily.js');
const { collectNotices } = await import('../assets/js/notify.js');

const setFase = (phase, extra = {}) => update((state) => {
  state.onboarded = true;
  state.profile.phase = phase;
  state.profile.name = 'Marcele Souza';
  state.profile.dueDate = phase === 'gravida' ? toKey(addDays(today(), 100)) : null;
  state.profile.birthDate = phase === 'posparto' ? toKey(addDays(today(), -40)) : null;
  state.profile.lastPeriodStart = toKey(addDays(today(), -10));
  state.logs = {};
  state.florDaily = { answers: {}, dismissed: [] };
  Object.assign(state.profile, extra);
});

/* ---------- a voz, aplicada a todo o conteúdo ---------- */

/** Os arquivos que falam com a usuária. */
const CONTEUDO = [
  'assets/js/florAssistant.js',
  'assets/js/florPregnancy.js',
  'assets/js/florDaily.js',
  'assets/js/florMoments.js',
  'assets/js/comfort.js',
  'assets/js/content.js',
  'assets/js/pregnancy.js',
  'assets/js/pregnancyNutrition.js',
  'assets/js/prenatal.js',
  'assets/js/postpartum.js',
];

for (const arquivo of CONTEUDO) {
  test(`${arquivo} respeita a voz da Flor`, async () => {
    const fonte = await readFile(new URL(`../${arquivo}`, import.meta.url), 'utf8');
    // a própria definição das regras contém os exemplos proibidos, de propósito
    const texto = arquivo.endsWith('florVoice.js') ? '' : fonte;

    for (const [regra, padrao] of Object.entries(FLOR_FORBIDDEN)) {
      const achou = texto.match(padrao);
      // "relaxa que acontece" aparece uma vez no acolhimento — para ser negado
      const permitido = achou && /não precisa aceitar isso como verdade/.test(texto);
      assert.ok(!achou || permitido, `${arquivo}: ${regra} → "${achou?.[0]}"`);
    }
  });
}

/**
 * A trava só vale se ela realmente pegar o que deveria. Em JavaScript,
 * `` ao lado de letra acentuada nunca casa — foi assim que "tenho certeza
 * que você" e "é só ansiedade" passavam batido por meses de varredura.
 */
test('cada regra de voz pega as frases que ela existe para barrar', () => {
  const deveBarrar = {
    promessa: [
      'vai dar certo',
      'logo você engravida',
      'tenho certeza que você vai conseguir',
      'pode ficar tranquila',
      'é só uma questão de tempo',
    ],
    julgamento: [
      'você deveria ter procurado antes',
      'a culpa é sua',
      'isso é errado',
    ],
    minimizar: [
      'relaxa que acontece',
      'isso é só ansiedade',
      'é só impressão sua',
      'deixa de drama',
    ],
    prescricao: [
      'tome 2 comprimidos',
      'ácido fólico 400 mcg por dia',
      '5 mg de ferro',
    ],
  };

  for (const [regra, frases] of Object.entries(deveBarrar)) {
    for (const frase of frases) {
      assert.match(frase, FLOR_FORBIDDEN[regra], `${regra} precisa barrar "${frase}"`);
    }
  }
});

test('as regras deixam passar o que a Flor precisa poder dizer', () => {
  const devePassar = [
    'isso não é culpa sua',
    'a culpa não é sua',
    'cafeína abaixo de 200 mg por dia',
    '200 ml de leite ou bebida vegetal',
    'se você ainda não se sente a mesma',
    'procurar apoio psicológico é cuidado, não fraqueza',
  ];

  for (const frase of devePassar) {
    for (const [regra, padrao] of Object.entries(FLOR_FORBIDDEN)) {
      assert.doesNotMatch(frase, padrao, `${regra} não pode barrar "${frase}"`);
    }
  }
});

test('a definição da voz cobre quem ela é, como fala e o que nunca faz', () => {
  assert.match(FLOR_VOICE.quem, /amiga mais experiente/);
  assert.match(FLOR_VOICE.missao, /informar com responsabilidade e acolher com carinho/);
  assert.ok(FLOR_VOICE.como.length >= 3 && FLOR_VOICE.nunca.length >= 3);

  const nunca = FLOR_VOICE.nunca.join(' ').toLowerCase();
  assert.match(nunca, /nunca julga/);
  assert.match(nunca, /nunca promete/);
});

test('o prompt do modelo carrega a mesma personalidade do app', async () => {
  const api = await readFile(new URL('../api/flor.js', import.meta.url), 'utf8');
  assert.match(api, /FLOR_PERSONA_PROMPT/, 'o prompt precisa vir do arquivo de voz');
  assert.doesNotMatch(api, /Você é a Flor, assistente do aplicativo/, 'não pode haver uma segunda definição solta');

  assert.match(FLOR_PERSONA_PROMPT, /QUEM VOCÊ É/);
  assert.match(FLOR_PERSONA_PROMPT, /O QUE VOCÊ NUNCA FAZ/);
  assert.match(FLOR_PERSONA_PROMPT, /Nunca promete/);
});

/* ---------- a mensagem diária ---------- */

test('a pergunta âncora é a primeira que ela vê, em cada fase', () => {
  for (const fase of ['gravida', 'posparto', 'tentante']) {
    setFase(fase);
    const message = dailyMessage(getState());
    assert.equal(message.id, 'como-voce-esta', `${fase}: a estreia é a pergunta âncora`);
    assert.match(message.text, /quase ningu[ée]m pergunta|a pergunta [ée] outra/i);
  }
});

test('a pergunta é sobre a mãe, não sobre o bebê', () => {
  setFase('gravida');
  const message = dailyMessage(getState());
  assert.match(message.title, /como você está/i);
  assert.match(message.text, /perguntando do bebê, e quase ninguém pergunta por elas/i);
});

test('o nome entra no lugar de "Mamãe", em vez de somar com ele', () => {
  setFase('gravida');
  const comNome = dailyMessage(getState());
  assert.equal(comNome.greeting, 'Marcele');
  assert.equal(comNome.heading, 'Marcele, como você está hoje?');
  assert.doesNotMatch(comNome.heading, /mam[ãa]e/i, 'não pode virar "Marcele, mamãe, …"');

  update((state) => { state.profile.name = ''; });
  const semNome = dailyMessage(getState());
  assert.equal(semNome.greeting, null);
  assert.equal(semNome.heading, 'Mamãe, como você está hoje?');
});

test('o cabeçalho usado na Home, no sininho e na tela é o mesmo', async () => {
  setFase('gravida');
  const esperado = dailyMessage(getState()).heading;
  const aviso = collectNotices(getState()).find((item) => item.kind === 'florDaily');
  assert.equal(aviso.title, esperado);

  for (const arquivo of ['assets/js/screens/home.js', 'assets/js/notify.js', 'assets/js/screens/florDaily.js']) {
    const fonte = await readFile(new URL(`../${arquivo}`, import.meta.url), 'utf8');
    assert.doesNotMatch(fonte, /message\.title\.toLowerCase\(\)/, `${arquivo} deve usar message.heading`);
  }
});

test('responder de manhã não troca a pergunta que ela vê de tarde', () => {
  setFase('gravida');
  const manha = dailyMessage(getState());
  update((state) => { state.florDaily.answers[toKey(today())] = { mood: 2, at: Date.now() }; });
  assert.equal(dailyMessage(getState()).id, manha.id, 'a pergunta do dia é estável');
  assert.equal(dailyMessage(getState()).heading, manha.heading);
});

test('a mensagem é a mesma o dia inteiro e muda de um dia para o outro', () => {
  setFase('gravida');
  update((state) => { state.florDaily.dismissed = [toKey(addDays(today(), -1))]; });

  const hoje = dailyMessage(getState()).id;
  assert.equal(dailyMessage(getState()).id, hoje, 'estável dentro do mesmo dia');

  const ids = new Set();
  for (let i = 0; i < 20; i += 1) ids.add(dailyMessage(getState(), addDays(today(), i)).id);
  assert.ok(ids.size > 1, 'ao longo dos dias ela varia');
});

test('responder ou dispensar tira a pergunta do dia', () => {
  setFase('tentante');
  assert.equal(dailyHandled(getState()), false);

  update((state) => { state.florDaily.dismissed.push(toKey(today())); });
  assert.equal(dailyHandled(getState()), true);

  setFase('tentante');
  update((state) => { state.florDaily.answers[toKey(today())] = { mood: 3, at: Date.now() }; });
  assert.equal(dailyHandled(getState()), true);
  assert.equal(dailyAnswer(getState()).mood, 3);
});

test('o aviso diário entra no sininho e some depois de respondido', () => {
  setFase('gravida');
  const comPergunta = collectNotices(getState());
  const aviso = comPergunta.find((item) => item.kind === 'florDaily');
  assert.ok(aviso, 'a pergunta do dia precisa aparecer no sininho');
  assert.equal(aviso.to, 'como-voce-esta');
  assert.match(aviso.title, /como você está/i);

  update((state) => { state.florDaily.answers[toKey(today())] = { mood: 2, at: Date.now() }; });
  assert.ok(!collectNotices(getState()).some((item) => item.kind === 'florDaily'));
});

test('desligar a preferência silencia a pergunta diária', () => {
  setFase('gravida');
  update((state) => { state.settings.notifications.florDaily = false; });
  assert.ok(!collectNotices(getState()).some((item) => item.kind === 'florDaily'));
  update((state) => { state.settings.notifications.florDaily = true; });
});

/* ---------- a devolutiva ---------- */

test('cada humor recebe uma resposta, e nenhuma delas cobra ou promete', () => {
  for (let mood = 0; mood < 5; mood += 1) {
    const reply = dailyReply(mood);
    assert.ok(reply.title && reply.text, `humor ${mood} precisa de resposta`);
    const corpo = [reply.title, reply.text, ...(reply.bullets || [])].join(' ');
    for (const [regra, padrao] of Object.entries(FLOR_FORBIDDEN)) {
      assert.doesNotMatch(corpo, padrao, `humor ${mood}: ${regra}`);
    }
  }
});

test('humor baixo oferece um caminho em vez de um conselho', () => {
  const triste = dailyReply(0);
  assert.match(triste.text, /não precisa transformar isso em aprendizado/i);
  assert.equal(triste.link.to, 'acolhimento');

  const ansiosa = dailyReply(1);
  assert.match([ansiosa.text, ...ansiosa.bullets].join(' '), /apoio psicológico é cuidado/i);
});

test('humor alto é guardado sem virar cobrança para o próximo dia', () => {
  const bem = dailyReply(4);
  assert.doesNotMatch(bem.text, /continue assim|mantenha|todo dia/i);
});

test('humor inválido não quebra a tela', () => {
  assert.ok(dailyReply(null).title);
  assert.ok(dailyReply(99).title);
  assert.ok(dailyReply('x').title);
});

/* ---------- as mensagens em si ---------- */

test('nenhuma mensagem diária pede dado, cobra registro ou fala do bebê no lugar dela', () => {
  for (const [fase, lista] of Object.entries(DAILY_MESSAGES)) {
    for (const message of lista) {
      const corpo = `${message.title} ${message.text}`;
      assert.doesNotMatch(corpo, /registre|preencha|não esqueça de|você precisa/i, `${fase}/${message.id}`);
      for (const [regra, padrao] of Object.entries(FLOR_FORBIDDEN)) {
        assert.doesNotMatch(corpo, padrao, `${fase}/${message.id}: ${regra}`);
      }
    }
  }
});
