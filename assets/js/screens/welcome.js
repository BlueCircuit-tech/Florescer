/** Tela de celebração exibida entre a conclusão do quiz e a Home. */
import { getState } from '../store.js';
import { icon } from '../icons.js';
import { esc } from '../ui.js';
import { navigate } from '../router.js';
import { welcomeContent } from '../welcome.js';

export default {
  id: 'boas-vindas',
  render() {
    const content = welcomeContent(getState().profile);

    return {
      appbar: null,
      html: `
        <section class="welcome welcome--${content.phase}">
          <div class="welcome__glow welcome__glow--one" aria-hidden="true"></div>
          <div class="welcome__glow welcome__glow--two" aria-hidden="true"></div>

          <div class="welcome__main">
            <p class="welcome__eyebrow">Seu Florescer está pronto</p>
            <div class="welcome__logo">
              <img src="icons/logo-app.png" width="210" height="210" alt="Florescer — seu ciclo, seu sonho, nossa missão">
            </div>

            <div class="welcome__copy">
              <span class="welcome__phase">${icon(content.icon, 16)} ${esc(content.label)}</span>
              <h1>${esc(content.title)}</h1>
              <p>${esc(content.message)}</p>
            </div>
          </div>

          <div class="welcome__footer">
            <button class="btn btn--grad" data-enter>
              Entrar no meu Florescer ${icon('chevron', 19)}
            </button>
            <p>Um espaço feito para acompanhar a sua história.</p>
          </div>
        </section>`,
      mount(root) {
        root.querySelector('[data-enter]').onclick = () => navigate('home', { replace: true });
      },
    };
  },
};
