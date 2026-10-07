import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.localStorage = { getItem: () => null, setItem: () => {} };
globalThis.sessionStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };

const { update } = await import('../assets/js/store.js');
const { addDays, today, toKey } = await import('../assets/js/cycle.js');
const { featureTarget, featuresFor, groupFeatures } = await import('../assets/js/features.js');
const home = (await import('../assets/js/screens/home.js')).default;

test('atalho Relatórios do pós-parto abre o crescimento do bebê', () => {
  update((state) => {
    state.onboarded = true;
    state.profile.phase = 'posparto';
    state.profile.birthDate = '2026-08-01';
    state.profile.babyName = 'Lia';
    state.profile.babyNames = ['Lia'];
  });

  const output = home.render();
  assert.match(output.html, /data-nav="crescimento-bebe"[\s\S]*Relatórios/);
  assert.match(output.html, /data-nav="vacinas-bebe"[\s\S]*Vacinas/);
  assert.doesNotMatch(output.html, /data-nav="relatorios"[\s\S]*Relatórios/);
  assert.match(output.html, /Lia nesta fase/);
  assert.match(output.html, /Marcos são referências, não prazos/);
  assert.match(output.html, /data-nav="desenvolvimento-bebe"/);
  assert.match(output.html, /data-nav="alimentacao-bebe"[\s\S]*Alimentação do bebê/);
  assert.equal((output.html.match(/class="shortcut"/g) || []).length, 4);
  assert.match(output.html, /data-nav="recursos\?modo=atalhos"/);
  assert.match(output.html, /data-nav="recursos\?modo=atalhos"/);
});

test('curso Florescer no Tempo de Deus aparece para todas as fases e assinantes', () => {
  for (const phase of ['tentante', 'gravida', 'posparto']) {
    update((state) => {
      state.onboarded = true;
      state.profile.phase = phase;
      state.premium = true;
    });

    const output = home.render();
    assert.match(output.html, /data-tempo-de-deus/);
    assert.match(output.html, /Florescer no Tempo de Deus/);
    assert.match(output.html, /data-nav="premium"/);
    assert.match(output.html, /Meu Florescer Premium/);
  }
});

test('Home mostra o botão Conhecer o Florescer Premium para não assinantes', () => {
  update((state) => {
    state.onboarded = true;
    state.profile.phase = 'tentante';
    state.premium = false;
  });

  const output = home.render();
  assert.match(output.html, /data-nav="premium"[\s\S]*Conhecer o Florescer Premium/);
});

test('Home explica o que acontece no corpo da tentante', () => {
  update((state) => {
    state.onboarded = true;
    state.profile.phase = 'tentante';
    state.profile.lastPeriodStart = toKey(today());
    state.profile.cycleLength = 28;
    state.profile.periodLength = 5;
    state.logs = {};
  });

  const output = home.render();
  assert.match(output.html, /Seu corpo hoje/);
  assert.match(output.html, /O que acontece por dentro/);
  assert.match(output.html, /queda de estrogênio e progesterona/);
  assert.match(output.html, /não confirmam ovulação ou gravidez/);
  assert.match(output.html, /data-nav="ciclo"/);
});

test('Home detalha mudanças semanais no corpo da gestante', () => {
  update((state) => {
    state.onboarded = true;
    state.profile.phase = 'gravida';
    state.profile.dueDate = toKey(addDays(today(), 140));
    state.profile.pregnancyType = 'unica';
  });

  const output = home.render();
  assert.match(output.html, /data-nav="semana-a-semana"[\s\S]*Ver a página da \d+ª semana/);
  assert.match(output.html, /<details class="pregdash__more">[\s\S]*<summary>[\s\S]*Expandir informações/);
  assert.doesNotMatch(output.html, /<details class="pregdash__more" open/);
  assert.match(output.html, /Desenvolvimento dos órgãos[\s\S]*Seu corpo nesta semana[\s\S]*<details class="pregdash__more">/);
  assert.match(output.html, /Sintomas que podem aparecer/);
  assert.match(output.html, /Alterações hormonais/);
  assert.match(output.html, /Desenvolvimento da barriga/);
  assert.match(output.html, /umbigo/i);
});

test('Home respeita a ordem dos atalhos personalizados', () => {
  update((state) => {
    state.onboarded = true;
    state.profile.phase = 'posparto';
    state.settings.homeShortcuts.posparto = ['baby-development', 'diapers', 'baby-status', 'library'];
  });

  const output = home.render();
  assert.match(output.html, /class="shortcuts"[\s\S]*data-nav="desenvolvimento-bebe"[\s\S]*data-nav="fraldas"[\s\S]*data-nav="status-bebe"[\s\S]*data-nav="biblioteca\/pos-parto"/);
  assert.equal((output.html.match(/class="shortcut"/g) || []).length, 4);
});

test('atalho Comunidade da gestante abre somente a Comunidade Gestantes', () => {
  update((state) => {
    state.onboarded = true;
    state.profile.phase = 'gravida';
    state.settings.homeShortcuts.gravida = ['community', 'calendar', 'daily-log', 'library'];
  });
  const output = home.render();
  assert.match(output.html, /data-nav="comunidade\/gestantes"[\s\S]*Comunidade Gestantes/);
});

test('o rodapé da Home é uma família de linhas, não uma pilha de botões', () => {
  update((state) => {
    state.onboarded = true;
    state.profile.phase = 'gravida';
    state.premium = false;
  });

  const html = home.render().html;
  // antes: link centralizado + botão gradiente lilás + botão outline
  assert.doesNotMatch(html, /btn--lilac/, 'o Premium não pode ser o botão mais forte da tela');
  assert.doesNotMatch(html, /link center/, 'o "ver todos" virou linha, não link solto');
  assert.equal((html.match(/class="homelink"/g) || []).length, 2, 'Tempo de Deus e Premium');
});

test('o painel da fase não sobe por cima do cartão que vier antes', () => {
  update((state) => {
    state.onboarded = true;
    state.profile.phase = 'gravida';
    state.profile.dueDate = toKey(addDays(today(), 100));
    state.florDaily = { answers: {}, dismissed: [] };
    state.florMoments = { seen: [] };
    state.settings.notifications.florDaily = true;
  });

  const html = home.render().html;
  const posCartao = html.indexOf('dailycard');
  const posPainel = html.indexOf('class="pregdash"');
  assert.ok(posCartao > -1 && posPainel > posCartao, 'o painel vem depois do cartão do dia');
  // o encaixe negativo só pode valer colado ao hero
  assert.doesNotMatch(html, /pregdash[^"]*"[^>]*style="[^"]*margin-top:-/);
});

test('o hero da gestante não repete a régua de semanas', () => {
  update((state) => {
    state.onboarded = true;
    state.profile.phase = 'gravida';
  });
  assert.doesNotMatch(home.render().html, /bumpline__scale/);
});

test('o painel da fase fecha como um cartão só, em todas as fases', () => {
  const casos = [
    ['tentante', (p) => { p.lastPeriodStart = toKey(addDays(today(), -11)); }],
    ['gravida', (p) => { p.dueDate = toKey(addDays(today(), 100)); }],
    ['posparto', (p) => { p.birthDate = toKey(addDays(today(), -50)); }],
  ];

  for (const [fase, preparar] of casos) {
    update((state) => {
      state.onboarded = true;
      state.profile.phase = fase;
      state.profile.dueDate = null;
      state.profile.birthDate = null;
      preparar(state.profile);
    });

    const html = home.render().html;
    const inicio = html.indexOf('class="pregdash');
    const completo = html.slice(inicio, html.indexOf('</section>', inicio));
    // "Expandir informações" é um segundo cartão, com fundo próprio: o que
    // está dentro dele não conta para o fecho do cartão principal
    const more = completo.indexOf('pregdash__more');
    const painel = more > -1 ? completo.slice(0, more) : completo;

    // o fundo branco do cartão é desenhado pelo grid e fechado pela linha final;
    // bloco de texto fora desse intervalo flutua sobre o fundo da página
    const grid = painel.indexOf('pregdash__grid');
    const primeiroBloco = painel.indexOf('class="preginfo');
    const ultimoBloco = painel.lastIndexOf('class="preginfo');
    const fecho = painel.indexOf('pregdash__weeklink');

    assert.ok(grid > -1, `${fase}: o painel precisa de um grid`);
    assert.ok(fecho > -1, `${fase}: o cartão precisa fechar com uma linha`);
    assert.ok(grid < primeiroBloco, `${fase}: há bloco de texto antes do cartão abrir`);
    assert.ok(fecho > ultimoBloco, `${fase}: há bloco de texto depois do cartão fechar`);
  }
});

test('a Home mostra TODOS os recursos da fase, não só os quatro atalhos', () => {
  const casos = [
    ['tentante', (p) => { p.lastPeriodStart = toKey(addDays(today(), -11)); }],
    ['gravida', (p) => { p.dueDate = toKey(addDays(today(), 100)); }],
    ['posparto', (p) => { p.birthDate = toKey(addDays(today(), -50)); }],
  ];

  for (const [fase, preparar] of casos) {
    update((state) => {
      state.onboarded = true;
      state.profile.phase = fase;
      state.profile.dueDate = null;
      state.profile.birthDate = null;
      preparar(state.profile);
    });

    const html = home.render().html;
    const recursos = featuresFor(fase, 'resources');

    const faltando = recursos.filter((item) => !html.includes(`data-nav="${featureTarget(item, fase)}"`));
    assert.deepEqual(faltando.map((f) => f.id), [],
      `${fase}: recurso sem nenhum caminho visível na Home`);

    // e eles vêm agrupados, não num amontoado
    const grupos = groupFeatures(recursos).length;
    assert.equal((html.match(/class="featgroup"/g) || []).length, grupos, `${fase}: grupos`);
  }
});

test('os quatro atalhos continuam em destaque acima do catálogo', () => {
  update((state) => {
    state.onboarded = true;
    state.profile.phase = 'posparto';
    state.profile.birthDate = toKey(addDays(today(), -50));
  });

  const html = home.render().html;
  assert.equal((html.match(/class="shortcut"/g) || []).length, 4, 'quatro favoritos');
  assert.ok(html.indexOf('class="shortcut"') < html.indexOf('class="featgroup"'),
    'os favoritos vêm antes do catálogo');
  assert.match(html, /Tudo o que você pode fazer/);
});

test('grupo pequeno não abre a lista deixando buracos na linha', () => {
  for (const fase of ['tentante', 'gravida', 'posparto']) {
    const grupos = groupFeatures(featuresFor(fase, 'resources'));
    // dentro da mesma faixa de ordem, o maior vem primeiro
    for (let i = 1; i < grupos.length; i += 1) {
      const antes = grupos[i - 1];
      const agora = grupos[i];
      if (antes.order !== agora.order) continue;
      assert.ok(antes.features.length >= agora.features.length,
        `${fase}: "${antes.label}" (${antes.features.length}) veio antes de "${agora.label}" (${agora.features.length})`);
    }
  }
});

test('o grupo da gestação muda de nome depois que o bebê nasce', async () => {
  const { groupLabel } = await import('../assets/js/features.js');
  const grupo = groupFeatures(featuresFor('posparto', 'resources')).find((g) => g.id === 'pregnancy');
  assert.equal(groupLabel(grupo, 'gravida'), 'Gestação');
  assert.equal(groupLabel(grupo, 'posparto'), 'Da sua gestação');
});
