import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.localStorage = { getItem: () => null };
const { emptyLog, logHasContent } = await import('../assets/js/store.js');

test('registro da gestante é reconhecido por qualquer campo do Diário da Mamãe', () => {
  assert.equal(logHasContent(emptyLog()), false);
  assert.equal(logHasContent({ ...emptyLog(), emotions: ['Feliz'] }), true);
  assert.equal(logHasContent({ ...emptyLog(), thoughts: 'Hoje ouvi o coração.' }), true);
  assert.equal(logHasContent({ ...emptyLog(), gratitude: 'Minha rede de apoio.' }), true);
  assert.equal(logHasContent({ ...emptyLog(), bumpPhotos: ['data:image/jpeg;base64,abc'] }), true);
  assert.equal(logHasContent({ ...emptyLog(), examPhotos: ['data:image/jpeg;base64,abc'] }), true);
  assert.equal(logHasContent({ ...emptyLog(), systolicPressure: 120, diastolicPressure: 80 }), true);
  assert.equal(logHasContent({ ...emptyLog(), weight: 68.5 }), true);
  assert.equal(logHasContent({ ...emptyLog(), glucose: 92 }), true);
});
