import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.localStorage = { getItem: () => null, setItem: () => {} };

const { update } = await import('../assets/js/store.js');
const { addDays, today, toKey } = await import('../assets/js/cycle.js');
const {
  PREGNANCY_AVOID,
  PREGNANCY_RECIPES,
  pregnancyNutritionGuide,
} = await import('../assets/js/pregnancyNutrition.js');
const screen = (await import('../assets/js/screens/pregnancyNutrition.js')).default;
const { featuresFor } = await import('../assets/js/features.js');

const setPregnancy = (weeks) => update((state) => {
  state.onboarded = true;
  state.profile.phase = 'gravida';
  state.profile.pregnancyType = 'unica';
  state.profile.dueDate = toKey(addDays(today(), (40 - weeks) * 7));
});

test('o guia muda conforme o trimestre', () => {
  assert.equal(pregnancyNutritionGuide(8).period, '1º trimestre');
  assert.equal(pregnancyNutritionGuide(20).period, '2º trimestre');
  assert.equal(pregnancyNutritionGuide(34).period, '3º trimestre');
  // fora do intervalo não quebra
  assert.equal(pregnancyNutritionGuide(0).period, '1º trimestre');
  assert.equal(pregnancyNutritionGuide(99).period, '3º trimestre');
});

test('cobre as restrições clássicas da gestação', () => {
  const texto = PREGNANCY_AVOID.join(' ').toLowerCase();
  for (const termo of ['crus', 'ovo cru', 'não pasteurizado', 'mercúrio', 'álcool', 'cafeína']) {
    assert.ok(texto.includes(termo), `restrição ausente: ${termo}`);
  }
});

test('toda receita tem ingredientes e modo de preparo', () => {
  assert.ok(PREGNANCY_RECIPES.length >= 4);
  for (const recipe of PREGNANCY_RECIPES) {
    assert.ok(recipe.title && recipe.ingredients && recipe.preparation && recipe.note);
  }
});

test('a tela abre em "Nesta fase" e troca de aba', () => {
  setPregnancy(20);
  const inicial = screen.render({ params: {} });
  assert.match(inicial.appbar.sub, /20ª semana · 2º trimestre/);
  assert.match(inicial.html, /aria-selected="true"[^>]*>Nesta fase|Nesta fase/);
  assert.match(inicial.html, /O que ajuda agora/);

  const proibidos = screen.render({ params: { guia: 'evitar' } });
  assert.match(proibidos.html, /Alimentos proibidos ou a evitar/);
  assert.match(proibidos.html, /listeria/);

  const receitas = screen.render({ params: { guia: 'receitas' } });
  assert.match(receitas.html, /Receitinhas fáceis/);
  assert.match(receitas.html, /Ingredientes/);
});

test('aba inválida cai no padrão em vez de quebrar', () => {
  setPregnancy(20);
  const output = screen.render({ params: { guia: 'inexistente' } });
  assert.match(output.html, /O que ajuda agora/);
});

test('fora da gestação o guia não aparece', () => {
  update((state) => { state.profile.phase = 'posparto'; });
  const output = screen.render({ params: {} });
  assert.match(output.html, /Guia indisponível/);
});

test('as novas telas entram no catálogo da fase certa', () => {
  const gestante = featuresFor('gravida', 'resources').map((feature) => feature.id);
  const tentante = featuresFor('tentante', 'resources').map((feature) => feature.id);

  for (const id of ['prenatal-plan', 'week-by-week', 'maternal-body', 'pregnancy-nutrition']) {
    assert.ok(gestante.includes(id), `faltou ${id} para gestantes`);
    assert.ok(!tentante.includes(id), `${id} não deveria aparecer para tentantes`);
  }
  assert.ok(tentante.includes('cycle-timeline'));
  assert.ok(!gestante.includes('cycle-timeline'));
});
