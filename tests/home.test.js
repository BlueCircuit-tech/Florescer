import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.localStorage = { getItem: () => null, setItem: () => {} };
globalThis.sessionStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };

const { update } = await import('../assets/js/store.js');
const home = (await import('../assets/js/screens/home.js')).default;

test('atalho Relatórios do pós-parto abre o crescimento do bebê', () => {
  update((state) => {
    state.onboarded = true;
    state.profile.phase = 'posparto';
    state.profile.birthDate = '2026-08-01';
    state.profile.babyName = 'Lia';
    state.profile.babyNames = ['Lia'];
  });

  const output = home.render();
  assert.match(output.html, /data-nav="crescimento-bebe"[\s\S]*Relatórios/);
  assert.doesNotMatch(output.html, /data-nav="relatorios"[\s\S]*Relatórios/);
});
