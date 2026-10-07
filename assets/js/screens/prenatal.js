/**
 * Calendário inteligente da gestação.
 * Mostra o plano de pré-natal já organizado por idade gestacional e permite
 * levar cada etapa para a agenda com um toque.
 */
import { getState, update, addJourney } from '../store.js';
import { icon } from '../icons.js';
import { emptyState, esc, haptic, note, toast } from '../ui.js';
import { navigate } from '../router.js';
import { fmtShort, pregnancyInfo, plural } from '../cycle.js';
import { saveScheduledEvent } from '../planner.js';
import { syncNotices } from '../notify.js';
import {
  PRENATAL_GROUPS, PRENATAL_STATUS,
  prenatalNextSteps, prenatalPlan, prenatalProgress, prenatalStepToEvent,
} from '../prenatal.js';

const rerender = () => import('../router.js').then((m) => m.render());

function statusPill(status) {
  const meta = PRENATAL_STATUS[status];
  return `<span class="pill pill--${meta.tone}">${esc(meta.label)}</span>`;
}

function stepRow(step) {
  const scheduled = step.event ? `Agendado para ${fmtShort(step.event.date)}` : `Sugestão: ${fmtShort(step.suggestedDate)}`;
  return `<article class="planstep planstep--${step.status}">
    <div class="planstep__head">
      <span class="grow">
        <b>${esc(step.title)}</b>
        <small>${esc(step.window)}</small>
      </span>
      ${statusPill(step.status)}
    </div>
    <p class="planstep__note">${esc(step.note)}</p>
    <div class="planstep__foot">
      <span class="planstep__date">${icon('calendar', 15)} ${esc(scheduled)}</span>
      ${step.event
        ? `<button class="planstep__btn" data-nav="agenda?id=${encodeURIComponent(step.event.id)}">${icon('edit', 15)} Ajustar</button>`
        : `<button class="planstep__btn planstep__btn--add" data-add="${step.id}">${icon('plus', 15)} Agendar</button>`}
    </div>
  </article>`;
}

export default {
  id: 'pre-natal',
  tab: null,
  render() {
    const state = getState();
    const preg = pregnancyInfo(state);

    if (state.profile.phase !== 'gravida' || !preg.known) {
      return {
        appbar: { title: 'Calendário inteligente' },
        html: emptyState(
          'calendar',
          'Plano indisponível',
          'Informe a data provável do parto para montarmos o calendário do seu pré-natal.',
          { label: 'Completar perfil', to: 'perfil' },
        ),
      };
    }

    const plan = prenatalPlan(state, preg);
    const next = prenatalNextSteps(plan);
    const progress = prenatalProgress(plan);

    const groups = PRENATAL_GROUPS.map((group) => {
      const steps = plan.filter((step) => step.type === group.id).sort((a, b) => a.from - b.from);
      if (!steps.length) return '';
      const pending = steps.filter((step) => step.status === 'late' || step.status === 'now').length;
      return `<details class="plangroup" ${pending ? 'open' : ''}>
        <summary>
          <span class="plangroup__ico">${icon(group.icon, 19)}</span>
          <span class="grow">
            <b>${esc(group.label)}</b>
            <small>${esc(group.intro)}</small>
          </span>
          ${pending ? `<span class="plangroup__badge">${pending}</span>` : ''}
          ${icon('chevronDown', 18)}
        </summary>
        <div class="plangroup__body">${steps.map(stepRow).join('')}</div>
      </details>`;
    }).join('');

    return {
      appbar: {
        title: 'Calendário inteligente',
        sub: `${preg.weeks}ª semana · ${preg.trimester}º trimestre`,
        actions: [{ icon: 'plus', label: 'Novo compromisso', to: 'agenda' }],
      },
      html: `<div class="section pb-24 stagger">
        <div class="planhero">
          <span class="planhero__ico">${icon('calendar', 22)}</span>
          <div class="grow">
            <b>Seu pré-natal organizado</b>
            <p>${progress.handled} de ${plural(progress.due, 'etapa já no seu calendário', 'etapas já no seu calendário')}</p>
            <div class="planhero__bar"><i style="width:${Math.round(progress.ratio * 100)}%"></i></div>
          </div>
        </div>

        ${next.length ? `
          <div class="section__head" style="padding:0"><h2>Para resolver agora</h2></div>
          <div class="stack-12">${next.map(stepRow).join('')}</div>` : `
          ${note('Tudo que já era para acontecer até a ' + preg.weeks + 'ª semana está no seu calendário.')}`}

        <div class="section__head" style="padding:0"><h2>Plano completo</h2></div>
        <div class="plangroups">${groups}</div>

        ${note('Este plano segue as recomendações gerais do pré-natal de baixo risco. Sua equipe pode pedir mais exames, antecipar consultas ou seguir um calendário próprio — o que ela orientar vale mais do que esta lista.')}
      </div>`,

      mount(root) {
        root.querySelectorAll('[data-add]').forEach((button) => {
          button.onclick = async () => {
            const step = plan.find((item) => item.id === button.dataset.add);
            if (!step) return;
            try {
              update((current) => saveScheduledEvent(current, prenatalStepToEvent(step)));
            } catch (error) {
              toast(error.message);
              return;
            }
            addJourney('calendar', 'Comecei a organizar o pré-natal', 'primeira etapa levada para o calendário');
            syncNotices();
            haptic(14);
            toast(`${step.title} foi para o seu calendário.`);
            rerender();
          };
        });
      },
    };
  },
};
