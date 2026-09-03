/**
 * Boas-vindas + quiz de entrada.
 * O quiz define a fase da usuária e os dados que alimentam o motor de ciclo.
 */
import { getState, update, addJourney } from '../store.js';
import { icon, markSvg } from '../icons.js';
import { toast, esc, haptic, progress } from '../ui.js';
import { navigate } from '../router.js';
import { toKey, today, addDays, fromKey, diffDays } from '../cycle.js';
import { applyPregnancyProfile, pregnancyDraft, pregnancyQuizSteps } from '../pregnancyProfile.js';
import { applyBabyNames, babyNamesEditor, babyNamesFromProfile, bindBabyNamesEditor } from '../babies.js';

let step = 0;
let draft = null;

export const initialBirthDate = (value, ref = today()) => value || toKey(ref);

const initDraft = () => {
  const p = getState().profile;
  return {
    name: p.name || '',
    phase: p.phase || null,
    tryingFor: p.tryingFor,
    regularity: p.regularity,
    challenge: p.challenge,
    lastPeriodStart: p.lastPeriodStart || null,
    cycleLength: p.cycleLength || 28,
    periodLength: p.periodLength || 5,
    dueDate: p.dueDate,
    pregnancyType: p.pregnancyType,
    ultrasoundPhoto: p.ultrasoundPhoto,
    birthDate: initialBirthDate(p.birthDate),
    babyName: p.babyName || '',
    babyNames: babyNamesFromProfile(p),
    tips: true,
  };
};

/* --------- definição dos passos --------- */
function steps() {
  const common = [
    {
      key: 'name',
      title: 'Como podemos te chamar?',
      sub: 'Usamos o seu nome nas mensagens do app — só aqui, no seu aparelho.',
      render: () => `<div class="quiz__opts">
        <div class="field">
          <label for="q-name">Seu nome ou apelido</label>
          <input id="q-name" type="text" autocomplete="given-name" maxlength="32" placeholder="Ex.: Marcele" value="${esc(draft.name)}">
        </div>
      </div>`,
      mount: (root) => {
        const el = root.querySelector('#q-name');
        el.oninput = () => { draft.name = el.value; };
        el.onkeydown = (e) => { if (e.key === 'Enter') next(); };
      },
      valid: () => draft.name.trim().length >= 2 || 'Escreva ao menos 2 letras 💛',
    },
    {
      key: 'phase',
      title: 'Em qual fase você está?',
      sub: 'Assim personalizamos a tela inicial e os conteúdos para o seu momento.',
      options: [
        ['seed', 'Tentando engravidar', 'tentante'],
        ['pregnant', 'Estou grávida', 'gravida'],
        ['baby', 'Pós-parto', 'posparto'],
      ],
      field: 'phase',
    },
  ];

  const tentante = [
    {
      key: 'tryingFor',
      title: 'Há quanto tempo você está tentando?',
      sub: 'Sem julgamentos — cada jornada tem o seu ritmo.',
      options: [
        ['sparkle', 'Ainda não comecei', 'nao_comecei'],
        ['flower', 'Menos de 6 meses', 'ate_6m'],
        ['leaf', 'Entre 6 meses e 1 ano', '6m_1a'],
        ['heart', 'Mais de 1 ano', 'mais_1a'],
      ],
      field: 'tryingFor',
    },
    {
      key: 'regularity',
      title: 'Como é o seu ciclo?',
      sub: 'Se não souber, tudo bem: o app aprende com os seus registros.',
      options: [
        ['calendar', 'Regular (varia até 4 dias)', 'regular'],
        ['refresh', 'Irregular', 'irregular'],
        ['help', 'Não sei informar', 'nao_sei'],
      ],
      field: 'regularity',
    },
    {
      key: 'dates',
      title: 'Quando começou a sua última menstruação?',
      sub: 'É a informação que mais melhora a precisão das previsões.',
      render: () => `<div class="quiz__opts">
        <div class="field">
          <label for="q-lmp">Primeiro dia da última menstruação</label>
          <input id="q-lmp" type="date" max="${toKey(today())}" min="${toKey(addDays(today(), -120))}" value="${draft.lastPeriodStart || ''}">
        </div>
        <div class="row" style="gap:12px">
          <div class="field grow"><label for="q-cycle">Duração do ciclo</label>
            <input id="q-cycle" type="number" inputmode="numeric" min="18" max="45" value="${draft.cycleLength}"></div>
          <div class="field grow"><label for="q-period">Dias de menstruação</label>
            <input id="q-period" type="number" inputmode="numeric" min="1" max="10" value="${draft.periodLength}"></div>
        </div>
        <p class="field__hint">Não sabe ao certo? Deixe 28 e 5 — os valores mais comuns. O app ajusta sozinho conforme você registra.</p>
      </div>`,
      mount: (root) => {
        root.querySelector('#q-lmp').onchange = (e) => { draft.lastPeriodStart = e.target.value; };
        root.querySelector('#q-cycle').onchange = (e) => { draft.cycleLength = +e.target.value || 28; };
        root.querySelector('#q-period').onchange = (e) => { draft.periodLength = +e.target.value || 5; };
      },
      valid: () => {
        if (!draft.lastPeriodStart) return 'Escolha uma data para continuar';
        if (diffDays(fromKey(draft.lastPeriodStart), today()) > 0) return 'A data não pode estar no futuro';
        return true;
      },
    },
    {
      key: 'challenge',
      title: 'Qual o seu maior desafio hoje?',
      sub: 'Vamos priorizar o que mais importa para você.',
      options: [
        ['leaf', 'Entender meu período fértil', 'fertil'],
        ['moon', 'Lidar com a ansiedade', 'ansiedade'],
        ['book', 'Falta de informação', 'informacao'],
        ['note', 'Organizar as tentativas', 'organizar'],
      ],
      field: 'challenge',
    },
  ];

  const gravida = pregnancyQuizSteps(draft);

  const posparto = [
    {
      key: 'birth',
      title: 'Quando o seu bebê nasceu?',
      sub: 'Assim acompanhamos a sua recuperação e as semanas do bebê.',
      render: () => `<div class="quiz__opts">
        <div class="field">
          <label for="q-birth">Data de nascimento</label>
          <input id="q-birth" type="date" value="${draft.birthDate}" max="${toKey(today())}" min="${toKey(addDays(today(), -900))}">
        </div>
        ${babyNamesEditor(draft, { minimum: 1, allowMore: true })}
      </div>`,
      mount: (root) => {
        root.querySelector('#q-birth').onchange = (e) => { draft.birthDate = e.target.value; };
        bindBabyNamesEditor(root, draft, { minimum: 1, allowMore: true });
      },
      valid: () => {
        if (!draft.birthDate) return 'Escolha a data de nascimento';
        if (diffDays(fromKey(draft.birthDate), today()) > 0) return 'A data de nascimento não pode estar no futuro';
        return true;
      },
    },
  ];

  const last = [
    {
      key: 'tips',
      title: 'Quer receber uma sugestão por dia?',
      sub: 'Mensagens curtas sobre ciclo, bem-estar e nutrição, escolhidas para a sua fase.',
      options: [
        ['heart', 'Sim, quero!', true],
        ['bell', 'Agora não', false],
      ],
      field: 'tips',
    },
  ];

  const middle = draft.phase === 'gravida' ? gravida : draft.phase === 'posparto' ? posparto : tentante;
  return [...common, ...(draft.phase ? middle : []), ...last];
}

/* --------- navegação do quiz --------- */
function next() {
  const list = steps();
  const s = list[step - 1];
  const check = s.valid ? s.valid() : (draft[s.field] !== null && draft[s.field] !== undefined) || 'Escolha uma opção para continuar 💛';
  if (check !== true) { toast(typeof check === 'string' ? check : 'Escolha uma opção 💛'); return; }
  haptic();
  if (step - 1 < list.length - 1) { step++; paint(); return; }
  finish();
}

function prev() {
  if (step > 0) { step--; paint(); return; }
  navigate('home');
}

function finish() {
  update((s) => {
    s.onboarded = true;
    Object.assign(s.profile, {
      name: draft.name.trim(),
      phase: draft.phase,
      tryingFor: draft.tryingFor,
      regularity: draft.regularity,
      challenge: draft.challenge,
      lastPeriodStart: draft.phase === 'tentante' ? draft.lastPeriodStart : (draft.lastPeriodStart || null),
      cycleLength: +draft.cycleLength || 28,
      periodLength: +draft.periodLength || 5,
      dueDate: draft.phase === 'gravida' ? draft.dueDate : null,
      pregnancyType: draft.phase === 'gravida' ? draft.pregnancyType : null,
      ultrasoundPhoto: draft.phase === 'gravida' ? draft.ultrasoundPhoto : null,
      birthDate: draft.phase === 'posparto' ? draft.birthDate : null,
      babyName: '',
      babyNames: [],
    });
    if (draft.phase === 'gravida') applyPregnancyProfile(s.profile, draft);
    else if (draft.phase === 'posparto') applyBabyNames(s.profile, draft.babyNames);
    s.settings.tipsOptIn = !!draft.tips;
    s.settings.notifications.tip = !!draft.tips;
  });
  const marcos = {
    tentante: ['seed', 'Comecei a acompanhar meu ciclo'],
    gravida: ['pregnant', 'Descobri que estou grávida'],
    posparto: ['baby', 'Meu bebê nasceu'],
  }[draft.phase];
  addJourney(marcos[0], marcos[1], 'registrado no cadastro');
  navigate('boas-vindas', { replace: true });
}

function paint() {
  // re-renderiza apenas esta tela sem passar pelo roteador
  const view = document.querySelector('#view');
  const out = screen.render();
  view.innerHTML = out.html;
  out.mount(view);
}

/* --------- render --------- */
const screen = {
  id: 'inicio',
  render() {
    if (draft === null) draft = initDraft();

    if (step === 0) {
      return {
        appbar: null,
        html: `<div class="splash">
          <div class="splash__top">
            <img class="splash__logo" src="icons/logo-app.png" width="248" height="248" alt="Florescer — seu ciclo, seu sonho, nossa missão">
            <p class="splash__sub">Ciclo, fertilidade, gestação e pós-parto — no seu ritmo.</p>
          </div>
          <div>
            <button class="btn" data-start>Quero começar ${icon('chevron', 18)}</button>
            <p class="splash__legal">Um quiz rápido para entendermos a sua fase. Seus dados ficam só neste aparelho e o app não substitui orientação médica.</p>
          </div>
        </div>`,
        mount(root) { root.querySelector('[data-start]').onclick = () => { step = 1; paint(); }; },
      };
    }

    const list = steps();
    const s = list[step - 1];
    const pct = step / list.length;

    return {
      appbar: null,
      html: `
        <header class="appbar appbar--flat" style="padding-bottom:4px">
          <button class="iconbtn" data-prev aria-label="Voltar">${icon('back', 20)}</button>
          <div class="appbar__title">Vamos nos conhecer</div>
        </header>
        <div class="quiz__prog">
          ${progress(pct)}
          <div class="quiz__step">Passo ${step} de ${list.length}</div>
        </div>
        <h1 class="quiz__title">${esc(s.title)}</h1>
        <p class="quiz__sub">${esc(s.sub)}</p>
        ${s.options ? `<div class="quiz__opts">${s.options.map((o, i) => `
          <button class="opt" data-opt="${i}" aria-pressed="${draft[s.field] === o[2]}">
            <span class="opt__ico">${icon(o[0], 18)}</span>
            <span class="grow">${esc(o[1])}</span>
            <span class="opt__check">${icon('check', 18)}</span>
          </button>`).join('')}</div>` : s.render()}
        <div class="section" style="padding-top:22px;padding-bottom:28px">
          <button class="btn" data-next>${step === list.length ? 'Ver meu Florescer 🌸' : 'Continuar'}</button>
        </div>`,
      mount(root) {
        root.querySelector('[data-prev]').onclick = prev;
        root.querySelector('[data-next]').onclick = next;
        s.mount?.(root);
        root.querySelectorAll('[data-opt]').forEach((btn) => {
          btn.onclick = () => {
            const opt = s.options[+btn.dataset.opt];
            draft[s.field] = opt[2];
            if (s.field === 'phase' && opt[2] === 'gravida') Object.assign(draft, pregnancyDraft(draft));
            haptic();
            root.querySelectorAll('[data-opt]').forEach((b) => b.setAttribute('aria-pressed', 'false'));
            btn.setAttribute('aria-pressed', 'true');
            setTimeout(next, 180);
          };
        });
      },
    };
  },
};

/** Reinicia o quiz (usado pelo perfil). */
export function restartQuiz() { step = 1; draft = initDraft(); }

export default screen;
