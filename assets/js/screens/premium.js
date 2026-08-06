/**
 * Paywall e gestão da assinatura.
 * A cobrança real depende de integração com loja/gateway — aqui o estado
 * é local e serve para liberar os recursos dentro do app.
 */
import { getState, update, addJourney } from '../store.js';
import { icon, markSvg } from '../icons.js';
import { esc, toast, confirmSheet, note } from '../ui.js';
import { navigate } from '../router.js';
import { fmtLong, addDays, today } from '../cycle.js';
import * as cms from '../cms.js';

let plan = 'anual';

export default {
  id: 'premium',
  render() {
    const state = getState();

    if (state.premium) return manageView(state);

    return {
      appbar: null,
      html: `<div class="paywall">
        <div class="paywall__hero">
          <div class="row row--between" style="margin-bottom:6px">
            <button class="iconbtn iconbtn--onbrand" data-back aria-label="Voltar">${icon('back', 20)}</button>
            <span></span>
          </div>
          <div class="mark">${markSvg(38, '#fff', '#FFD34D')}</div>
          <h1>Florescer Premium</h1>
          <p>Acompanhe a sua jornada por inteiro — com análises, conteúdo completo e apoio.</p>
        </div>
        <div class="paywall__card">
          <div class="itemlist">
            ${cms.getBenefits().map((b) => `
              <div class="item">
                <span class="item__ico">${icon(b.icon, 19)}</span>
                <span class="item__body"><b>${esc(b.title)}</b><span>${esc(b.text)}</span></span>
              </div>`).join('')}
          </div>

          <div class="stack-8 mt-16">
            ${cms.getPlans().map((p) => `
              <button class="opt" data-plan="${p.id}" aria-pressed="${plan === p.id}">
                <span class="opt__ico">${icon(p.best ? 'crown' : 'calendar', 18)}</span>
                <span class="grow">
                  <b style="display:block;font-size:14px">${p.label}${p.best ? ' <span class="pill pill--lilac" style="margin-left:6px">melhor valor</span>' : ''}</b>
                  <span class="fs-12 muted">${esc(p.note)}</span>
                </span>
                <span style="text-align:right"><b style="font-size:15px">${p.price}</b><span class="fs-11 muted" style="display:block">${p.per}</span></span>
              </button>`).join('')}
          </div>

          <button class="btn btn--grad mt-16" data-sub>${icon('crown', 19)} Quero florescer</button>
          <button class="btn btn--soft mt-8" data-free>Continuar na versão gratuita</button>
          <p class="center fs-11 faint mt-12" style="line-height:1.6">
            Inclui os e-books “100 nomes de meninas” e “100 nomes de meninos”, com significados.<br>
            Renovação automática · cancele a qualquer momento nas configurações.
          </p>
        </div>
      </div>`,
      mount(root) {
        root.querySelectorAll('[data-plan]').forEach((b) => {
          b.onclick = () => {
            plan = b.dataset.plan;
            root.querySelectorAll('[data-plan]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
          };
        });
        root.querySelector('[data-sub]').onclick = () => {
          update((s) => { s.premium = true; s.premiumSince = Date.now(); s.plan = plan; });
          addJourney('crown', 'Assinei o Florescer Premium', cms.getPlans().find((p) => p.id === plan).label.toLowerCase());
          toast('Bem-vinda ao Premium! Conteúdos e análises liberados 🌸');
          navigate('home');
        };
        root.querySelector('[data-free]').onclick = () => {
          toast('Sem pressa. O plano gratuito continua com você 💛');
          navigate('home');
        };
      },
    };
  },
};

function manageView(state) {
  const p = cms.getPlans().find((x) => x.id === (state.plan || 'anual'));
  const renew = addDays(new Date(state.premiumSince || Date.now()), p.id === 'anual' ? 365 : 30);
  return {
    appbar: { title: 'Minha assinatura' },
    html: `<div class="section pb-24">
      <div class="card center" style="background:var(--grad-lilac);color:#fff;border:0">
        <div style="width:56px;height:56px;border-radius:18px;background:rgba(255,255,255,.18);display:grid;place-items:center;margin:4px auto 12px">${icon('crown', 26)}</div>
        <b style="font-family:var(--font-display);font-size:18px">Florescer Premium ativo</b>
        <p class="fs-13" style="color:rgba(255,255,255,.85);margin-top:4px">Plano ${p.label.toLowerCase()} · ${p.price}${p.per}</p>
      </div>
      <div class="card card--flush mt-16">
        <div class="kv"><span class="kv__k">Assinante desde</span><span class="kv__v">${fmtLong(new Date(state.premiumSince))}</span></div>
        <div class="kv"><span class="kv__k">Próxima renovação</span><span class="kv__v">${fmtLong(renew)}</span></div>
        <div class="kv"><span class="kv__k">Forma de pagamento</span><span class="kv__v">A definir na loja</span></div>
      </div>
      <div class="section__head"><h2>Incluído no seu plano</h2></div>
      <div class="card card--flush">
        ${cms.getBenefits().map((b) => `
          <div class="item"><span class="item__ico">${icon(b.icon, 19)}</span>
            <span class="item__body"><b>${esc(b.title)}</b><span>${esc(b.text)}</span></span>
            <span class="item__end" style="color:var(--leaf-500)">${icon('check', 18)}</span>
          </div>`).join('')}
      </div>
      ${note('A cobrança é processada pela loja de aplicativos. O cancelamento mantém o acesso até o fim do período pago.')}
      <button class="btn btn--danger mt-16" data-cancel>Cancelar assinatura</button>
    </div>`,
    mount(root) {
      root.querySelector('[data-cancel]').onclick = async () => {
        const ok = await confirmSheet({
          title: 'Cancelar o Premium?',
          message: 'Você perde as análises avançadas, os conteúdos completos e os relatórios. Seus registros continuam salvos.',
          confirmLabel: 'Cancelar assinatura',
          danger: true,
        });
        if (!ok) return;
        update((s) => { s.premium = false; s.premiumSince = null; });
        toast('Assinatura cancelada. Você continua com o plano gratuito 💛');
        navigate('perfil');
      };
    },
  };
}
