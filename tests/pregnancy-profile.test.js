import test from 'node:test';
import assert from 'node:assert/strict';

import { applyPregnancyProfile, pregnancyDraft } from '../assets/js/pregnancyProfile.js';

test('calcula a DPP a partir da última menstruação ao iniciar o questionário', () => {
  const draft = pregnancyDraft({ lastPeriodStart: '2026-01-01' });

  assert.equal(draft.lastPeriodStart, '2026-01-01');
  assert.equal(draft.dueDate, '2026-10-08');
});

test('calcula a última menstruação a partir da DPP informada', () => {
  const draft = pregnancyDraft({ dueDate: '2026-10-08' });

  assert.equal(draft.lastPeriodStart, '2026-01-01');
  assert.equal(draft.dueDate, '2026-10-08');
});

test('salva tipo de gestação, nome e ultrassonografia no perfil', () => {
  const profile = {};
  const ultrasoundPhoto = 'data:image/jpeg;base64,abc';

  applyPregnancyProfile(profile, {
    lastPeriodStart: '2026-01-01',
    dueDate: '2026-10-08',
    pregnancyType: 'gemelar',
    babyNames: ['  Lia  ', '  Liz  '],
    ultrasoundPhoto,
  });

  assert.deepEqual(profile, {
    lastPeriodStart: '2026-01-01',
    dueDate: '2026-10-08',
    pregnancyType: 'gemelar',
    babyName: 'Lia',
    babyNames: ['Lia', 'Liz'],
    ultrasoundPhoto,
  });
});

test('descarta imagem que não seja JPEG local válido', () => {
  const profile = {};
  applyPregnancyProfile(profile, { pregnancyType: 'unica', babyNames: [], ultrasoundPhoto: 'https://example.com/exame.jpg' });

  assert.equal(profile.ultrasoundPhoto, null);
});
