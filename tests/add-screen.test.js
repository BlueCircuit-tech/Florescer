import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.localStorage = { getItem: () => null, setItem: () => {} };

const { update } = await import('../assets/js/store.js');
const addScreen = (await import('../assets/js/screens/add.js')).default;
const logScreen = (await import('../assets/js/screens/log.js')).default;

test('Tentante pode escolher Registrar Relação no botão principal', () => {
  update((state) => { state.profile.phase = 'tentante'; });
  const output = addScreen.render();

  assert.match(output.html, /Registrar Relação/i);
  assert.match(output.html, /data-nav="relacao"/);
  assert.match(output.html, /data-nav="sono"/);
  assert.match(output.html, /Ciclo e tentativas/);
  assert.match(output.html, /Meu cuidado/);
  assert.equal((output.html.match(/<details class="resource-group" open>/g) || []).length, 1);
});

test('gestante escolhe entre registro, sintoma e nascimento no botão principal', () => {
  update((state) => { state.profile.phase = 'gravida'; });
  const output = addScreen.render();

  assert.match(output.html, /Adicionar um Registro/i);
  assert.match(output.html, /Adicionar um Sintoma/i);
  assert.match(output.html, /Registrar nascimento/i);
  assert.match(output.html, /data-nav="sono"/);
  assert.match(output.html, /Meu cuidado/);
  assert.match(output.html, /Gestação/);
  assert.match(output.html, /data-register-birth/);
});

test('puérpera pode registrar o status do bebê no botão principal', () => {
  update((state) => { state.profile.phase = 'posparto'; });
  const output = addScreen.render();

  assert.match(output.html, /Registrar status do bebê/i);
  assert.match(output.html, /data-nav="status-bebe"/);
  assert.match(output.html, /data-nav="vacinas-bebe"/);
  assert.match(output.html, /Registro de Desenvolvimento/i);
  assert.match(output.html, /data-nav="desenvolvimento-bebe"/);
  assert.match(output.html, /Registrar amamentação/i);
  assert.match(output.html, /data-nav="amamentacao"/);
  assert.match(output.html, /Registrar fralda/i);
  assert.match(output.html, /data-nav="fraldas"/);
  assert.match(output.html, /Registro de Saúde/i);
  assert.match(output.html, /data-nav="saude-bebe"/);
  assert.match(output.html, /data-nav="sono"/);
  assert.match(output.html, /Rotina do bebê/);
  assert.match(output.html, /Saúde e desenvolvimento/);
  assert.match(output.html, /Meu cuidado/);
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
