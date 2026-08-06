/**
 * Perfil: dados do quiz (editáveis), fase, jornada afetiva e acesso às configurações.
 */
import { getState, update, addJourney } from '../store.js';
import { icon } from '../icons.js';
import { esc, toast, openSheet, closeSheet, haptic, note } from '../ui.js';
import { navigate } from '../router.js';
import {
  cycleInfo, pregnancyInfo, postpartumInfo, streak, toKey, today, fromKey,
  fmtLong, fmtShort, addDays, diffDays, plural,
} from '../cycle.js';
import { PHASE_LABELS } from '../content.js';
import { restartQuiz } from './onboarding.js';

const rerender = () => import('../router.js').then((m) => m.render());

const TRYING = { nao_comecei: 'Ainda não comecei', ate_6m: 'Menos de 6 meses', '6m_1a': 'Entre 6 meses e 1 ano', mais_1a: 'Mais de 1 ano' };
const REGULARITY = { regular: 'Regular', irregular: 'Irregular', nao_sei: 'Não sei informar' };
const CHALLENGE = { fertil: 'Entender o período fértil', ansiedade: 'Lidar com a ansiedade', informacao: 'Falta de informação', organizar: 'Organizar as tentativas', outro: 'Outro' };

export default {
  id: 'perfil',
  render(route) {
    const state = getState();
    const p = state.profile;
    const info = cycleInfo(state);
    const preg = pregnancyInfo(state);
    const pp = postpartumInfo(state);
    const st = streak(state);
    const meta = PHASE_LABELS[p.phase];

    if (route.arg === 'ciclo') setTimeout(() => editCycle(), 60);

    const dadosFase = p.phase === 'tentante' ? `
        ${kv('Ciclo médio', info.known ? `${info.avgLength} dias` : `${p.cycleLength} dias`)}
        ${kv('Duração da menstruação', `${p.periodLength} dias`)}
        ${kv('Última menstruação', p.lastPeriodStart ? fmtLong(fromKey(p.lastPeriodStart)) : '—')}
        ${kv('Regularidade', REGULARITY[p.regularity] || '—')}
        ${kv('Tentando há', TRYING[p.tryingFor] || '—')}
        ${kv('Maior desafio', CHALLENGE[p.challenge] || '—')}`
      : p.phase === 'gravida' ? `
        ${kv('Data provável do parto', preg.known ? fmtLong(preg.due) : '—')}
        ${kv('Semanas', preg.known ? `${preg.weeks} semanas e ${preg.days} dias` : '—')}
        ${kv('Trimestre', preg.known ? `${preg.trimester}º` : '—')}`
      : `
        ${kv('Nascimento', pp.known ? fmtLong(pp.birth) : '—')}
        ${kv('Idade do bebê', pp.known ? pp.age : '—')}
        ${kv('Nome do bebê', p.babyName || '—')}`;

    const journey = state.journey.length ? state.journey : [
      { icon: 'flower', title: 'Entrei no Florescer', note: 'sua jornada começa aqui', at: state.createdAt },
    ];

    return {
      appbar: null,
      html: `
        <header class="hero" style="text-align:center;border-radius:0 0 var(--r-xl) var(--r-xl)">
          <div class="row row--between" style="position:relative;z-index:1">
            <button class="iconbtn iconbtn--onbrand" data-back aria-label="Voltar">${icon('back', 20)}</button>
            <button class="iconbtn iconbtn--onbrand" data-nav="configuracoes" aria-label="Configurações">${icon('settings', 20)}</button>
          </div>
          <div style="position:relative;z-index:1;padding-top:6px">
            <div class="hero__avatar" style="width:78px;height:78px;border-radius:26px;margin:0 auto 12px;font-size:34px">${meta.emoji}</div>
            <h1 style="font-family:var(--font-display);font-size:21px;font-weight:600">${esc(p.name || 'Sua jornada')}</h1>
            <p class="fs-12" style="color:rgba(255,255,255,.78);margin-top:4px">
              ${meta.label} · desde ${fmtShort(new Date(state.createdAt))}
              ${state.premium ? ' · <b style="color:#FFE08A">Premium 🌸</b>' : ''}
            </p>
            <div class="row" style="justify-content:center;gap:8px;margin-top:14px">
              <span class="pill pill--onbrand">${plural(st.total, 'registro', 'registros')}</span>
              <span class="pill pill--onbrand">sequência ${st.current}d</span>
              ${info.known ? `<span class="pill pill--onbrand">dia ${info.dayOfCycle}</span>` : ''}
            </div>
          </div>
        </header>

        <div class="section pb-24" style="margin-top:22px">
          <div class="section__head" style="margin-top:0"><h2>Meus dados</h2>
            <button class="link" data-edit>Editar ${icon('edit', 14)}</button>
          </div>
          <div class="card card--flush">
            ${kv('Fase', `${meta.emoji} ${meta.label}`)}
            ${dadosFase}
          </div>

          <div class="section__head"><h2>Minha jornada</h2></div>
          <div class="card">
            <div class="itemlist">
              ${journey.map((j) => `
                <div class="item">
                  <span class="item__ico">${icon(j.icon, 19)}</span>
                  <span class="item__body"><b>${esc(j.title)}</b><span>${esc(j.note || '')} · ${fmtShort(new Date(j.at))}</span></span>
                </div>`).join('')}
            </div>
          </div>

          <div class="section__head"><h2>Administração</h2></div>
          <button class="card card--link" data-nav="admin" style="background:var(--grad-lilac);color:#fff;border:0">
            <span class="challenge__ico">${icon('settings', 21)}</span>
            <span class="grow" style="text-align:left">
              <b style="display:block;font-family:var(--font-display);font-size:var(--fs-15)">Painel da administradora</b>
              <span class="fs-12" style="display:block;color:rgba(255,255,255,.85);margin-top:2px">Editar conteúdo, moderar a comunidade e publicar</span>
            </span>
            <span style="flex:none">${icon('chevron', 18)}</span>
          </button>

          <div class="section__head"><h2>Conta</h2></div>
          <div class="card card--flush">
            ${link('crown', state.premium ? 'Gerenciar assinatura' : 'Florescer Premium', state.premium ? 'Ativa desde ' + fmtShort(new Date(state.premiumSince || Date.now())) : 'R$ 19,90/mês', 'premium')}
            ${link('bell', 'Lembretes', 'Período fértil, registro diário e sugestões', 'lembretes')}
            ${link('settings', 'Configurações', 'Tema, ciclo, privacidade e dados', 'configuracoes')}
            ${link('bookmark', 'Meus salvos', 'Artigos e sugestões guardadas', 'salvos')}
            ${link('help', 'Ajuda e perguntas frequentes', '', 'ajuda')}
          </div>

          <button class="btn btn--ghost mt-16" data-requiz>${icon('refresh', 18)} Refazer o quiz</button>
          ${note('Seus dados ficam apenas neste aparelho. Faça a exportação em Configurações para não perdê-los.')}
        </div>`,

      mount(root) {
        root.querySelector('[data-edit]').onclick = () => (p.phase === 'tentante' ? editCycle() : editPhaseData());
        root.querySelector('[data-requiz]').onclick = () => { restartQuiz(); navigate('inicio'); };
      },
    };
  },
};

const kv = (k, v) => `<div class="kv"><span class="kv__k">${esc(k)}</span><span class="kv__v">${esc(v)}</span></div>`;
const link = (ic, title, sub, to) => `
  <button class="item" data-nav="${to}">
    <span class="item__ico">${icon(ic, 19)}</span>
    <span class="item__body"><b>${esc(title)}</b>${sub ? `<span>${esc(sub)}</span>` : ''}</span>
    <span class="item__end">${icon('chevron', 16)}</span>
  </button>`;

/* ---------- edição dos dados do ciclo ---------- */
export function editCycle() {
  const p = getState().profile;
  openSheet({
    title: 'Dados do meu ciclo',
    subtitle: 'Ajustar aqui recalcula todas as previsões.',
    body: `
      <div class="field"><label for="e-lmp">Primeiro dia da última menstruação</label>
        <input id="e-lmp" type="date" value="${p.lastPeriodStart || ''}" max="${toKey(today())}" min="${toKey(addDays(today(), -180))}"></div>
      <div class="row" style="gap:12px">
        <div class="field grow"><label for="e-cycle">Ciclo (dias)</label>
          <input id="e-cycle" type="number" inputmode="numeric" min="18" max="45" value="${p.cycleLength}"></div>
        <div class="field grow"><label for="e-period">Menstruação (dias)</label>
          <input id="e-period" type="number" inputmode="numeric" min="1" max="10" value="${p.periodLength}"></div>
      </div>
      <div class="field"><label for="e-name">Meu nome</label>
        <input id="e-name" type="text" maxlength="32" value="${esc(p.name)}"></div>
      <button class="btn" data-save>Salvar</button>`,
    onMount(sheet) {
      sheet.querySelector('[data-save]').onclick = () => {
        const lmp = sheet.querySelector('#e-lmp').value;
        if (lmp && diffDays(fromKey(lmp), today()) > 0) { toast('A data não pode estar no futuro'); return; }
        update((s) => {
          s.profile.lastPeriodStart = lmp || null;
          s.profile.cycleLength = Math.min(45, Math.max(18, +sheet.querySelector('#e-cycle').value || 28));
          s.profile.periodLength = Math.min(10, Math.max(1, +sheet.querySelector('#e-period').value || 5));
          s.profile.name = sheet.querySelector('#e-name').value.trim();
        });
        closeSheet();
        toast('Dados atualizados 🌸');
        rerender();
      };
    },
  });
}

/* ---------- edição para gestação / pós-parto ---------- */
function editPhaseData() {
  const p = getState().profile;
  const gravida = p.phase === 'gravida';
  openSheet({
    title: gravida ? 'Minha gestação' : 'Meu bebê',
    subtitle: gravida ? 'Usamos a DPP para calcular as semanas.' : 'Acompanhamos a idade do bebê e a sua recuperação.',
    body: gravida
      ? `<div class="field"><label for="e-due">Data provável do parto</label>
          <input id="e-due" type="date" value="${p.dueDate || ''}"></div>
         <div class="field"><label for="e-name2">Meu nome</label><input id="e-name2" type="text" maxlength="32" value="${esc(p.name)}"></div>
         <button class="btn" data-save>Salvar</button>`
      : `<div class="field"><label for="e-birth">Data de nascimento</label>
          <input id="e-birth" type="date" value="${p.birthDate || ''}" max="${toKey(today())}"></div>
         <div class="field"><label for="e-baby">Nome do bebê</label><input id="e-baby" type="text" maxlength="24" value="${esc(p.babyName)}"></div>
         <div class="field"><label for="e-name2">Meu nome</label><input id="e-name2" type="text" maxlength="32" value="${esc(p.name)}"></div>
         <button class="btn" data-save>Salvar</button>`,
    onMount(sheet) {
      sheet.querySelector('[data-save]').onclick = () => {
        update((s) => {
          if (gravida) s.profile.dueDate = sheet.querySelector('#e-due').value || null;
          else {
            s.profile.birthDate = sheet.querySelector('#e-birth').value || null;
            s.profile.babyName = sheet.querySelector('#e-baby').value.trim();
          }
          s.profile.name = sheet.querySelector('#e-name2').value.trim();
        });
        closeSheet();
        toast('Dados atualizados 🌸');
        rerender();
      };
    },
  });
}

/* ---------- mudança de fase (usada nas configurações) ---------- */
export function changePhase() {
  const state = getState();
  openSheet({
    title: 'Mudar de fase',
    subtitle: 'Seus registros anteriores são preservados.',
    body: `<div class="itemlist">
      ${Object.entries(PHASE_LABELS).map(([id, m]) => `
        <button class="item" data-phase="${id}">
          <span class="item__ico">${icon(m.icon, 19)}</span>
          <span class="item__body"><b>${m.emoji} ${m.label}</b></span>
          ${state.profile.phase === id ? icon('check', 18) : icon('chevron', 16)}
        </button>`).join('')}
    </div>`,
    onMount(sheet) {
      sheet.querySelectorAll('[data-phase]').forEach((b) => {
        b.onclick = () => {
          const phase = b.dataset.phase;
          update((s) => { s.profile.phase = phase; });
          const marco = { tentante: ['seed', 'Voltei a acompanhar meu ciclo'], gravida: ['pregnant', 'Descobri que estou grávida'], posparto: ['baby', 'Meu bebê nasceu'] }[phase];
          addJourney(marco[0], marco[1], 'mudança de fase');
          closeSheet();
          haptic(14);
          toast('Fase atualizada — sua tela inicial mudou 🌷');
          if (phase !== 'tentante') setTimeout(editPhaseData, 400);
          navigate('home');
        };
      });
    },
  });
}
