import { getState, update, addJourney } from '../store.js';
import { babyNamesFromProfile } from '../babies.js';
import { diaperSummary, saveDiaperLog } from '../diapers.js';
import { icon } from '../icons.js';
import { esc, haptic, toast } from '../ui.js';
import { navigate } from '../router.js';
import { fmtFull, fromKey, today, toKey } from '../cycle.js';

export default {
  id: 'fraldas',
  tab: null,
  render(route = { params: {} }) {
    const state = getState();
    const names = babyNamesFromProfile(state.profile);
    const selected = names.includes(route.params.b) ? route.params.b : names[0] || 'Bebê';
    const todayKey = toKey(today());
    const summary = diaperSummary(state, todayKey, selected);
    const recent = (state.diaperLogs || []).filter((log) => log.babyName === selected).slice(0, 6);
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    return {
      appbar: { title: 'Fraldas', sub: `Acompanhamento de ${selected}` },
      html: `<div class="section pb-24 stagger">
        ${names.length > 1 ? `<div class="field"><label for="diaper-baby">Qual bebê?</label><select id="diaper-baby">
          ${names.map((name) => `<option value="${esc(name)}" ${name === selected ? 'selected' : ''}>${esc(name)}</option>`).join('')}
        </select></div>` : ''}

        <div class="section__head" style="padding:0"><h2>Frequência de hoje</h2></div>
        <div class="stats diaperstats">
          ${stat('Trocas', summary.total, 'total registrado')}
          ${stat('Urina', summary.urine, 'fraldas com urina')}
          ${stat('Fezes', summary.stool, 'fraldas com fezes')}
        </div>

        <div class="section__head" style="padding:0"><h2>Registrar troca</h2></div>
        <div class="healthdate">
          <div class="field"><label for="diaper-date">Data</label><input id="diaper-date" type="date" value="${todayKey}" min="${state.profile.birthDate || ''}" max="${todayKey}"></div>
          <div class="field"><label for="diaper-time">Horário</label><input id="diaper-time" type="time" value="${currentTime}"></div>
        </div>

        <div class="quiz__opts mt-16" style="padding:0">
          <button class="opt" data-diaper="urine" aria-pressed="false"><span class="opt__ico">${icon('drop', 19)}</span><span class="grow"><b>Urina</b></span><span class="opt__check">${icon('check', 18)}</span></button>
          <button class="opt" data-diaper="stool" aria-pressed="false"><span class="opt__ico">${icon('note', 19)}</span><span class="grow"><b>Fezes</b></span><span class="opt__check">${icon('check', 18)}</span></button>
        </div>

        <div class="field mt-16"><label for="diaper-notes">Observações (opcional)</label><textarea id="diaper-notes" maxlength="300" placeholder="Ex.: quantidade, cor, consistência ou algo diferente"></textarea></div>
        <button class="btn mt-16" data-save-diaper>${icon('check', 19)} Salvar troca de fralda</button>

        ${recent.length ? `<div class="section__head" style="padding:0"><h2>Trocas recentes</h2></div><div class="card card--flush"><div class="itemlist">
          ${recent.map((log) => `<div class="item"><span class="item__ico">${icon(log.stool ? 'note' : 'drop', 18)}</span><span class="item__body"><b>${log.urine && log.stool ? 'Urina e fezes' : log.urine ? 'Urina' : 'Fezes'}</b><span>${esc(fmtFull(fromKey(log.date)))}${log.time ? ` · ${esc(log.time)}` : ''}${log.notes ? ` · ${esc(log.notes)}` : ''}</span></span></div>`).join('')}
        </div></div>` : ''}
      </div>`,
      mount(root) {
        const selectedTypes = { urine: false, stool: false };
        root.querySelector('#diaper-baby')?.addEventListener('change', (event) => {
          navigate(`fraldas?b=${encodeURIComponent(event.target.value)}`, { replace: true });
        });
        root.querySelectorAll('[data-diaper]').forEach((button) => {
          button.onclick = () => {
            const type = button.dataset.diaper;
            selectedTypes[type] = !selectedTypes[type];
            button.setAttribute('aria-pressed', String(selectedTypes[type]));
            haptic();
          };
        });
        root.querySelector('[data-save-diaper]').onclick = () => {
          try {
            update((current) => saveDiaperLog(current, {
              babyName: selected,
              date: root.querySelector('#diaper-date').value,
              time: root.querySelector('#diaper-time').value,
              urine: selectedTypes.urine,
              stool: selectedTypes.stool,
              notes: root.querySelector('#diaper-notes').value,
            }));
          } catch (error) {
            toast(error.message);
            return;
          }
          addJourney('baby', 'Primeira troca de fralda registrada', 'um cuidado diário acompanhado no Florescer Baby');
          haptic(14);
          toast('Troca de fralda registrada.');
          navigate(`fraldas?b=${encodeURIComponent(selected)}`, { replace: true });
        };
      },
    };
  },
};

const stat = (label, value, note) => `<div class="stat"><div class="k">${label}</div><div class="v">${value}</div><div class="m">${note}</div></div>`;
