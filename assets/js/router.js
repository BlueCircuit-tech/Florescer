/**
 * Roteador por hash (#/rota/param) — funciona offline, sem servidor,
 * e mantém o botão "voltar" do sistema funcionando.
 */
import { icon } from './icons.js';
import { $, closeSheet, esc } from './ui.js';
import { getState } from './store.js';

const routes = new Map();
let current = null;
const scrollMemory = new Map();

export function register(screen) { routes.set(screen.id, screen); }

export function parseHash(hash = location.hash) {
  const clean = hash.replace(/^#\/?/, '');
  const [path, query] = clean.split('?');
  const parts = path.split('/').filter(Boolean);
  const params = Object.fromEntries(new URLSearchParams(query || ''));
  return { id: parts[0] || 'home', arg: parts[1] ? decodeURIComponent(parts[1]) : null, params };
}

export function navigate(to, { replace = false } = {}) {
  const target = to.startsWith('#') ? to : `#/${to}`;
  if (location.hash === target) { render(); return; }
  const depth = history.state?.depth ?? 0;
  if (replace) history.replaceState({ depth }, '', target);
  else history.pushState({ depth: depth + 1 }, '', target);
  render();
}

/** Volta uma tela; se já for a primeira do app, cai no destino de reserva. */
export function back(fallback = 'home') {
  if ((history.state?.depth ?? 0) > 0) history.back();
  else navigate(fallback, { replace: true });
}

export const currentRoute = () => parseHash();

export function render() {
  const view = $('#view');
  const appbar = $('#appbar');
  const tabbar = $('#tabbar');
  const route = parseHash();
  const screen = routes.get(route.id) || routes.get('home');

  if (current && routes.get(current)) scrollMemory.set(current, view.scrollTop);
  closeSheet();

  const out = screen.render(route) || {};
  appbar.innerHTML = out.appbar ? renderAppbar(out.appbar) : '';
  appbar.className = `appbar${out.appbar?.variant === 'flat' ? ' appbar--flat' : ''}`;
  view.innerHTML = out.html || '';
  view.classList.toggle('has-tabbar', !!screen.tab);
  tabbar.classList.toggle('on', !!screen.tab);
  if (screen.tab) renderTabbar(screen.tab);

  document.title = out.appbar?.title ? `${out.appbar.title} · Florescer` : 'Florescer — Fertilidade & Maternidade';
  out.mount?.(view);

  view.scrollTop = route.arg ? 0 : (scrollMemory.get(route.id) ?? 0);
  current = route.id;
  view.focus({ preventScroll: true });
}

function renderAppbar({ title, sub, back: hasBack = true, actions = [] }) {
  return `
    ${hasBack ? `<button class="iconbtn" data-back aria-label="Voltar">${icon('back', 20)}</button>` : ''}
    <div class="appbar__title">${esc(title)}${sub ? `<span class="appbar__sub">${esc(sub)}</span>` : ''}</div>
    ${actions.map((a) => `
      <button class="iconbtn" ${a.to ? `data-nav="${a.to}"` : `data-action="${a.action}"`} aria-label="${esc(a.label)}" style="position:relative">
        ${icon(a.icon, 20)}${a.dot ? '<i class="iconbtn__dot"></i>' : ''}
      </button>`).join('')}`;
}

const TABS = [
  { id: 'home', to: 'home', label: 'Início', icon: 'home' },
  { id: 'ciclo', to: 'ciclo', label: 'Ciclo', icon: 'calendar' },
  { id: 'missoes', to: 'missoes', label: 'Missões', icon: 'flag' },
  { id: 'fab', to: 'registro', label: 'Registrar meu dia', icon: 'plus', fab: true },
  { id: 'dicas', to: 'dicas', label: 'Dicas', icon: 'sparkle' },
  { id: 'comunidade', to: 'comunidade', label: 'Comunidade', icon: 'users' },
  { id: 'perfil', to: 'perfil', label: 'Perfil', icon: 'user' },
];

function renderTabbar(active) {
  const phase = getState().profile.phase;
  const fabTarget = phase === 'posparto' ? 'registro' : 'adicionar';
  const fabLabel = phase === 'tentante' ? 'Adicionar teste, relação ou registro'
    : phase === 'gravida' ? 'Adicionar registro, sintoma ou nascimento' : 'Registrar meu dia';
  $('#tabbar').innerHTML = TABS.map((t) => t.fab
    ? `<button class="tab__fab" data-nav="${fabTarget}" aria-label="${fabLabel}">${icon(t.icon, 26, { stroke: 2 })}</button>`
    : `<button class="tab" data-nav="${t.to}" ${active === t.id ? 'aria-current="page"' : ''}>
        <span class="tab__ico">${icon(t.icon, 22)}</span><span>${t.label}</span>
      </button>`).join('');
}

/* ---------- delegação global de eventos ---------- */
export function initRouter() {
  // popstate cobre o botão voltar/avançar do sistema e mudanças manuais no hash
  addEventListener('popstate', render);

  document.addEventListener('click', (e) => {
    const nav = e.target.closest('[data-nav]');
    if (nav) { e.preventDefault(); navigate(nav.dataset.nav); return; }
    const b = e.target.closest('[data-back]');
    if (b) { e.preventDefault(); back(); }
  });

  if (!location.hash) history.replaceState(null, '', '#/home');
}
