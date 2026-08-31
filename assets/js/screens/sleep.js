import { getState, update, addJourney } from '../store.js';
import { formatSleepDuration, saveSleepLog, sleepStats, sleepTips } from '../sleep.js';
import { icon } from '../icons.js';
import { esc, haptic, toast } from '../ui.js';
import { navigate } from '../router.js';
import { fmtFull, fromKey, today, toKey } from '../cycle.js';

export default {
  id: 'sono',
  tab: null,
  render() {
    const state = getState();
    const key = toKey(today());
    const existing = (state.sleepLogs || []).find((log) => log.date === key);
    const stats = sleepStats(state);
    const tips = sleepTips(state, state.profile.phase);

    return {
      appbar: { title: 'Meu sono', sub: 'Sono noturno, cochilos e descanso' },
      html: `<div class="section pb-24 stagger">
        <div class="sleephero card">
          <span>${icon('moon', 24)}</span><div><small>Total registrado hoje</small><strong data-sleep-total>${formatSleepDuration(existing?.totalMinutes || 0)}</strong></div>
        </div>

        <div class="stats mt-16">
          ${stat('Último registro', stats.latest ? formatSleepDuration(stats.latest.totalMinutes) : '—', stats.latest ? fmtFull(fromKey(stats.latest.date)) : 'sem dados')}
          ${stat('Média recente', stats.recent.length ? formatSleepDuration(stats.averageTotalMinutes) : '—', stats.recent.length ? `${stats.recent.length} registros analisados` : 'registre seu sono')}
        </div>

        <div class="section__head" style="padding:0"><h2>Registrar descanso</h2></div>
        <div class="field"><label for="sleep-date">Data</label><input id="sleep-date" type="date" value="${key}" max="${key}"></div>
        <div class="card card--flush">
          <div class="kv"><span class="kv__k">Sono noturno<small>total dormido durante a noite</small></span>
            <span class="measurement"><input class="input input--inline" id="sleep-night" inputmode="decimal" value="${hoursValue(existing?.nightMinutes)}" placeholder="7,5"><b>horas</b></span></div>
          <div class="kv"><span class="kv__k">Cochilos<small>tempo somado ao longo do dia</small></span>
            <span class="measurement"><input class="input input--inline" id="sleep-naps" inputmode="decimal" value="${hoursValue(existing?.napMinutes)}" placeholder="1,5"><b>horas</b></span></div>
          <div class="kv"><span class="kv__k">Quantidade de cochilos<small>quantas vezes você descansou</small></span>
            <span class="measurement"><input class="input input--inline" id="sleep-nap-count" type="number" inputmode="numeric" min="0" max="10" value="${existing?.napCount || ''}" placeholder="1"><b>vezes</b></span></div>
        </div>
        <div class="field mt-16"><label for="sleep-notes">Como foi seu descanso? (opcional)</label><textarea id="sleep-notes" maxlength="500" placeholder="Ex.: acordei algumas vezes, demorei para dormir ou acordei descansada">${esc(existing?.notes || '')}</textarea></div>
        <button class="btn mt-16" data-save-sleep>${icon('check', 19)} Salvar registro de sono</button>

        <div class="section__head" style="padding:0"><h2>Dicas para você</h2></div>
        <div class="sleeptips">${tips.map((tip) => `<div class="card"><span>${icon('sparkle', 18)}</span><p>${esc(tip)}</p></div>`).join('')}</div>

        ${stats.recent.length ? `<div class="section__head" style="padding:0"><h2>Histórico recente</h2></div><div class="card card--flush"><div class="itemlist">
          ${stats.recent.map((log) => `<div class="item"><span class="item__ico">${icon('moon', 18)}</span><span class="item__body"><b>${formatSleepDuration(log.totalMinutes)}</b><span>${esc(fmtFull(fromKey(log.date)))} · noite ${formatSleepDuration(log.nightMinutes)}${log.napMinutes ? ` · cochilos ${formatSleepDuration(log.napMinutes)}` : ''}</span></span></div>`).join('')}
        </div></div>` : ''}
        <div class="note mt-16">${icon('info', 17)}<span>As dicas apoiam sua rotina, mas não substituem avaliação profissional diante de insônia persistente, exaustão ou sonolência intensa.</span></div>
      </div>`,
      mount(root) {
        const night = root.querySelector('#sleep-night');
        const naps = root.querySelector('#sleep-naps');
        const paintTotal = () => {
          const minutes = [night.value, naps.value].reduce((sum, value) => sum + (Number(value.replace(',', '.')) || 0) * 60, 0);
          root.querySelector('[data-sleep-total]').textContent = formatSleepDuration(minutes);
        };
        night.oninput = paintTotal;
        naps.oninput = paintTotal;
        root.querySelector('[data-save-sleep]').onclick = () => {
          try {
            update((current) => saveSleepLog(current, {
              date: root.querySelector('#sleep-date').value,
              nightHours: night.value,
              napHours: naps.value,
              napCount: root.querySelector('#sleep-nap-count').value,
              notes: root.querySelector('#sleep-notes').value,
            }));
          } catch (error) {
            toast(error.message);
            return;
          }
          addJourney('moon', 'Primeiro registro de sono', 'um passo para compreender melhor sua rotina de descanso');
          haptic(14);
          toast('Sono registrado.');
          navigate('sono', { replace: true });
        };
      },
    };
  },
};

const stat = (label, value, note) => `<div class="stat"><div class="k">${label}</div><div class="v">${value}</div><div class="m">${note}</div></div>`;
const hoursValue = (minutes) => minutes ? String(Math.round(minutes / 6) / 10).replace('.', ',') : '';
