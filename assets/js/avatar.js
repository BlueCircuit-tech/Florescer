/**
 * O avatar da usuária.
 *
 * Antes era um emoji por fase (🤰 / 🍼 / 🌷). Virou a foto dela quando existe
 * e, quando não existe, um ícone do mesmo conjunto do resto do app — não um
 * emoji, que destoa da interface e muda de desenho em cada sistema.
 */
import { icon } from './icons.js';
import { esc } from './ui.js';

/** Ícone de reserva por fase, do conjunto do app. */
export const AVATAR_ICON = {
  tentante: 'flower',
  gravida: 'pregnant',
  posparto: 'baby',
};

export const avatarIcon = (phase) => AVATAR_ICON[phase] || AVATAR_ICON.tentante;

/**
 * O conteúdo de dentro do avatar: a foto dela, ou o ícone da fase.
 * @param {object} profile perfil da usuária
 * @param {number} size tamanho do ícone de reserva
 */
export function avatarContent(profile = {}, size = 20) {
  const foto = typeof profile.avatarPhoto === 'string' && profile.avatarPhoto.startsWith('data:image/')
    ? profile.avatarPhoto
    : null;

  if (foto) {
    const nome = String(profile.name || '').trim().split(/\s+/)[0];
    return `<img class="avatar__img" src="${esc(foto)}" alt="${nome ? `Foto de ${esc(nome)}` : 'Sua foto de perfil'}">`;
  }
  return icon(avatarIcon(profile.phase), size);
}

export const hasAvatarPhoto = (profile = {}) => typeof profile.avatarPhoto === 'string'
  && profile.avatarPhoto.startsWith('data:image/');
