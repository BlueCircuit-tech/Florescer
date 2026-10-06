/**
 * Linha do tempo do ciclo.
 * Mostra as fases do ciclo atual em ordem, com os dias de cada uma e uma
 * explicação simples do que acontece no corpo em cada etapa.
 */
import { getState } from '../store.js';
import { cycleInfo, PHASES, addDays, diffDays, fmtShort, plural, today } from '../cycle.js';
import { cyclePhaseGuide } from '../fertility.js';
import { icon } from '../icons.js';
import { emptyState, esc, note } from '../ui.js';

/**
 * Divide o ciclo em etapas com o intervalo de dias de cada uma.
 * Os limites vêm do mesmo motor que alimenta o calendário.
 */
export function cycleStages(info) {
  if (!info.known) return [];
  const length = info.avgLength;
  const ovulationDay = diffDays(info.ovulation, info.cycleStart) + 1;
  const fertileStartDay = diffDays(info.fertileStart, info.cycleStart) + 1;
  const fertileEndDay = diffDays(info.fertileEnd, info.cycleStart) + 1;

  const stages = [
    { phase: 'menstrual', from: 1, to: info.periodLength },
    { phase: 'follicular', from: info.periodLength + 1, to: fertileStartDay - 1 },
    { phase: 'fertile', from: fertileStartDay, to: ovulationDay - 1 },
    { phase: 'ovulation', from: ovulationDay, to: ovulationDay },
    { phase: 'luteal', from: ovulationDay + 1, to: length },
  ];

  return stages
    .filter((stage) => stage.to >= stage.from)
    .map((stage) => ({
      ...stage,
      meta: PHASES[stage.phase],
      guide: cyclePhaseGuide(stage.phase),
      startDate: addDays(info.cycleStart, stage.from - 1),
      endDate: addDays(info.cycleStart, stage.to - 1),
      current: info.dayOfCycle >= stage.from && info.dayOfCycle <= stage.to,
      done: info.dayOfCycle > stage.to,
      // a janela fértil engloba a ovulação; marcamos para explicar na tela
      overlapsFertile: stage.phase === 'ovulation' && fertileEndDay >= ovulationDay,
    }));
}

const dayLabel = (stage) => (stage.from === stage.to
  ? `Dia ${stage.from}`
  : `Dias ${stage.from} a ${stage.to}`);

export default {
  id: 'linha-do-tempo',
  tab: null,
  render() {
    const state = getState();
    const info = cycleInfo(state);

    if (state.profile.phase !== 'tentante' || !info.known) {
      return {
        appbar: { title: 'Linha do tempo do ciclo' },
        html: emptyState(
          'flower',
          'Linha do tempo indisponível',
          'Informe a data da sua última menstruação para acompanharmos as fases do seu ciclo.',
          { label: 'Completar perfil', to: 'perfil' },
        ),
      };
    }

    const stages = cycleStages(info);
    const progress = Math.round((info.dayOfCycle / info.avgLength) * 100);

    return {
      appbar: {
        title: 'Linha do tempo do ciclo',
        sub: `Dia ${info.dayOfCycle} de ${info.avgLength} · ${PHASES[info.phase].label.toLowerCase()}`,
        actions: [{ icon: 'calendar', label: 'Ver calendário', to: 'ciclo' }],
      },
      html: `<div class="section pb-24 stagger">
        <header class="timeline__hero">
          <div class="row" style="gap:12px">
            <span class="timeline__heroico">${icon(PHASES[info.phase].icon, 22)}</span>
            <div class="grow">
              <span class="eyebrow">Você está aqui</span>
              <b>Dia ${info.dayOfCycle} · ${esc(PHASES[info.phase].label)}</b>
              <p>Ciclo iniciado em ${fmtShort(info.cycleStart)} · ${plural(info.avgLength, 'dia estimado', 'dias estimados')}</p>
            </div>
          </div>
          <div class="timeline__track" role="img" aria-label="Progresso de ${progress}% do ciclo">
            <i style="width:${Math.min(100, progress)}%"></i>
          </div>
        </header>

        <div class="section__head" style="padding:0"><h2>O que acontece em cada fase</h2></div>
        <ol class="timeline">
          ${stages.map((stage) => `
            <li class="timeline__item ${stage.current ? 'timeline__item--current' : ''} ${stage.done ? 'timeline__item--done' : ''}">
              <span class="timeline__dot" style="--dot:${stage.meta.color}">${icon(stage.meta.icon, 15)}</span>
              <article class="timeline__card">
                <header class="timeline__head">
                  <span class="grow">
                    <b>${esc(stage.meta.label)}</b>
                    <small>${dayLabel(stage)} · ${fmtShort(stage.startDate)}${stage.from === stage.to ? '' : ` a ${fmtShort(stage.endDate)}`}</small>
                  </span>
                  ${stage.current ? '<span class="pill pill--rose">agora</span>' : ''}
                </header>
                <p class="timeline__body">${esc(stage.guide.body)}</p>
                <div class="timeline__rows">
                  <div><span>${icon('heart', 15)}</span><p><b>O que você pode notar:</b> ${esc(stage.guide.notice)}</p></div>
                  <div><span>${icon('info', 15)}</span><p><b>Para lembrar:</b> ${esc(stage.guide.care)}</p></div>
                </div>
              </article>
            </li>`).join('')}
        </ol>

        ${note('As datas são estimativas do seu histórico e mudam a cada ciclo registrado. A janela fértil inclui o dia da ovulação e os dias anteriores, quando a chance de gravidez é maior.')}
      </div>`,
    };
  },
};
