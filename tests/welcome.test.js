import test from 'node:test';
import assert from 'node:assert/strict';

import { welcomeContent } from '../assets/js/welcome.js';

test('personaliza a mensagem da gestante', () => {
  const content = welcomeContent({ name: 'Marcele Silva', phase: 'gravida' });

  assert.equal(content.title, 'Parabéns, Marcele!');
  assert.match(content.message, /durante toda a sua gestação/);
  assert.match(content.message, /cada semana juntas/);
});

test('personaliza a mensagem da tentante', () => {
  const content = welcomeContent({ name: 'Ana', phase: 'tentante' });

  assert.equal(content.title, 'Vamos florescer juntas, Ana!');
  assert.match(content.message, /conhecer melhor o seu ciclo/);
  assert.match(content.message, /no seu tempo/);
});

test('personaliza o pós-parto com o nome do bebê', () => {
  const content = welcomeContent({ name: 'Júlia', phase: 'posparto', babyName: 'Cecília' });

  assert.equal(content.title, 'Bem-vinda a esta nova fase, Júlia!');
  assert.match(content.message, /acompanhar Cecília/);
  assert.match(content.message, /acolher o seu pós-parto/);
});

test('usa uma descrição genérica quando o bebê não tem nome informado', () => {
  const content = welcomeContent({ name: 'Clara', phase: 'posparto' });

  assert.match(content.message, /acompanhar seu bebê/);
});
