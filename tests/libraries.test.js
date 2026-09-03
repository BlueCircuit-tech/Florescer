import test from 'node:test';
import assert from 'node:assert/strict';

import { ARTICLES } from '../assets/js/content.js';
import {
  LIBRARY_TOPICS,
  articleTopic,
  articlesForLibrary,
  articlesForPhase,
  canAccessArticle,
  libraryPath,
  topicsForPhase,
} from '../assets/js/libraries.js';
import { iconNames } from '../assets/js/icons.js';

test('bibliotecas possuem rotas canônicas por fase', () => {
  assert.equal(libraryPath('tentante'), 'biblioteca/tentantes');
  assert.equal(libraryPath('gravida'), 'biblioteca/gestantes');
  assert.equal(libraryPath('posparto'), 'biblioteca/pos-parto');
  assert.equal(libraryPath('gravida', 'emotional-health'), 'biblioteca/gestantes?tema=emotional-health');
});

test('catálogo temático usa IDs únicos e ícones existentes', () => {
  assert.equal(new Set(LIBRARY_TOPICS.map((topic) => topic.id)).size, LIBRARY_TOPICS.length);
  for (const topic of LIBRARY_TOPICS) assert.equal(iconNames.includes(topic.icon), true, topic.id);
});

test('todos os artigos iniciais possuem um tema reconhecido', () => {
  for (const article of ARTICLES) assert.ok(articleTopic(article), article.id);
});

test('biblioteca gestacional cobre todos os temas essenciais', () => {
  const expected = [
    'nutrition', 'exercises', 'sleep', 'vaginal-birth', 'cesarean',
    'breastfeeding', 'postpartum', 'emotional-health', 'rights', 'pregnancy',
  ];
  const topics = new Set(topicsForPhase('gravida').map((topic) => topic.id));
  const articles = articlesForPhase(ARTICLES, 'gravida');

  for (const id of expected) {
    assert.equal(topics.has(id), true, `tema ausente: ${id}`);
    assert.equal(articlesForLibrary(ARTICLES, 'gravida', id).length > 0, true, `conteúdo ausente: ${id}`);
  }
  assert.equal(articles.length >= expected.length, true);
});

test('filtro e acesso direto isolam artigos por fase', () => {
  const fertility = ARTICLES.find((article) => article.id === 'periodo-fertil');
  const pregnancy = ARTICLES.find((article) => article.id === 'primeiro-trimestre');

  assert.equal(canAccessArticle(fertility, 'tentante'), true);
  assert.equal(canAccessArticle(fertility, 'gravida'), false);
  assert.equal(canAccessArticle(pregnancy, 'gravida'), true);
  assert.equal(articlesForPhase(ARTICLES, 'gravida').includes(fertility), false);
});

test('artigos antigos sem topic continuam classificados pela categoria', () => {
  assert.equal(articleTopic({ cat: 'Nutrição' }).id, 'nutrition');
  assert.equal(articleTopic({ cat: 'Gestação' }).id, 'pregnancy');
});
