import { getState, update, addJourney } from '../store.js';
import { icon } from '../icons.js';
import { haptic, toast } from '../ui.js';
import { DAILY_MISSIONS, missionProgress, missionStats, toggleMission } from '../missions.js';
import { toKey, today } from '../cycle.js';

export default {
  id: 'missoes',
  tab: 'missoes',
  render() {
    const state = getState();
    const key = toKey(today());
    const progress = missionProgress(state, key);
    const stats = missionStats(state);

    return {
      appbar: { title: 'Missões Diárias', sub: 'Pequenos cuidados, todos os dias' },
      html: `<div class="section pb-24 stagger">
        <section class="missionhero ${progress.done ? 'missionhero--complete' : ''}" aria-label="Progresso das missões de hoje">
          <div class="missionhero__top">
            <div><span>Seu progresso hoje</span><b>${progress.done ? 'Todas concluídas! 🎉' : `${progress.count} de ${progress.total} missões`}</b></div>
            <strong>${Math.round(progress.count / progress.total * 100)}%</strong>
          </div>
          <div class="progress"><i style="width:${progress.count / progress.total * 100}%"></i></div>
          <div class="missionstats">
            <div><span>${icon('sparkle', 16)} Pontos</span><b>${stats.totalPoints}</b></div>
            <div><span>${icon('flag', 16)} Sequência</span><b>${stats.streak} ${stats.streak === 1 ? 'dia' : 'dias'}</b></div>
            <div><span>${icon('crown', 16)} Nível</span><b>${stats.level}</b></div>
          </div>
        </section>

        <div class="section__head" style="padding:0"><h2>Missões de hoje</h2><span>${progress.points} pontos hoje</span></div>
        <div class="missionlist">
          ${DAILY_MISSIONS.map((mission) => {
            const done = progress.completed.includes(mission.id);
            return `<button class="mission ${done ? 'mission--done' : ''}" data-mission="${mission.id}" aria-pressed="${done}">
              <span class="mission__check">${done ? icon('check', 19) : icon(mission.icon, 20)}</span>
              <span class="grow"><b>${mission.title}</b><small>${mission.text}</small></span>
              <span class="mission__points">+${mission.points}</span>
            </button>`;
          }).join('')}
        </div>

        <div class="card mt-16 missionlevel">
          <div class="row row--between"><b>Rumo ao nível ${stats.level + 1}</b><span>${stats.totalPoints % 250}/250 pts</span></div>
          <div class="progress mt-8"><i style="width:${stats.levelProgress * 100}%"></i></div>
        </div>

        <div class="note mt-16">${icon('bell', 17)}<span>Se os lembretes estiverem ativados, avisaremos quando ainda houver missões pendentes no horário escolhido.</span></div>
      </div>`,

      mount(root) {
        root.querySelectorAll('[data-mission]').forEach((button) => {
          button.onclick = () => {
            let completed;
            update((state) => { completed = toggleMission(state, button.dataset.mission, key); });
            haptic(completed ? 14 : 8);
            const current = missionProgress(getState(), key);
            if (current.done) {
              addJourney('crown', 'Primeiro dia com todas as missões', 'uma rotina de autocuidado concluída');
              toast('Todas as missões concluídas! 50 pontos hoje 🎉');
            } else if (completed) {
              toast(`Missão concluída! +10 pontos ✨`);
            }
            import('../router.js').then(({ render }) => render());
          };
        });
      },
    };
  },
};
