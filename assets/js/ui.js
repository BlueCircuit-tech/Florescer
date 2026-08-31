/**
 * Primitivas de interface: toast, bottom sheet, feedback tátil,
 * helpers de DOM e gráficos SVG usados nos relatórios.
 */
import { icon } from './icons.js';

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/** Escapa texto vindo da usuária antes de injetar em HTML. */
export function esc(str = '') {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function haptic(ms = 8) {
  if (navigator.vibrate) { try { navigator.vibrate(ms); } catch { /* ignorado */ } }
}

/* ---------- toast ---------- */
let toastTimer;
export function toast(msg, ms = 2800) {
  const el = $('#toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('on'), ms);
}

/* ---------- bottom sheet ---------- */
let sheetCloser = null;

export function openSheet({ title, subtitle = '', body = '', onMount }) {
  const sheet = $('#sheet');
  const scrim = $('#scrim');
  sheet.innerHTML = `
    <div class="sheet__grab"></div>
    <h2 class="sheet__title" id="sheet-title">${esc(title)}</h2>
    ${subtitle ? `<p class="sheet__sub">${esc(subtitle)}</p>` : ''}
    <div class="sheet__body">${body}</div>`;
  sheet.hidden = false;
  scrim.hidden = false;
  requestAnimationFrame(() => { sheet.classList.add('on'); scrim.classList.add('on'); });
  onMount?.(sheet);
  sheetCloser = closeSheet;
  scrim.onclick = closeSheet;
  document.addEventListener('keydown', escClose);
  const focusable = sheet.querySelector('button, input, select, textarea');
  focusable?.focus({ preventScroll: true });
  return sheet;
}

function escClose(e) { if (e.key === 'Escape') closeSheet(); }

export function closeSheet() {
  const sheet = $('#sheet');
  const scrim = $('#scrim');
  if (!sheet || sheet.hidden) return;
  sheet.classList.remove('on');
  scrim.classList.remove('on');
  document.removeEventListener('keydown', escClose);
  setTimeout(() => { sheet.hidden = true; scrim.hidden = true; sheet.innerHTML = ''; }, 240);
  sheetCloser = null;
}

export const isSheetOpen = () => !!sheetCloser;

/** Confirmação em bottom sheet — devolve Promise<boolean>. */
export function confirmSheet({ title, message, confirmLabel = 'Confirmar', danger = false }) {
  return new Promise((resolve) => {
    openSheet({
      title,
      subtitle: message,
      body: `<div class="btnrow mt-8">
          <button class="btn btn--ghost" data-act="no">Cancelar</button>
          <button class="btn ${danger ? 'btn--danger' : ''}" data-act="yes">${esc(confirmLabel)}</button>
        </div>`,
      onMount(sheet) {
        sheet.querySelector('[data-act="no"]').onclick = () => { closeSheet(); resolve(false); };
        sheet.querySelector('[data-act="yes"]').onclick = () => { closeSheet(); resolve(true); };
      },
    });
  });
}

/* ---------- blocos reutilizáveis ---------- */
export function sectionHead(title, action) {
  return `<div class="section__head">
    <h2>${esc(title)}</h2>
    ${action ? `<button class="link" data-nav="${action.to}">${esc(action.label)} ${icon('chevron', 14)}</button>` : ''}
  </div>`;
}

export function emptyState(iconName, title, text, action) {
  return `<div class="empty">
    <div class="empty__ico">${icon(iconName, 28)}</div>
    <b>${esc(title)}</b>
    <p>${esc(text)}</p>
    ${action ? `<button class="btn btn--soft btn--auto btn--sm mt-16" data-nav="${action.to}">${esc(action.label)}</button>` : ''}
  </div>`;
}

/**
 * Seção com carrossel horizontal e indicação clara de que rola para o lado:
 * setas, barra de progresso, desvanecimento na borda e dica de arrastar.
 */
export function hscrollSection(title, id, cardsHtml, { hint = 'arraste para ver mais' } = {}) {
  return `<section class="hsec" data-hsec="${id}">
    <div class="hsec__head">
      <h2>${esc(title)}</h2>
      <div class="hsec__nav">
        <button data-hprev aria-label="Anterior" disabled>${icon('back', 17)}</button>
        <button data-hnext aria-label="Próximo">${icon('chevron', 17)}</button>
      </div>
    </div>
    <div class="hscroll" data-hrow>${cardsHtml}</div>
    <div class="hsec__rail"><i data-hbar></i></div>
    ${hint ? `<div class="hsec__hint">${esc(hint)} ${icon('chevron', 14)}</div>` : ''}
  </section>`;
}

/** Liga setas, barra e estados de todos os carrosséis dentro de `root`. */
export function bindHscroll(root) {
  root.querySelectorAll('[data-hsec]').forEach((sec) => {
    const row = sec.querySelector('[data-hrow]');
    const bar = sec.querySelector('[data-hbar]');
    const prev = sec.querySelector('[data-hprev]');
    const next = sec.querySelector('[data-hnext]');
    if (!row) return;

    const step = () => Math.max(160, row.clientWidth * 0.8);
    // o scroll-snap encosta no primeiro cartão deixando o padding lateral
    // como deslocamento inicial — daí a folga antes de considerar "rolado"
    const REST = 28;

    const sync = () => {
      const max = row.scrollWidth - row.clientWidth;
      const ratio = max > 4 ? row.scrollLeft / max : 1;
      const visible = max > 4 ? row.clientWidth / row.scrollWidth : 1;
      if (bar) {
        bar.style.transform = `scaleX(${visible}) translateX(${(ratio * (1 - visible) * 100) / visible}%)`;
      }
      sec.classList.toggle('has-more', max > 4 && ratio < 0.98);
      sec.classList.toggle('is-scrolled', row.scrollLeft > REST);
      if (prev) prev.disabled = row.scrollLeft <= REST;
      if (next) next.disabled = max <= 4 || ratio >= 0.98;
      sec.querySelector('.hsec__nav')?.style.setProperty('display', max > 4 ? 'flex' : 'none');
      sec.querySelector('.hsec__rail')?.style.setProperty('display', max > 4 ? 'block' : 'none');
      const hintEl = sec.querySelector('.hsec__hint');
      if (hintEl) hintEl.style.display = max > 4 ? 'flex' : 'none';
    };

    row.addEventListener('scroll', sync, { passive: true });
    prev?.addEventListener('click', () => { row.scrollBy({ left: -step() }); haptic(); });
    next?.addEventListener('click', () => { row.scrollBy({ left: step() }); haptic(); });
    requestAnimationFrame(sync);
  });
}

export function note(text, variant = '') {
  return `<div class="note ${variant ? `note--${variant}` : ''}">${icon('info', 17)}<span>${text}</span></div>`;
}

export function toggleRow(label, checked, id, hint = '') {
  return `<div class="kv">
    <span class="kv__k">${esc(label)}${hint ? `<small>${esc(hint)}</small>` : ''}</span>
    <button class="toggle" role="switch" aria-checked="${checked}" aria-label="${esc(label)}" data-toggle="${id}"></button>
  </div>`;
}

export function linkRow(label, value, target, hint = '') {
  return `<button class="kv" data-nav="${target}">
    <span class="kv__k">${esc(label)}${hint ? `<small>${esc(hint)}</small>` : ''}</span>
    <span class="kv__v">${esc(value)} ${icon('chevron', 15)}</span>
  </button>`;
}

/* ---------- gráficos SVG ---------- */

/** Gráfico de barras: [{label, value}] */
export function barChart(data, { height = 130, max, unit = '', highlightLast = true } = {}) {
  if (!data.length) return '';
  const w = 100, h = height;
  const top = Math.max(max || 0, ...data.map((d) => d.value)) * 1.15 || 1;
  const gap = 2.4;
  const bw = (w - gap * (data.length - 1)) / data.length;
  const bars = data.map((d, i) => {
    const bh = Math.max(2, (d.value / top) * (h - 30));
    const x = i * (bw + gap);
    const y = h - 22 - bh;
    const soft = highlightLast && i < data.length - 1;
    return `<rect class="bar ${soft ? 'bar--soft' : ''}" x="${x}" y="${y}" width="${bw}" height="${bh}" rx="3"/>
      <text x="${x + bw / 2}" y="${y - 5}" text-anchor="middle">${d.value}${unit}</text>
      <text x="${x + bw / 2}" y="${h - 6}" text-anchor="middle">${esc(d.label)}</text>`;
  }).join('');
  return `<svg class="chart" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" role="img" aria-label="Gráfico de barras">${bars}</svg>`;
}

/** Gráfico de linha (temperatura basal): [{label, value}] com valores possivelmente nulos. */
export function lineChart(data, { height = 140, unit = '°C', ariaLabel = 'Curva de temperatura basal' } = {}) {
  const pts = data.filter((d) => typeof d.value === 'number');
  if (pts.length < 2) return '';
  const w = 100, h = height, padY = 20;
  const vals = pts.map((p) => p.value);
  const min = Math.min(...vals) - 0.1;
  const max = Math.max(...vals) + 0.1;
  const sx = (i) => (data.indexOf(pts[i]) / Math.max(1, data.length - 1)) * w;
  const sy = (v) => padY + (1 - (v - min) / (max - min || 1)) * (h - padY * 2);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${sx(i).toFixed(1)},${sy(p.value).toFixed(1)}`).join(' ');
  const area = `${d} L${sx(pts.length - 1).toFixed(1)},${h - padY} L${sx(0).toFixed(1)},${h - padY} Z`;
  const dots = pts.map((p, i) => `<circle class="dot" cx="${sx(i).toFixed(1)}" cy="${sy(p.value).toFixed(1)}" r="1.6"/>`).join('');
  return `<svg class="chart" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" role="img" aria-label="${esc(ariaLabel)}">
    <line class="grid" x1="0" y1="${padY}" x2="${w}" y2="${padY}"/>
    <line class="grid" x1="0" y1="${h - padY}" x2="${w}" y2="${h - padY}"/>
    <path class="area" d="${area}"/>
    <path class="line" d="${d}"/>
    ${dots}
    <text x="0" y="${padY - 6}">${max.toFixed(1)}${unit}</text>
    <text x="0" y="${h - padY + 12}">${min.toFixed(1)}${unit}</text>
  </svg>`;
}

/** Anel do ciclo em SVG com os segmentos das fases. */
export function cycleRing(info, { size = 138 } = {}) {
  const r = 55, cx = 69, cy = 69, C = 2 * Math.PI * r;
  const len = info.avgLength || 28;
  const seg = (fromDay, toDay, color, width = 10, cap = 'butt') => {
    const start = ((fromDay - 1) / len) * C;
    const dash = Math.max(0, ((toDay - fromDay + 1) / len) * C);
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${width}"
      stroke-dasharray="${dash} ${C - dash}" stroke-dashoffset="${-start}" stroke-linecap="${cap}"
      transform="rotate(-90 ${cx} ${cy})"/>`;
  };
  const ovulDay = len - (info.luteal || 14);
  const angle = ((info.dayOfCycle - 0.5) / len) * 360 - 90;
  const rad = (angle * Math.PI) / 180;
  const mx = cx + Math.cos(rad) * r;
  const my = cy + Math.sin(rad) * r;

  return `<svg class="ring__svg" viewBox="0 0 138 138" width="${size}" height="${size}" role="img" aria-label="Dia ${info.dayOfCycle} de um ciclo de ${len} dias">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(255,255,255,.20)" stroke-width="10"/>
    ${seg(1, info.periodLength, 'rgba(255,183,208,.95)')}
    ${seg(ovulDay - 5, ovulDay + 1, 'rgba(160,235,192,.5)')}
    ${seg(ovulDay, ovulDay, '#A6EFC4', 12, 'round')}
    <circle cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="8.5" fill="rgba(255,255,255,.28)"/>
    <circle cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="5.5" fill="#fff"/>
    <text class="ring__day" x="${cx}" y="${cy + 3}" text-anchor="middle">${info.dayOfCycle}</text>
    <text class="ring__cap" x="${cx}" y="${cy + 19}" text-anchor="middle">dia do ciclo</text>
  </svg>`;
}

/** Barra de progresso simples. */
export function progress(pct) {
  return `<div class="progress"><i style="width:${Math.round(pct * 100)}%"></i></div>`;
}

/* ---------- download ---------- */
export function downloadFile(filename, content, type = 'application/json') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
