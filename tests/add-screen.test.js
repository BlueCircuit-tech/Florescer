import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.localStorage = { getItem: () => null, setItem: () => {} };

const { update } = await import('../assets/js/store.js');
const addScreen = (await import('../assets/js/screens/add.js')).default;
const logScreen = (await import('../assets/js/screens/log.js')).default;

test('gestante escolhe entre registro, sintoma e nascimento no botão principal', () => {
  update((state) => { state.profile.phase = 'gravida'; });
  const output = addScreen.render();

  assert.match(output.html, /Adicionar um Registro/);
  assert.match(output.html, /Adicionar um Sintoma/);
  assert.match(output.html, /Registrar nascimento/);
});

test('sintomas ficam separados do Diário da Mamãe', () => {
  const diary = logScreen.render({ params: {} });
  const symptoms = logScreen.render({ params: { s: 'sintomas' } });

  assert.doesNotMatch(diary.html, /id="symptom-control"/);
  assert.match(symptoms.html, /id="symptom-control"/);
  assert.match(symptoms.html, /Controle de Sintomas/);
});
