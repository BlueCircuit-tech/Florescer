import test from 'node:test';
import assert from 'node:assert/strict';

import { babyFeedingGuide } from '../assets/js/babyFeeding.js';

test('adapta a orientação às cinco faixas de alimentação', () => {
  assert.equal(babyFeedingGuide(30).period, 'Antes dos 6 meses');
  assert.equal(babyFeedingGuide(180).period, 'De 6 a 8 meses');
  assert.equal(babyFeedingGuide(270).period, 'De 9 a 11 meses');
  assert.equal(babyFeedingGuide(365).period, 'De 1 a 2 anos');
  assert.equal(babyFeedingGuide(730).period, 'A partir de 2 anos');
});

test('prioriza meses completos quando a idade de calendário está disponível', () => {
  assert.equal(babyFeedingGuide(180, 5).period, 'Antes dos 6 meses');
  assert.equal(babyFeedingGuide(184, 6).period, 'De 6 a 8 meses');
  assert.equal(babyFeedingGuide(370, 12).period, 'De 1 a 2 anos');
});

test('não oferece receitas nem sólidos antes dos seis meses', () => {
  const guide = babyFeedingGuide(120);
  assert.equal(guide.recipes.length, 0);
  assert.match(guide.when, /6 meses/);
  assert.match(guide.allowed.join(' '), /Leite materno/);
  assert.match(guide.avoid.join(' '), /papinhas/);
});

test('libera receitas e mantém restrições críticas conforme a idade', () => {
  const sixMonths = babyFeedingGuide(180);
  const oneYear = babyFeedingGuide(365);

  assert.equal(sixMonths.recipes.length >= 3, true);
  assert.match(sixMonths.avoid.join(' '), /Mel antes de 1 ano/);
  assert.match(sixMonths.avoid.join(' '), /engasgo/);
  assert.match(oneYear.avoid.join(' '), /Açúcar.*2 anos/);
});
