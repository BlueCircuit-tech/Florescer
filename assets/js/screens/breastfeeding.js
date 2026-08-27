import { getState, update, addJourney } from '../store.js';
import { babyNamesFromProfile } from '../babies.js';
import { BREASTFEEDING_SIDES, formatBreastfeedingDuration, saveBreastfeeding } from '../breastfeeding.js';
import { icon } from '../icons.js';
import { esc, haptic, toast } from '../ui.js';
import { navigate } from '../router.js';
import { fmtFull, fromKey, today, toKey } from '../cycle.js';

export default {
  id: 'amamentacao',
  tab: null,
  render() {
    const state = getState();
    const names = babyNamesFromProfile(state.profile);
    const recent = (state.breastfeedingLogs || []).slice(0, 4);
    let elapsed = 0;
    let runningSince = null;
    let side = null;

    return {
      appbar: { title: 'Amamentação', sub: 'Mamada, extração e estoque' },
      html: `<div class="section pb-24 stagger">
        ${names.length > 1 ? `<div class="field"><label for="feeding-baby">Qual bebê?</label>
          <select id="feeding-baby">${names.map((name) => `<option value="${esc(name)}">${esc(name)}</option>`).join('')}</select></div>` : ''}
        <div class="field"><label for="feeding-date">Data</label><input id="feeding-date" type="date" value="${toKey(today())}" min="${state.profile.birthDate || ''}" max="${toKey(today())}"></div>

        <div class="feedtimer card">
          <span class="eyebrow">Tempo da amamentação</span>
          <strong data-timer>00:00</strong>
          <div class="btnrow">
            <button class="btn" data-timer-toggle>${icon('clock', 19)} <span>Iniciar</span></button>
            <button class="btn btn--ghost" data-timer-reset>${icon('refresh', 18)} Reiniciar</button>
          </div>
        </div>

        <div class="section__head" style="padding:0"><h2>Lado utilizado</h2></div>
        <div class="quiz__opts" style="padding:0">
          ${Object.entries(BREASTFEEDING_SIDES).map(([id, label]) => `<button class="opt" data-side="${id}" aria-pressed="false">
            <span class="opt__ico">${icon('heart', 18)}</span><span class="grow">${label}</span><span class="opt__check">${icon('check', 18)}</span>
          </button>`).join('')}
        </div>

        <div class="section__head" style="padding:0"><h2>Leite extraído e guardado</h2></div>
        <div class="card card--flush">
          <div class="kv"><span class="kv__k">Extração de leite<small>volume desta sessão</small></span>
            <span class="measurement"><input class="input input--inline" id="feeding-extracted" type="number" inputmode="numeric" min="0" max="5000" placeholder="120"><b>ml</b></span></div>
          <div class="kv"><span class="kv__k">Estoque guardado<small>total disponível agora</small></span>
            <span class="measurement"><input class="input input--inline" id="feeding-stock" type="number" inputmode="numeric" min="0" max="5000" placeholder="350"><b>ml</b></span></div>
        </div>

        <button class="btn mt-16" data-save-feeding>${icon('check', 19)} Salvar amamentação</button>

        ${recent.length ? `<div class="section__head" style="padding:0"><h2>Registros recentes</h2></div><div class="card card--flush"><div class="itemlist">
          ${recent.map((entry) => `<div class="item"><span class="item__ico">${icon('heart', 19)}</span><span class="item__body"><b>${esc(entry.babyName)} · ${esc(fmtFull(fromKey(entry.date)))}</b><span>${entry.durationSeconds ? `${formatBreastfeedingDuration(entry.durationSeconds)} · ${BREASTFEEDING_SIDES[entry.side]}` : 'Extração/estoque'}${entry.extractedMl != null ? ` · ${entry.extractedMl} ml extraídos` : ''}${entry.storedMl != null ? ` · ${entry.storedMl} ml em estoque` : ''}</span></span></div>`).join('')}
        </div></div>` : ''}
      </div>`,
      mount(root) {
        const timer = root.querySelector('[data-timer]');
        const toggle = root.querySelector('[data-timer-toggle]');
        let interval;
        const seconds = () => elapsed + (runningSince ? Math.floor((Date.now() - runningSince) / 1000) : 0);
        const paintTimer = () => {
          if (!root.isConnected) { clearInterval(interval); return; }
          timer.textContent = formatBreastfeedingDuration(seconds());
          toggle.querySelector('span').textContent = runningSince ? 'Pausar' : elapsed ? 'Continuar' : 'Iniciar';
        };
        toggle.onclick = () => {
          if (runningSince) {
            elapsed = seconds();
            runningSince = null;
          } else {
            runningSince = Date.now();
          }
          haptic();
          paintTimer();
        };
        root.querySelector('[data-timer-reset]').onclick = () => {
          elapsed = 0;
          runningSince = null;
          haptic();
          paintTimer();
        };
        interval = setInterval(paintTimer, 500);
        paintTimer();

        root.querySelectorAll('[data-side]').forEach((button) => {
          button.onclick = () => {
            side = button.dataset.side;
            root.querySelectorAll('[data-side]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
            haptic();
          };
        });

        root.querySelector('[data-save-feeding]').onclick = () => {
          try {
            update((current) => saveBreastfeeding(current, {
              date: root.querySelector('#feeding-date').value,
              babyName: root.querySelector('#feeding-baby')?.value || names[0] || 'Bebê',
              durationSeconds: seconds(),
              side,
              extractedMl: root.querySelector('#feeding-extracted').value,
              storedMl: root.querySelector('#feeding-stock').value,
            }));
          } catch (error) {
            toast(error.message);
            return;
          }
          clearInterval(interval);
          addJourney('heart', 'Primeiro registro de amamentação', 'um momento de cuidado guardado no Florescer Baby');
          haptic(14);
          toast('Amamentação registrada.');
          navigate('home');
        };
      },
    };
  },
};
