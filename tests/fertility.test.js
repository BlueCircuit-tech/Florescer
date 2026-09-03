import test from 'node:test';
import assert from 'node:assert/strict';

import { cyclePhaseGuide } from '../assets/js/fertility.js';

const PHASES = ['menstrual', 'follicular', 'fertile', 'ovulation', 'luteal'];

test('explica em linguagem simples todas as fases do ciclo', () => {
  for (const phase of PHASES) {
    const guide = cyclePhaseGuide(phase);
    assert.ok(guide.title, phase);
    assert.ok(guide.body, phase);
    assert.ok(guide.notice, phase);
    assert.ok(guide.care, phase);
  }
});

test('fase lútea não apresenta sintomas como confirmação de gravidez', () => {
  const guide = cyclePhaseGuide('luteal');
  assert.match(guide.notice, /não confirmam gravidez/i);
  assert.match(guide.care, /teste/i);
});

test('ovulação deixa explícito que a data é uma previsão', () => {
  const guide = cyclePhaseGuide('ovulation');
  assert.match(guide.title, /estimada/i);
  assert.match(guide.care, /previsão/i);
});
