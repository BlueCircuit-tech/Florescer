import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.localStorage = { getItem: () => null, setItem: () => {} };
globalThis.sessionStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };

const { update } = await import('../assets/js/store.js');
const { addDays, today, toKey } = await import('../assets/js/cycle.js');
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
  assert.match(output.html, /data-nav="recursos"/);
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
    assert.match(output.html, /data-nav="missoes" aria-label="Missões diárias"/);
    assert.match(output.html, /data-nav="premium"/);
    assert.match(output.html, /Gerenciar Florescer Premium/);
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
  assert.match(output.html, /data-nav="semana-a-semana"[\s\S]*Ver Semana a Semana/);
  assert.match(output.html, /<details class="pregdash__more">[\s\S]*<summary>[\s\S]*Expandir informações/);
  assert.doesNotMatch(output.html, /<details class="pregdash__more" open/);
  assert.match(output.html, /Desenvolvimento dos órgãos[\s\S]*Seu corpo esta semana[\s\S]*<details class="pregdash__more">/);
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
