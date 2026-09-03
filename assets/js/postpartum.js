/** Registra o nascimento e ativa a experiência pós-parto/Florescer Baby. */
export function registerBirth(state, birthDate, now = Date.now()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate || '')) throw new Error('Informe uma data de nascimento válida.');
  state.profile.phase = 'posparto';
  state.profile.birthDate = birthDate;
  state.profile.birthRegisteredAt = now;
  return state.profile;
}

const BABY_PHASES = [
  { from: 0, period: 'Primeiros dias', emoji: '🤱', action: 'começar a reconhecer sua voz', detail: 'Vozes, cheiros e o contato próximo ajudam o bebê a se sentir seguro enquanto se adapta ao mundo fora do útero.' },
  { from: 14, period: 'Primeiro mês', emoji: '👀', action: 'acompanhar seu rosto por alguns instantes', detail: 'O olhar ainda é breve, mas rostos próximos e contrastes fortes podem chamar cada vez mais a atenção.' },
  { from: 42, period: 'Por volta de 6 semanas', emoji: '😊', action: 'sorrir quando você conversa', detail: 'Os primeiros sorrisos sociais podem surgir como resposta à sua voz, ao seu rosto e às brincadeiras.' },
  { from: 60, period: 'Por volta de 2 meses', emoji: '🧸', action: 'sustentar melhor a cabeça', detail: 'Durante momentos acordado e supervisionado de barriga para baixo, pescoço e ombros ficam mais fortes.' },
  { from: 90, period: 'Por volta de 3 meses', emoji: '🙌', action: 'alcançar objetos e dar risadinhas', detail: 'As mãos ficam mais ativas, e sons, brinquedos e expressões podem provocar novas reações.' },
  { from: 120, period: 'Por volta de 4 meses', emoji: '🔄', action: 'tentar rolar', detail: 'Alguns bebês começam a virar de barriga para cima ou para baixo. Mantenha atenção redobrada em superfícies altas.' },
  { from: 150, period: 'Por volta de 5 meses', emoji: '🪑', action: 'sentar com apoio', detail: 'O controle do tronco avança, e o bebê pode permanecer sentado por alguns instantes quando está bem apoiado.' },
  { from: 180, period: 'Por volta de 6 meses', emoji: '🧘', action: 'sentar sem apoio por alguns instantes', detail: 'O equilíbrio melhora aos poucos. Fique por perto e ofereça um espaço firme e seguro para praticar.' },
  { from: 210, period: 'Por volta de 7 meses', emoji: '🐛', action: 'buscar maneiras de se deslocar', detail: 'Pode arrastar, rolar, engatinhar ou criar outro jeito de chegar ao que deseja; nem todo bebê engatinha.' },
  { from: 240, period: 'Por volta de 8 meses', emoji: '👏', action: 'bater palmas e responder ao próprio nome', detail: 'Gestos, sons repetidos e brincadeiras de interação ganham espaço na comunicação.' },
  { from: 270, period: 'Por volta de 9 meses', emoji: '🧍', action: 'tentar ficar de pé com apoio', detail: 'Móveis firmes podem virar apoio para levantar. É uma boa fase para revisar a segurança da casa.' },
  { from: 300, period: 'Por volta de 10 meses', emoji: '🤏', action: 'pegar objetos pequenos com os dedos', detail: 'O movimento de pinça fica mais preciso, ajudando a explorar objetos de diferentes formas e texturas.' },
  { from: 330, period: 'Por volta de 11 meses', emoji: '👣', action: 'andar de lado segurando nos móveis', detail: 'Equilíbrio e força nas pernas continuam evoluindo enquanto o bebê explora apoios seguros.' },
  { from: 365, period: 'A partir de 1 ano', emoji: '🚶', action: 'dar os primeiros passos e dizer palavras simples', detail: 'Passos e palavras podem surgir em momentos diferentes. Conversar e permitir movimentos seguros favorece novas tentativas.' },
  { from: 450, period: 'Por volta de 15 meses', emoji: '⚽', action: 'andar com mais confiança', detail: 'A exploração aumenta, assim como a vontade de imitar gestos e participar das atividades da família.' },
  { from: 540, period: 'Por volta de 18 meses', emoji: '🏃', action: 'correr e apontar partes do corpo', detail: 'Movimento, compreensão e vocabulário avançam juntos durante brincadeiras e conversas do dia a dia.' },
  { from: 720, period: 'A partir de 2 anos', emoji: '💬', action: 'juntar palavras em frases curtas', detail: 'A linguagem e as brincadeiras de faz de conta se ampliam conforme a criança observa e interage.' },
];

/** Retorna uma referência de desenvolvimento adequada à idade do bebê em dias. */
export function babyPhaseGuide(days) {
  const ageDays = Number.isFinite(days) ? Math.max(0, Math.floor(days)) : 0;
  let phase = BABY_PHASES[0];
  for (const candidate of BABY_PHASES) {
    if (ageDays < candidate.from) break;
    phase = candidate;
  }
  return { ...phase };
}
