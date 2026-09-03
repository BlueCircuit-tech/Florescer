import { getState } from '../store.js';
import { babyNamesFromProfile, formatBabyNames } from '../babies.js';
import { postpartumInfo } from '../cycle.js';
import { babyFeedingGuide } from '../babyFeeding.js';
import { icon } from '../icons.js';
import { emptyState, esc, note } from '../ui.js';

const TABS = [
  ['inicio', 'Quando iniciar'],
  ['introducao', 'Introdução alimentar'],
  ['receitas', 'Receitinhas fáceis'],
  ['liberados', 'Alimentos liberados'],
  ['evitar', 'Alimentos proibidos'],
];

const list = (items, iconName = 'check') => `<div class="feeding-list ${iconName === 'close' ? 'feeding-list--avoid' : ''}">${items.map((item) => `<div><span>${icon(iconName, 17)}</span><p>${esc(item)}</p></div>`).join('')}</div>`;

function tabContent(tab, guide) {
  if (tab === 'inicio') return `
    <div class="feeding-section__head"><span>${icon('clock', 21)}</span><div><h2>Quando iniciar</h2><p>${esc(guide.status)}</p></div></div>
    <div class="card"><p class="feeding-copy">${esc(guide.when)}</p></div>
    <div class="section__head" style="padding:0"><h2>Sinais de prontidão</h2></div>
    ${list(guide.signs, 'sparkle')}`;

  if (tab === 'introducao') return `
    <div class="feeding-section__head"><span>${icon('baby', 21)}</span><div><h2>Introdução alimentar</h2><p>${esc(guide.period)}</p></div></div>
    ${list(guide.introduction, 'leaf')}
    ${note('Engasgo é diferente de reflexo de gag. O bebê deve comer sentado, acordado e sempre sob supervisão próxima. Procure orientação para aprender primeiros socorros.')}`;

  if (tab === 'receitas') return `
    <div class="feeding-section__head"><span>${icon('note', 21)}</span><div><h2>Receitinhas fáceis</h2><p>Preparações adequadas para ${esc(guide.period.toLowerCase())}</p></div></div>
    ${guide.recipes.length ? `<div class="feeding-recipes">${guide.recipes.map((recipe) => `<article class="card feeding-recipe">
      <span class="feeding-recipe__ico">${icon('leaf', 19)}</span><div><h3>${esc(recipe.title)}</h3><b>Ingredientes</b><p>${esc(recipe.ingredients)}</p><b>Como preparar</b><p>${esc(recipe.preparation)}</p></div>
    </article>`).join('')}</div>` : `<div class="card feeding-wait"><span>${icon('clock', 24)}</span><b>Receitas só depois do início alimentar</b><p>Até cerca de 6 meses, mantenha leite materno e/ou fórmula e converse com o pediatra antes de oferecer outros alimentos.</p></div>`}`;

  if (tab === 'liberados') return `
    <div class="feeding-section__head"><span>${icon('check', 21)}</span><div><h2>Alimentos liberados</h2><p>Opções seguras para a fase atual</p></div></div>
    ${list(guide.allowed, 'check')}`;

  return `
    <div class="feeding-section__head feeding-section__head--avoid"><span>${icon('close', 21)}</span><div><h2>Alimentos proibidos ou a evitar</h2><p>Restrições e riscos importantes nesta idade</p></div></div>
    ${list(guide.avoid, 'close')}`;
}

export default {
  id: 'alimentacao-bebe',
  tab: null,
  render(route = { params: {} }) {
    const state = getState();
    const age = postpartumInfo(state);
    if (state.profile.phase !== 'posparto' || !age.known) {
      return {
        appbar: { title: 'Alimentação do bebê' },
        html: emptyState('leaf', 'Guia indisponível', 'Registre o nascimento para receber orientações conforme a idade do bebê.', { label: 'Ver perfil', to: 'perfil' }),
      };
    }

    const selected = TABS.some(([id]) => id === route.params.guia) ? route.params.guia : 'inicio';
    const guide = babyFeedingGuide(age.days, age.months);
    const names = babyNamesFromProfile(state.profile);
    const subject = names.length ? formatBabyNames(names) : 'Seu bebê';

    return {
      appbar: { title: 'Alimentação do bebê', sub: `${subject} · ${age.age}` },
      html: `<div class="section pb-24">
        <div class="feeding-hero">
          <span class="feeding-hero__ico">${icon('leaf', 25)}</span>
          <div><span class="eyebrow">Guia para a idade atual</span><h1>${esc(guide.period)}</h1><p>${esc(guide.status)}</p></div>
        </div>
        <div class="feeding-tabs" role="tablist" aria-label="Guias de alimentação">
          ${TABS.map(([id, label]) => `<button role="tab" aria-selected="${selected === id}" data-nav="alimentacao-bebe?guia=${id}">${esc(label)}</button>`).join('')}
        </div>
        <section class="feeding-panel" role="tabpanel">${tabContent(selected, guide)}</section>
        <div class="note mt-16">${icon('shield', 17)}<span>Orientação educativa baseada na idade. Prematuridade, alergias, dificuldades para engolir, baixo ganho de peso e outras condições exigem acompanhamento individual com pediatra ou nutricionista.</span></div>
      </div>`,
    };
  },
};
