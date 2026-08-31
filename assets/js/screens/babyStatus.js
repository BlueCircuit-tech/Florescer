import { getState, update, addJourney } from '../store.js';
import { babyNamesFromProfile } from '../babies.js';
import { saveBabyStatus } from '../babyStatus.js';
import { icon } from '../icons.js';
import { esc, haptic, toast } from '../ui.js';
import { navigate } from '../router.js';
import { diffDays, fmtFull, fromKey, today, toKey } from '../cycle.js';
import { scheduleReminders } from '../notify.js';

export default {
  id: 'status-bebe',
  tab: null,
  render() {
    const state = getState();
    const names = babyNamesFromProfile(state.profile);
    const recent = (state.babyStatus || []).slice(0, 3);
    const minRecordDate = state.profile.birthDate || '';

    return {
      appbar: { title: 'Status do bebê', sub: 'Crescimento e próximos cuidados' },
      html: `<div class="section pb-24 stagger">
        <div class="card diaryintro">
          <span class="floatcard__ico">${icon('baby', 22)}</span>
          <div><b>Acompanhe cada descoberta</b><p>Guarde medidas e agende vacinas ou consultas no calendário.</p></div>
        </div>

        ${names.length > 1 ? `<div class="field mt-16"><label for="baby-status-name">Qual bebê?</label>
          <select id="baby-status-name">${names.map((name) => `<option value="${esc(name)}">${esc(name)}</option>`).join('')}</select></div>` : ''}
        <div class="field mt-16"><label for="baby-status-date">Data do registro</label>
          <input id="baby-status-date" type="date" value="${toKey(today())}" min="${minRecordDate}" max="${toKey(today())}"></div>

        <div class="section__head" style="padding:0"><h2>Medidas atuais</h2></div>
        <div class="card card--flush">
          <div class="kv"><span class="kv__k">Peso atual<small>em quilogramas</small></span>
            <span class="measurement"><input class="input input--inline" id="baby-weight" inputmode="decimal" placeholder="5,2"><b>kg</b></span></div>
          <div class="kv"><span class="kv__k">Altura atual<small>em centímetros</small></span>
            <span class="measurement"><input class="input input--inline" id="baby-height" inputmode="decimal" placeholder="58"><b>cm</b></span></div>
          <div class="kv"><span class="kv__k">Perímetro cefálico<small>medida ao redor da cabeça</small></span>
            <span class="measurement"><input class="input input--inline" id="baby-head" inputmode="decimal" placeholder="38"><b>cm</b></span></div>
        </div>

        <div class="section__head" style="padding:0"><h2>Próxima vacina</h2></div>
        <div class="card card--flush">
          <div class="field mt-16"><label for="baby-vaccine-date">Data</label><input id="baby-vaccine-date" type="date" min="${toKey(today())}"></div>
          <div class="field"><label for="baby-vaccine">Vacina (opcional)</label><input id="baby-vaccine" maxlength="80" placeholder="Ex.: Pentavalente"></div>
        </div>

        <div class="section__head" style="padding:0"><h2>Próxima consulta</h2></div>
        <div class="card card--flush">
          <div class="field mt-16"><label for="baby-appointment-date">Data</label><input id="baby-appointment-date" type="date" min="${toKey(today())}"></div>
          <div class="field"><label for="baby-appointment">Consulta (opcional)</label><input id="baby-appointment" maxlength="80" placeholder="Ex.: Pediatra"></div>
        </div>

        <div class="note mt-16">${icon('bell', 17)}<span>Vacinas e consultas serão exibidas no calendário e lembradas no dia anterior e no próprio dia.</span></div>
        <button class="btn mt-16" data-save-baby-status>${icon('check', 19)} Salvar status do bebê</button>
        <button class="btn btn--soft mt-8" data-nav="crescimento-bebe">${icon('chart', 19)} Ver gráfico de crescimento</button>

        ${recent.length ? `<div class="section__head" style="padding:0"><h2>Registros recentes</h2></div><div class="card card--flush"><div class="itemlist">
          ${recent.map((status) => `<div class="item"><span class="item__ico">${icon('baby', 19)}</span><span class="item__body"><b>${esc(status.babyName)}</b><span>${esc(fmtFull(fromKey(status.recordedOn)))}${status.weight != null ? ` · ${String(status.weight).replace('.', ',')} kg` : ''}${status.height != null ? ` · ${String(status.height).replace('.', ',')} cm` : ''}${status.headCircumference != null ? ` · PC ${String(status.headCircumference).replace('.', ',')} cm` : ''}</span></span></div>`).join('')}
        </div></div>` : ''}
      </div>`,
      mount(root) {
        root.querySelector('[data-save-baby-status]').onclick = () => {
          const number = (selector) => {
            const value = root.querySelector(selector).value.replace(',', '.').trim();
            return value ? Number(value) : null;
          };
          const nextVaccineDate = root.querySelector('#baby-vaccine-date').value;
          const nextAppointmentDate = root.querySelector('#baby-appointment-date').value;
          if (nextVaccineDate && diffDays(fromKey(nextVaccineDate), today()) < 0) { toast('A próxima vacina não pode estar no passado.'); return; }
          if (nextAppointmentDate && diffDays(fromKey(nextAppointmentDate), today()) < 0) { toast('A próxima consulta não pode estar no passado.'); return; }

          try {
            update((current) => saveBabyStatus(current, {
              babyName: root.querySelector('#baby-status-name')?.value || names[0] || 'Bebê',
              recordedOn: root.querySelector('#baby-status-date').value,
              weight: number('#baby-weight'),
              height: number('#baby-height'),
              headCircumference: number('#baby-head'),
              nextVaccineDate,
              nextVaccine: root.querySelector('#baby-vaccine').value,
              nextAppointmentDate,
              nextAppointment: root.querySelector('#baby-appointment').value,
            }));
          } catch (error) {
            toast(error.message);
            return;
          }
          addJourney('baby', 'Primeiro status do bebê registrado', 'crescimento e cuidados acompanhados no Florescer Baby');
          scheduleReminders();
          haptic(14);
          toast('Status salvo no calendário.');
          navigate('ciclo');
        };
      },
    };
  },
};
