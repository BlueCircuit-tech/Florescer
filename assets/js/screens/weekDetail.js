/**
 * Página exclusiva de cada semana da gestação.
 * Reúne o desenvolvimento do bebê, o tamanho aproximado, o que ele já consegue
 * fazer, a curiosidade da semana e o que acontece com o corpo da mãe.
 */
import { getState } from '../store.js';
import { pregnancyInfo } from '../cycle.js';
import { pregnancyBabyWeek, pregnancyWeekGuide } from '../pregnancy.js';
import { icon } from '../icons.js';
import { emptyState, esc, note } from '../ui.js';

const trimesterOf = (week) => (week < 14 ? 1 : week < 28 ? 2 : 3);

function block(iconName, label, text, tone = '') {
  return `<article class="weekpage__block ${tone}">
    <div><b>${esc(label)}</b><p>${esc(text)}</p></div>
  </article>`;
}

export default {
  id: 'semana',
  tab: null,
  render(route = {}) {
    const state = getState();
    const preg = pregnancyInfo(state);

    if (state.profile.phase !== 'gravida' || !preg.known) {
      return {
        appbar: { title: 'Semana da gestação' },
        html: emptyState('pregnant', 'Acompanhamento indisponível', 'Complete os dados da gestação para abrir a página de cada semana.', { label: 'Completar perfil', to: 'perfil' }),
      };
    }

    const currentWeek = Math.max(1, Math.min(40, preg.weeks));
    const requested = Math.floor(Number(route.arg));
    // só liberamos semanas já vividas, como na lista Semana a Semana
    const week = Number.isFinite(requested) ? Math.max(1, Math.min(currentWeek, requested)) : currentWeek;

    const detail = pregnancyBabyWeek(week);
    const guide = week >= 4 ? pregnancyWeekGuide(week) : null;
    const isCurrent = week === currentWeek;

    const prev = week > 1 ? week - 1 : null;
    const next = week < currentWeek ? week + 1 : null;

    return {
      appbar: {
        title: `${week}ª semana`,
        sub: `${trimesterOf(week)}º trimestre${isCurrent ? ' · você está aqui' : ''}`,
        actions: [{ icon: 'calendar', label: 'Ver todas as semanas', to: 'semana-a-semana' }],
      },
      html: `<div class="section pb-24 stagger">
        <header class="weekpage__hero ${isCurrent ? 'weekpage__hero--current' : ''}">
          <span class="weekpage__emoji" aria-hidden="true">${detail.emoji}</span>
          <div class="grow">
            <span class="eyebrow">${isCurrent ? 'Sua semana agora' : 'Semana já vivida'}</span>
            <h1>${week}ª semana</h1>
            <p>${esc(detail.title)}</p>
          </div>
        </header>

        ${guide ? `<div class="weekpage__metrics">
          <div><span>Tamanho</span><b>${esc(guide.fruit)}</b></div>
          <div><span>Comprimento</span><b>${esc(guide.length)}</b></div>
          <div><span>Peso</span><b>${esc(guide.weight)}</b></div>
        </div>` : ''}

        <div class="section__head" style="padding:0"><h2>Desenvolvimento do bebê</h2></div>
        <div class="weekpage__blocks">
          ${block('baby', 'Como está crescendo', detail.growth, 'weekpage__block--growth')}
          ${block('flower', 'Quais órgãos estão se formando', detail.organs, 'weekpage__block--organs')}
          ${block('sparkle', week <= 2 ? 'O que acontece agora' : 'O que já consegue fazer', detail.ability, 'weekpage__block--ability')}
          ${block('info', 'Curiosidade', detail.curiosity, 'weekpage__block--curiosity')}
        </div>

        ${guide ? `
          <div class="section__head" style="padding:0"><h2>Você nesta semana</h2></div>
          <div class="weekpage__blocks">
            ${block('pregnant', 'O que pode acontecer com o seu corpo', guide.mother, 'weekpage__block--mother')}
            ${block('heart', 'Dica da semana', guide.tip, 'weekpage__block--tip')}
          </div>
          <button class="card card--link mt-12" data-nav="corpo-da-mae">
            <span class="floatcard__ico" style="background:var(--lilac-50);color:var(--lilac-600)">${icon('pregnant', 22)}</span>
            <span class="grow" style="text-align:left">
              <b style="display:block;font-size:var(--fs-14)">Mudanças no corpo da mãe</b>
              <span class="fs-12 muted" style="display:block;margin-top:3px">Sintomas, hormônios, barriga e emoções desta fase</span>
            </span>
            <span style="color:var(--faint);flex:none">${icon('chevron', 18)}</span>
          </button>` : ''}

        <nav class="weekpage__nav" aria-label="Navegar entre as semanas">
          ${prev
            ? `<button class="weekpage__navbtn" data-nav="semana/${prev}">${icon('back', 17)}<span><small>Anterior</small><b>${prev}ª semana</b></span></button>`
            : '<span class="weekpage__navbtn weekpage__navbtn--off"><span><small>Anterior</small><b>—</b></span></span>'}
          ${next
            ? `<button class="weekpage__navbtn weekpage__navbtn--next" data-nav="semana/${next}"><span><small>Próxima</small><b>${next}ª semana</b></span>${icon('chevron', 17)}</button>`
            : '<span class="weekpage__navbtn weekpage__navbtn--off"><span><small>Próxima</small><b>em breve</b></span></span>'}
        </nav>

        ${note('Medidas e marcos são referências educativas: cada bebê cresce no seu ritmo. Quem acompanha a sua gestação é a sua equipe de pré-natal.')}
      </div>`,
    };
  },
};
