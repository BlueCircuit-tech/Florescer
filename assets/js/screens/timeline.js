/**
 * Minha jornada — a linha do tempo montada sozinha.
 *
 * Não existe formulário aqui: tudo vem do que ela já registrou em outras
 * telas. A leitura é cronológica, de cima para baixo, com a fase de cada
 * marco à vista.
 */
import { getState } from '../store.js';
import { icon } from '../icons.js';
import { emptyState, esc, note } from '../ui.js';
import { plural } from '../cycle.js';
import { journeyTimeline, TIMELINE_GROUPS } from '../timeline.js';

function marco(item) {
  const group = TIMELINE_GROUPS[item.group] || TIMELINE_GROUPS.tentativa;
  return `<li class="tl__item tl__item--${esc(item.group)}">
    <span class="tl__dot" aria-hidden="true"><em>${item.emoji}</em></span>
    <div class="tl__body">
      <span class="tl__when">${esc(item.label)} · ${esc(group.label)}</span>
      <b class="tl__title">${esc(item.title)}</b>
      ${item.note ? `<span class="tl__note">${esc(item.note)}</span>` : ''}
      ${item.photo ? `<figure class="tl__photo"><img src="${esc(item.photo)}" alt="${esc(item.title)}"></figure>` : ''}
    </div>
  </li>`;
}

export default {
  id: 'jornada',
  tab: null,
  render() {
    const state = getState();
    const { items, counts, span } = journeyTimeline(state);

    if (!items.length) {
      return {
        appbar: { title: 'Minha jornada' },
        html: `<div class="section pb-24">${emptyState('sparkle', 'Sua linha do tempo começa agora',
          'Conforme você registra o seu ciclo, a gestação e os marcos do bebê, eles aparecem aqui sozinhos — você não precisa montar nada.',
          { label: 'Fazer um registro', to: 'registro' })}</div>`,
      };
    }

    const resumo = Object.entries(TIMELINE_GROUPS)
      .filter(([id]) => counts[id])
      .map(([id, group]) => `<div class="tl__stat tl__stat--${esc(id)}">
        <b>${counts[id]}</b><span>${esc(group.label.toLowerCase())}</span>
      </div>`).join('');

    return {
      appbar: {
        title: 'Minha jornada',
        sub: `${plural(items.length, 'marco reunido', 'marcos reunidos')}`,
      },
      html: `<div class="section pb-24">
        ${span ? `<div class="tl__head">
          <p>De <b>${esc(span.from)}</b> a <b>${esc(span.to)}</b>${span.days > 0 ? ` — ${esc(plural(span.days, 'dia', 'dias'))} de história` : ''}.</p>
        </div>` : ''}
        <div class="tl__stats">${resumo}</div>

        <ol class="tl">${items.map(marco).join('')}</ol>

        ${note('Esta linha do tempo é montada sozinha a partir dos seus registros. Tudo fica neste aparelho.')}
      </div>`,
    };
  },
};
