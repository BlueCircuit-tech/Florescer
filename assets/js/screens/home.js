/**
 * Tela inicial — muda conforme a fase da usuária:
 * tentante → anel do ciclo | grávida → semanas | pós-parto → idade do bebê.
 */
import { getState, update } from '../store.js';
import { icon } from '../icons.js';
import { esc, cycleRing, toast, sectionHead } from '../ui.js';
import { navigate } from '../router.js';
import {
  cycleInfo, pregnancyInfo, postpartumInfo, streak, PHASES,
  today, toKey, fmtShort, relativeDay, plural, fmtFull,
} from '../cycle.js';
import { tipOfDay, categoryLabel } from '../content.js';
import * as cms from '../cms.js';
import { postCard, bindPostActions, visiblePosts } from './community.js';
import { isUnlocked } from './admin.js';

let tipOffset = 0;

const greeting = () => {
  const h = new Date().getHours();
  if (h < 5) return 'Boa madrugada';
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
};

/* ---------- heros por fase ---------- */
function heroTentante(state, info) {
  if (!info.known) {
    return `<div class="ring">
      <div class="grow">
        <p style="font-size:15px;line-height:1.5">Informe a data da sua última menstruação para começarmos a acompanhar o seu ciclo.</p>
        <button class="btn btn--light btn--sm btn--auto mt-12" data-nav="perfil/ciclo">Informar agora</button>
      </div>
    </div>`;
  }
  const phase = PHASES[info.phase];
  const stat2 = info.inPeriod
    ? { k: 'Menstruação', v: `dia ${info.dayOfCycle} de ${info.periodLength}` }
    : info.daysToOvulation >= 0
      ? { k: 'Ovulação prevista', v: `${relativeDay(info.ovulation)}, ${fmtShort(info.ovulation)}`, hl: info.daysToOvulation <= 2 }
      : { k: 'Próxima menstruação', v: `${relativeDay(info.nextPeriod)}, ${fmtShort(info.nextPeriod)}` };

  return `<div class="ring">
    ${cycleRing(info)}
    <div class="ring__stats">
      <div class="ring__stat"><div class="k">Fase atual</div><div class="v">${phase.label}</div></div>
      <div class="ring__stat"><div class="k">${stat2.k}</div><div class="v ${stat2.hl ? 'hl' : ''}">${stat2.v}</div></div>
    </div>
  </div>`;
}

function heroGravida(state, preg) {
  if (!preg.known) return `<p style="font-size:15px">Informe a data provável do parto no seu perfil para acompanharmos as semanas.</p>
    <button class="btn btn--light btn--sm btn--auto mt-12" data-nav="perfil">Completar perfil</button>`;
  return `<div class="bump">
    <div class="bump__week"><b>${preg.weeks}</b><span>semanas</span></div>
    <div class="ring__stats">
      <div class="ring__stat"><div class="k">${preg.trimester}º trimestre</div><div class="v">Faltam ${plural(Math.max(0, preg.daysLeft), 'dia', 'dias')}</div></div>
      <div class="ring__stat"><div class="k">Data provável do parto</div><div class="v">${fmtFull(preg.due)}</div></div>
    </div>
  </div>`;
}

function heroPosparto(state, pp) {
  const nome = state.profile.babyName ? esc(state.profile.babyName) : 'Seu bebê';
  if (!pp.known) return `<p style="font-size:15px">Informe a data de nascimento no perfil para acompanhar as semanas do bebê.</p>
    <button class="btn btn--light btn--sm btn--auto mt-12" data-nav="perfil">Completar perfil</button>`;
  return `<div class="bump">
    <div class="bump__week"><b>${pp.weeks}</b><span>semanas</span></div>
    <div class="ring__stats">
      <div class="ring__stat"><div class="k">${nome}</div><div class="v">${pp.age} de vida</div></div>
      <div class="ring__stat"><div class="k">Sua recuperação</div><div class="v">${pp.quarantine ? 'Puerpério — vá com calma 💛' : 'Consulta de revisão em dia?'}</div></div>
    </div>
  </div>`;
}

function pregnancyDashboard(preg) {
  const g = preg.guide;
  return `
    <section class="pregdash" aria-label="Resumo da semana ${preg.weeks} da gestação">
      <p class="pregdash__countdown">${icon('heartFill', 19)} <span>${esc(preg.countdown)}</span></p>
      <article class="pregdash__baby">
        <div class="pregdash__fruit" aria-hidden="true">${g.emoji}</div>
        <div class="grow">
          <span class="eyebrow">Seu bebê nesta semana</span>
          <h2>Do tamanho de ${esc(g.fruit)}</h2>
          <p>Valores de referência para a ${g.week}ª semana</p>
        </div>
        <div class="pregdash__metrics">
          <div><span>Peso</span><b>${esc(g.weight)}</b></div>
          <div><span>Comprimento</span><b>${esc(g.length)}</b></div>
        </div>
      </article>

      <div class="pregdash__grid">
        <article class="preginfo preginfo--baby">
          <span class="preginfo__ico">${icon('baby', 19)}</span>
          <div><span>Desenvolvimento dos órgãos</span><p>${esc(g.development)}</p></div>
        </article>
        <article class="preginfo preginfo--mother">
          <span class="preginfo__ico">${icon('pregnant', 19)}</span>
          <div><span>Seu corpo esta semana</span><p>${esc(g.mother)}</p></div>
        </article>
      </div>

      <article class="preginfo preginfo--tip">
        <span class="preginfo__ico">${icon('sparkle', 19)}</span>
        <div><span>Dica da semana</span><p>${esc(g.tip)}</p></div>
      </article>

      <article class="preginfo preginfo--exam">
        <span class="preginfo__ico">${icon('calendar', 19)}</span>
        <div class="grow">
          <span>Próximo acompanhamento</span>
          <b>${esc(g.nextExam.name)}</b>
          <p>${esc(g.nextExam.when)} · ${esc(g.nextExam.note)}</p>
        </div>
      </article>

      <p class="pregdash__disclaimer">Peso, comprimento e marcos são referências educativas. Exames e desenvolvimento variam em cada gestação; confirme seu calendário com a equipe de pré-natal.</p>
    </section>`;
}

/* ---------- cartão de destaque ---------- */
function highlight(state, info, preg, pp) {
  const p = state.profile.phase;
  if (p === 'gravida' && preg.known) {
    return pregnancyDashboard(preg);
  }
  if (p === 'posparto' && pp.known) {
    return card('bottle', 'var(--lilac-50)', 'var(--lilac-600)', pp.quarantine ? 'Primeiras semanas' : 'Rotina em construção',
      pp.quarantine ? 'Descanse sempre que puder e aceite ajuda.' : 'Registre sono, humor e amamentação no seu diário.', 'registro');
  }
  if (!info.known) return '';
  if (info.inFertile || info.isOvulation) {
    return card('leaf', 'var(--leaf-50)', 'var(--leaf-600)', info.isOvulation ? 'Hoje é o dia estimado da ovulação' : 'Você está no período fértil',
      `${fmtShort(info.fertileStart)} a ${fmtShort(info.fertileEnd)} · maior chance nos próximos dias`, 'ciclo');
  }
  if (info.inPeriod) {
    return card('drop', 'var(--rose-50)', 'var(--rose-700)', 'Menstruação em curso',
      `Dia ${info.dayOfCycle} · registre o fluxo para melhorar as previsões`, 'registro');
  }
  if (info.daysToOvulation > 0) {
    return card('flower', 'var(--amber-50)', 'var(--amber-600)', `Janela fértil ${relativeDay(info.fertileStart)}`,
      `De ${fmtShort(info.fertileStart)} a ${fmtShort(info.fertileEnd)} · avisaremos você`, 'ciclo');
  }
  return card('moon', 'var(--lilac-50)', 'var(--lilac-600)', 'Fase lútea',
    `Menstruação prevista para ${fmtShort(info.nextPeriod)} (${relativeDay(info.nextPeriod)})`, 'ciclo');
}

const card = (ic, bg, fg, title, sub, to) => `
  <button class="floatcard" data-nav="${to}">
    <span class="floatcard__ico" style="background:${bg};color:${fg}">${icon(ic, 22)}</span>
    <span class="grow" style="text-align:left"><b>${esc(title)}</b><span>${esc(sub)}</span></span>
    <span style="color:var(--faint)">${icon('chevron', 18)}</span>
  </button>`;

/* ---------- tela ---------- */
export default {
  id: 'home',
  tab: 'home',
  render() {
    const state = getState();
    // deep link antes do cadastro: redireciona depois que este render terminar,
    // senão o roteador sobrescreve a tela de boas-vindas com uma view vazia
    if (!state.onboarded) {
      setTimeout(() => navigate('inicio', { replace: true }), 0);
      return { appbar: null, html: '' };
    }

    const info = cycleInfo(state);
    const preg = pregnancyInfo(state);
    const pp = postpartumInfo(state);
    const st = streak(state);
    const phase = state.profile.phase;
    const firstName = (state.profile.name || 'flor').split(' ')[0];
    const babyName = state.profile.babyName || 'bebê';
    const todayKey = toKey(today());
    const loggedToday = !!state.logs[todayKey];
    const symptomLog = state.logs[todayKey] || {};
    const symptomsLoggedToday = !!symptomLog.symptoms?.length || symptomLog.systolicPressure != null ||
      symptomLog.weight != null || symptomLog.glucose != null || !!symptomLog.symptomNotes;
    const tip = tipOfDay(state, info, todayKey, tipOffset, cms.getTips());

    const hero = phase === 'gravida' ? heroGravida(state, preg)
      : phase === 'posparto' ? heroPosparto(state, pp)
        : heroTentante(state, info);

    const hello = phase === 'posparto' && pp.known
      ? `Olá, ${babyName}!`
      : `${greeting()}, ${firstName}`;

    const sub = phase === 'tentante' && info.known
      ? `Dia ${info.dayOfCycle} do seu ciclo`
      : phase === 'gravida' && preg.known ? `${preg.weeks} semanas e ${preg.days} dias`
        : phase === 'posparto' && pp.known ? `Hoje você completa ${pp.age}` : 'Bem-vinda ao Florescer';

    const shortcuts = [
      ['calendar', 'Calendário', 'ciclo', 'var(--rose-50)', 'var(--rose-700)'],
      ['note', phase === 'gravida' ? 'Diário' : 'Registrar', 'registro', 'var(--lilac-50)', 'var(--lilac-600)'],
      ['chart', 'Relatórios', 'relatorios', 'var(--leaf-50)', 'var(--leaf-600)'],
      ['book', 'Biblioteca', 'biblioteca', 'var(--amber-50)', 'var(--amber-600)'],
    ];

    const feed = visiblePosts(state).slice(0, 1).map((p) => postCard(p, state)).join('');

    return {
      appbar: null,
      html: `
        <header class="hero">
          <div class="hero__row">
            <button class="hero__avatar" data-nav="perfil" aria-label="Meu perfil">${state.profile.phase === 'gravida' ? '🤰' : state.profile.phase === 'posparto' ? '🍼' : '🌷'}</button>
            <div class="hero__hello">
              <span>${esc(hello)}</span>
              <b>${esc(sub)}</b>
            </div>
            <button class="iconbtn iconbtn--onbrand" data-nav="lembretes" aria-label="Lembretes" style="position:relative">
              ${icon('bell', 20)}${state.settings.notifications.fertile ? '<i class="iconbtn__dot"></i>' : ''}
            </button>
          </div>
          ${hero}
        </header>

        ${highlight(state, info, preg, pp)}

        <div class="section stagger" style="margin-top:26px">
          <article class="tipcard">
            <header class="tipcard__head">
              <span class="tipcard__ico">${icon('sparkle', 19)}</span>
              <div>
                <b>Sugestão do dia</b>
                <span id="tip-cat">${esc(categoryLabel(tip.c, phase))}</span>
              </div>
            </header>
            <p id="tip-text">${esc(tip.txt)}</p>
            <div class="tipcard__foot">
              <button class="tipcard__btn" data-newtip>${icon('refresh', 16)} Outra</button>
              <button class="tipcard__btn ${state.savedTips.includes(tip.txt) ? 'on' : ''}" data-savetip>
                ${icon('bookmark', 16)} <span>${state.savedTips.includes(tip.txt) ? 'Salva' : 'Salvar'}</span>
              </button>
            </div>
          </article>

          <button class="card card--link mt-16" data-nav="registro">
            <span class="floatcard__ico" style="background:${loggedToday ? 'var(--leaf-50)' : 'var(--amber-50)'};color:${loggedToday ? 'var(--leaf-600)' : 'var(--amber-600)'}">
              ${icon(loggedToday ? 'check' : 'note', 22)}
            </span>
            <span class="grow" style="text-align:left">
              <b style="display:block;font-size:var(--fs-14)">${phase === 'gravida' ? 'Diário da Mamãe' : loggedToday ? 'Dia registrado 🌸' : 'Como você está hoje?'}</b>
              <span class="fs-12 muted" style="display:block;margin-top:3px;line-height:1.45">${phase === 'gravida' ? (loggedToday ? 'Seu registro de hoje está guardado 🌸' : 'Humor, emoções, sintomas, memórias e gratidão') : st.current > 0 ? `Sequência de ${plural(st.current, 'dia', 'dias')} · recorde ${st.best}` : 'Humor, sintomas e fertilidade em 30 segundos'}</span>
            </span>
            <span style="color:var(--faint);flex:none">${icon('chevron', 18)}</span>
          </button>

          <button class="card card--link mt-8" data-nav="registro?s=sintomas">
            <span class="floatcard__ico" style="background:${symptomsLoggedToday ? 'var(--leaf-50)' : 'var(--rose-50)'};color:${symptomsLoggedToday ? 'var(--leaf-600)' : 'var(--rose-700)'}">
              ${icon(symptomsLoggedToday ? 'check' : 'thermometer', 22)}
            </span>
            <span class="grow" style="text-align:left">
              <b style="display:block;font-size:var(--fs-14)">Controle de Sintomas</b>
              <span class="fs-12 muted" style="display:block;margin-top:3px;line-height:1.45">${symptomsLoggedToday ? 'Sintomas ou medições registrados hoje' : 'Sintomas, pressão arterial, peso e glicemia'}</span>
            </span>
            <span style="color:var(--faint);flex:none">${icon('chevron', 18)}</span>
          </button>

          <div class="section__head" style="padding:0"><h2>Seus atalhos</h2></div>
          <div class="shortcuts">
            ${shortcuts.map(([ic, label, to, bg, fg]) => `
              <button class="shortcut" data-nav="${to}">
                <span class="shortcut__ico" style="background:${bg};color:${fg}">${icon(ic, 19)}</span>${label}
              </button>`).join('')}
          </div>

          ${sectionHead('Comunidade agora', { label: 'Ver tudo', to: 'comunidade' })}
          ${feed}

          ${isUnlocked() ? `
            <button class="card card--link mt-8" data-nav="admin">
              <span class="floatcard__ico" style="background:var(--lilac-50);color:var(--lilac-600)">${icon('settings', 22)}</span>
              <span class="grow" style="text-align:left">
                <b style="display:block;font-size:var(--fs-14)">Painel da administradora</b>
                <span class="fs-12 muted" style="display:block;margin-top:3px">Conteúdo, comunidade e publicação</span>
              </span>
              <span style="color:var(--faint);flex:none">${icon('chevron', 18)}</span>
            </button>` : ''}

          ${state.premium ? '' : `
            <button class="btn btn--lilac mt-8" data-nav="premium">
              ${icon('crown', 19)} Conhecer o Florescer Premium
            </button>`}

          <p class="center fs-11 faint mt-16" style="line-height:1.6">
            As previsões são estimativas com base nos seus registros.<br>O Florescer não substitui acompanhamento médico.
          </p>
        </div>`,

      mount(root) {
        const saveBtn = root.querySelector('[data-savetip]');
        const syncSave = (txt) => {
          const on = getState().savedTips.includes(txt);
          saveBtn.classList.toggle('on', on);
          saveBtn.querySelector('span').textContent = on ? 'Salva' : 'Salvar';
        };

        root.querySelector('[data-newtip]')?.addEventListener('click', () => {
          tipOffset++;
          const t = tipOfDay(getState(), info, todayKey, tipOffset, cms.getTips());
          root.querySelector('#tip-text').textContent = t.txt;
          root.querySelector('#tip-cat').textContent = categoryLabel(t.c, phase);
          syncSave(t.txt);
          if (tipOffset === 3 && !state.premium) toast('No plano gratuito são 3 sugestões por dia — ilimitadas no Premium ✨');
        });

        saveBtn?.addEventListener('click', () => {
          const t = tipOfDay(getState(), info, todayKey, tipOffset, cms.getTips());
          update((s) => {
            const i = s.savedTips.indexOf(t.txt);
            if (i >= 0) s.savedTips.splice(i, 1); else s.savedTips.push(t.txt);
          });
          syncSave(t.txt);
          toast(getState().savedTips.includes(t.txt) ? 'Sugestão salva nas suas favoritas 💛' : 'Removida das favoritas');
        });
        bindPostActions(root);
      },
    };
  },
};
