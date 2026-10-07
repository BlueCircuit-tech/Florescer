/**
 * IA Flor — tela de conversa.
 *
 * Fluxo de uma pergunta:
 *  1. a base local classifica a pergunta;
 *  2. se for sinal de alerta, responde na hora e NÃO envia nada ao servidor;
 *  3. senão, com a IA autorizada e online, pergunta ao modelo;
 *  4. qualquer falha cai na resposta local.
 *
 * A conversa fica salva no aparelho e pode ser apagada pela usuária.
 */
import { getState, update } from '../store.js';
import { icon } from '../icons.js';
import { closeSheet, confirmSheet, esc, haptic, openSheet, toast } from '../ui.js';
import { askFlor, florSuggestions } from '../florAssistant.js';
import { florNudge } from '../florProfile.js';
import { aiDecided, aiEnabled, askFlorAI, cycleContext, recentHistory } from '../florClient.js';

const MAX_MESSAGES = 60;
const rerender = () => import('../router.js').then((m) => m.render());

function pushMessage(message) {
  update((state) => {
    if (!Array.isArray(state.florChat)) state.florChat = [];
    state.florChat.push(message);
    if (state.florChat.length > MAX_MESSAGES) state.florChat = state.florChat.slice(-MAX_MESSAGES);
  });
}

function replaceLast(message) {
  update((state) => {
    if (!Array.isArray(state.florChat) || !state.florChat.length) return;
    state.florChat[state.florChat.length - 1] = message;
  });
}

function bubble(message) {
  if (message.role === 'user') {
    return `<li class="flormsg flormsg--user"><p>${esc(message.text)}</p></li>`;
  }

  if (message.pending) {
    return `<li class="flormsg flormsg--flor flormsg--pending" aria-live="polite">
      <span class="flordots" aria-hidden="true"><i></i><i></i><i></i></span>
      <span class="flormsg__pendingtext">A Flor está pensando…</span>
    </li>`;
  }

  const bullets = (message.bullets || []).length
    ? `<ul class="flormsg__list">${message.bullets.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>`
    : '';
  const warning = message.warning
    ? `<p class="flormsg__warn">${icon('info', 15)}<span>${esc(message.warning)}</span></p>`
    : '';
  const link = message.link
    ? `<button class="flormsg__link" data-nav="${esc(message.link.to)}">${esc(message.link.label)} ${icon('chevron', 14)}</button>`
    : '';
  const suggestions = (message.suggestions || []).length
    ? `<div class="florchips">${message.suggestions.map((text) => `<button class="florchip" data-ask="${esc(text)}">${esc(text)}</button>`).join('')}</div>`
    : '';
  const origem = message.source === 'ia'
    ? '<span class="florsource">resposta da IA</span>'
    : message.source === 'local'
      ? '<span class="florsource">resposta do guia do app</span>'
      : '';

  return `<li class="flormsg flormsg--flor ${message.kind === 'alert' ? 'flormsg--alert' : ''}">
    ${message.title ? `<b class="flormsg__title">${esc(message.title)}</b>` : ''}
    <p>${esc(message.text)}</p>
    ${bullets}${warning}${link}${suggestions}${origem}
  </li>`;
}

/* ---------------------------------------------------------------
   Consentimento — a IA só entra em cena depois de a usuária escolher
   --------------------------------------------------------------- */
function consentSheet() {
  openSheet({
    title: 'Quer ativar as respostas da IA?',
    subtitle: 'A Flor funciona dos dois jeitos. Você escolhe, e pode mudar depois em Configurações.',
    body: `<div class="itemlist">
        <div class="item">
          <span class="item__ico">${icon('shield', 19)}</span>
          <span class="item__body"><b>Sem a IA</b><span>Tudo continua no aparelho. A Flor responde pelo guia escrito e revisado do app.</span></span>
        </div>
        <div class="item">
          <span class="item__ico">${icon('sparkle', 19)}</span>
          <span class="item__body"><b>Com a IA</b><span>Ela entende mais perguntas. Para isso, a sua pergunta e os números do seu ciclo são enviados ao servidor do Florescer.</span></span>
        </div>
      </div>
      <p class="fs-12 muted mt-12" style="line-height:1.6">
        Nunca enviamos o seu nome, o seu diário nem os seus sintomas. Perguntas com sinal de alerta
        são respondidas no próprio aparelho e não saem dele.
      </p>
      <button class="btn mt-16" data-sim>${icon('sparkle', 18)} Ativar respostas da IA</button>
      <button class="btn btn--ghost mt-8" data-nao>Usar só as respostas do app</button>`,
    onMount(sheet) {
      const decide = (value) => {
        update((state) => { state.settings.florAI = value; });
        closeSheet();
        toast(value ? 'IA ativada. Pode perguntar.' : 'Beleza: só respostas do app.');
        rerender();
      };
      sheet.querySelector('[data-sim]').onclick = () => decide(true);
      sheet.querySelector('[data-nao]').onclick = () => decide(false);
    },
  });
}

export default {
  id: 'flor',
  tab: null,
  render() {
    const state = getState();
    const chat = Array.isArray(state.florChat) ? state.florChat : [];
    const nome = (state.profile.name || '').split(' ')[0];
    const comIA = aiEnabled(state);
    const gestante = state.profile.phase === 'gravida';
    const nudge = florNudge(state);
    const sugestoes = florSuggestions(state);

    const intro = `<div class="florintro">
      <span class="florintro__mark">${icon('flower', 24)}</span>
      <div>
        <b>Oi${nome ? `, ${esc(nome)}` : ''}. Eu sou a Flor.</b>
        <p>${gestante
          ? 'Tire dúvidas sobre a gestação, as consultas, os exames e o que você está sentindo. Eu uso a sua semana e os seus registros para responder — e não substituo a sua equipe de pré-natal.'
          : 'Tire dúvidas sobre ciclo, menstruação, hormônios e período fértil. Quando a resposta depender do seu ciclo, eu uso os seus próprios registros.'}</p>
        ${nudge ? `<button class="florintro__nudge" data-ask="${esc(nudge.ask)}">${icon('sparkle', 15)}<span>${esc(nudge.text)}</span></button>` : ''}
      </div>
    </div>
    <div class="florchips florchips--intro">
      ${sugestoes.map((text) => `<button class="florchip" data-ask="${esc(text)}">${esc(text)}</button>`).join('')}
    </div>`;

    return {
      appbar: {
        title: 'IA Flor',
        sub: comIA ? 'Com respostas da IA' : 'Respostas do guia do app',
        actions: [
          { icon: 'settings', label: 'Preferências da Flor', action: 'prefs' },
          ...(chat.length ? [{ icon: 'trash', label: 'Limpar conversa', action: 'clear' }] : []),
        ],
      },
      html: `<div class="florscreen">
        <div class="florscroll" data-florscroll>
          <div class="section">
            ${chat.length ? '' : intro}
            <ul class="florlist">${chat.map(bubble).join('')}</ul>
          </div>
        </div>

        <form class="florbar" data-florform>
          <label class="sr-only" for="flor-input">Sua pergunta</label>
          <input id="flor-input" type="text" maxlength="300" autocomplete="off"
            placeholder="${gestante ? 'Pergunte sobre a sua gestação…' : 'Pergunte sobre o seu ciclo…'}" data-florinput>
          <button class="florbar__send" type="submit" aria-label="Enviar pergunta">${icon('send', 19)}</button>
        </form>

        <p class="florscreen__legal">A Flor dá informação educativa e não substitui consulta. Ela não faz diagnóstico nem indica medicamento.</p>
      </div>`,

      mount(root) {
        const form = root.querySelector('[data-florform]');
        const input = root.querySelector('[data-florinput]');
        const scroll = root.querySelector('[data-florscroll]');

        scroll.scrollTop = scroll.scrollHeight;
        if (!aiDecided(getState())) setTimeout(consentSheet, 400);

        const scrollDown = () => requestAnimationFrame(() => {
          document.querySelector('[data-florscroll]')?.scrollTo({ top: 99999, behavior: 'smooth' });
        });

        const ask = async (text) => {
          const pergunta = String(text || '').trim();
          if (!pergunta) return;

          const atual = getState();
          const local = askFlor(pergunta, atual);

          pushMessage({ role: 'user', text: pergunta, at: Date.now() });

          // sinal de alerta: resolve aqui, sem mandar nada para fora
          if (local.kind === 'alert' || !aiEnabled(atual)) {
            pushMessage({ ...toMessage(local), source: local.kind === 'alert' ? null : 'local' });
            haptic();
            await rerender();
            scrollDown();
            return;
          }

          pushMessage({ role: 'flor', pending: true, at: Date.now() });
          haptic();
          await rerender();
          scrollDown();

          const resposta = await askFlorAI({
            question: pergunta,
            cycle: cycleContext(atual),
            history: recentHistory(getState().florChat.slice(0, -2)),
          });

          replaceLast(resposta
            ? {
              role: 'flor', id: local.id, kind: 'answer', text: resposta.answer, source: 'ia',
              // mesmo vindo da IA, os próximos passos saem da base local,
              // escolhidos pela fase e pela semana dela
              suggestions: florSuggestions(getState()).slice(0, 3),
              at: Date.now(),
            }
            : { ...toMessage(local), source: 'local' });

          await rerender();
          scrollDown();
          document.querySelector('[data-florinput]')?.focus({ preventScroll: true });
        };

        form.onsubmit = (event) => {
          event.preventDefault();
          const pergunta = input.value;
          input.value = '';
          ask(pergunta);
        };

        root.querySelectorAll('[data-ask]').forEach((button) => {
          button.onclick = () => ask(button.dataset.ask);
        });

        document.querySelector('#appbar [data-action="prefs"]')?.addEventListener('click', consentSheet);

        document.querySelector('#appbar [data-action="clear"]')?.addEventListener('click', async () => {
          const ok = await confirmSheet({
            title: 'Apagar a conversa?',
            message: 'As perguntas e respostas desta conversa serão removidas deste aparelho.',
            confirmLabel: 'Apagar',
            danger: true,
          });
          if (!ok) return;
          update((current) => { current.florChat = []; });
          toast('Conversa apagada.');
          rerender();
        });
      },
    };
  },
};

function toMessage(local) {
  return {
    role: 'flor',
    // o id do tema fica guardado: é com ele que a Flor evita repetir
    // a mesma sugestão que ela acabou de ver
    id: local.id,
    kind: local.kind,
    title: local.title,
    text: local.answer,
    bullets: local.bullets,
    warning: local.warning,
    link: local.link,
    suggestions: local.suggestions,
    at: Date.now(),
  };
}
