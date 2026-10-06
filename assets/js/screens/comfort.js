/**
 * Acolhimento — a tela que a Flor abre depois de um teste negativo.
 *
 * A abertura fica sempre visível; abaixo dela, a usuária escolhe um dos quatro
 * caminhos. A troca de caminho acontece dentro desta tela, sem passar pelo
 * roteador: um re-render global apagaria o que ela estivesse escrevendo.
 *
 * O conteúdo e as contas vivem em `comfort.js`.
 */
import { getLog, getState, saveLog } from '../store.js';
import { icon } from '../icons.js';
import { esc, haptic, toast } from '../ui.js';
import { navigate } from '../router.js';
import { today, toKey } from '../cycle.js';
import { noticeAchievements } from '../notify.js';
import { askFlor } from '../florAssistant.js';
import {
  appendToNotes,
  comfortGreeting,
  comfortMessage,
  COMFORT_OPENING,
  COMFORT_PATHS,
  COMFORT_SILENCE,
  COMFORT_WRITING_MAX,
  COMFORT_WRITING_PROMPTS,
  nextCycleBriefing,
} from '../comfort.js';

const bullets = (items) => (items?.length
  ? `<ul class="flormsg__list">${items.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>`
  : '');

function card({ title, text, items, warning, foot = '', variant = '' }) {
  return `<div class="comfortcard ${variant}">
    ${title ? `<b class="comfortcard__title">${esc(title)}</b>` : ''}
    ${text ? `<p>${esc(text)}</p>` : ''}
    ${bullets(items)}
    ${warning ? `<p class="flormsg__warn">${icon('info', 15)}<span>${esc(warning)}</span></p>` : ''}
    ${foot}
  </div>`;
}

/* ---------- caminho 1: acolhimento ---------- */
function acolhidaView(index) {
  const message = comfortMessage(index);
  return card({
    title: message.title,
    text: message.text,
    items: message.bullets,
    foot: `<button class="btn btn--ghost btn--sm mt-16" data-another>${icon('refresh', 17)} Me diz outra coisa</button>`,
  });
}

/* ---------- caminho 2: desabafo ---------- */
function desabafoView() {
  return `<div class="comfortcard">
    <b class="comfortcard__title">Escreve aqui</b>
    <p>Sem ninguém lendo, sem precisar fazer sentido. Pode ser uma frase ou três páginas.</p>
    <div class="florchips">
      ${COMFORT_WRITING_PROMPTS.map((text) => `<button class="florchip" data-prompt="${esc(text)}">${esc(text)}</button>`).join('')}
    </div>
    <div class="field mt-12">
      <label class="sr-only" for="comfort-text">O que você está sentindo</label>
      <textarea id="comfort-text" rows="8" maxlength="${COMFORT_WRITING_MAX}"
        placeholder="Começa por onde doer…" data-comfort-text></textarea>
    </div>
    <div class="note">${icon('lock', 17)}<span>Isto fica só neste aparelho. Se você guardar, entra nas observações de hoje e você pode apagar quando quiser.</span></div>
    <button class="btn mt-16" data-save>${icon('check', 19)} Guardar no meu diário</button>
    <button class="btn btn--ghost mt-8" data-discard>Só precisava escrever, não quero guardar</button>
    <div data-comfort-alert></div>
  </div>`;
}

/* ---------- caminho 3: próximo ciclo ---------- */
function proximoView(state) {
  const brief = nextCycleBriefing(state);
  const facts = brief.facts.length
    ? `<dl class="comfortfacts">${brief.facts.map((fact) => `<div class="comfortfacts__row">
        <dt>${esc(fact.label)}</dt>
        <dd>${esc(fact.value)}<small>${esc(fact.hint)}</small></dd>
      </div>`).join('')}</dl>`
    : '';
  const link = brief.link
    ? `<button class="flormsg__link" data-nav="${esc(brief.link.to)}">${esc(brief.link.label)} ${icon('chevron', 14)}</button>`
    : '';

  return `<div class="comfortcard">
    <b class="comfortcard__title">${brief.known ? 'O seu próximo ciclo' : 'Preciso de uma data sua'}</b>
    ${brief.known ? '<p>Sem pressa e sem meta. Isto é só para você saber o que esperar quando quiser voltar a olhar.</p>' : ''}
    ${facts}
    ${bullets(brief.bullets)}
    <p class="flormsg__warn">${icon('info', 15)}<span>${esc(brief.warning)}</span></p>
    ${link}
  </div>`;
}

/* ---------- caminho 4: silêncio ---------- */
function silencioView() {
  return card({
    title: COMFORT_SILENCE.title,
    text: COMFORT_SILENCE.text,
    items: COMFORT_SILENCE.bullets,
    foot: '<button class="btn btn--ghost mt-16" data-close>Fechar por agora</button>',
  });
}

function pathList() {
  return `<div class="comfortask">O que você precisa agora?</div>
  <div class="card card--flush"><div class="itemlist">
    ${COMFORT_PATHS.map((path) => `<button class="item" data-path="${esc(path.id)}">
      <span class="item__ico">${icon(path.icon, 20)}</span>
      <span class="item__body"><b>${esc(path.label)}</b><span>${esc(path.hint)}</span></span>
      <span class="item__end">${icon('chevron', 17)}</span>
    </button>`).join('')}
  </div></div>`;
}

export default {
  id: 'acolhimento',
  tab: null,
  render() {
    const state = getState();

    return {
      appbar: { title: 'Um minuto com a Flor', sub: 'Depois de um resultado negativo' },
      html: `<div class="section pb-24">
        <div class="comfortopen">
          <span class="comfortopen__mark">${icon('flower', 26)}</span>
          <b>${esc(comfortGreeting(state.profile))}</b>
          <p>${esc(COMFORT_OPENING.text)}</p>
          <p class="comfortopen__lead">${esc(COMFORT_OPENING.lead)}</p>
          <strong class="comfortopen__em">${esc(COMFORT_OPENING.emphasis)}</strong>
        </div>
        <div class="comfortbody" data-comfort-body></div>
      </div>`,

      mount(root) {
        const body = root.querySelector('[data-comfort-body]');
        let messageIndex = 0;

        const show = (pathId) => {
          if (!pathId) {
            body.innerHTML = pathList();
          } else {
            const view = pathId === 'acolhida' ? acolhidaView(messageIndex)
              : pathId === 'desabafo' ? desabafoView()
                : pathId === 'proximo' ? proximoView(getState())
                  : silencioView();
            body.innerHTML = `${view}
              <button class="btn btn--ghost mt-12" data-back-paths>${icon('back', 17)} Ver as outras opções</button>`;
          }
          bind(pathId);
        };

        function bind(pathId) {
          body.querySelectorAll('[data-path]').forEach((button) => {
            button.onclick = () => { haptic(); show(button.dataset.path); };
          });

          const voltar = body.querySelector('[data-back-paths]');
          if (voltar) voltar.onclick = () => { haptic(); show(null); };

          const outra = body.querySelector('[data-another]');
          if (outra) outra.onclick = () => { messageIndex += 1; haptic(); show('acolhida'); };

          const fechar = body.querySelector('[data-close]');
          if (fechar) fechar.onclick = () => navigate('home', { replace: true });

          if (pathId === 'desabafo') bindWriting();
        }

        function bindWriting() {
          const field = body.querySelector('[data-comfort-text]');
          const alertBox = body.querySelector('[data-comfort-alert]');

          body.querySelectorAll('[data-prompt]').forEach((chip) => {
            chip.onclick = () => {
              const atual = field.value.trim();
              field.value = atual ? `${atual}\n\n${chip.dataset.prompt} ` : `${chip.dataset.prompt} `;
              field.focus();
              field.setSelectionRange(field.value.length, field.value.length);
            };
          });

          /**
           * Rede de segurança: a mesma lista de sinais de alerta da Flor.
           * Roda no aparelho, não envia nada para lugar nenhum — e é justamente
           * aqui, num desabafo depois de um negativo, que ela mais importa.
           */
          const checkAlert = (text) => {
            const resposta = askFlor(text, getState());
            if (resposta.kind !== 'alert') return false;
            alertBox.innerHTML = card({
              title: resposta.title,
              text: resposta.answer,
              items: resposta.bullets,
              variant: 'comfortcard--alert',
            });
            alertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            return true;
          };

          body.querySelector('[data-save]').onclick = () => {
            const text = field.value.trim();
            if (!text) { toast('Escreva alguma coisa antes de guardar.'); return; }

            const alertou = checkAlert(text);

            const key = toKey(today());
            const log = getLog(key);
            const notes = appendToNotes(log.notes, text);
            const result = saveLog(key, { ...log, notes });
            noticeAchievements(result.achievements);

            field.value = '';
            haptic(14);
            if (!alertou) toast('Guardado nas observações de hoje.');
          };

          body.querySelector('[data-discard]').onclick = () => {
            const text = field.value.trim();
            const alertou = text ? checkAlert(text) : false;
            field.value = '';
            haptic();
            if (!alertou) toast('Pronto. Não guardei nada.');
          };
        }

        show(null);
      },
    };
  },
};
