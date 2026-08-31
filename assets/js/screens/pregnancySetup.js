import { getState, update } from '../store.js';
import { icon } from '../icons.js';
import { esc, haptic, progress, toast } from '../ui.js';
import { navigate } from '../router.js';
import { applyPregnancyProfile, pregnancyDraft, pregnancyQuizSteps } from '../pregnancyProfile.js';

let step = 0;
let draft = null;

function steps() { return pregnancyQuizSteps(draft); }

function paint() {
  const view = document.querySelector('#view');
  const out = screen.render();
  view.innerHTML = out.html;
  out.mount(view);
}

function next() {
  const list = steps();
  const current = list[step];
  const check = current.valid ? current.valid() : draft[current.field] != null || 'Escolha uma opção para continuar';
  if (check !== true) { toast(typeof check === 'string' ? check : 'Preencha esta etapa para continuar.'); return; }
  haptic();
  if (step < list.length - 1) { step++; paint(); return; }

  update((state) => {
    state.profile.phase = 'gravida';
    applyPregnancyProfile(state.profile, draft);
  });
  haptic(14);
  toast('Informações da gestação salvas.');
  draft = null;
  step = 0;
  navigate('boas-vindas', { replace: true });
}

function prev() {
  if (step > 0) { step--; paint(); }
  else navigate('home', { replace: true });
}

const screen = {
  id: 'gestacao-inicio',
  tab: null,
  render() {
    if (!draft) draft = pregnancyDraft(getState().profile);
    const list = steps();
    const current = list[step];

    return {
      appbar: null,
      html: `<header class="appbar appbar--flat" style="padding-bottom:4px">
          <button class="iconbtn" data-prev aria-label="Voltar">${icon('back', 20)}</button>
          <div class="appbar__title">Seu Florescer Gestação</div>
        </header>
        <div class="quiz__prog">
          ${progress((step + 1) / list.length)}
          <div class="quiz__step">Passo ${step + 1} de ${list.length}</div>
        </div>
        <h1 class="quiz__title">${esc(current.title)}</h1>
        <p class="quiz__sub">${esc(current.sub)}</p>
        ${current.options ? `<div class="quiz__opts">${current.options.map((option, index) => `
          <button class="opt" data-opt="${index}" aria-pressed="${draft[current.field] === option[2]}">
            <span class="opt__ico">${icon(option[0], 18)}</span>
            <span class="grow">${esc(option[1])}</span>
            <span class="opt__check">${icon('check', 18)}</span>
          </button>`).join('')}</div>` : current.render()}
        <div class="section" style="padding-top:22px;padding-bottom:28px">
          <button class="btn" data-next>${step === list.length - 1 ? 'Começar meu Florescer Gestação' : 'Continuar'}</button>
        </div>`,
      mount(root) {
        root.querySelector('[data-prev]').onclick = prev;
        root.querySelector('[data-next]').onclick = next;
        current.mount?.(root);
        root.querySelectorAll('[data-opt]').forEach((button) => {
          button.onclick = () => {
            draft[current.field] = current.options[+button.dataset.opt][2];
            root.querySelectorAll('[data-opt]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
            haptic();
            setTimeout(next, 180);
          };
        });
      },
    };
  },
};

export default screen;
