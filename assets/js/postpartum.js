/** Registra o nascimento e ativa a experiência pós-parto/Florescer Baby. */
export function registerBirth(state, birthDate, now = Date.now()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate || '')) throw new Error('Informe uma data de nascimento válida.');
  state.profile.phase = 'posparto';
  state.profile.birthDate = birthDate;
  state.profile.birthRegisteredAt = now;
  return state.profile;
}
