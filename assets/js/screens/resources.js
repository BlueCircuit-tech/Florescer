import { getState, update } from '../store.js';
import {
  FEATURE_TONES,
  HOME_SHORTCUT_DEFAULTS,
  featureDescription,
  featureLabel,
  featureTarget,
  featuresFor,
  groupFeatures,
  normalizeHomeShortcutIds,
} from '../features.js';
import { icon } from '../icons.js';
import { esc, haptic, toast } from '../ui.js';
import { navigate } from '../router.js';

export default {
  id: 'recursos',
  tab: null,
  render(route = { params: {} }) {
    const state = getState();
    const phase = state.profile.phase;
    const customizing = route.params.modo === 'atalhos';
    const items = featuresFor(phase, customizing ? 'home' : 'resources');
    const groups = groupFeatures(items);
    let selected = normalizeHomeShortcutIds(state.settings.homeShortcuts?.[phase], phase);

    return {
      appbar: {
        title: customizing ? 'Personalizar atalhos' : 'Central de Recursos',
        sub: customizing ? 'Escolha exatamente quatro' : phaseLabel(phase),
      },
      html: `<div class="section pb-24 stagger">
        <div class="card diaryintro">
          <span class="floatcard__ico">${icon(customizing ? 'settings' : 'flower', 22)}</span>
          <div><b>${customizing ? 'Sua Home, do seu jeito' : 'Tudo em um só lugar'}</b><p>${customizing ? 'Selecione quatro recursos. A ordem escolhida será usada na tela inicial.' : 'Encontre os cuidados e conteúdos da sua fase sem sobrecarregar a tela inicial.'}</p></div>
        </div>

        ${customizing ? `<div class="shortcut-editor__status mt-16"><b data-shortcut-count role="status" aria-live="polite">${selected.length} de 4 selecionados</b><button class="link" data-default-shortcuts>Restaurar padrão</button></div>` : `<button class="btn btn--soft mt-16" data-nav="recursos?modo=atalhos">${icon('settings', 18)} Personalizar atalhos da Home</button>`}

        <div class="resource-groups">
          ${groups.map((group, index) => resourceGroup(group, phase, customizing, selected, index === 0)).join('')}
        </div>

        ${customizing ? `<button class="btn mt-16" data-save-shortcuts ${selected.length === 4 ? '' : 'disabled'}>${icon('check', 19)} Salvar atalhos</button>` : ''}
      </div>`,
      mount(root) {
        if (!customizing) return;
        const buttons = [...root.querySelectorAll('[data-shortcut-id]')];
        const count = root.querySelector('[data-shortcut-count]');
        const save = root.querySelector('[data-save-shortcuts]');
        const sync = () => {
          buttons.forEach((button) => {
            const order = selected.indexOf(button.dataset.shortcutId);
            button.setAttribute('aria-pressed', String(order >= 0));
            button.querySelector('[data-shortcut-order]').textContent = order >= 0 ? String(order + 1) : '';
          });
          count.textContent = `${selected.length} de 4 selecionados`;
          save.disabled = selected.length !== 4;
        };
        buttons.forEach((button) => {
          button.onclick = () => {
            const id = button.dataset.shortcutId;
            if (selected.includes(id)) selected = selected.filter((item) => item !== id);
            else if (selected.length >= 4) { toast('Você pode escolher até quatro atalhos.'); return; }
            else selected.push(id);
            haptic();
            sync();
          };
        });
        root.querySelector('[data-default-shortcuts]').onclick = () => {
          selected = [...HOME_SHORTCUT_DEFAULTS[phase]];
          sync();
          haptic();
        };
        save.onclick = () => {
          if (selected.length !== 4) { toast('Escolha quatro atalhos para continuar.'); return; }
          update((current) => { current.settings.homeShortcuts[phase] = [...selected]; });
          toast('Atalhos da Home atualizados.');
          navigate('home', { replace: true });
        };
        sync();
      },
    };
  },
};

function resourceGroup(group, phase, customizing, selected, open) {
  return `<details class="resource-group" ${open ? 'open' : ''}>
    <summary class="resource-group__summary"><span>${esc(group.label)}</span><span class="pill pill--gray">${group.features.length}</span>${icon('chevronDown', 17)}</summary>
    <div class="card card--flush"><div class="itemlist">
      ${group.features.map((item) => customizing ? shortcutOption(item, phase, selected) : resourceLink(item, phase)).join('')}
    </div></div>
  </details>`;
}

function resourceLink(item, phase) {
  const tone = FEATURE_TONES[item.tone] || FEATURE_TONES.rose;
  return `<button class="item" data-nav="${esc(featureTarget(item, phase))}">
    <span class="item__ico" style="background:${tone.bg};color:${tone.fg}">${icon(item.icon, 20)}</span>
    <span class="item__body"><b>${esc(featureLabel(item, phase))}</b><span>${esc(featureDescription(item, phase))}</span></span>
    <span class="item__end">${icon('chevron', 17)}</span>
  </button>`;
}

function shortcutOption(item, phase, selected) {
  const tone = FEATURE_TONES[item.tone] || FEATURE_TONES.rose;
  const order = selected.indexOf(item.id);
  return `<button class="item shortcut-option" data-shortcut-id="${item.id}" aria-pressed="${order >= 0}">
    <span class="item__ico" style="background:${tone.bg};color:${tone.fg}">${icon(item.icon, 20)}</span>
    <span class="item__body"><b>${esc(featureLabel(item, phase))}</b><span>${esc(featureDescription(item, phase))}</span></span>
    <span class="shortcut-option__order" data-shortcut-order>${order >= 0 ? order + 1 : ''}</span>
  </button>`;
}

function phaseLabel(phase) {
  return phase === 'gravida' ? 'Florescer Gestação' : phase === 'posparto' ? 'Florescer Baby' : 'Florescer Tentante';
}
