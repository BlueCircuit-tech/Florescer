import test from 'node:test';
import assert from 'node:assert/strict';

import { applyBabyNames, babyNamesFromProfile, formatBabyNames, postpartumGreeting } from '../assets/js/babies.js';

test('lê o nome legado quando ainda não existe uma lista', () => {
  assert.deepEqual(babyNamesFromProfile({ babyName: 'Lia' }), ['Lia']);
});

test('formata naturalmente dois ou mais nomes', () => {
  assert.equal(formatBabyNames(['Lia', 'Liz']), 'Lia e Liz');
  assert.equal(formatBabyNames(['Lia', 'Liz', 'Theo']), 'Lia, Liz e Theo');
});

test('monta a saudação do dashboard pós-parto com todos os nomes', () => {
  assert.equal(postpartumGreeting({ babyNames: ['Teste 1', 'Teste 2'] }), 'Olá, Teste 1 e Teste 2!');
});

test('salva múltiplos nomes e mantém o primeiro no campo legado', () => {
  const profile = {};
  applyBabyNames(profile, [' Lia ', '', 'Liz', 'Theo']);

  assert.deepEqual(profile.babyNames, ['Lia', 'Liz', 'Theo']);
  assert.equal(profile.babyName, 'Lia');
});

test('gestação única conserva somente o primeiro nome', () => {
  const profile = {};
  applyBabyNames(profile, ['Lia', 'Liz'], { multiple: false });

  assert.deepEqual(profile.babyNames, ['Lia']);
});
