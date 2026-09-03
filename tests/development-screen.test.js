import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.localStorage = { getItem: () => null, setItem: () => {} };
globalThis.sessionStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };

const { update } = await import('../assets/js/store.js');
const developmentScreen = (await import('../assets/js/screens/development.js')).default;

test('tela de desenvolvimento oferece marcos e apresenta a linha do tempo do bebê', () => {
  update((state) => {
    state.profile.phase = 'posparto';
    state.profile.birthDate = '2026-01-01';
    state.profile.babyName = 'Lia';
    state.profile.babyNames = ['Lia'];
    state.babyDevelopmentRecords = [{
      id: 'development:1', babyName: 'Lia', milestoneType: 'first_smile', title: 'Primeiro sorriso',
      happenedOn: '2026-02-10', notes: 'Sorriu para a mamãe.', createdAt: 1, updatedAt: 1,
    }];
  });

  const output = developmentScreen.render({ params: {} });

  assert.equal(output.appbar.title, 'Registro de Desenvolvimento');
  assert.match(output.html, /Primeiro sorriso/);
  assert.match(output.html, /Primeiros passos/);
  assert.match(output.html, /Primeiro aniversário/);
  assert.match(output.html, /Linha do tempo/);
  assert.match(output.html, /Sorriu para a mamãe/);
  assert.match(output.html, /data-edit-development="development:1"/);
});
