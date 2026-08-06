/**
 * Dicas personalizadas + biblioteca de conteúdos + leitor de artigos.
 */
import { getState, update } from '../store.js';
import { icon } from '../icons.js';
import { esc, toast, emptyState, haptic, note, hscrollSection, bindHscroll } from '../ui.js';
import { navigate } from '../router.js';
import { cycleInfo, PHASES, toKey, today, plural } from '../cycle.js';
import { tipsByCategory, TIP_CATEGORIES, categoryLabel, PHASE_LABELS } from '../content.js';
import * as cms from '../cms.js';

const rerender = () => import('../router.js').then((m) => m.render());

/* ---------- tela: dicas ---------- */
export default {
  id: 'dicas',
  tab: 'dicas',
  render() {
    const state = getState();
    const info = cycleInfo(state);
    const cats = tipsByCategory(state, info, cms.getTips());
    const phaseLabel = state.profile.phase === 'tentante'
      ? `${PHASE_LABELS.tentante.label} · ${info.known ? PHASES[info.phase].label.toLowerCase() : 'sem ciclo definido'}`
      : PHASE_LABELS[state.profile.phase].label;

    const tileFor = (t, i, cat) => {
      const locked = !state.premium && i >= 2;
      const meta = TIP_CATEGORIES[cat];
      const saved = state.savedTips.includes(t.txt);
      return `<article class="tile ${locked ? 'tile--locked' : ''}">
        <span class="tile__ico" style="background:${locked ? 'var(--lilac-50)' : meta.color};color:${locked ? 'var(--lilac-600)' : meta.fg}">
          ${icon(locked ? 'lock' : meta.icon, 20)}
        </span>
        <p style="flex:1;color:${locked ? 'var(--lilac-600)' : 'var(--ink-2)'}">
          ${locked ? 'Conteúdo exclusivo do Florescer Premium — guias completos e análises da sua fase.' : esc(t.txt)}
        </p>
        <div class="tile__foot">
          <span class="pill ${locked ? 'pill--lilac' : 'pill--gray'}">${locked ? '🔒 Premium' : esc(categoryLabel(cat, state.profile.phase).split(' ')[0])}</span>
          ${locked
            ? `<button class="fs-12" style="font-weight:800;color:var(--lilac-500)" data-nav="premium">Desbloquear</button>`
            : `<button class="fs-12" style="font-weight:800;color:${saved ? 'var(--accent)' : 'var(--muted)'}" data-save="${encodeURIComponent(t.txt)}">
                 ${saved ? 'Salva ♥' : '♡ Salvar'}</button>`}
        </div>
      </article>`;
    };

    return {
      appbar: {
        title: 'Dicas para você',
        sub: phaseLabel,
        back: false,
        actions: [{ icon: 'bookmark', label: 'Salvas', to: 'salvos' }],
      },
      html: `
        ${Object.entries(cats).map(([cat, list]) => list.length
          ? hscrollSection(categoryLabel(cat, state.profile.phase), cat, list.map((t, i) => tileFor(t, i, cat)).join(''))
          : '').join('')}

        <div class="section pb-24">
          ${note('As sugestões são geradas no seu aparelho a partir da sua fase e dos seus registros. São educativas e não substituem orientação profissional.')}
          ${state.premium ? '' : `<button class="btn btn--lilac mt-16" data-nav="premium">${icon('crown', 19)} Sugestões ilimitadas no Premium</button>`}
          <button class="btn btn--soft mt-8" data-nav="biblioteca">${icon('book', 19)} Ver a biblioteca completa</button>
        </div>`,
      mount(root) {
        bindHscroll(root);
        root.querySelectorAll('[data-save]').forEach((b) => {
          b.onclick = () => {
            const txt = decodeURIComponent(b.dataset.save);
            update((s) => {
              const i = s.savedTips.indexOf(txt);
              if (i >= 0) s.savedTips.splice(i, 1); else s.savedTips.push(txt);
            });
            haptic();
            toast(getState().savedTips.includes(txt) ? 'Salva nas suas favoritas 💛' : 'Removida das favoritas');
            rerender();
          };
        });
      },
    };
  },
};

/* ---------- tela: biblioteca ---------- */
let libFilter = 'todos';

export const libraryScreen = {
  id: 'biblioteca',
  tab: 'dicas',
  render() {
    const state = getState();
    const cats = ['todos', ...new Set(cms.getArticles().map((a) => a.cat))];
    const list = cms.getArticles()
      .filter((a) => libFilter === 'todos' || a.cat === libFilter)
      .sort((a, b) => Number(b.phases.includes(state.profile.phase)) - Number(a.phases.includes(state.profile.phase)));

    return {
      appbar: { title: 'Biblioteca', sub: `${cms.getArticles().length} conteúdos`, actions: [{ icon: 'bookmark', label: 'Salvos', to: 'salvos' }] },
      html: `
        <div class="chiprow">
          ${cats.map((c) => `<button class="chip" data-cat="${esc(c)}" aria-pressed="${libFilter === c}">${c === 'todos' ? 'Todos' : esc(c)}</button>`).join('')}
        </div>
        <div class="section pb-24">
          <div class="itemlist card card--flush">
            ${list.map((a) => {
              const locked = a.premium && !state.premium;
              const read = state.readArticles.includes(a.id);
              return `<button class="item" data-nav="artigo/${a.id}">
                <span class="item__ico" style="background:${locked ? 'var(--lilac-50)' : 'var(--accent-tint)'};color:${locked ? 'var(--lilac-600)' : 'var(--accent-strong)'}">
                  ${icon(locked ? 'lock' : a.icon, 19)}
                </span>
                <span class="item__body">
                  <b>${esc(a.title)}</b>
                  <span>${esc(a.cat)} · ${a.time} min${read ? ' · lido' : ''}${locked ? ' · Premium' : ''}</span>
                </span>
                <span class="item__end">${icon('chevron', 16)}</span>
              </button>`;
            }).join('')}
          </div>
        </div>`,
      mount(root) {
        root.querySelectorAll('[data-cat]').forEach((b) => {
          b.onclick = () => { libFilter = b.dataset.cat; rerender(); };
        });
      },
    };
  },
};

/* ---------- tela: artigo ---------- */
export const articleScreen = {
  id: 'artigo',
  tab: 'dicas',
  render(route) {
    const state = getState();
    const a = cms.getArticles().find((x) => x.id === route.arg);
    if (!a) return { appbar: { title: 'Conteúdo' }, html: emptyState('book', 'Conteúdo não encontrado', 'Ele pode ter sido movido.', { label: 'Ver biblioteca', to: 'biblioteca' }) };

    const locked = a.premium && !state.premium;
    if (!locked && !state.readArticles.includes(a.id)) update((s) => { s.readArticles.push(a.id); }, { silent: true });
    const saved = state.savedArticles.includes(a.id);

    const body = locked
      ? `<p>${esc(a.excerpt)}</p>
         <div class="card card--tint center" style="padding:26px 20px;margin-top:18px">
           <div class="empty__ico" style="margin:0 auto 12px">${icon('lock', 28)}</div>
           <b style="font-family:var(--font-display);font-size:16px">Conteúdo do Florescer Premium</b>
           <p class="fs-13 muted mt-4">Guias completos, análises do seu ciclo e relatórios para levar à consulta.</p>
           <button class="btn btn--lilac mt-16" data-nav="premium">${icon('crown', 18)} Desbloquear</button>
         </div>`
      : a.body.map(([type, text]) => {
        if (type === 'h2') return `<h2>${esc(text)}</h2>`;
        if (type === 'li') return `<li>${esc(text)}</li>`;
        if (type === 'note') return `<div class="note mt-12">${icon('info', 17)}<span>${esc(text)}</span></div>`;
        return `<p>${esc(text)}</p>`;
      }).join('');

    return {
      appbar: { title: a.cat, actions: [{ icon: 'bookmark', label: saved ? 'Remover dos salvos' : 'Salvar', action: 'save' }] },
      html: `<div class="section article pb-24">
        <div class="article__hero" style="background:${a.grad}">${icon(a.icon, 46)}</div>
        <h1>${esc(a.title)}</h1>
        <div class="article__meta">
          <span class="pill pill--gray">${esc(a.cat)}</span>
          <span>${a.time} min de leitura</span>
          ${a.premium ? '<span class="pill pill--lilac">Premium</span>' : ''}
        </div>
        <div class="article__body">${body}</div>
        <div class="note mt-24">${icon('shield', 17)}<span>Conteúdo educativo, revisado por profissionais parceiros. Não substitui consulta médica.</span></div>
      </div>`,
      mount() {
        document.querySelector('#appbar [data-action="save"]')?.addEventListener('click', () => {
          update((s) => {
            const i = s.savedArticles.indexOf(a.id);
            if (i >= 0) s.savedArticles.splice(i, 1); else s.savedArticles.push(a.id);
          });
          toast(getState().savedArticles.includes(a.id) ? 'Salvo na sua lista 💛' : 'Removido dos salvos');
          rerender();
        });
      },
    };
  },
};

/* ---------- tela: salvos ---------- */
export const savedScreen = {
  id: 'salvos',
  tab: 'dicas',
  render() {
    const state = getState();
    const arts = cms.getArticles().filter((a) => state.savedArticles.includes(a.id));
    const tips = state.savedTips;
    const vazio = !arts.length && !tips.length;

    return {
      appbar: { title: 'Meus salvos', sub: `${plural(arts.length + tips.length, 'item', 'itens')}` },
      html: vazio
        ? emptyState('bookmark', 'Nada salvo ainda', 'Toque em ♡ nas sugestões ou no marcador dos artigos para guardar aqui.', { label: 'Ver dicas', to: 'dicas' })
        : `<div class="section pb-24">
            ${arts.length ? `<div class="section__head" style="padding:0"><h2>Artigos</h2></div>
              <div class="itemlist card card--flush">
                ${arts.map((a) => `<button class="item" data-nav="artigo/${a.id}">
                  <span class="item__ico">${icon(a.icon, 19)}</span>
                  <span class="item__body"><b>${esc(a.title)}</b><span>${esc(a.cat)} · ${a.time} min</span></span>
                  <span class="item__end">${icon('chevron', 16)}</span></button>`).join('')}
              </div>` : ''}
            ${tips.length ? `<div class="section__head" style="padding:0"><h2>Sugestões</h2></div>
              <div class="stack-12">
                ${tips.map((t, i) => `<div class="tipcard"><p>${esc(t)}</p>
                  <button class="tipcard__act" data-rm="${i}">${icon('trash', 15)} Remover</button></div>`).join('')}
              </div>` : ''}
          </div>`,
      mount(root) {
        root.querySelectorAll('[data-rm]').forEach((b) => {
          b.onclick = () => {
            update((s) => { s.savedTips.splice(+b.dataset.rm, 1); });
            rerender();
          };
        });
      },
    };
  },
};
