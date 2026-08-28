import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.localStorage = { getItem: () => null, setItem: () => {} };

const { update } = await import('../assets/js/store.js');
const addScreen = (await import('../assets/js/screens/add.js')).default;
const logScreen = (await import('../assets/js/screens/log.js')).default;

test('Tentante pode escolher Registrar Relação no botão principal', () => {
  update((state) => { state.profile.phase = 'tentante'; });
  const output = addScreen.render();

  assert.match(output.html, /Registrar Relação/);
  assert.match(output.html, /data-nav="relacao"/);
});

test('gestante escolhe entre registro, sintoma e nascimento no botão principal', () => {
  update((state) => { state.profile.phase = 'gravida'; });
  const output = addScreen.render();

  assert.match(output.html, /Adicionar um Registro/);
  assert.match(output.html, /Adicionar um Sintoma/);
  assert.match(output.html, /Registrar nascimento/);
});

test('puérpera pode registrar o status do bebê no botão principal', () => {
  update((state) => { state.profile.phase = 'posparto'; });
  const output = addScreen.render();

  assert.match(output.html, /Registrar status do bebê/);
  assert.match(output.html, /data-nav="status-bebe"/);
  assert.match(output.html, /Registrar amamentação/);
  assert.match(output.html, /data-nav="amamentacao"/);
  assert.match(output.html, /Registrar fralda/);
  assert.match(output.html, /data-nav="fraldas"/);
  assert.match(output.html, /Registro de Saúde/);
  assert.match(output.html, /data-nav="saude-bebe"/);
});

test('sintomas ficam separados do Diário da Mamãe', () => {
  update((state) => { state.profile.phase = 'posparto'; });
  const diary = logScreen.render({ params: {} });
  const symptoms = logScreen.render({ params: { s: 'sintomas' } });

  assert.doesNotMatch(diary.html, /id="symptom-control"/);
  assert.doesNotMatch(diary.html, /Menstruação|Fertilidade|bump-photo|exam-photo/);
  assert.match(diary.html, /Emoções e sentimentos/);
  assert.match(diary.html, /Conquistas do dia/);
  assert.match(diary.html, /Gratidão do dia/);
  assert.match(diary.html, /Observações/);
  assert.match(symptoms.html, /id="symptom-control"/);
  assert.match(symptoms.html, /Controle de Sintomas/);
});
