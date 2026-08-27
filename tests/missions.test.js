import test from 'node:test';
import assert from 'node:assert/strict';

import { fromKey } from '../assets/js/cycle.js';
import { DAILY_MISSIONS, completedMissions, missionProgress, missionStats, toggleMission } from '../assets/js/missions.js';

const all = DAILY_MISSIONS.map((mission) => mission.id);

test('calcula o progresso diário ignorando missões inválidas e duplicadas', () => {
  const state = { missionDays: { '2026-08-25': ['water', 'water', 'invalid'] } };
  const progress = missionProgress(state, '2026-08-25');

  assert.deepEqual(progress.completed, ['water']);
  assert.equal(progress.count, 1);
  assert.equal(progress.remaining, 4);
  assert.equal(progress.points, 10);
  assert.equal(progress.done, false);
});

test('marca e desmarca uma missão do dia', () => {
  const state = { missionDays: {} };

  assert.equal(toggleMission(state, 'sleep', '2026-08-25'), true);
  assert.deepEqual(completedMissions(state, '2026-08-25'), ['sleep']);
  assert.equal(toggleMission(state, 'sleep', '2026-08-25'), false);
  assert.deepEqual(state.missionDays, {});
});

test('soma pontos e mantém a sequência enquanto o dia atual está em aberto', () => {
  const state = { missionDays: {
    '2026-08-23': all,
    '2026-08-24': all,
    '2026-08-25': ['water'],
  } };
  const stats = missionStats(state, fromKey('2026-08-25'));

  assert.equal(stats.totalPoints, 110);
  assert.equal(stats.streak, 2);
  assert.equal(stats.level, 1);
});
