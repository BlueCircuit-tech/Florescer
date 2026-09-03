import { getState } from '../store.js';
import { pregnancyInfo, plural } from '../cycle.js';
import { pregnancyBabyWeek } from '../pregnancy.js';
import { icon } from '../icons.js';
import { emptyState, esc, note } from '../ui.js';

function weekCard(week, currentWeek) {
  const detail = pregnancyBabyWeek(week);
  const current = week === currentWeek;
  const row = (ic, label, text, tone = '') => `<div class="weekstory__row ${tone}">
    <span class="weekstory__ico">${icon(ic, 18)}</span>
    <div><b>${esc(label)}</b><p>${esc(text)}</p></div>
  </div>`;

  return `<details class="weekstory ${current ? 'weekstory--current' : ''}" data-week="${week}" ${current ? 'open' : ''}>
    <summary>
      <span class="weekstory__number">${week}</span>
      <span class="grow"><b>${week}ª semana${current ? ' · agora' : ''}</b><small>${esc(detail.title)}</small></span>
      ${icon('chevronDown', 18)}
    </summary>
    <div class="weekstory__body">
      <div class="weekstory__growth"><span aria-hidden="true">${detail.emoji}</span><div><b>Como está crescendo</b><p>${esc(detail.growth)}</p></div></div>
      ${row('baby', 'Formação e desenvolvimento', detail.organs, 'weekstory__row--organs')}
      ${row('sparkle', week <= 2 ? 'O que acontece agora' : 'O que já consegue fazer', detail.ability, 'weekstory__row--ability')}
      ${row('info', 'Curiosidade da semana', detail.curiosity, 'weekstory__row--curiosity')}
    </div>
  </details>`;
}

export default {
  id: 'semana-a-semana',
  tab: null,
  render() {
    const state = getState();
    const preg = pregnancyInfo(state);
    if (state.profile.phase !== 'gravida' || !preg.known) {
      return {
        appbar: { title: 'Semana a Semana' },
        html: emptyState('pregnant', 'Acompanhamento indisponível', 'Complete os dados da gestação para acompanhar o desenvolvimento semana a semana.', { label: 'Completar perfil', to: 'perfil' }),
      };
    }

    const currentWeek = Math.max(1, Math.min(40, preg.weeks));
    const weeks = Array.from({ length: currentWeek }, (_, index) => currentWeek - index);

    return {
      appbar: { title: 'Semana a Semana', sub: `Até a ${currentWeek}ª semana` },
      html: `<div class="section pb-24">
        <div class="weekly-intro">
          <span class="weekly-intro__emoji" aria-hidden="true">${preg.guide.emoji}</span>
          <div><span class="eyebrow">Sua gestação agora</span><h1>${currentWeek}ª semana</h1><p>${plural(currentWeek, 'semana acompanhada', 'semanas acompanhadas')}</p></div>
        </div>
        ${note('Aqui aparecem somente a semana atual e as anteriores. As medidas e os marcos são referências educativas e podem variar em cada gestação.')}
        <div class="section__head" style="padding:0"><h2>Desenvolvimento do bebê</h2></div>
        <div class="weekstory-list">${weeks.map((week) => weekCard(week, currentWeek)).join('')}</div>
      </div>`,
    };
  },
};
