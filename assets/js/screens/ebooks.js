/**
 * E-books e materiais.
 *
 * Os arquivos ficam em /ebooks/ e são servidos junto com o app; o catálogo
 * (título, resumo, arquivo, fase) é editado no Painel da administradora.
 * Nada é gerado aqui: se não houver material publicado, a tela diz isso em
 * vez de inventar uma estante cheia.
 */
import { getState } from '../store.js';
import { icon } from '../icons.js';
import { emptyState, esc, note } from '../ui.js';
import { plural } from '../cycle.js';
import * as cms from '../cms.js';

/** Só os materiais da fase dela, e só os que têm arquivo de verdade. */
export function ebooksForPhase(list, phase, premium) {
  return (Array.isArray(list) ? list : [])
    .filter((item) => item && item.title && item.file)
    .filter((item) => !Array.isArray(item.phases) || !item.phases.length || item.phases.includes(phase))
    .map((item) => ({ ...item, locked: !!item.premium && !premium }));
}

function card(item) {
  const meta = [
    item.pages ? plural(item.pages, 'página', 'páginas') : null,
    item.premium ? 'Premium' : null,
  ].filter(Boolean).join(' · ');

  return `<article class="ebook">
    <span class="ebook__cover">${icon('book', 22)}</span>
    <div class="grow">
      <b>${esc(item.title)}</b>
      ${item.excerpt ? `<p>${esc(item.excerpt)}</p>` : ''}
      ${meta ? `<span class="ebook__meta">${esc(meta)}</span>` : ''}
      ${item.locked
        ? `<button class="ebook__btn ebook__btn--locked" data-nav="premium">${icon('lock', 16)} Exclusivo do Premium</button>`
        : `<a class="ebook__btn" href="ebooks/${encodeURIComponent(item.file)}" target="_blank" rel="noopener">
            ${icon('download', 16)} Abrir o material
          </a>`}
    </div>
  </article>`;
}

export default {
  id: 'materiais',
  tab: null,
  render() {
    const state = getState();
    const items = ebooksForPhase(cms.getEbooks(), state.profile.phase, state.premium);

    return {
      appbar: {
        title: 'E-books e materiais',
        sub: items.length ? plural(items.length, 'material', 'materiais') : 'nada publicado ainda',
      },
      html: `<div class="section pb-24">
        ${items.length
          ? `<div class="ebooks">${items.map(card).join('')}</div>
             ${note('Os materiais abrem no leitor do seu aparelho e podem ser guardados para ler offline.')}`
          : emptyState('book', 'Nenhum material publicado ainda',
            'Quando os e-books forem publicados, eles aparecem aqui para você abrir e guardar.',
            { label: 'Ver a biblioteca de artigos', to: 'biblioteca' })}
      </div>`,
    };
  },
};
