/**
 * A carta da Flor — um momento da jornada, em tela cheia.
 *
 * Esta tela não pede nada e não mede nada. É só uma mensagem, no dia em que
 * ela importa, para a mulher que o app existe para cuidar.
 */
import { addJourney, getState, update } from '../store.js';
import { icon } from '../icons.js';
import { esc, haptic, toast } from '../ui.js';
import { navigate } from '../router.js';
import { markMomentSeen, momentById, momentOfDay, momentSeen } from '../florMoments.js';

export default {
  id: 'momento',
  tab: null,
  render(route = {}) {
    const state = getState();
    // abre o momento pedido na rota; sem rota, o que vale para hoje
    const moment = (route.arg && momentById(route.arg)) || momentOfDay(state);
    const nome = (state.profile.name || '').trim().split(/\s+/)[0];

    if (!moment) {
      return {
        appbar: { title: 'Da Flor para você' },
        html: `<div class="section pb-24">
          <div class="momento">
            <span class="momento__mark">${icon('flower', 30)}</span>
            <p class="momento__text">Nenhuma carta por aqui agora. Quando um momento chegar, eu te escrevo.</p>
          </div>
          <button class="btn btn--soft mt-16" data-nav="home">Voltar para o início</button>
        </div>`,
      };
    }

    const jaVista = momentSeen(state, moment.id);

    return {
      appbar: { title: 'Da Flor para você', back: true },
      html: `<div class="section pb-24">
        <article class="momento">
          <span class="momento__mark">${icon('flower', 30)}</span>
          ${nome ? `<span class="momento__to">${esc(nome)},</span>` : ''}
          <h1 class="momento__title">${esc(moment.title)}</h1>
          <p class="momento__text">${esc(moment.text)}</p>
          <span class="momento__sign">— Flor</span>
        </article>

        ${moment.link ? `<button class="btn btn--soft mt-16" data-nav="${esc(moment.link.to)}">${esc(moment.link.label)}</button>` : ''}
        <button class="btn ${moment.link ? 'btn--ghost mt-8' : 'mt-16'}" data-close>${jaVista ? 'Fechar' : 'Obrigada, Flor'}</button>
      </div>`,

      mount(root) {
        // ler já é o suficiente: a carta não volta, mesmo que ela saia sem tocar em nada
        if (!jaVista) {
          let guardou = false;
          update((s) => { guardou = markMomentSeen(s, moment.id); });
          if (guardou && moment.journey) {
            addJourney(moment.journey[0], moment.journey[1], moment.title.toLowerCase());
          }
        }

        root.querySelector('[data-close]').onclick = () => {
          haptic();
          if (!jaVista) toast('Guardei na sua jornada 💛');
          navigate('home', { replace: true });
        };
      },
    };
  },
};
