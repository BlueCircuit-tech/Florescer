import test from 'node:test';
import assert from 'node:assert/strict';

import { achievementStats, unlockAchievements } from '../assets/js/achievements.js';
import { fromKey } from '../assets/js/cycle.js';

const state = (logs = {}) => ({ profile: {}, logs, achievements: [], journey: [] });

test('relação isolada desbloqueia as conquistas de primeiro registro e primeira relação', () => {
  const current = state({ '2026-08-20': { intercourse: true } });
  const unlocked = unlockAchievements(current, { logs: 0, relationships: 0, cycles: 0 }, 123, fromKey('2026-08-20'));

  assert.deepEqual(unlocked.map((item) => item.id), ['first-log', 'first-intercourse']);
  assert.deepEqual(current.achievements.map((item) => item.id), ['first-log', 'first-intercourse']);
  assert.equal(current.journey.length, 2);
});

test('desbloqueia celebração ao alcançar sete registros', () => {
  const logs = Object.fromEntries(Array.from({ length: 7 }, (_, index) => [`2026-08-${String(index + 1).padStart(2, '0')}`, { mood: 2 }]));
  const current = state(logs);
  current.achievements.push({ id: 'first-log', at: 1 });

  const unlocked = unlockAchievements(current, { logs: 6, relationships: 0, cycles: 0 }, 123, fromKey('2026-08-20'));
  assert.deepEqual(unlocked.map((item) => item.id), ['logs-7']);
});

test('reconhece um ciclo completo quando um novo período começa', () => {
  const current = state({
    '2026-07-01': { flow: 'medium' },
    '2026-07-29': { flow: 'medium' },
  });
  current.achievements.push({ id: 'first-log', at: 1 });

  const before = { ...achievementStats(current, fromKey('2026-07-28')), cycles: 0 };
  const unlocked = unlockAchievements(current, before, 123, fromKey('2026-07-29'));
  assert.deepEqual(unlocked.map((item) => item.id), ['first-cycle']);
});

test('não desbloqueia a mesma conquista novamente', () => {
  const current = state({ '2026-08-20': { intercourse: true } });
  current.achievements.push({ id: 'first-log', at: 1 }, { id: 'first-intercourse', at: 1 });

  assert.deepEqual(unlockAchievements(current, { logs: 0, relationships: 0, cycles: 0 }, 123, fromKey('2026-08-20')), []);
});
