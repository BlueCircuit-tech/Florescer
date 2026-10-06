/**
 * Avisos — a central que abre no sininho da Home.
 *
 * Não há push: os avisos são calculados quando ela abre o app e ficam aqui
 * esperando. Ao entrar nesta tela, tudo é marcado como lido.
 */
import { getState } from '../store.js';
import { icon } from '../icons.js';
import { confirmSheet, emptyState, esc, haptic, note, toast } from '../ui.js';
import { relativeTime } from '../cycle.js';
import { allNotices, clearNotices, markNoticesRead, removeNotice, unreadCount } from '../notify.js';

const rerender = () => import('../router.js').then((m) => m.render());

function noticeItem(notice) {
  return `<article class="notice ${notice.read ? '' : 'notice--new'}" data-notice="${esc(notice.id)}">
    <button class="notice__go" data-nav="${esc(notice.to)}">
      <span class="notice__ico">${icon(notice.icon, 19)}</span>
      <span class="grow">
        <b>${esc(notice.title)}</b>
        <span class="notice__body">${esc(notice.body)}</span>
        <span class="notice__time">${esc(relativeTime(notice.at))}</span>
      </span>
    </button>
    <button class="notice__close" data-drop="${esc(notice.id)}" aria-label="Dispensar aviso">${icon('close', 16)}</button>
  </article>`;
}

export default {
  id: 'avisos',
  tab: null,
  render() {
    const state = getState();
    const notices = allNotices(state);
    const novos = unreadCount(state);

    return {
      appbar: {
        title: 'Avisos',
        sub: novos ? `${novos} ${novos === 1 ? 'novo' : 'novos'}` : 'tudo em dia',
        actions: notices.length ? [{ icon: 'trash', label: 'Limpar avisos', action: 'clear' }] : [],
      },
      html: `<div class="section pb-24">
        ${notices.length
          ? `<div class="noticelist">${notices.map(noticeItem).join('')}</div>
             ${note('Os avisos aparecem aqui quando você abre o Florescer. Escolha quais quer receber em Configurações › Avisos.')}`
          : `${emptyState('bell', 'Nenhum aviso por aqui',
              'Quando houver algo para lembrar — janela fértil, menstruação prevista, uma consulta marcada ou missões do dia — o aviso aparece neste espaço.',
              { label: 'Escolher meus avisos', to: 'lembretes' })}`}
      </div>`,

      mount(root) {
        // entrou na central: a partir daqui nada mais é "novo"
        if (novos) setTimeout(markNoticesRead, 600);

        root.querySelectorAll('[data-drop]').forEach((button) => {
          button.onclick = (event) => {
            event.stopPropagation();
            removeNotice(button.dataset.drop);
            haptic();
            rerender();
          };
        });

        document.querySelector('#appbar [data-action="clear"]')?.addEventListener('click', async () => {
          const ok = await confirmSheet({
            title: 'Limpar todos os avisos?',
            message: 'Eles saem desta lista. Os que ainda valerem para hoje voltam na próxima vez que você abrir o app.',
            confirmLabel: 'Limpar',
          });
          if (!ok) return;
          clearNotices();
          toast('Avisos limpos.');
          rerender();
        });
      },
    };
  },
};
