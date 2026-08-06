/**
 * Gera os arquivos de marca do app a partir da logo original.
 *
 *   npm run icons          (precisa de sharp: npm i -D sharp)
 *   npm run icons:docker   (usa Docker, sem instalar nada)
 *
 * Entrada:  icons/logo.png  — a logo oficial, em alta resolução
 * Saídas:
 *   icons/logo-app.png      versão leve usada dentro do app
 *   icons/icon-192|512.png  ícone do PWA (ilustração + anel da marca)
 *   icons/apple-touch-icon.png
 *   icons/maskable-192|512.png  ícone adaptativo do Android
 *   icons/badge.png         badge monocromático das notificações
 */
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ICONS = join(ROOT, 'icons');
const LOGO = join(ICONS, 'logo.png');

let sharp;
try {
  ({ default: sharp } = await import('sharp'));
} catch {
  console.error(`
sharp não encontrado.

  Opção 1 — instalar:    npm i -D sharp && npm run icons
  Opção 2 — via Docker:  npm run icons:docker
`);
  process.exit(1);
}

const meta = await sharp(LOGO).metadata();
console.log(`fonte: ${LOGO.split(/[\\/]/).pop()} (${meta.width}×${meta.height})`);

/* Recorte da ilustração (gestante + ramo), sem o nome e a assinatura.
   Proporções medidas sobre a arte original. */
const side = Math.round(meta.width * 0.49);
const crop = {
  left: Math.round(meta.width * 0.245),
  top: Math.round(meta.height * 0.115),
  width: side,
  height: side,
};

const CREAM = '#FDF4F7';

/** Fundo do ícone: creme da marca + anel rosa-lilás, como no selo original. */
const iconBackground = (size, ring) => Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="anel" x1="0" y1="0.25" x2="1" y2="0.75">
      <stop offset="0%" stop-color="#F0A8CC"/><stop offset="50%" stop-color="#E7A9D2"/><stop offset="100%" stop-color="#C3A6E0"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="${CREAM}"/>
  ${ring ? '<circle cx="256" cy="256" r="240" fill="none" stroke="url(#anel)" stroke-width="13"/>' : ''}
</svg>`);

/** Máscara circular: recorta a ilustração e some com o fundo branco do arquivo. */
const circleMask = (s) => Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}"><circle cx="${s / 2}" cy="${s / 2}" r="${s / 2}" fill="#fff"/></svg>`,
);

async function build({ out, size, scale, ring }) {
  const inner = Math.round(size * scale);
  const illo = await sharp(LOGO)
    .extract(crop)
    .resize(inner, inner, { fit: 'fill' })
    .composite([{ input: circleMask(inner), blend: 'dest-in' }])
    .png()
    .toBuffer();

  await sharp(iconBackground(size, ring))
    .composite([{ input: illo, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toFile(join(ICONS, out));

  console.log(`✓ icons/${out} (${size}px)`);
}

// Versão leve da logo completa para as telas do app.
// Recortamos no próprio selo: a marca fica redonda de verdade e assenta bem
// também sobre fundos coloridos (a splash, por exemplo).
{
  const S = 560;
  const r = Math.round(S * 0.487); // borda externa do anel
  await sharp(LOGO)
    .resize(S, S, { fit: 'fill' })
    .composite([{
      input: Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}"><circle cx="${S / 2}" cy="${S / 2}" r="${r}" fill="#fff"/></svg>`,
      ),
      blend: 'dest-in',
    }])
    .png({ compressionLevel: 9 })
    .toFile(join(ICONS, 'logo-app.png'));
  console.log(`✓ icons/logo-app.png (${S}px, recorte circular)`);
}

await build({ out: 'icon-512.png', size: 512, scale: 0.66, ring: true });
await build({ out: 'icon-192.png', size: 192, scale: 0.66, ring: true });
await build({ out: 'apple-touch-icon.png', size: 180, scale: 0.66, ring: true });
// maskable: conteúdo dentro da área segura (80% central), sem anel
await build({ out: 'maskable-512.png', size: 512, scale: 0.48, ring: false });
await build({ out: 'maskable-192.png', size: 192, scale: 0.48, ring: false });

// badge monocromático do Android (silhueta branca sobre fundo transparente)
await sharp(join(ICONS, 'badge.svg'), { density: 384 })
  .resize(96, 96)
  .png({ compressionLevel: 9 })
  .toFile(join(ICONS, 'badge.png'));
console.log('✓ icons/badge.png (96px)');

console.log('\nMarca gerada a partir de icons/logo.png.');
