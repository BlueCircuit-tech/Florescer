import { icon } from './icons.js';
import { esc } from './ui.js';

export function babyNamesFromProfile(profile = {}) {
  const names = Array.isArray(profile.babyNames) ? profile.babyNames : [];
  const normalized = names.map((name) => String(name || '').trim()).filter(Boolean);
  if (normalized.length) return normalized;
  const legacy = String(profile.babyName || '').trim();
  return legacy ? [legacy] : [];
}

export function formatBabyNames(names, fallback = 'bebê') {
  const clean = (Array.isArray(names) ? names : []).map((name) => String(name || '').trim()).filter(Boolean);
  if (!clean.length) return fallback;
  if (clean.length === 1) return clean[0];
  if (clean.length === 2) return `${clean[0]} e ${clean[1]}`;
  return `${clean.slice(0, -1).join(', ')} e ${clean.at(-1)}`;
}

export function postpartumGreeting(profile = {}) {
  return `Olá, ${formatBabyNames(babyNamesFromProfile(profile))}!`;
}

export function applyBabyNames(profile, names, { multiple = true } = {}) {
  const clean = (Array.isArray(names) ? names : []).map((name) => String(name || '').trim()).filter(Boolean);
  profile.babyNames = multiple ? clean : clean.slice(0, 1);
  profile.babyName = profile.babyNames[0] || '';
  return profile;
}

export function babyNamesEditor(draft, { minimum = 1, allowMore = true } = {}) {
  ensureSlots(draft, minimum);
  return `<div data-baby-names>${babyNameFields(draft, { minimum, allowMore })}</div>`;
}

export function bindBabyNamesEditor(root, draft, { minimum = 1, allowMore = true } = {}) {
  const container = root.querySelector('[data-baby-names]');
  if (!container) return;
  const paint = () => {
    ensureSlots(draft, minimum);
    container.innerHTML = babyNameFields(draft, { minimum, allowMore });
    container.querySelectorAll('[data-baby-name]').forEach((input) => {
      input.oninput = () => { draft.babyNames[+input.dataset.babyName] = input.value; };
    });
    container.querySelectorAll('[data-remove-baby]').forEach((button) => {
      button.onclick = () => {
        draft.babyNames.splice(+button.dataset.removeBaby, 1);
        paint();
      };
    });
    container.querySelector('[data-add-baby]')?.addEventListener('click', () => {
      draft.babyNames.push('');
      paint();
      container.querySelector(`[data-baby-name="${draft.babyNames.length - 1}"]`)?.focus();
    });
  };
  paint();
}

function ensureSlots(draft, minimum) {
  if (!Array.isArray(draft.babyNames)) draft.babyNames = [];
  while (draft.babyNames.length < minimum) draft.babyNames.push('');
}

function babyNameFields(draft, { minimum, allowMore }) {
  return `${draft.babyNames.map((name, index) => `<div class="field">
      <label for="q-baby-${index}">${draft.babyNames.length > 1 ? `Bebê ${index + 1}` : 'Nome do bebê'} (opcional)</label>
      <div class="row" style="gap:8px">
        <input class="grow" id="q-baby-${index}" data-baby-name="${index}" type="text" maxlength="40" value="${esc(name)}" placeholder="Você pode deixar em branco">
        ${draft.babyNames.length > minimum ? `<button type="button" class="iconbtn" data-remove-baby="${index}" aria-label="Remover nome">${icon('trash', 17)}</button>` : ''}
      </div>
    </div>`).join('')}
    ${allowMore ? `<button type="button" class="btn btn--soft btn--sm" data-add-baby>${icon('plus', 17)} Adicionar outro bebê</button>` : ''}`;
}
