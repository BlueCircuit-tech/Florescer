import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.localStorage = { getItem: () => null, setItem: () => {} };
const { emptyLog, getState, logHasContent, saveIntercourse, saveLog } = await import('../assets/js/store.js');

test('registro da gestante é reconhecido por qualquer campo do Diário da Mamãe', () => {
  assert.equal(logHasContent(emptyLog()), false);
  assert.equal(logHasContent({ ...emptyLog(), emotions: ['Feliz'] }), true);
  assert.equal(logHasContent({ ...emptyLog(), thoughts: 'Hoje ouvi o coração.' }), true);
  assert.equal(logHasContent({ ...emptyLog(), accomplishments: 'Consegui descansar.' }), true);
  assert.equal(logHasContent({ ...emptyLog(), gratitude: 'Minha rede de apoio.' }), true);
  assert.equal(logHasContent({ ...emptyLog(), observations: 'Um dia tranquilo.' }), true);
  assert.equal(logHasContent({ ...emptyLog(), bumpPhotos: ['data:image/jpeg;base64,abc'] }), true);
  assert.equal(logHasContent({ ...emptyLog(), examPhotos: ['data:image/jpeg;base64,abc'] }), true);
  assert.equal(logHasContent({ ...emptyLog(), systolicPressure: 120, diastolicPressure: 80 }), true);
  assert.equal(logHasContent({ ...emptyLog(), weight: 68.5 }), true);
  assert.equal(logHasContent({ ...emptyLog(), glucose: 92 }), true);
});

test('relação isolada é reconhecida como conteúdo do dia', () => {
  assert.equal(logHasContent({ ...emptyLog(), intercourse: true }), true);
});

test('registro rápido de relação preserva os outros dados do dia', () => {
  saveLog('2026-08-20', { ...emptyLog(), mood: 3, notes: 'Um dia tranquilo.' });
  const result = saveIntercourse('2026-08-20', { protected: true });
  const saved = getState().logs['2026-08-20'];

  assert.equal(result.saved, true);
  assert.equal(saved.intercourse, true);
  assert.equal(saved.protected, true);
  assert.equal(saved.mood, 3);
  assert.equal(saved.notes, 'Um dia tranquilo.');
});
