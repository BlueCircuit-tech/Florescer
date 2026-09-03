/**
 * Tela inicial — muda conforme a fase da usuária:
 * tentante → anel do ciclo | grávida → semanas | pós-parto → idade do bebê.
 */
import { getState, update } from '../store.js';
import { icon } from '../icons.js';
import { esc, cycleRing, toast, openSheet } from '../ui.js';
import { navigate } from '../router.js';
import {
  cycleInfo, pregnancyInfo, postpartumInfo, PHASES,
  today, toKey, fmtShort, relativeDay, plural, fmtFull,
} from '../cycle.js';
import { tipOfDay, categoryLabel } from '../content.js';
import * as cms from '../cms.js';
import { isUnlocked } from './admin.js';
import { babyNamesFromProfile, formatBabyNames, postpartumGreeting } from '../babies.js';
import { FEATURE_TONES, featureLabel, featureTarget, resolveHomeShortcuts } from '../features.js';
import { cyclePhaseGuide } from '../fertility.js';

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
  const names = babyNamesFromProfile(state.profile);
  const nome = names.length ? esc(formatBabyNames(names)) : 'Seu bebê';
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
          <span class="eyebrow">${preg.multiple ? 'Seus bebês nesta semana' : 'Seu bebê nesta semana'}</span>
          <h2>${preg.multiple ? 'Cada bebê: tamanho aproximado de' : 'Do tamanho de'} ${esc(g.fruit)}</h2>
          <p>Valores de referência para a ${g.week}ª semana</p>
          <button class="pregdash__weeklink" data-nav="semana-a-semana">Ver Semana a Semana ${icon('chevron', 14)}</button>
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

      <details class="pregdash__more">
        <summary>
          <span class="pregdash__moreico">${icon('chevronDown', 18)}</span>
          <span class="grow"><b class="pregdash__expand">Expandir informações</b><b class="pregdash__collapse">Recolher informações</b><small>Sintomas, hormônios, barriga e cuidados</small></span>
        </summary>
        <div class="pregdash__morebody">
          <div class="pregdash__grid pregdash__maternal">
            <article class="preginfo preginfo--symptoms">
              <span class="preginfo__ico">${icon('thermometer', 19)}</span>
              <div><span>Sintomas que podem aparecer</span><p>${esc(g.symptoms)}</p></div>
            </article>
            <article class="preginfo preginfo--hormones">
              <span class="preginfo__ico">${icon('sparkle', 19)}</span>
              <div><span>Alterações hormonais</span><p>${esc(g.hormones)}</p></div>
            </article>
            <article class="preginfo preginfo--belly">
              <span class="preginfo__ico">${icon('pregnant', 19)}</span>
              <div><span>Desenvolvimento da barriga</span><p>${esc(g.belly)}</p></div>
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
        </div>
      </details>

      <p class="pregdash__disclaimer">Peso, comprimento, sintomas e mudanças da barriga são referências educativas e variam em cada gestação. Sangramento, perda de líquido, dor forte, desmaio, falta de ar intensa, dor de cabeça forte com alteração visual ou redução dos movimentos do bebê precisam de avaliação.</p>
    </section>`;
}

function postpartumDashboard(state, pp) {
  const names = babyNamesFromProfile(state.profile);
  const babies = state.profile.pregnancyType === 'gemelar' || names.length > 1;
  const subject = names.length ? esc(formatBabyNames(names)) : babies ? 'Seus bebês' : 'Seu bebê';
  const g = pp.guide;
  return `
    <section class="pregdash" aria-label="Fase de desenvolvimento do bebê">
      <article class="pregdash__baby">
        <div class="pregdash__fruit" aria-hidden="true">${g.emoji}</div>
        <div class="grow">
          <span class="eyebrow">${subject} nesta fase</span>
          <h2>${babies ? 'Podem' : 'Pode'} ${esc(g.action)}</h2>
          <p>${esc(g.period)} · ${esc(pp.age)} de vida</p>
        </div>
      </article>

      <article class="preginfo preginfo--baby">
        <span class="preginfo__ico">${icon('baby', 19)}</span>
        <div><span>Descobertas desta fase</span><p>${esc(g.detail)}</p></div>
      </article>

      <button class="btn btn--soft" data-nav="desenvolvimento-bebe">${icon('sparkle', 18)} Registrar uma descoberta</button>
      <button class="btn btn--soft" data-nav="alimentacao-bebe">${icon('leaf', 18)} Alimentação do bebê</button>

      <p class="pregdash__disclaimer">Marcos são referências, não prazos. Cada bebê se desenvolve no próprio ritmo; converse com o pediatra se tiver dúvidas.</p>
    </section>`;
}

function cycleDashboard(info) {
  const phase = PHASES[info.phase];
  const guide = cyclePhaseGuide(info.phase);
  const next = info.inPeriod
    ? `Janela fértil prevista de ${fmtShort(info.fertileStart)} a ${fmtShort(info.fertileEnd)}`
    : info.daysToOvulation >= 0
      ? `Ovulação prevista ${relativeDay(info.ovulation)}, em ${fmtShort(info.ovulation)}`
      : `Próxima menstruação prevista para ${fmtShort(info.nextPeriod)} (${relativeDay(info.nextPeriod)})`;

  return `
    <section class="pregdash cycledash" aria-label="O que acontece no seu corpo durante a ${esc(phase.label)}">
      <article class="pregdash__baby">
        <div class="pregdash__fruit cycledash__symbol" aria-hidden="true">${icon(phase.icon, 28)}</div>
        <div class="grow">
          <span class="eyebrow">Seu corpo hoje</span>
          <h2>${esc(guide.title)}</h2>
          <p>Dia ${info.dayOfCycle} do ciclo · ${esc(phase.label)}</p>
        </div>
      </article>

      <div class="pregdash__grid">
        <article class="preginfo preginfo--baby">
          <span class="preginfo__ico">${icon('flower', 19)}</span>
          <div><span>O que acontece por dentro</span><p>${esc(guide.body)}</p></div>
        </article>
        <article class="preginfo preginfo--mother">
          <span class="preginfo__ico">${icon('heart', 19)}</span>
          <div><span>O que você pode notar</span><p>${esc(guide.notice)}</p></div>
        </article>
      </div>

      <article class="preginfo preginfo--tip">
        <span class="preginfo__ico">${icon('sparkle', 19)}</span>
        <div><span>Para lembrar</span><p>${esc(guide.care)}</p></div>
      </article>

      <article class="preginfo preginfo--exam">
        <span class="preginfo__ico">${icon('calendar', 19)}</span>
        <div><span>Próxima etapa estimada</span><p>${esc(next)}</p></div>
      </article>

      <button class="btn btn--soft" data-nav="ciclo">${icon('calendar', 18)} Ver meu calendário</button>
      <p class="pregdash__disclaimer">Fases, datas e sinais são estimativas educativas. Eles variam entre ciclos e não confirmam ovulação ou gravidez.</p>
    </section>`;
}

/* ---------- cartão de destaque ---------- */
function highlight(state, info, preg, pp) {
  const p = state.profile.phase;
  if (p === 'gravida' && preg.known) {
    return pregnancyDashboard(preg);
  }
  if (p === 'posparto' && pp.known) {
    return postpartumDashboard(state, pp);
  }
  if (p !== 'tentante' || !info.known) return '';
  return cycleDashboard(info);
}

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
    const phase = state.profile.phase;
    const firstName = (state.profile.name || 'flor').split(' ')[0];
    const todayKey = toKey(today());
    const tip = tipOfDay(state, info, todayKey, tipOffset, cms.getTips());

    const hero = phase === 'gravida' ? heroGravida(state, preg)
      : phase === 'posparto' ? heroPosparto(state, pp)
        : heroTentante(state, info);

    const hello = phase === 'posparto'
      ? postpartumGreeting(state.profile)
      : `${greeting()}, ${firstName}`;

    const sub = phase === 'tentante' && info.known
      ? `Dia ${info.dayOfCycle} do seu ciclo`
      : phase === 'gravida' && preg.known ? `${preg.weeks} semanas e ${preg.days} dias`
        : phase === 'posparto' && pp.known ? `Hoje você completa ${pp.age}` : 'Bem-vinda ao Florescer';

    const shortcuts = resolveHomeShortcuts(state.settings, phase);

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
            <div class="hero__actions">
              <button class="iconbtn iconbtn--onbrand" data-nav="lembretes" aria-label="Lembretes" style="position:relative">
                ${icon('bell', 20)}${state.settings.notifications.fertile ? '<i class="iconbtn__dot"></i>' : ''}
              </button>
              <button class="iconbtn iconbtn--onbrand" data-nav="missoes" aria-label="Missões diárias">
                ${icon('flag', 20)}
              </button>
            </div>
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

          <div class="section__head" style="padding:0"><h2>Seus atalhos</h2><button class="link" data-nav="recursos?modo=atalhos">Personalizar</button></div>
            <div class="shortcuts">
              ${shortcuts.map((item) => {
                const tone = FEATURE_TONES[item.tone] || FEATURE_TONES.rose;
                return `<button class="shortcut" data-nav="${featureTarget(item, phase)}">
                  <span class="shortcut__ico" style="background:${tone.bg};color:${tone.fg}">${icon(item.icon, 19)}</span>${esc(featureLabel(item, phase, 'home'))}
                </button>`;
              }).join('')}
            </div>
          <button class="link center" style="width:100%;margin-top:12px" data-nav="recursos">Ver todos os recursos</button>

          ${isUnlocked() ? `
            <button class="card card--link mt-8" data-nav="admin">
              <span class="floatcard__ico" style="background:var(--lilac-50);color:var(--lilac-600)">${icon('settings', 22)}</span>
              <span class="grow" style="text-align:left">
                <b style="display:block;font-size:var(--fs-14)">Painel da administradora</b>
                <span class="fs-12 muted" style="display:block;margin-top:3px">Conteúdo, comunidade e publicação</span>
              </span>
              <span style="color:var(--faint);flex:none">${icon('chevron', 18)}</span>
            </button>` : ''}

          <button class="btn btn--lilac mt-8" data-nav="premium">
            ${icon('crown', 19)} ${state.premium ? 'Gerenciar Florescer Premium' : 'Conhecer o Florescer Premium'}
          </button>
          <button class="btn btn--soft mt-8" data-tempo-de-deus>
            ${icon('book', 19)} Florescer no Tempo de Deus
          </button>

          <p class="center fs-11 faint mt-16" style="line-height:1.6">
            As previsões são estimativas com base nos seus registros.<br>O Florescer não substitui acompanhamento médico.
          </p>
        </div>`,

      mount(root) {
        root.querySelector('[data-tempo-de-deus]').onclick = () => openSheet({
          title: 'Florescer no Tempo de Deus',
          subtitle: 'Cuidado para a sua jornada de maternidade',
          body: `<div class="card diaryintro">
              <span class="floatcard__ico">${icon('heart', 22)}</span>
              <div><b>Um curso completo para você</b><p>Acolhimento emocional e cuidado físico para viver cada etapa da maternidade com mais consciência, equilíbrio e confiança.</p></div>
            </div>
            <div class="note mt-16">${icon('sparkle', 17)}<span>Conteúdo pensado para apoiar a mulher em suas emoções, em seu corpo e nos desafios reais dessa jornada.</span></div>
            <a class="btn mt-16" href="https://payfast.greenn.com.br/zgk8dm5" target="_blank" rel="noopener noreferrer">${icon('heart', 19)} Quero conhecer o curso</a>`,
        });
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
      },
    };
  },
};
