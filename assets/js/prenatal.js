/**
 * Plano de pré-natal montado automaticamente a partir da idade gestacional.
 *
 * Referências editoriais: Linha de Cuidado do Pré-natal de Baixo Risco e
 * Caderneta da Gestante (Ministério da Saúde) e calendário vacinal da gestante
 * do Programa Nacional de Imunizações.
 *
 * São sugestões educativas de organização. Quem define quais consultas, exames
 * e vacinas valem para cada gestação é a equipe de pré-natal — gestações de
 * alto risco costumam seguir um calendário próprio.
 */
import { addDays, diffDays, fromKey, today } from './cycle.js';

export const PRENATAL_GROUPS = [
  { id: 'prenatal', label: 'Consultas de pré-natal', icon: 'pregnant', intro: 'Mensais até a 28ª semana, quinzenais até a 36ª e semanais a partir daí.' },
  { id: 'ultrasound', label: 'Ultrassons', icon: 'baby', intro: 'As janelas abaixo são as mais usadas; sua equipe pode pedir outros exames.' },
  { id: 'lab', label: 'Exames laboratoriais', icon: 'test', intro: 'Costumam ser repetidos a cada trimestre para acompanhar você e o bebê.' },
  { id: 'vaccine', label: 'Vacinas da gestante', icon: 'shield', intro: 'Protegem você e passam anticorpos para o bebê. Leve sempre a caderneta.' },
  { id: 'vitamin', label: 'Vitaminas e suplementos', icon: 'leaf', intro: 'A dose e o período são definidos na consulta. Aqui ficam só os lembretes.' },
];

/** Ritmo de consultas recomendado pelo Ministério da Saúde. */
const CONSULTATION_WEEKS = [8, 12, 16, 20, 24, 28, 30, 32, 34, 36, 37, 38, 39, 40];

const consultationSteps = () => CONSULTATION_WEEKS.map((week, index) => ({
  id: `consulta-${week}`,
  type: 'prenatal',
  title: index === 0 ? '1ª consulta de pré-natal' : `Consulta de pré-natal · ${week}ª semana`,
  from: week,
  to: Math.min(40, week + (week < 28 ? 3 : week < 36 ? 1 : 0)),
  note: index === 0
    ? 'Quanto mais cedo começar, melhor. Leve documentos, histórico de saúde e dúvidas anotadas.'
    : week >= 36
      ? 'No fim da gestação as consultas ficam semanais e avaliam sinais de trabalho de parto.'
      : 'Avalia pressão, peso, altura uterina, batimentos do bebê e os exames já realizados.',
  reminderDays: 1,
}));

const FIXED_STEPS = [
  /* ---------- ultrassons ---------- */
  {
    id: 'usg-datacao', type: 'ultrasound', title: 'Ultrassom de datação',
    from: 6, to: 12, reminderDays: 1,
    note: 'Confirma a idade gestacional, o número de bebês e os batimentos cardíacos.',
  },
  {
    id: 'usg-morfologico-1', type: 'ultrasound', title: 'Morfológico do 1º trimestre',
    from: 11, to: 14, reminderDays: 2,
    note: 'Inclui a medida da translucência nucal. A janela entre 11 e 14 semanas não se repete.',
  },
  {
    id: 'usg-morfologico-2', type: 'ultrasound', title: 'Morfológico do 2º trimestre',
    from: 20, to: 24, reminderDays: 2,
    note: 'Avalia em detalhe a formação dos órgãos do bebê. É o ultrassom mais completo da gestação.',
  },
  {
    id: 'usg-crescimento', type: 'ultrasound', title: 'Ultrassom de crescimento',
    from: 28, to: 32, reminderDays: 1,
    note: 'Acompanha o ganho de peso do bebê, a placenta e o líquido amniótico.',
  },
  {
    id: 'usg-final', type: 'ultrasound', title: 'Ultrassom de avaliação final',
    from: 36, to: 38, reminderDays: 1,
    note: 'Verifica a posição do bebê e ajuda no planejamento do parto.',
  },

  /* ---------- exames laboratoriais ---------- */
  {
    id: 'lab-1tri', type: 'lab', title: 'Exames do 1º trimestre',
    from: 4, to: 12, reminderDays: 2,
    note: 'Hemograma, tipagem sanguínea e fator Rh, glicemia de jejum, sífilis, HIV, hepatite B, toxoplasmose, urina e urocultura.',
  },
  {
    id: 'lab-totg', type: 'lab', title: 'Teste de tolerância à glicose (TOTG 75 g)',
    from: 24, to: 28, reminderDays: 2,
    note: 'Rastreia o diabetes gestacional. Exige jejum e algumas horas no laboratório — organize o dia.',
  },
  {
    id: 'lab-2tri', type: 'lab', title: 'Exames do 2º trimestre',
    from: 24, to: 28, reminderDays: 2,
    note: 'Repete hemograma, sífilis e HIV. Quem é Rh negativo costuma repetir o Coombs indireto.',
  },
  {
    id: 'lab-3tri', type: 'lab', title: 'Exames do 3º trimestre',
    from: 30, to: 36, reminderDays: 2,
    note: 'Nova rodada de hemograma, sífilis, HIV, hepatite B e urina antes do parto.',
  },
  {
    id: 'lab-estrepto', type: 'lab', title: 'Pesquisa de estreptococo do grupo B',
    from: 35, to: 37, reminderDays: 2,
    note: 'Coleta simples (vaginal e retal) que orienta o uso de antibiótico no trabalho de parto.',
  },

  /* ---------- vacinas ---------- */
  {
    id: 'vac-dtpa', type: 'vaccine', title: 'dTpa — difteria, tétano e coqueluche',
    from: 20, to: 36, reminderDays: 2,
    note: 'Indicada em toda gestação, a partir da 20ª semana. Protege o bebê da coqueluche nos primeiros meses.',
  },
  {
    id: 'vac-influenza', type: 'vaccine', title: 'Influenza (gripe)',
    from: 4, to: 40, reminderDays: 2,
    note: 'Pode ser aplicada em qualquer idade gestacional, durante a campanha anual.',
  },
  {
    id: 'vac-hepatite-b', type: 'vaccine', title: 'Hepatite B',
    from: 4, to: 40, reminderDays: 2,
    note: 'Três doses, se o seu esquema ainda não estiver completo. Confira a caderneta.',
  },
  {
    id: 'vac-covid', type: 'vaccine', title: 'COVID-19',
    from: 4, to: 40, reminderDays: 2,
    note: 'Siga a recomendação vigente para gestantes no seu município.',
  },

  /* ---------- vitaminas ---------- */
  {
    id: 'vit-folico', type: 'vitamin', title: 'Ácido fólico',
    from: 4, to: 12, recurrence: 'daily', durationDays: 60, reminderDays: 0,
    note: 'Em geral diário até o fim do 1º trimestre. A dose é definida pela sua equipe.',
  },
  {
    id: 'vit-ferro', type: 'vitamin', title: 'Sulfato ferroso',
    from: 20, to: 40, recurrence: 'daily', durationDays: 120, reminderDays: 0,
    note: 'Costuma ser indicado a partir da 20ª semana e seguir no pós-parto, conforme prescrição.',
  },
];

export const PRENATAL_STEPS = [...consultationSteps(), ...FIXED_STEPS];

export const prenatalStepById = (id) => PRENATAL_STEPS.find((step) => step.id === id) || null;

/** "Entre a 20ª e a 24ª semana", "Até a 12ª semana", "A partir da 20ª semana". */
export function prenatalWindowLabel(step) {
  if (step.from <= 4 && step.to >= 40) return 'Em qualquer fase da gestação';
  if (step.from <= 4) return `Até a ${step.to}ª semana`;
  if (step.to >= 40) return `A partir da ${step.from}ª semana`;
  if (step.from === step.to) return `Na ${step.from}ª semana`;
  return `Entre a ${step.from}ª e a ${step.to}ª semana`;
}

const STATUS_ORDER = { late: 0, now: 1, scheduled: 2, upcoming: 3, done: 4 };

export const PRENATAL_STATUS = {
  late: { label: 'Em atraso', tone: 'rose' },
  now: { label: 'É agora', tone: 'leaf' },
  scheduled: { label: 'Agendado', tone: 'lilac' },
  upcoming: { label: 'Mais adiante', tone: 'gray' },
  done: { label: 'Concluído', tone: 'gray' },
};

/**
 * Monta o plano com datas sugeridas e o estado de cada etapa.
 * @param {object} state estado do app (usa calendarEvents para saber o que já foi agendado)
 * @param {object} preg resultado de pregnancyInfo()
 * @param {Date} [ref] data de referência
 */
export function prenatalPlan(state, preg, ref = today()) {
  if (!preg?.known) return [];
  const conception = addDays(preg.due, -280);
  const week = preg.weeks;
  const events = (state?.calendarEvents || []).filter((event) => event.planId);

  return PRENATAL_STEPS.map((step) => {
    const windowStart = addDays(conception, step.from * 7);
    const event = events.find((item) => item.planId === step.id) || null;

    let status;
    if (event) status = diffDays(fromKey(event.date), ref) < 0 ? 'done' : 'scheduled';
    else if (week < step.from) status = 'upcoming';
    else if (week > step.to) status = 'late';
    else status = 'now';

    // antes da janela, sugere o primeiro dia dela; dentro ou depois, sugere hoje
    const suggestedDate = diffDays(windowStart, ref) > 0 ? windowStart : ref;

    return {
      ...step,
      window: prenatalWindowLabel(step),
      windowStart,
      suggestedDate,
      status,
      event,
    };
  }).sort((a, b) => (STATUS_ORDER[a.status] - STATUS_ORDER[b.status]) || (a.from - b.from));
}

/** Etapas que pedem atenção agora: atrasadas ou dentro da janela, ainda sem agendamento. */
export function prenatalNextSteps(plan, limit = 4) {
  return plan.filter((step) => step.status === 'late' || step.status === 'now').slice(0, limit);
}

export function prenatalProgress(plan) {
  const handled = plan.filter((step) => step.status === 'done' || step.status === 'scheduled').length;
  const due = plan.filter((step) => step.status !== 'upcoming').length;
  return { handled, due, total: plan.length, ratio: due ? handled / due : 0 };
}

/** Converte uma etapa do plano em entrada para saveScheduledEvent(). */
export function prenatalStepToEvent(step, { date } = {}) {
  const start = date || step.suggestedDate || today();
  const base = {
    planId: step.id,
    phase: 'gravida',
    type: step.type,
    title: step.title,
    date: typeof start === 'string' ? start : toKeySafe(start),
    reminderDays: step.reminderDays ?? 1,
    notes: step.note,
  };
  if (step.recurrence === 'daily') {
    base.recurrence = 'daily';
    base.endDate = toKeySafe(addDays(typeof start === 'string' ? fromKey(start) : start, step.durationDays || 30));
  }
  return base;
}

function toKeySafe(date) {
  const x = date instanceof Date ? date : fromKey(date);
  const month = String(x.getMonth() + 1).padStart(2, '0');
  const day = String(x.getDate()).padStart(2, '0');
  return `${x.getFullYear()}-${month}-${day}`;
}
