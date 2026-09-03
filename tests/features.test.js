import test from 'node:test';
import assert from 'node:assert/strict';

import {
  FEATURES,
  HOME_SHORTCUT_DEFAULTS,
  featureLabel,
  featureTarget,
  featuresFor,
  normalizeHomeShortcutIds,
  resolveHomeShortcuts,
} from '../assets/js/features.js';
import { iconNames } from '../assets/js/icons.js';

test('catálogo possui IDs únicos, ícones existentes e destinos ou ações', () => {
  const ids = FEATURES.map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const item of FEATURES) {
    assert.equal(iconNames.includes(item.icon), true, `ícone ausente em ${item.id}`);
    assert.equal(Boolean(item.to || item.action), true, `destino ausente em ${item.id}`);
  }
});

test('cada fase possui quatro atalhos padrão distintos e elegíveis', () => {
  for (const [phase, defaults] of Object.entries(HOME_SHORTCUT_DEFAULTS)) {
    const eligible = new Set(featuresFor(phase, 'home').map((item) => item.id));
    assert.equal(defaults.length, 4);
    assert.equal(new Set(defaults).size, 4);
    assert.equal(defaults.every((id) => eligible.has(id)), true);
  }
});

test('normalização remove atalhos inválidos e duplicados e completa quatro', () => {
  assert.deepEqual(normalizeHomeShortcutIds(['diapers', 'diapers', 'invalid', 'baby-health'], 'posparto'), [
    'diapers', 'baby-health', 'calendar', 'baby-vaccines',
  ]);
});

test('resolvedor preserva a ordem personalizada e os rótulos da Home', () => {
  const shortcuts = resolveHomeShortcuts({
    homeShortcuts: { posparto: ['baby-development', 'diapers', 'baby-status', 'baby-growth'] },
  }, 'posparto');

  assert.deepEqual(shortcuts.map((item) => item.id), ['baby-development', 'diapers', 'baby-status', 'baby-growth']);
  assert.equal(featureLabel(shortcuts[3], 'posparto', 'home'), 'Relatórios');
});

test('nascimento permanece uma ação especial e não uma rota', () => {
  const birth = featuresFor('gravida', 'add').find((item) => item.id === 'birth');
  assert.equal(birth.action, 'register-birth');
  assert.equal(birth.to, undefined);
});

test('recurso de comunidade resolve nome e rota conforme a fase', () => {
  const community = FEATURES.find((item) => item.id === 'community');
  assert.equal(featureLabel(community, 'gravida'), 'Comunidade Gestantes');
  assert.equal(featureTarget(community, 'gravida'), 'comunidade/gestantes');
  assert.equal(featureTarget(community, 'tentante'), 'comunidade/tentantes');
});

test('recurso de biblioteca resolve nome e rota conforme a fase', () => {
  const library = FEATURES.find((item) => item.id === 'library');
  assert.equal(featureLabel(library, 'gravida'), 'Biblioteca da Gestante');
  assert.equal(featureTarget(library, 'gravida'), 'biblioteca/gestantes');
  assert.equal(featureTarget(library, 'tentante'), 'biblioteca/tentantes');
  assert.equal(featureTarget(library, 'posparto'), 'biblioteca/pos-parto');
});

test('alimentação do bebê é exclusiva do pós-parto', () => {
  const feeding = FEATURES.find((item) => item.id === 'baby-feeding');
  assert.ok(feeding);
  assert.equal(featureTarget(feeding, 'posparto'), 'alimentacao-bebe');
  assert.equal(featuresFor('posparto', 'resources').includes(feeding), true);
  assert.equal(featuresFor('posparto', 'home').includes(feeding), true);
  assert.equal(featuresFor('gravida', 'resources').includes(feeding), false);
});
