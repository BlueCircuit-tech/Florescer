export const PREGNANCY_TEST_RESULTS = {
  positivo: 'Positivo',
  negativo: 'Negativo',
  inconclusivo: 'Inconclusivo',
};

/** Registra um teste e ativa a experiência de gestação quando ele é positivo. */
export function recordPregnancyTest(state, { date, result }, now = Date.now()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) throw new Error('Informe a data do teste.');
  if (!PREGNANCY_TEST_RESULTS[result]) throw new Error('Informe o resultado do teste.');

  const test = { id: `${date}-${now}`, date, result, createdAt: now };
  if (!Array.isArray(state.pregnancyTests)) state.pregnancyTests = [];
  state.pregnancyTests.unshift(test);
  if (result === 'positivo') state.profile.phase = 'gravida';
  return test;
}
