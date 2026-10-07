/**
 * "Mamãe, como você está hoje?" — o check-in diário da Flor.
 *
 * É a única tela do app que não quer dado nenhum: responder é opcional,
 * dispensar não custa nada e nenhuma resposta é cobrada ou corrigida.
 * O que ela conta vai para o diário do dia, no aparelho, e a Flor devolve
 * uma palavra à altura do que foi dito.
 */
import { getLog, getState, saveLog, update } from '../store.js';
import { icon } from '../icons.js';
import { esc, haptic, toast } from '../ui.js';
import { navigate } from '../router.js';
import { MOODS } from '../content.js';
import { today, toKey } from '../cycle.js';
import { appendToNotes } from '../comfort.js';
import { askFlor } from '../florAssistant.js';
import { noticeAchievements } from '../notify.js';
import { dailyAnswer, dailyMessage, dailyReply } from '../florDaily.js';

const rerender = () => import('../router.js').then((m) => m.render());

const bullets = (items) => (items?.length
  ? `<ul class="flormsg__list">${items.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>`
  : '');

function replyCard(reply, variant = '') {
  return `<div class="comfortcard ${variant}">
    <b class="comfortcard__title">${esc(reply.title)}</b>
    <p>${esc(reply.text || reply.answer || '')}</p>
    ${bullets(reply.bullets)}
    ${reply.link ? `<button class="flormsg__link" data-nav="${esc(reply.link.to)}">${esc(reply.link.label)} ${icon('chevron', 14)}</button>` : ''}
  </div>`;
}

export default {
  id: 'como-voce-esta',
  tab: null,
  render() {
    const state = getState();
    const message = dailyMessage(state);
    const jaRespondeu = dailyAnswer(state);

    return {
      appbar: { title: 'Um momento seu', sub: 'A pergunta de hoje da Flor' },
      html: `<div class="section pb-24">
        <div class="dailyask">
          <span class="dailyask__mark">${icon('flower', 26)}</span>
          <b>${esc(message.heading)}</b>
          <p>${esc(message.text)}</p>
        </div>

        <div data-daily-body>
          ${jaRespondeu ? respondido(jaRespondeu) : formulario()}
        </div>
      </div>`,

      mount(root) {
        const body = root.querySelector('[data-daily-body]');
        let mood = jaRespondeu ? jaRespondeu.mood : null;

        const bind = () => {
          body.querySelectorAll('[data-mood]').forEach((button) => {
            button.onclick = () => {
              mood = Number(button.dataset.mood);
              body.querySelectorAll('[data-mood]').forEach((item) => {
                item.setAttribute('aria-pressed', String(item === button));
              });
              const salvar = body.querySelector('[data-save]');
              if (salvar) salvar.disabled = false;
              haptic();
            };
          });

          const salvar = body.querySelector('[data-save]');
          if (salvar) salvar.onclick = () => responder(mood, body.querySelector('[data-daily-text]')?.value || '');

          const pular = body.querySelector('[data-skip]');
          if (pular) pular.onclick = () => {
            update((s) => {
              if (!s.florDaily) s.florDaily = { answers: {}, dismissed: [] };
              const day = toKey(today());
              if (!s.florDaily.dismissed.includes(day)) s.florDaily.dismissed.push(day);
            });
            haptic();
            toast('Tudo bem. Eu pergunto de novo amanhã.');
            navigate('home', { replace: true });
          };
        };

        bind();
      },
    };
  },
};

function formulario() {
  return `<div class="comfortcard">
    <b class="comfortcard__title">Escolha o que mais se parece com hoje</b>
    <div class="moodrow mt-12">
      ${MOODS.map((m, i) => `<button class="mood" data-mood="${i}" aria-pressed="false"><em>${m.emoji}</em>${esc(m.label)}</button>`).join('')}
    </div>
    <div class="field mt-16">
      <label for="daily-text">Quer contar alguma coisa? <small>opcional</small></label>
      <textarea id="daily-text" rows="4" maxlength="1000"
        placeholder="Uma frase já basta. Ou nenhuma." data-daily-text></textarea>
    </div>
    <div class="note">${icon('lock', 17)}<span>Fica só neste aparelho, junto com o seu dia. Ninguém além de você lê.</span></div>
    <button class="btn mt-16" data-save disabled>${icon('check', 19)} Contar para a Flor</button>
    <button class="btn btn--ghost mt-8" data-skip>Hoje não, obrigada</button>
  </div>`;
}

function respondido(answer) {
  const mood = MOODS[answer.mood] || MOODS[2];
  return `<div class="dailydone">
    <span class="dailydone__face">${mood.emoji}</span>
    <div><b>Você já me contou hoje</b><span>Seu dia está como "${esc(mood.label.toLowerCase())}". Pode mudar a qualquer momento no seu registro.</span></div>
  </div>
  ${replyCard(dailyReply(answer.mood))}
  <button class="btn btn--ghost mt-12" data-nav="registro">${icon('note', 18)} Abrir o meu registro de hoje</button>`;
}

/* ---------- salvar ---------- */
function responder(mood, texto) {
  if (!Number.isInteger(mood)) { toast('Escolha como foi o seu dia.'); return; }

  const day = toKey(today());
  const limpo = String(texto || '').trim();

  // mesma rede de segurança do acolhimento: roda aqui, não sai do aparelho
  const alerta = limpo ? askFlor(limpo, getState()) : null;
  const alertou = alerta?.kind === 'alert';

  const log = getLog(day);
  const resultado = saveLog(day, {
    ...log,
    mood,
    notes: limpo ? appendToNotes(log.notes, limpo) : log.notes,
  });
  noticeAchievements(resultado.achievements);

  update((s) => {
    if (!s.florDaily) s.florDaily = { answers: {}, dismissed: [] };
    s.florDaily.answers[day] = { mood, at: Date.now(), wrote: !!limpo };
  });

  haptic(14);
  if (alertou) {
    // o alerta tem prioridade sobre qualquer devolutiva de humor
    const body = document.querySelector('[data-daily-body]');
    if (body) {
      body.innerHTML = replyCard(
        { title: alerta.title, text: alerta.answer, bullets: alerta.bullets },
        'comfortcard--alert',
      );
    }
    return;
  }

  toast('Obrigada por contar');
  rerender();
}
