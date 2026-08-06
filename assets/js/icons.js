/**
 * Conjunto de ícones do Florescer.
 * Traçado de 1.7px em grade de 24px — coerente em todo o app.
 * Uso: icon('calendar', 20) → string SVG.
 */

const P = {
  /* navegação */
  home: '<path d="M3.6 10.4 12 3.8l8.4 6.6V19a1.6 1.6 0 0 1-1.6 1.6h-3.2v-6H8.4v6H5.2A1.6 1.6 0 0 1 3.6 19z"/>',
  calendar: '<rect x="3.4" y="5" width="17.2" height="15.6" rx="3"/><path d="M3.4 9.6h17.2M8 3.4v3.2M16 3.4v3.2"/>',
  sparkle: '<path d="M12 3.2 13.9 9l5.8 1.9-5.8 1.9L12 18.6 10.1 12.8 4.3 10.9 10.1 9z"/><path d="M18.6 3.4v3M17.1 4.9h3"/>',
  users: '<path d="M15.8 20.4v-1.7a3.9 3.9 0 0 0-3.9-3.9H6.6a3.9 3.9 0 0 0-3.9 3.9v1.7"/><circle cx="9.2" cy="7.6" r="3.4"/><path d="M21.3 20.4v-1.7a3.9 3.9 0 0 0-2.9-3.8M16.1 4.2a3.9 3.9 0 0 1 0 7"/>',
  plus: '<path d="M12 5.2v13.6M5.2 12h13.6"/>',
  user: '<circle cx="12" cy="8" r="3.9"/><path d="M4.6 20.4a7.4 7.4 0 0 1 14.8 0"/>',

  /* ações */
  back: '<path d="M14.8 5.4 8.2 12l6.6 6.6"/>',
  chevron: '<path d="M9.2 5.4 15.8 12l-6.6 6.6"/>',
  chevronUp: '<path d="M5.4 14.8 12 8.2l6.6 6.6"/>',
  chevronDown: '<path d="M5.4 9.2 12 15.8l6.6-6.6"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  check: '<path d="M4.8 12.6 9.4 17.2 19.2 7.4"/>',
  refresh: '<path d="M20.2 11.2A8.2 8.2 0 0 0 5.6 7.4M3.8 12.8A8.2 8.2 0 0 0 18.4 16.6"/><path d="M20.4 5.6v5.6h-5.6M3.6 18.4v-5.6h5.6"/>',
  edit: '<path d="M16.4 3.9a2.3 2.3 0 0 1 3.3 3.3L8.4 18.5l-4.3 1 1-4.3z"/>',
  trash: '<path d="M4.6 6.6h14.8M9.4 6.6V4.8a1.4 1.4 0 0 1 1.4-1.4h2.4a1.4 1.4 0 0 1 1.4 1.4v1.8M6.4 6.6l.9 12.2a1.6 1.6 0 0 0 1.6 1.5h6.2a1.6 1.6 0 0 0 1.6-1.5l.9-12.2"/>',
  download: '<path d="M12 3.6v11.2M7.4 10.4 12 15l4.6-4.6M4.4 19.2h15.2"/>',
  upload: '<path d="M12 15V3.8M7.4 8.4 12 3.8l4.6 4.6M4.4 19.2h15.2"/>',
  share: '<path d="M15.8 8.4a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2ZM6.2 14.6a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2ZM15.8 20.8a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2Z"/><path d="m8.5 10.9 5-2.5M8.5 13.1l5 2.5"/>',
  send: '<path d="M20.4 3.6 10.8 13.2M20.4 3.6 14.3 20.4l-3.5-7.2-7.2-3.5z"/>',
  search: '<circle cx="10.8" cy="10.8" r="6.6"/><path d="m20.4 20.4-4.9-4.9"/>',
  filter: '<path d="M4 5.6h16L14 12.8v5.6l-4 2v-7.6z"/>',
  settings: '<circle cx="12" cy="12" r="3.1"/><path d="M19.1 14.6a1.5 1.5 0 0 0 .3 1.7l.1.1a1.9 1.9 0 1 1-2.7 2.7l-.1-.1a1.5 1.5 0 0 0-2.6 1.1v.2a1.9 1.9 0 1 1-3.8 0v-.1a1.5 1.5 0 0 0-2.6-1.1l-.1.1a1.9 1.9 0 1 1-2.7-2.7l.1-.1a1.5 1.5 0 0 0-1.1-2.6h-.2a1.9 1.9 0 1 1 0-3.8h.1a1.5 1.5 0 0 0 1.1-2.6l-.1-.1a1.9 1.9 0 1 1 2.7-2.7l.1.1a1.5 1.5 0 0 0 1.7.3h.1a1.5 1.5 0 0 0 .9-1.4v-.2a1.9 1.9 0 1 1 3.8 0v.1a1.5 1.5 0 0 0 2.6 1.1l.1-.1a1.9 1.9 0 1 1 2.7 2.7l-.1.1a1.5 1.5 0 0 0-.3 1.7v.1a1.5 1.5 0 0 0 1.4.9h.2a1.9 1.9 0 1 1 0 3.8h-.1a1.5 1.5 0 0 0-1.4.9z"/>',

  /* ciclo & saúde */
  drop: '<path d="M12 3.2s6 6.3 6 10.2a6 6 0 0 1-12 0c0-3.9 6-10.2 6-10.2Z"/>',
  leaf: '<path d="M4.6 19.4c-2-6.5 2.6-14.2 15.2-15.2C21.4 15.6 14.4 21.4 4.6 19.4Z"/><path d="M4.6 19.4c3-4.6 6.8-7.4 11.4-9.6"/>',
  seed: '<path d="M12 20.4c-4.6 0-7.4-3.2-7.4-7.4S7.4 3.6 12 3.6s7.4 5.2 7.4 9.4-2.8 7.4-7.4 7.4Z"/><path d="M12 20.4V8.6M12 12.4 8.8 9.2M12 14.6l3.2-3.2"/>',
  flower: '<circle cx="12" cy="12" r="2.6"/><path d="M12 9.4c0-3.2 1.2-5.6 0-6.2s-2.4 3-2.4 6.2M14.6 12c3.2 0 5.6 1.2 6.2 0s-3-2.4-6.2-2.4M12 14.6c0 3.2-1.2 5.6 0 6.2s2.4-3 2.4-6.2M9.4 12c-3.2 0-5.6-1.2-6.2 0s3 2.4 6.2 2.4"/>',
  heart: '<path d="M12 20.2s-7.6-4.6-7.6-9.8a4.3 4.3 0 0 1 7.6-2.7 4.3 4.3 0 0 1 7.6 2.7c0 5.2-7.6 9.8-7.6 9.8Z"/>',
  heartFill: '<path d="M12 20.2s-7.6-4.6-7.6-9.8a4.3 4.3 0 0 1 7.6-2.7 4.3 4.3 0 0 1 7.6 2.7c0 5.2-7.6 9.8-7.6 9.8Z" fill="currentColor" stroke="none"/>',
  thermometer: '<path d="M13.8 14.2V5.4a2 2 0 1 0-4 0v8.8a4.2 4.2 0 1 0 4 0Z"/>',
  test: '<path d="M9.4 3.6h5.2M11 3.6v6.2l-4.4 8a2.4 2.4 0 0 0 2.1 3.6h6.6a2.4 2.4 0 0 0 2.1-3.6l-4.4-8V3.6"/><path d="M7.9 15.4h8.2"/>',
  moon: '<path d="M20.4 13.4A8.4 8.4 0 1 1 10.6 3.6a6.6 6.6 0 0 0 9.8 9.8Z"/>',
  baby: '<circle cx="12" cy="12" r="8.4"/><path d="M9.4 10.2h.01M14.6 10.2h.01M9.6 14.4a3.4 3.4 0 0 0 4.8 0"/>',
  bottle: '<path d="M9.8 3.6h4.4l-1 3.2v1.4a3 3 0 0 1 2 2.8v6.6a2.8 2.8 0 0 1-2.8 2.8h-1.8a2.8 2.8 0 0 1-2.8-2.8V11a3 3 0 0 1 2-2.8V6.8Z"/><path d="M8.8 13h6.4"/>',
  pregnant: '<circle cx="10.6" cy="4.4" r="2.4"/><path d="M8.6 20.8v-5.2M8.6 15.6v-5.4a2.2 2.2 0 0 1 2.2-2.2h.6a4.2 4.2 0 0 1 0 8.4H8.6"/>',

  /* app */
  bell: '<path d="M17.6 10.4a5.6 5.6 0 1 0-11.2 0c0 6.2-2.4 8 -2.4 8h16s-2.4-1.8-2.4-8Z"/><path d="M13.6 21.4a1.9 1.9 0 0 1-3.2 0"/>',
  lock: '<rect x="4.6" y="10.4" width="14.8" height="10" rx="2.6"/><path d="M8.2 10.4V7.6a3.8 3.8 0 0 1 7.6 0v2.8"/>',
  crown: '<path d="M3.4 7.4 7 12l5-6.6L17 12l3.6-4.6-1.6 11.2H5z"/>',
  book: '<path d="M4.4 5.2A2 2 0 0 1 6.4 3.2H19v17.6H6.4a2 2 0 0 0-2 2Z"/><path d="M4.4 18.6a2 2 0 0 1 2-2H19"/>',
  chart: '<path d="M4.4 20V4M4.4 20h15.8"/><path d="M8.4 16.4v-4.2M12.4 16.4V7.6M16.4 16.4v-6.4"/>',
  note: '<path d="M5.4 4.6h13.2v14.8H5.4z" rx="2"/><path d="M8.6 9h6.8M8.6 12.4h6.8M8.6 15.8h4"/>',
  clock: '<circle cx="12" cy="12" r="8.4"/><path d="M12 7.2V12l3 1.8"/>',
  info: '<circle cx="12" cy="12" r="8.4"/><path d="M12 16v-4.4M12 8.2h.01"/>',
  shield: '<path d="M12 3.4 19.4 6v6c0 4.4-3.1 7.6-7.4 8.6C7.7 19.6 4.6 16.4 4.6 12V6Z"/><path d="m9.4 12 1.9 1.9 3.6-3.8"/>',
  help: '<circle cx="12" cy="12" r="8.4"/><path d="M9.8 9.6a2.3 2.3 0 0 1 4.5.7c0 1.5-2.3 2.3-2.3 2.3M12 16.4h.01"/>',
  logout: '<path d="M9.4 20.4H5.8a1.8 1.8 0 0 1-1.8-1.8V5.4a1.8 1.8 0 0 1 1.8-1.8h3.6M15 16.4l4.4-4.4L15 7.6M19.4 12H9"/>',
  bookmark: '<path d="M18.4 20.4 12 16l-6.4 4.4V5.4a2 2 0 0 1 2-2h8.8a2 2 0 0 1 2 2Z"/>',
  message: '<path d="M20.4 11.6a7.2 7.2 0 0 1-7.8 7.2 8.3 8.3 0 0 1-3.4-.8l-5 1.6 1.6-4.6a7.5 7.5 0 0 1-.9-3.6 7.2 7.2 0 0 1 7.3-7.2h.5a7.2 7.2 0 0 1 6.8 6.8Z"/>',
  flag: '<path d="M5 20.4V4.2M5 4.2h9.6l-1 2.6 1 2.6H5"/>',
  wifiOff: '<path d="M2.6 2.6l18.8 18.8M8.4 15.6a5 5 0 0 1 6-.8M5 12.2a10 10 0 0 1 4-2.4M2 8.8a15 15 0 0 1 4.4-2.6M12 20h.01M17.6 12.6a10 10 0 0 0-2.6-1.6M22 8.8a15 15 0 0 0-8-3.6"/>',
  install: '<rect x="6.4" y="2.6" width="11.2" height="18.8" rx="2.6"/><path d="M12 6.6v7.2M9.2 11l2.8 2.8L14.8 11"/>',
};

const SIZES = { sm: 16, md: 20, lg: 24 };

/**
 * @param {keyof P} name
 * @param {number|'sm'|'md'|'lg'} [size=20]
 * @param {{class?:string, stroke?:number}} [opts]
 */
export function icon(name, size = 20, opts = {}) {
  const d = P[name];
  if (!d) return '';
  const s = SIZES[size] || size;
  const cls = opts.class ? ` class="${opts.class}"` : '';
  const sw = opts.stroke || 1.7;
  return `<svg${cls} width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${d}</svg>`;
}

/**
 * Marca monocromática do Florescer — a gestante da logo em traço único.
 * Usada sobre fundos coloridos (splash, paywall, notificação), onde a
 * versão colorida da logo não teria contraste.
 */
export function markSvg(size = 48, stroke = 'currentColor', heart = '#FFD34D') {
  return `<svg width="${size}" height="${size}" viewBox="0 0 300 300" aria-hidden="true" focusable="false">
    <g transform="translate(150,150) scale(0.72) translate(-252,-238)"
       fill="none" stroke="${stroke}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round">
      <path d="M243 108 C203 116 178 146 174 186 C170 228 180 268 194 300 C203 322 216 336 233 342"/>
      <path d="M243 108 C273 104 295 123 298 153 C299 167 303 175 310 183 C314 188 312 194 305 195 L295 197 C296 209 291 220 280 223 C271 225 262 222 257 215"/>
      <path d="M257 215 C257 230 250 240 240 246 C219 258 203 274 198 296"/>
      <path d="M262 238 C298 246 320 272 322 304 C324 342 297 368 260 368 C224 368 200 342 198 306"/>
    </g>
    <path transform="translate(150,150) scale(0.72) translate(-252,-238)"
          d="M262 352 C262 352 226 331 226 306 C226 292 236 284 247 284 C254 284 259 288 262 293 C265 288 270 284 277 284 C288 284 298 292 298 306 C298 331 262 352 262 352 Z"
          fill="${heart}"/>
  </svg>`;
}

/** Logo completa (selo + nome + assinatura), em arquivo, para fundos claros. */
export function logoImg(size = 120, cls = '') {
  return `<img src="icons/logo-app.png" width="${size}" height="${size}" alt="Florescer — seu ciclo, seu sonho, nossa missão"${cls ? ` class="${cls}"` : ''}>`;
}

export const iconNames = Object.keys(P);
