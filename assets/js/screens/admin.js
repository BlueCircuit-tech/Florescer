/**
 * Painel da administradora.
 *
 * Permite editar todo o conteúdo do app (sugestões, artigos, FAQ, diretrizes,
 * desafio, planos e benefícios), moderar a comunidade e exportar o resultado
 * em JSON ou em SQL pronto para o Supabase.
 *
 * IMPORTANTE sobre segurança: enquanto o app roda só no aparelho, esta senha
 * é uma tranca de interface — ela impede acesso casual, não um ataque de quem
 * tenha o aparelho e conhecimento técnico. A proteção real chega junto com o
 * Supabase Auth (ver supabase/README.md, coluna is_admin).
 */
import { getState, update } from '../store.js';
import { icon } from '../icons.js';
import {
  $, esc, toast, note, haptic, openSheet, closeSheet, confirmSheet,
  downloadFile, emptyState,
} from '../ui.js';
import { navigate } from '../router.js';
import * as cms from '../cms.js';
import { TIP_CATEGORIES, CYCLE_PHASE_OPTIONS, PHASE_LABELS } from '../content.js';
import { allPosts } from './community.js';
import { fmtLong } from '../cycle.js';

/* ---------------------------------------------------------------
   1. Credenciais
   --------------------------------------------------------------- */
const DEFAULT_EMAIL = 'marcele@florescer.app';
// SHA-256 de "florescer:v1:<email>:<senha>" — a senha nunca fica no código.
const DEFAULT_HASH = '09a50f03a0202410aa443ff0f3ff058d72c6b37259a02ad282bd96839b33c0e6';

const K_EMAIL = 'florescer:admin:email';
const K_HASH = 'florescer:admin:hash';
const K_SESSION = 'florescer:admin:session';
const SESSION_MS = 2 * 60 * 60 * 1000; // 2 horas

const adminEmail = () => (localStorage.getItem(K_EMAIL) || DEFAULT_EMAIL).toLowerCase();
const adminHash = () => localStorage.getItem(K_HASH) || DEFAULT_HASH;

async function hash(email, password) {
  const data = new TextEncoder().encode(`florescer:v1:${email.toLowerCase()}:${password}`);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const isUnlocked = () => Number(sessionStorage.getItem(K_SESSION) || 0) > Date.now();
const unlock = () => sessionStorage.setItem(K_SESSION, String(Date.now() + SESSION_MS));
const lock = () => sessionStorage.removeItem(K_SESSION);

/* ---------------------------------------------------------------
   2. Coleções editáveis (formulários gerados a partir do schema)
   --------------------------------------------------------------- */
const uid = () => `c${Date.now().toString(36)}${Math.floor(performance.now() % 1000)}`;

const PHASE_OPTIONS = Object.entries(PHASE_LABELS).map(([id, m]) => [id, `${m.emoji} ${m.label}`]);
const CAT_OPTIONS = Object.entries(TIP_CATEGORIES).map(([id, c]) => [id, c.label]);

/** Corpo do artigo <-> texto simples, para edição confortável. */
function bodyToText(body = []) {
  return body.map(([type, text]) => {
    if (type === 'h2') return `## ${text}`;
    if (type === 'li') return `- ${text}`;
    if (type === 'note') return `! ${text}`;
    return text;
  }).join('\n\n');
}
function textToBody(text = '') {
  return text.split(/\n{2,}/).map((raw) => {
    const line = raw.trim();
    if (!line) return null;
    if (line.startsWith('## ')) return ['h2', line.slice(3).trim()];
    if (line.startsWith('- ')) return ['li', line.slice(2).trim()];
    if (line.startsWith('! ')) return ['note', line.slice(2).trim()];
    return ['p', line];
  }).filter(Boolean);
}

const COLLECTIONS = {
  dicas: {
    key: 'tips',
    title: 'Sugestões diárias',
    icon: 'sparkle',
    describe: (list) => `${list.length} sugestões no ar`,
    label: (t) => t.txt,
    sub: (t) => `${TIP_CATEGORIES[t.c]?.label || t.c} · ${(t.phases || []).map((p) => PHASE_LABELS[p]?.label || p).join(', ')}`,
    blank: () => ({ id: uid(), c: 'bem', txt: '', phases: ['tentante'], cycle: ['any'] }),
    fields: [
      { k: 'txt', label: 'Texto da sugestão', type: 'textarea', rows: 5, required: true },
      { k: 'c', label: 'Categoria', type: 'select', options: CAT_OPTIONS },
      { k: 'phases', label: 'Aparece para', type: 'multi', options: PHASE_OPTIONS, required: true },
      { k: 'cycle', label: 'Momento do ciclo (só para tentantes)', type: 'multi', options: CYCLE_PHASE_OPTIONS, required: true },
    ],
  },

  artigos: {
    key: 'articles',
    title: 'Artigos da biblioteca',
    icon: 'book',
    describe: (list) => `${list.length} artigos · ${list.filter((a) => a.premium).length} exclusivos`,
    label: (a) => a.title,
    sub: (a) => `${a.cat} · ${a.time} min${a.premium ? ' · Premium' : ''}`,
    blank: () => ({
      id: uid(), cat: 'Ciclo', title: '', excerpt: '', icon: 'book',
      grad: 'var(--grad-rose)', time: 5, premium: false, phases: ['tentante'], body: [],
    }),
    fields: [
      { k: 'title', label: 'Título', type: 'text', required: true },
      { k: 'excerpt', label: 'Resumo (aparece na lista)', type: 'textarea', rows: 2, required: true },
      { k: 'cat', label: 'Categoria', type: 'text', required: true },
      { k: 'time', label: 'Minutos de leitura', type: 'number', min: 1, max: 60 },
      { k: 'premium', label: 'Conteúdo exclusivo do Premium', type: 'bool' },
      { k: 'phases', label: 'Aparece para', type: 'multi', options: PHASE_OPTIONS, required: true },
      {
        k: 'body',
        label: 'Conteúdo',
        type: 'body',
        rows: 12,
        hint: 'Um parágrafo por bloco (linha em branco entre eles). Use "## " para título, "- " para item de lista e "! " para aviso.',
      },
    ],
  },

  faq: {
    key: 'faq',
    title: 'Perguntas frequentes',
    icon: 'help',
    describe: (list) => `${list.length} perguntas`,
    label: (f) => f.q,
    sub: (f) => f.a,
    blank: () => ({ q: '', a: '' }),
    fields: [
      { k: 'q', label: 'Pergunta', type: 'text', required: true },
      { k: 'a', label: 'Resposta', type: 'textarea', rows: 5, required: true },
    ],
  },

  diretrizes: {
    key: 'rules',
    title: 'Diretrizes da comunidade',
    icon: 'shield',
    describe: (list) => `${list.length} regras`,
    label: (r) => r,
    sub: () => '',
    plain: true,
    blank: () => '',
    fields: [{ k: '_', label: 'Regra', type: 'textarea', rows: 3, required: true }],
  },

  beneficios: {
    key: 'benefits',
    title: 'Benefícios do Premium',
    icon: 'crown',
    describe: (list) => `${list.length} benefícios`,
    label: (b) => b.title,
    sub: (b) => b.text,
    blank: () => ({ icon: 'sparkle', title: '', text: '' }),
    fields: [
      { k: 'title', label: 'Benefício', type: 'text', required: true },
      { k: 'text', label: 'Descrição', type: 'textarea', rows: 2, required: true },
      {
        k: 'icon',
        label: 'Ícone',
        type: 'select',
        options: [['sparkle', 'Brilho'], ['flower', 'Flor'], ['leaf', 'Folha'], ['moon', 'Lua'],
          ['chart', 'Gráfico'], ['users', 'Comunidade'], ['book', 'Livro'], ['heart', 'Coração']],
      },
    ],
  },
};

/* ---------------------------------------------------------------
   3. Tela de acesso
   --------------------------------------------------------------- */
function loginScreen() {
  return {
    appbar: { title: 'Área da administradora' },
    html: `<div class="section pb-24">
      <div class="card center" style="padding:26px 20px">
        <div class="empty__ico" style="margin:0 auto 14px">${icon('lock', 28)}</div>
        <b style="font-family:var(--font-display);font-size:17px">Painel do Florescer</b>
        <p class="fs-13 muted mt-4">Entre para editar o conteúdo do app e moderar a comunidade.</p>
      </div>
      <div class="field mt-16">
        <label for="ad-email">E-mail</label>
        <input id="ad-email" type="email" autocomplete="username" inputmode="email" placeholder="voce@florescer.app">
      </div>
      <div class="field">
        <label for="ad-pass">Senha</label>
        <input id="ad-pass" type="password" autocomplete="current-password" placeholder="••••••••">
      </div>
      <button class="btn" data-login>${icon('logout', 18)} Entrar</button>
      ${note('A senha protege o painel neste aparelho. Troque-a no primeiro acesso, em Painel › Segurança.')}
    </div>`,
    mount(root) {
      const email = root.querySelector('#ad-email');
      const pass = root.querySelector('#ad-pass');
      const submit = async () => {
        if (!crypto?.subtle) { toast('Abra o app por http://localhost ou https para entrar.'); return; }
        const ok = email.value.trim().toLowerCase() === adminEmail()
          && (await hash(adminEmail(), pass.value)) === adminHash();
        if (!ok) { toast('E-mail ou senha incorretos.'); pass.value = ''; return; }
        unlock();
        haptic(14);
        toast('Bem-vinda ao painel 🌸');
        rerender();
      };
      root.querySelector('[data-login]').onclick = submit;
      pass.onkeydown = (e) => { if (e.key === 'Enter') submit(); };
      email.focus();
    },
  };
}

/* ---------------------------------------------------------------
   4. Painel
   --------------------------------------------------------------- */
const rerender = () => import('../router.js').then((m) => m.render());

function dashboard() {
  const state = getState();
  const posts = allPosts(state);
  const custom = cms.customCount();

  const cards = [
    ...Object.entries(COLLECTIONS).map(([slug, col]) => ({
      to: `admin/${slug}`,
      icon: col.icon,
      title: col.title,
      sub: col.describe(cms.get(col.key)),
      tag: cms.isCustom(col.key) ? 'editado' : '',
    })),
    { to: 'admin/desafio', icon: 'flag', title: 'Desafio da semana', sub: cms.getChallenge().title, tag: cms.isCustom('challenge') ? 'editado' : '' },
    { to: 'admin/planos', icon: 'crown', title: 'Planos e preços', sub: cms.getPlans().map((p) => `${p.label} ${p.price}`).join(' · '), tag: cms.isCustom('plans') ? 'editado' : '' },
    { to: 'admin/comunidade', icon: 'users', title: 'Moderar a comunidade', sub: `${posts.length} publicações no feed` },
    { to: 'admin/dados', icon: 'download', title: 'Publicar e exportar', sub: 'JSON do conteúdo e SQL para o Supabase' },
    { to: 'admin/seguranca', icon: 'shield', title: 'Segurança', sub: 'Trocar e-mail e senha do painel' },
  ];

  return {
    appbar: {
      title: 'Painel',
      sub: adminEmail(),
      back: false,
      actions: [{ icon: 'logout', label: 'Sair do painel', action: 'logout' }],
    },
    html: `<div class="section pb-24">
      <div class="card" style="background:var(--grad-lilac);color:#fff;border:0">
        <div class="row" style="gap:13px">
          <span class="challenge__ico">${icon('settings', 21)}</span>
          <div class="grow">
            <b style="font-family:var(--font-display);font-size:17px">Você controla o app daqui</b>
            <p class="fs-12" style="color:rgba(255,255,255,.85);margin-top:3px;line-height:1.45">
              ${custom ? `${custom} ${custom === 1 ? 'seção editada' : 'seções editadas'} · alterações valem na hora` : 'Nenhuma alteração publicada ainda'}
            </p>
          </div>
        </div>
      </div>

      <div class="card card--flush mt-16">
        ${cards.map((c) => `
          <button class="item" data-nav="${c.to}">
            <span class="item__ico">${icon(c.icon, 19)}</span>
            <span class="item__body"><b>${esc(c.title)}</b><span>${esc(c.sub)}</span></span>
            <span class="item__end">${c.tag ? `<span class="pill pill--lilac">${c.tag}</span>` : ''}${icon('chevron', 16)}</span>
          </button>`).join('')}
      </div>

      ${note('As alterações ficam salvas neste aparelho e valem imediatamente para quem usa o app aqui. Para publicar em produção, exporte o SQL em “Publicar e exportar”.')}
    </div>`,
    mount() {
      $('#appbar').querySelector('[data-action="logout"]')?.addEventListener('click', () => {
        lock();
        toast('Você saiu do painel.');
        navigate('configuracoes');
      });
    },
  };
}

/* ---------------------------------------------------------------
   5. Editor genérico de coleção
   --------------------------------------------------------------- */
function collectionScreen(slug) {
  const col = COLLECTIONS[slug];
  const list = cms.get(col.key);

  return {
    appbar: {
      title: col.title,
      sub: col.describe(list),
      actions: [{ icon: 'plus', label: 'Adicionar', action: 'add' }],
    },
    html: `<div class="section pb-24">
      ${cms.isCustom(col.key) ? `
        <div class="row row--between mb-12">
          <span class="pill pill--lilac">conteúdo editado</span>
          <button class="link" data-restore>${icon('refresh', 14)} Restaurar padrão</button>
        </div>` : ''}
      ${list.length ? `<div class="card card--flush">
        ${list.map((item, i) => `
          <div class="item">
            <span class="item__ico">${icon(col.icon, 19)}</span>
            <span class="item__body">
              <b style="font-weight:600">${esc(String(col.label(item)).slice(0, 90))}${String(col.label(item)).length > 90 ? '…' : ''}</b>
              ${col.sub(item) ? `<span>${esc(String(col.sub(item)).slice(0, 80))}</span>` : ''}
            </span>
            <span class="item__end">
              <button class="iconbtn iconbtn--ghost" data-edit="${i}" aria-label="Editar">${icon('edit', 17)}</button>
              <button class="iconbtn iconbtn--ghost" data-del="${i}" aria-label="Excluir" style="color:var(--red-500)">${icon('trash', 17)}</button>
            </span>
          </div>`).join('')}
      </div>` : emptyState(col.icon, 'Nada aqui ainda', 'Toque em + para criar o primeiro item.')}
      <button class="btn btn--soft mt-16" data-add>${icon('plus', 18)} Adicionar</button>
    </div>`,

    mount(root) {
      const openAdd = () => openForm(col, col.blank(), null);
      root.querySelector('[data-add]').onclick = openAdd;
      $('#appbar').querySelector('[data-action="add"]')?.addEventListener('click', openAdd);

      root.querySelectorAll('[data-edit]').forEach((b) => {
        b.onclick = () => openForm(col, structuredClone(list[+b.dataset.edit]), +b.dataset.edit);
      });
      root.querySelectorAll('[data-del]').forEach((b) => {
        b.onclick = async () => {
          const ok = await confirmSheet({ title: 'Excluir item?', message: 'Ele sai do app imediatamente.', confirmLabel: 'Excluir', danger: true });
          if (!ok) return;
          const next = cms.get(col.key).slice();
          next.splice(+b.dataset.del, 1);
          cms.set(col.key, next);
          toast('Item excluído.');
          rerender();
        };
      });
      root.querySelector('[data-restore]')?.addEventListener('click', async () => {
        const ok = await confirmSheet({ title: 'Restaurar o conteúdo padrão?', message: 'Suas edições nesta seção serão descartadas.', confirmLabel: 'Restaurar', danger: true });
        if (!ok) return;
        cms.reset(col.key);
        toast('Conteúdo padrão restaurado.');
        rerender();
      });
    },
  };
}

/** Formulário em bottom sheet, gerado a partir de col.fields. */
function openForm(col, draft, index) {
  const value = (f) => (col.plain ? draft : draft[f.k]);

  const fieldHtml = (f) => {
    const v = value(f);
    if (f.type === 'textarea' || f.type === 'body') {
      const text = f.type === 'body' ? bodyToText(v) : (v || '');
      return `<div class="field">
        <label for="f-${f.k}">${esc(f.label)}</label>
        <textarea id="f-${f.k}" rows="${f.rows || 3}">${esc(text)}</textarea>
        ${f.hint ? `<p class="field__hint">${esc(f.hint)}</p>` : ''}
      </div>`;
    }
    if (f.type === 'select') {
      return `<div class="field"><label for="f-${f.k}">${esc(f.label)}</label>
        <select id="f-${f.k}">${f.options.map(([id, label]) => `<option value="${id}" ${v === id ? 'selected' : ''}>${esc(label)}</option>`).join('')}</select></div>`;
    }
    if (f.type === 'multi') {
      return `<div class="field"><span class="field__label">${esc(f.label)}</span>
        <div class="chipwrap" data-multi="${f.k}">
          ${f.options.map(([id, label]) => `<button type="button" class="chip" data-opt="${id}" aria-pressed="${(v || []).includes(id)}">${esc(label)}</button>`).join('')}
        </div></div>`;
    }
    if (f.type === 'bool') {
      return `<div class="kv"><span class="kv__k">${esc(f.label)}</span>
        <button class="toggle" role="switch" aria-checked="${!!v}" data-bool="${f.k}" aria-label="${esc(f.label)}"></button></div>`;
    }
    return `<div class="field"><label for="f-${f.k}">${esc(f.label)}</label>
      <input id="f-${f.k}" type="${f.type}" ${f.min !== undefined ? `min="${f.min}"` : ''} ${f.max !== undefined ? `max="${f.max}"` : ''} value="${esc(v ?? '')}"></div>`;
  };

  openSheet({
    title: index === null ? `Novo item · ${col.title}` : `Editar · ${col.title}`,
    body: `${col.fields.map(fieldHtml).join('')}
      <button class="btn mt-8" data-save>${icon('check', 18)} Salvar</button>`,
    onMount(sheet) {
      sheet.querySelectorAll('[data-multi]').forEach((group) => {
        group.querySelectorAll('[data-opt]').forEach((b) => {
          b.onclick = () => b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true');
        });
      });
      sheet.querySelectorAll('[data-bool]').forEach((b) => {
        b.onclick = () => b.setAttribute('aria-checked', b.getAttribute('aria-checked') !== 'true');
      });

      sheet.querySelector('[data-save]').onclick = () => {
        // coleções de texto simples (diretrizes) têm um único campo
        if (col.plain) {
          const el = sheet.querySelector(`#f-${col.fields[0].k}`);
          const v = el.value.trim();
          if (!v) { toast(`Preencha: ${col.fields[0].label}`); return; }
          cms.set(col.key, applyAt(cms.get(col.key), index, v));
          closeSheet();
          toast('Salvo 🌸');
          rerender();
          return;
        }

        const next = { ...draft };
        for (const f of col.fields) {
          let v;
          if (f.type === 'multi') {
            v = [...sheet.querySelectorAll(`[data-multi="${f.k}"] [aria-pressed="true"]`)].map((b) => b.dataset.opt);
          } else if (f.type === 'bool') {
            v = sheet.querySelector(`[data-bool="${f.k}"]`).getAttribute('aria-checked') === 'true';
          } else {
            const el = sheet.querySelector(`#f-${f.k}`);
            v = f.type === 'number' ? Number(el.value) : el.value.trim();
            if (f.type === 'body') v = textToBody(el.value);
          }
          if (f.required && (!v || (Array.isArray(v) && !v.length))) {
            toast(`Preencha: ${f.label}`);
            return;
          }
          next[f.k] = v;
        }
        cms.set(col.key, applyAt(cms.get(col.key), index, next));
        closeSheet();
        toast('Salvo 🌸');
        rerender();
      };
    },
  });
}

function applyAt(list, index, value) {
  const next = list.slice();
  if (index === null) next.push(value); else next[index] = value;
  return next;
}

/* ---------------------------------------------------------------
   6. Telas específicas
   --------------------------------------------------------------- */
function challengeScreen() {
  const ch = cms.getChallenge();
  return {
    appbar: { title: 'Desafio da semana' },
    html: `<div class="section pb-24">
      <div class="field"><label for="ch-title">Título</label><input id="ch-title" type="text" value="${esc(ch.title)}"></div>
      <div class="field"><label for="ch-desc">Descrição</label><textarea id="ch-desc" rows="3">${esc(ch.description)}</textarea></div>
      <div class="row" style="gap:12px">
        <div class="field grow"><label for="ch-days">Dias</label><input id="ch-days" type="number" min="1" max="31" value="${ch.days}"></div>
        <div class="field grow"><label for="ch-part">Participantes</label><input id="ch-part" type="number" min="0" value="${ch.participants}"></div>
      </div>
      <button class="btn" data-save>${icon('check', 18)} Salvar</button>
      ${cms.isCustom('challenge') ? '<button class="btn btn--ghost mt-8" data-restore>Restaurar padrão</button>' : ''}
    </div>`,
    mount(root) {
      root.querySelector('[data-save]').onclick = () => {
        cms.set('challenge', {
          title: root.querySelector('#ch-title').value.trim() || ch.title,
          description: root.querySelector('#ch-desc').value.trim(),
          days: Math.min(31, Math.max(1, +root.querySelector('#ch-days').value || 7)),
          participants: Math.max(0, +root.querySelector('#ch-part').value || 0),
        });
        toast('Desafio atualizado 🌸');
        navigate('admin');
      };
      root.querySelector('[data-restore]')?.addEventListener('click', () => {
        cms.reset('challenge'); toast('Padrão restaurado.'); rerender();
      });
    },
  };
}

function plansScreen() {
  const plans = cms.getPlans();
  return {
    appbar: { title: 'Planos e preços' },
    html: `<div class="section pb-24">
      ${plans.map((p, i) => `
        <div class="card mb-12">
          <span class="eyebrow">${esc(p.label)}</span>
          <div class="field mt-8"><label for="p-price-${i}">Preço</label><input id="p-price-${i}" type="text" value="${esc(p.price)}"></div>
          <div class="field"><label for="p-per-${i}">Período</label><input id="p-per-${i}" type="text" value="${esc(p.per)}"></div>
          <div class="field" style="margin-bottom:0"><label for="p-note-${i}">Observação</label><input id="p-note-${i}" type="text" value="${esc(p.note)}"></div>
        </div>`).join('')}
      <button class="btn" data-save>${icon('check', 18)} Salvar</button>
      ${cms.isCustom('plans') ? '<button class="btn btn--ghost mt-8" data-restore>Restaurar padrão</button>' : ''}
    </div>`,
    mount(root) {
      root.querySelector('[data-save]').onclick = () => {
        cms.set('plans', plans.map((p, i) => ({
          ...p,
          price: root.querySelector(`#p-price-${i}`).value.trim() || p.price,
          per: root.querySelector(`#p-per-${i}`).value.trim() || p.per,
          note: root.querySelector(`#p-note-${i}`).value.trim(),
        })));
        toast('Planos atualizados 🌸');
        navigate('admin');
      };
      root.querySelector('[data-restore]')?.addEventListener('click', () => {
        cms.reset('plans'); toast('Padrão restaurado.'); rerender();
      });
    },
  };
}

function moderationScreen() {
  const state = getState();
  const posts = allPosts(state);
  return {
    appbar: { title: 'Moderar a comunidade', sub: `${posts.length} publicações` },
    html: `<div class="section pb-24">
      ${note('Publicações ocultas somem do feed. As de origem editorial voltam quando o conteúdo é republicado.')}
      <div class="card card--flush mt-16">
        ${posts.map((p) => `
          <div class="item">
            <span class="post__av" style="width:38px;height:38px;font-size:17px">${p.avatar}</span>
            <span class="item__body">
              <b style="font-weight:600">${esc(p.author)} · ${esc(PHASE_LABELS[p.phase]?.label || 'Sem comunidade')}</b>
              <span>${esc(p.text.slice(0, 70))}${p.text.length > 70 ? '…' : ''}</span>
            </span>
            <span class="item__end">
              <button class="iconbtn iconbtn--ghost" data-hide="${p.id}" aria-label="Ocultar" style="color:${state.hiddenPosts?.includes(p.id) ? 'var(--accent)' : 'var(--faint)'}">
                ${icon(state.hiddenPosts?.includes(p.id) ? 'lock' : 'flag', 17)}
              </button>
            </span>
          </div>`).join('')}
      </div>
    </div>`,
    mount(root) {
      root.querySelectorAll('[data-hide]').forEach((b) => {
        b.onclick = () => {
          const id = b.dataset.hide;
          update((s) => {
            s.hiddenPosts = s.hiddenPosts || [];
            const i = s.hiddenPosts.indexOf(id);
            if (i >= 0) s.hiddenPosts.splice(i, 1); else s.hiddenPosts.push(id);
          });
          haptic();
          toast(getState().hiddenPosts.includes(id) ? 'Publicação ocultada.' : 'Publicação liberada.');
          rerender();
        };
      });
    },
  };
}

function dataScreen() {
  return {
    appbar: { title: 'Publicar e exportar' },
    html: `<div class="section pb-24">
      <div class="card card--flush">
        <button class="kv" data-sql>
          <span class="kv__k">Gerar SQL para o Supabase<small>publica sugestões, artigos, FAQ e diretrizes</small></span>
          <span class="kv__v">${icon('download', 18)}</span>
        </button>
        <button class="kv" data-json>
          <span class="kv__k">Exportar conteúdo (JSON)<small>backup completo do que está no ar</small></span>
          <span class="kv__v">${icon('download', 18)}</span>
        </button>
        <button class="kv" data-import>
          <span class="kv__k">Importar conteúdo<small>restaura um JSON exportado antes</small></span>
          <span class="kv__v">${icon('upload', 18)}</span>
        </button>
        <button class="kv" data-reset>
          <span class="kv__k" style="color:var(--red-500)">Restaurar todo o conteúdo padrão<small>descarta todas as edições</small></span>
          <span class="kv__v" style="color:var(--red-500)">${icon('refresh', 18)}</span>
        </button>
      </div>
      ${note('O SQL usa “insert … on conflict do update”: pode ser rodado quantas vezes quiser no SQL Editor do Supabase.')}
    </div>`,
    mount(root) {
      const stamp = new Date().toISOString().slice(0, 10);
      root.querySelector('[data-sql]').onclick = () => {
        downloadFile(`florescer-conteudo-${stamp}.sql`, cms.toSql(), 'text/plain');
        toast('SQL gerado. Rode no SQL Editor do Supabase.');
      };
      root.querySelector('[data-json]').onclick = () => {
        downloadFile(`florescer-conteudo-${stamp}.json`, cms.exportJson());
        toast('Conteúdo exportado 💛');
      };
      root.querySelector('[data-import]').onclick = () => openSheet({
        title: 'Importar conteúdo',
        subtitle: 'Escolha um JSON exportado por este painel.',
        body: `<input type="file" accept="application/json,.json" id="cms-file" class="input">
          <button class="btn mt-12" data-do>Importar</button>`,
        onMount(sheet) {
          sheet.querySelector('[data-do]').onclick = async () => {
            const file = sheet.querySelector('#cms-file').files?.[0];
            if (!file) { toast('Escolha um arquivo primeiro'); return; }
            try {
              cms.importJson(await file.text());
              closeSheet();
              toast('Conteúdo importado 🌸');
              rerender();
            } catch {
              toast('Arquivo inválido.');
            }
          };
        },
      });
      root.querySelector('[data-reset]').onclick = async () => {
        const ok = await confirmSheet({
          title: 'Restaurar tudo?',
          message: 'Todas as edições de conteúdo serão descartadas e o app volta ao conteúdo original.',
          confirmLabel: 'Restaurar', danger: true,
        });
        if (!ok) return;
        cms.resetAll();
        toast('Conteúdo padrão restaurado.');
        navigate('admin');
      };
    },
  };
}

function securityScreen() {
  return {
    appbar: { title: 'Segurança' },
    html: `<div class="section pb-24">
      <div class="card card--flush">
        <div class="kv"><span class="kv__k">E-mail de acesso</span><span class="kv__v">${esc(adminEmail())}</span></div>
        <div class="kv"><span class="kv__k">Sessão expira em</span><span class="kv__v">2 horas</span></div>
        <div class="kv"><span class="kv__k">Senha padrão trocada</span><span class="kv__v">${localStorage.getItem(K_HASH) ? 'sim' : 'ainda não'}</span></div>
      </div>

      <div class="section__head"><h2>Trocar credenciais</h2></div>
      <div class="field"><label for="s-email">Novo e-mail</label><input id="s-email" type="email" value="${esc(adminEmail())}"></div>
      <div class="field"><label for="s-cur">Senha atual</label><input id="s-cur" type="password" autocomplete="current-password"></div>
      <div class="field"><label for="s-new">Nova senha</label><input id="s-new" type="password" autocomplete="new-password"></div>
      <div class="field"><label for="s-rep">Repita a nova senha</label><input id="s-rep" type="password" autocomplete="new-password"></div>
      <button class="btn" data-save>${icon('shield', 18)} Salvar credenciais</button>

      ${note('Esta senha tranca o painel neste aparelho. Ela não protege contra quem tenha acesso técnico ao aparelho — a proteção de verdade vem com o login do Supabase, já previsto no schema (coluna is_admin).')}
    </div>`,
    mount(root) {
      root.querySelector('[data-save]').onclick = async () => {
        const cur = root.querySelector('#s-cur').value;
        const neu = root.querySelector('#s-new').value;
        const rep = root.querySelector('#s-rep').value;
        const mail = root.querySelector('#s-email').value.trim().toLowerCase();

        if ((await hash(adminEmail(), cur)) !== adminHash()) { toast('Senha atual incorreta.'); return; }
        if (neu.length < 8) { toast('A nova senha precisa de ao menos 8 caracteres.'); return; }
        if (neu !== rep) { toast('As senhas não conferem.'); return; }
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail)) { toast('E-mail inválido.'); return; }

        localStorage.setItem(K_EMAIL, mail);
        localStorage.setItem(K_HASH, await hash(mail, neu));
        toast('Credenciais atualizadas 🔒');
        navigate('admin');
      };
    },
  };
}

/* ---------------------------------------------------------------
   7. Rota
   --------------------------------------------------------------- */
export default {
  id: 'admin',
  render(route) {
    if (!isUnlocked()) return loginScreen();

    const section = route.arg;
    if (!section) return dashboard();
    if (COLLECTIONS[section]) return collectionScreen(section);
    if (section === 'desafio') return challengeScreen();
    if (section === 'planos') return plansScreen();
    if (section === 'comunidade') return moderationScreen();
    if (section === 'dados') return dataScreen();
    if (section === 'seguranca') return securityScreen();
    return dashboard();
  },
};
