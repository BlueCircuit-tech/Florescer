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
    babySex: null,
    babySexAt: null,
    ultrasoundPhoto,
  });
});

test('descarta imagem que não seja JPEG local válido', () => {
  const profile = {};
  applyPregnancyProfile(profile, { pregnancyType: 'unica', babyNames: [], ultrasoundPhoto: 'https://example.com/exame.jpg' });

  assert.equal(profile.ultrasoundPhoto, null);
});

test('o sexo do bebê guarda a data em que ela soube, e surpresa não guarda nada', () => {
  const profile = {};
  applyPregnancyProfile(profile, { pregnancyType: 'unica', babyNames: ['Alice'], babySex: 'menina' });
  assert.equal(profile.babySex, 'menina');
  assert.match(profile.babySexAt, /^\d{4}-\d{2}-\d{2}$/, 'a data da descoberta vira marco na jornada');

  applyPregnancyProfile(profile, { pregnancyType: 'unica', babyNames: ['Alice'], babySex: 'surpresa' });
  assert.equal(profile.babySex, 'surpresa');
  assert.equal(profile.babySexAt, null);

  applyPregnancyProfile(profile, { pregnancyType: 'unica', babyNames: ['Alice'], babySex: 'invalido' });
  assert.equal(profile.babySex, null);
});
