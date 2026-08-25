/** Conteúdo personalizado da tela exibida ao concluir o quiz. */
export function welcomeContent(profile = {}) {
  const firstName = String(profile.name || 'flor').trim().split(/\s+/)[0];

  if (profile.phase === 'gravida') {
    return {
      phase: 'gravida',
      icon: 'pregnant',
      label: 'Sua gestação, semana a semana',
      title: `Parabéns, ${firstName}!`,
      message: 'Hoje uma nova etapa da sua história começa. O Florescer continuará ao seu lado durante toda a sua gestação. Vamos viver cada semana juntas!',
    };
  }

  if (profile.phase === 'posparto') {
    const babyName = String(profile.babyName || '').trim();
    const baby = babyName || 'seu bebê';
    return {
      phase: 'posparto',
      icon: 'baby',
      label: 'Um novo capítulo de amor',
      title: `Bem-vinda a esta nova fase, ${firstName}!`,
      message: `Uma nova história floresceu na sua vida. O Florescer continuará ao seu lado para acompanhar ${baby}, acolher o seu pós-parto e cuidar de você em cada descoberta. Vamos viver cada dia juntas!`,
    };
  }

  return {
    phase: 'tentante',
    icon: 'seed',
    label: 'Sua jornada começa aqui',
    title: `Vamos florescer juntas, ${firstName}!`,
    message: 'Seu sonho merece cuidado, acolhimento e informação. O Florescer estará ao seu lado para ajudar você a conhecer melhor o seu ciclo e viver cada passo no seu tempo. Vamos caminhar juntas!',
  };
}
