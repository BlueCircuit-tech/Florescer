/**
 * Comunidade: feed com filtros, curtidas, comentários e criação de posts.
 * Conteúdo inicial é semeado; tudo que a usuária faz fica salvo no aparelho.
 */
import { getState, update } from '../store.js';
import { icon } from '../icons.js';
import { esc, toast, emptyState, openSheet, closeSheet, confirmSheet, haptic, note } from '../ui.js';
import { navigate, back } from '../router.js';
import { relativeTime } from '../cycle.js';
import { SEED_POSTS, PHASE_LABELS } from '../content.js';
import * as cms from '../cms.js';
import {
  canAccessCommunityPost,
  communityForPhase,
  communityPath,
  createCommunityPost,
  postsForCommunity,
} from '../communities.js';

const BOOT = Date.now();

/** Junta posts semeados e os da usuária, aplicando curtidas/comentários salvos. */
export function allPosts(state) {
  const seeded = SEED_POSTS.map((p) => {
    const st = state.postState[p.id] || {};
    return {
      ...p,
      ts: BOOT - p.hoursAgo * 3600000,
      mine: false,
      likes: p.likes + (st.liked ? 1 : 0),
      liked: !!st.liked,
      comments: [
        ...p.comments.map((c) => ({ ...c, ts: BOOT - c.hoursAgo * 3600000 })),
        ...(st.comments || []),
      ],
    };
  });
  const mine = state.posts.map((p) => {
    const st = state.postState[p.id] || {};
    return { ...p, mine: true, liked: !!st.liked, likes: (p.likes || 0) + (st.liked ? 1 : 0), comments: st.comments || p.comments || [] };
  });
  return [...seeded, ...mine].sort((a, b) => b.ts - a.ts);
}

/** Feed visível: exclui o que a moderação ocultou. */
export function visiblePosts(state) {
  const hidden = state.hiddenPosts || [];
  return allPosts(state).filter((p) => !hidden.includes(p.id));
}

export function findPost(state, id) { return allPosts(state).find((p) => p.id === id); }

export function communityPosts(state, phase = state.profile.phase) {
  return postsForCommunity(visiblePosts(state), phase);
}

export function findAccessiblePost(state, id) {
  const post = findPost(state, id);
  return canAccessCommunityPost(state, post) ? post : null;
}

/* ---------- cartão de post ---------- */
export function postCard(p, state, { full = false } = {}) {
  const meta = PHASE_LABELS[p.phase] || PHASE_LABELS.tentante;
  const tone = p.phase === 'tentante' ? 'leaf' : p.phase === 'gravida' ? 'rose' : 'amber';
  return `<article class="post" data-post="${p.id}">
    <header class="post__head">
      <div class="post__av">${p.avatar || '🌸'}</div>
      <div class="grow">
        <b>${esc(p.author)}${p.mine ? ' <span class="fs-11 muted">(você)</span>' : ''}</b>
        <span>${meta.label} · ${relativeTime(p.ts)}</span>
      </div>
      <span class="pill pill--${tone}">${meta.emoji} ${meta.label.toLowerCase()}</span>
    </header>
    <div class="post__txt">${esc(p.text)}</div>
    <div class="post__acts">
      <button data-like="${p.id}" class="${p.liked ? 'on' : ''}" aria-pressed="${p.liked}">
        ${icon(p.liked ? 'heartFill' : 'heart', 17)} <span>${p.likes}</span>
      </button>
      <button data-open="${p.id}">${icon('message', 17)} <span>${p.comments.length}</span></button>
      ${p.mine
        ? `<button data-del="${p.id}">${icon('trash', 17)} Excluir</button>`
        : `<button data-report="${p.id}">${icon('flag', 17)} Reportar</button>`}
    </div>
  </article>`;
}

/** Liga as ações de post em qualquer tela que exiba cartões. */
export function bindPostActions(root, onChange) {
  root.querySelectorAll('[data-like]').forEach((b) => {
    b.onclick = () => {
      const id = b.dataset.like;
      haptic();
      update((s) => {
        if (!findAccessiblePost(s, id)) return;
        const st = s.postState[id] || (s.postState[id] = {});
        st.liked = !st.liked;
      });
      onChange ? onChange() : refreshCard(root, id);
    };
  });
  root.querySelectorAll('[data-open]').forEach((b) => { b.onclick = () => navigate(`post/${b.dataset.open}`); });
  root.querySelectorAll('[data-report]').forEach((b) => {
    b.onclick = () => {
      if (!findAccessiblePost(getState(), b.dataset.report)) { toast('Esta publicação não está disponível nesta comunidade.'); return; }
      openSheet({
      title: 'Reportar publicação',
      subtitle: 'Escolha o motivo para revisar esta publicação neste aparelho.',
      body: ['Conteúdo ofensivo', 'Venda de produtos ou serviços', 'Indicação de medicamentos', 'Conteúdo sensível sem aviso']
        .map((r) => `<button class="item" data-reason="${esc(r)}"><span class="item__ico">${icon('flag', 19)}</span><span class="item__body"><b>${esc(r)}</b></span>${icon('chevron', 16)}</button>`).join(''),
      onMount(sheet) {
        sheet.querySelectorAll('[data-reason]').forEach((r) => {
          r.onclick = () => { closeSheet(); toast('Obrigada por ajudar a manter este espaço acolhedor.'); };
        });
      },
    });
    };
  });
  root.querySelectorAll('[data-del]').forEach((b) => {
    b.onclick = async () => {
      const ok = await confirmSheet({ title: 'Excluir publicação?', message: 'Ela sai da comunidade e não pode ser recuperada.', confirmLabel: 'Excluir', danger: true });
      if (!ok) return;
      update((s) => {
        const post = findAccessiblePost(s, b.dataset.del);
        if (!post?.mine) return;
        s.posts = s.posts.filter((p) => p.id !== b.dataset.del);
        delete s.postState[b.dataset.del];
        s.hiddenPosts = (s.hiddenPosts || []).filter((id) => id !== b.dataset.del);
      });
      toast('Publicação excluída.');
      onChange ? onChange() : navigate(communityPath(getState().profile.phase));
    };
  });
}

function refreshCard(root, id) {
  const state = getState();
  const p = findAccessiblePost(state, id);
  const el = root.querySelector(`[data-post="${id}"]`);
  if (!p || !el) return;
  el.outerHTML = postCard(p, state);
  bindPostActions(root);
}

/* ---------- tela: comunidade ---------- */
export default {
  id: 'comunidade',
  tab: 'comunidade',
  render() {
    const state = getState();
    const phase = state.profile.phase;
    const community = communityForPhase(phase);
    const posts = communityPosts(state, phase);
    const ch = cms.getChallenge();
    const total = ch.days || 7;
    const done = state.challengeDays.filter((d) => d < total).length;

    return {
      appbar: {
        title: community.title, back: false,
        actions: [
          { icon: 'help', label: 'Diretrizes', action: 'rules' },
          { icon: 'plus', label: `Publicar em ${community.title}`, to: 'novo-post' },
        ],
      },
      html: `
        <div class="section pb-24">
          <section class="community-intro community-intro--${phase}">
            <span class="community-intro__ico">${icon(community.icon, 23)}</span>
            <div><span class="eyebrow">${esc(community.eyebrow)}</span><h1>${esc(community.title)}</h1><p>${esc(community.description)}</p></div>
            <button class="btn btn--sm btn--auto" data-nav="novo-post">${icon('edit', 17)} Compartilhar</button>
          </section>
          <section class="challenge">
            <div class="challenge__top">
              <span class="challenge__ico">${icon('sparkle', 21)}</span>
              <div>
                <span class="eyebrow">Desafio da semana</span>
                <b>${esc(ch.title)}</b>
              </div>
            </div>
            <p>${esc(ch.description)} ${(ch.participants || 0) + done} mulheres participando.</p>
            <div class="challenge__meter"><i style="width:${Math.round((done / total) * 100)}%"></i></div>
            <div class="challenge__foot">
              <div class="challenge__days">
                ${Array.from({ length: total }, (_, i) => {
                  const on = state.challengeDays.includes(i);
                  return `<button class="cday" data-day="${i}" aria-pressed="${on}" aria-label="Dia ${i + 1}${on ? ' — concluído' : ''}">
                    ${on ? icon('check', 17, { stroke: 2.4 }) : i + 1}
                  </button>`;
                }).join('')}
              </div>
              <span class="challenge__count">${done}/${total}</span>
            </div>
          </section>
          ${posts.length ? posts.map((p) => postCard(p, state)).join('')
            : emptyState('users', `A ${community.title} está começando`, 'Seja a primeira a compartilhar o que está vivendo nesta fase.', { label: 'Escrever publicação', to: 'novo-post' })}
        </div>`,
      mount(root) {
        root.querySelectorAll('[data-day]').forEach((b) => {
          b.onclick = () => {
            const i = +b.dataset.day;
            update((s) => {
              const at = s.challengeDays.indexOf(i);
              if (at >= 0) s.challengeDays.splice(at, 1); else s.challengeDays.push(i);
            });
            haptic();
            rerender();
          };
        });
        bindPostActions(root, rerender);
        document.querySelector('#appbar [data-action="rules"]')?.addEventListener('click', showRules);
      },
    };
  },
};

function rerender() { import('../router.js').then((m) => m.render()); }

function showRules() {
  openSheet({
    title: 'Diretrizes da comunidade',
    subtitle: 'Um espaço seguro depende de todas nós.',
    body: `<div class="itemlist">${cms.getRules().map((r) => `
      <div class="item"><span class="item__ico">${icon('shield', 19)}</span><span class="item__body"><b style="font-weight:600;font-size:13.5px">${esc(r)}</b></span></div>`).join('')}
    </div>
    <button class="btn btn--soft mt-16" data-close>Entendi</button>`,
    onMount(sheet) { sheet.querySelector('[data-close]').onclick = closeSheet; },
  });
}

/* ---------- tela: detalhe do post ---------- */
export const postScreen = {
  id: 'post',
  tab: 'comunidade',
  render(route) {
    const state = getState();
    const p = findAccessiblePost(state, route.arg);
    const community = communityForPhase(state.profile.phase);
    if (!p) return { appbar: { title: 'Publicação' }, html: emptyState('message', 'Publicação não disponível', 'Ela pode ter sido removida ou pertencer a outra comunidade.', { label: `Voltar à ${community.title}`, to: communityPath(state.profile.phase) }) };

    return {
      appbar: { title: 'Publicação', sub: `${p.comments.length} comentário${p.comments.length === 1 ? '' : 's'}` },
      html: `<div class="section pb-24">
        ${postCard(p, state)}
        <div class="card">
          <h2 class="fs-14" style="font-weight:700;margin-bottom:6px">Comentários</h2>
          ${p.comments.length ? p.comments.map((c) => `
            <div class="comment">
              <div class="comment__av">${c.avatar || '🌸'}</div>
              <div class="grow"><b>${esc(c.author)}</b><time>${relativeTime(c.ts)}</time><p>${esc(c.text)}</p></div>
            </div>`).join('')
            : '<p class="fs-13 muted" style="padding:8px 0">Ninguém comentou ainda. Que tal deixar uma palavra de apoio?</p>'}
          <div class="field mt-12" style="margin-bottom:0">
            <label for="c-text" class="sr-only">Seu comentário</label>
            <textarea id="c-text" rows="2" maxlength="500" placeholder="Escreva com carinho…"></textarea>
          </div>
          <button class="btn btn--sm mt-8" data-send>${icon('send', 17)} Comentar</button>
        </div>
      </div>`,
      mount(root) {
        bindPostActions(root, () => rerender());
        root.querySelector('[data-send]').onclick = () => {
          const ta = root.querySelector('#c-text');
          const text = ta.value.trim();
          if (text.length < 2) { toast('Escreva o seu comentário 💛'); return; }
          const current = getState();
          if (!findAccessiblePost(current, p.id)) { toast('Esta publicação não está disponível nesta comunidade.'); return; }
          const author = current.profile.name || 'Você';
          update((s) => {
            const st = s.postState[p.id] || (s.postState[p.id] = {});
            (st.comments || (st.comments = [])).push({ author, avatar: '🌷', text, ts: Date.now(), mine: true });
          });
          toast('Comentário publicado 💛');
          rerender();
        };
      },
    };
  },
};

/* ---------- tela: nova publicação ---------- */
export const newPostScreen = {
  id: 'novo-post',
  render() {
    const state = getState();
    const phase = state.profile.phase;
    const community = communityForPhase(phase);
    return {
      appbar: { title: 'Nova publicação', sub: community.title },
      html: `<div class="section pb-24">
        <div class="card diaryintro">
          <span class="floatcard__ico">${icon(community.icon, 22)}</span>
          <div><b>Publicando em ${esc(community.title)}</b><p>Este relato será compartilhado somente com mulheres desta mesma fase.</p></div>
        </div>
        <div class="mt-16">${note('Sua publicação aparece com o nome do seu perfil. Nada de dados médicos sensíveis ou indicação de medicamentos.')}</div>
        <div class="field mt-16">
          <label for="np-text">O que você quer compartilhar?</label>
          <textarea id="np-text" rows="7" maxlength="800" placeholder="${esc(community.prompt)}"></textarea>
          <p class="field__hint"><span id="np-count">0</span>/800</p>
        </div>
        <label class="kv" style="border:0">
          <span class="kv__k">Li e concordo com as diretrizes<small>Acolhimento, sem venda e sem indicação de remédios.</small></span>
          <input type="checkbox" id="np-ok" style="width:22px;height:22px;accent-color:var(--accent)">
        </label>
        <button class="btn mt-12" data-publish>${icon('send', 18)} Publicar</button>
      </div>`,
      mount(root) {
        const ta = root.querySelector('#np-text');
        ta.oninput = () => { root.querySelector('#np-count').textContent = ta.value.length; };
        ta.focus();
        root.querySelector('[data-publish]').onclick = () => {
          const text = ta.value.trim();
          if (text.length < 5) { toast('Escreva um pouco mais para publicar 💛'); return; }
          if (!root.querySelector('#np-ok').checked) { toast('Confirme as diretrizes da comunidade para publicar'); return; }
          let post;
          try {
            update((s) => { post = createCommunityPost(s, { text, expectedPhase: phase }); });
          } catch (error) {
            toast(error.message);
            if (getState().profile.phase !== phase) navigate(communityPath(getState().profile.phase), { replace: true });
            return;
          }
          toast('Publicado! Obrigada por compartilhar 🌸');
          navigate(`post/${post.id}`, { replace: true });
        };
      },
    };
  },
};
