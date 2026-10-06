/**
 * Alimentação na gestação — o que comer, o que evitar, suplementos e receitas.
 * Reaproveita a linguagem visual do guia de alimentação do bebê.
 */
import { getState } from '../store.js';
import { pregnancyInfo } from '../cycle.js';
import { pregnancyNutritionGuide } from '../pregnancyNutrition.js';
import { icon } from '../icons.js';
import { emptyState, esc, note } from '../ui.js';

const TABS = [
  ['fase', 'Nesta fase'],
  ['liberados', 'Alimentos liberados'],
  ['evitar', 'Alimentos proibidos'],
  ['suplementos', 'Suplementos'],
  ['receitas', 'Receitinhas fáceis'],
];

const list = (items, iconName = 'check') => `<div class="feeding-list ${iconName === 'close' ? 'feeding-list--avoid' : ''}">${
  items.map((item) => `<div><span>${icon(iconName, 17)}</span><p>${esc(item)}</p></div>`).join('')
}</div>`;

function tabContent(tab, guide) {
  if (tab === 'fase') return `
    <div class="feeding-section__head"><span>${icon('leaf', 21)}</span><div><h2>Nesta fase</h2><p>${esc(guide.status)}</p></div></div>
    <div class="card"><p class="feeding-copy">${esc(guide.focus)}</p></div>
    <div class="section__head" style="padding:0"><h2>O que ajuda agora</h2></div>
    ${list(guide.tips, 'sparkle')}
    <div class="note mt-16">${icon('info', 17)}<span>${esc(guide.hydration)}</span></div>`;

  if (tab === 'liberados') return `
    <div class="feeding-section__head"><span>${icon('check', 21)}</span><div><h2>Alimentos liberados</h2><p>Para incluir ao longo da semana</p></div></div>
    ${list(guide.allowed, 'check')}
    ${note('Não existe alimento obrigatório: o que conta é a variedade ao longo dos dias. Restrições alimentares, alergias e vegetarianismo pedem acompanhamento de nutricionista.')}`;

  if (tab === 'evitar') return `
    <div class="feeding-section__head feeding-section__head--avoid"><span>${icon('close', 21)}</span><div><h2>Alimentos proibidos ou a evitar</h2><p>Riscos de infecção e substâncias que atravessam a placenta</p></div></div>
    ${list(guide.avoid, 'close')}
    ${note('A maior parte dessas restrições existe por risco de listeria, toxoplasmose e salmonela — infecções que são leves para você e podem ser graves para o bebê.')}`;

  if (tab === 'suplementos') return `
    <div class="feeding-section__head"><span>${icon('test', 21)}</span><div><h2>Suplementos</h2><p>O que costuma ser prescrito e por quê</p></div></div>
    <div class="feeding-list">${guide.supplements.map((item) => `
      <div><span>${icon('leaf', 17)}</span><p><b>${esc(item.name)}</b> — ${esc(item.text)}</p></div>`).join('')}</div>
    ${note('Nenhum suplemento deve ser iniciado por conta própria, nem mesmo os vendidos sem receita. Doses erradas de vitamina A e de iodo, por exemplo, trazem risco ao bebê.')}`;

  return `
    <div class="feeding-section__head"><span>${icon('note', 21)}</span><div><h2>Receitinhas fáceis</h2><p>Preparações simples para os dias corridos</p></div></div>
    <div class="feeding-recipes">${guide.recipes.map((recipe) => `
      <article class="card feeding-recipe">
        <span class="feeding-recipe__ico">${icon('leaf', 19)}</span>
        <div>
          <h3>${esc(recipe.title)}</h3>
          <span class="pill pill--leaf">${esc(recipe.note)}</span>
          <b>Ingredientes</b><p>${esc(recipe.ingredients)}</p>
          <b>Como preparar</b><p>${esc(recipe.preparation)}</p>
        </div>
      </article>`).join('')}</div>`;
}

export default {
  id: 'alimentacao-gestante',
  tab: null,
  render(route = { params: {} }) {
    const state = getState();
    const preg = pregnancyInfo(state);

    if (state.profile.phase !== 'gravida' || !preg.known) {
      return {
        appbar: { title: 'Alimentação na gestação' },
        html: emptyState('leaf', 'Guia indisponível', 'Informe os dados da gestação para receber orientações conforme a sua fase.', { label: 'Completar perfil', to: 'perfil' }),
      };
    }

    const selected = TABS.some(([id]) => id === route.params?.guia) ? route.params.guia : 'fase';
    const guide = pregnancyNutritionGuide(preg.weeks);

    return {
      appbar: { title: 'Alimentação na gestação', sub: `${preg.weeks}ª semana · ${guide.period}` },
      html: `<div class="section pb-24">
        <div class="feeding-hero">
          <span class="feeding-hero__ico">${icon('leaf', 25)}</span>
          <div><span class="eyebrow">Guia da sua fase</span><h1>${esc(guide.period)}</h1><p>${esc(guide.status)}</p></div>
        </div>
        <div class="feeding-tabs" role="tablist" aria-label="Guias de alimentação na gestação">
          ${TABS.map(([id, label]) => `<button role="tab" aria-selected="${selected === id}" data-nav="alimentacao-gestante?guia=${id}">${esc(label)}</button>`).join('')}
        </div>
        <section class="feeding-panel" role="tabpanel">${tabContent(selected, guide)}</section>
        <div class="note mt-16">${icon('shield', 17)}<span>Orientação educativa. Diabetes gestacional, hipertensão, anemia, restrições alimentares e gestação múltipla exigem plano alimentar individual com nutricionista ou médico.</span></div>
      </div>`,
    };
  },
};
