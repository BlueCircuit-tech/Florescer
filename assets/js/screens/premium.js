/**
 * Vitrine do Premium e gestão da assinatura.
 *
 * A cobrança ainda não existe: não há loja nem gateway integrado. Por isso
 * esta tela NÃO libera o Premium — um botão que entrega a assinatura de graça
 * é uma compra falsa, e uma usuária real passaria a usar o app achando que
 * pagou. A tela apresenta planos e benefícios e registra o interesse; a
 * liberação para testes fica no painel da administradora.
 *
 * Para ligar a cobrança de verdade depois, basta trocar `data-notify` por uma
 * chamada ao gateway e marcar `premium` quando o pagamento for confirmado.
 */
import { getState, update } from '../store.js';
import { icon, markSvg } from '../icons.js';
import { esc, toast, confirmSheet, note } from '../ui.js';
import { navigate } from '../router.js';
import { fmtLong } from '../cycle.js';
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

          ${note('As assinaturas ainda não estão abertas. Avise-me e eu te chamo assim que o Premium começar — nada é cobrado agora.')}
          <button class="btn btn--grad mt-16" data-notify>${icon('bell', 19)} ${state.premiumInterest ? 'Você está na lista' : 'Avise-me quando abrir'}</button>
          <button class="btn btn--soft mt-8" data-free>Continuar na versão gratuita</button>
          <p class="center fs-11 faint mt-12" style="line-height:1.6">
            Os e-books de nomes e o Guia de ansiedade são gratuitos e já estão em
            <b>Central de Recursos › E-books e materiais</b>.
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
        root.querySelector('[data-notify]').onclick = () => {
          // registra o interesse no aparelho; nenhuma cobrança acontece aqui
          update((s) => { s.premiumInterest = { plan, at: Date.now() }; });
          toast('Anotado! Te avisamos aqui mesmo quando as assinaturas abrirem.');
          navigate('home');
        };
        root.querySelector('[data-free]').onclick = () => {
          toast('Sem pressa. O plano gratuito continua com você.');
          navigate('home');
        };
      },
    };
  },
};

/** Premium ativo. Hoje só chega aqui quem foi liberada pelo painel. */
function manageView(state) {
  return {
    appbar: { title: 'Meu Premium' },
    html: `<div class="section pb-24">
      <div class="card center" style="background:var(--grad-lilac);color:#fff;border:0">
        <div style="width:56px;height:56px;border-radius:18px;background:rgba(255,255,255,.18);display:grid;place-items:center;margin:4px auto 12px">${icon('crown', 26)}</div>
        <b style="font-family:var(--font-display);font-size:18px">Florescer Premium ativo</b>
        <p class="fs-13" style="color:rgba(255,255,255,.85);margin-top:4px">Acesso liberado${state.premiumSince ? ` em ${fmtLong(new Date(state.premiumSince))}` : ''}</p>
      </div>
      <div class="section__head"><h2>O que está liberado</h2></div>
      <div class="card card--flush">
        ${cms.getBenefits().map((b) => `
          <div class="item"><span class="item__ico">${icon(b.icon, 19)}</span>
            <span class="item__body"><b>${esc(b.title)}</b><span>${esc(b.text)}</span></span>
            <span class="item__end" style="color:var(--leaf-500)">${icon('check', 18)}</span>
          </div>`).join('')}
      </div>
      ${note('As assinaturas pagas ainda não abriram: este acesso foi liberado pela administradora e não gera cobrança nenhuma.')}
      <button class="btn btn--danger mt-16" data-cancel>Voltar para a versão gratuita</button>
    </div>`,
    mount(root) {
      root.querySelector('[data-cancel]').onclick = async () => {
        const ok = await confirmSheet({
          title: 'Voltar para a versão gratuita?',
          message: 'Você perde as análises avançadas, os conteúdos completos e os relatórios. Seus registros continuam salvos.',
          confirmLabel: 'Voltar ao gratuito',
          danger: true,
        });
        if (!ok) return;
        update((s) => { s.premium = false; s.premiumSince = null; });
        toast('Pronto. Você continua com o plano gratuito');
        navigate('perfil');
      };
    },
  };
}
