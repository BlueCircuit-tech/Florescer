import { getState, update, addJourney } from '../store.js';
import { babyNamesFromProfile } from '../babies.js';
import { deleteBabyVaccine, listBabyVaccines, markVaccineTaken, saveBabyVaccine } from '../vaccines.js';
import { icon } from '../icons.js';
import { confirmSheet, esc, haptic, toast } from '../ui.js';
import { navigate } from '../router.js';
import { fmtFull, fromKey, today, toKey } from '../cycle.js';
import { permission, requestPermission, scheduleReminders } from '../notify.js';

export default {
  id: 'vacinas-bebe',
  tab: null,
  render(route = { params: {} }) {
    const state = getState();
    const names = babyNamesFromProfile(state.profile);
    const selected = names.includes(route.params.b) ? route.params.b : names[0] || 'Bebê';
    const existing = (state.babyVaccines || []).find((vaccine) => vaccine.id === route.params.id);
    const vaccines = listBabyVaccines(state, selected);
    const scheduled = vaccines.filter((vaccine) => vaccine.status === 'scheduled');
    const taken = vaccines.filter((vaccine) => vaccine.status === 'taken');
    const todayKey = toKey(today());

    return {
      appbar: { title: 'Vacinas do bebê', sub: selected },
      html: `<div class="section pb-24 stagger">
        ${names.length > 1 ? `<div class="field"><label for="vaccine-baby">Qual bebê?</label><select id="vaccine-baby">
          ${names.map((name) => `<option value="${esc(name)}" ${name === selected ? 'selected' : ''}>${esc(name)}</option>`).join('')}
        </select></div>` : ''}
        <div class="vaccinesummary"><div><span>${icon('calendar', 19)}</span><b>${scheduled.length}</b><small>marcadas</small></div><div><span>${icon('shield', 19)}</span><b>${taken.length}</b><small>tomadas</small></div></div>

        <div class="section__head" style="padding:0"><h2>${existing ? 'Editar vacina' : 'Adicionar vacina'}</h2></div>
        <div class="field"><label for="vaccine-name">Nome da vacina</label><input id="vaccine-name" maxlength="100" value="${esc(existing?.name || '')}" placeholder="Ex.: Pentavalente"></div>
        <div class="field"><label for="vaccine-dose">Dose (opcional)</label><input id="vaccine-dose" maxlength="80" value="${esc(existing?.dose || '')}" placeholder="Ex.: 2ª dose"></div>
        <div class="field"><label for="vaccine-status">Situação</label><select id="vaccine-status"><option value="scheduled" ${existing?.status !== 'taken' ? 'selected' : ''}>Vacina marcada</option><option value="taken" ${existing?.status === 'taken' ? 'selected' : ''}>Vacina tomada</option></select></div>
        <div class="field"><label for="vaccine-date">Data</label><input id="vaccine-date" type="date" value="${existing?.date || todayKey}"></div>
        <div class="field"><label for="vaccine-notes">Observações (opcional)</label><textarea id="vaccine-notes" maxlength="500" placeholder="Local, lote, reação ou orientação recebida">${esc(existing?.notes || '')}</textarea></div>
        <button class="btn mt-16" data-save-vaccine>${icon('check', 19)} ${existing ? 'Salvar alterações' : 'Salvar vacina'}</button>
        ${existing ? `<button class="btn btn--ghost mt-8" data-delete-vaccine>${icon('trash', 18)} Excluir vacina</button>` : ''}
        <div class="note mt-16">${icon('bell', 17)}<span>Vacinas marcadas aparecem automaticamente no calendário. Com as notificações ativadas, o Florescer avisa no dia anterior e no próprio dia.</span></div>

        <div class="section__head" style="padding:0"><h2>Vacinas marcadas</h2></div>
        ${scheduled.length ? `<div class="vaccinelist">${scheduled.map((vaccine) => vaccineCard(vaccine, todayKey)).join('')}</div>` : '<div class="card"><p class="fs-13 muted">Nenhuma vacina marcada para este bebê.</p></div>'}
        <div class="section__head" style="padding:0"><h2>Vacinas tomadas</h2></div>
        ${taken.length ? `<div class="vaccinelist">${taken.map((vaccine) => vaccineCard(vaccine, todayKey)).join('')}</div>` : '<div class="card"><p class="fs-13 muted">As vacinas tomadas aparecerão aqui.</p></div>'}
      </div>`,
      mount(root) {
        const statusInput = root.querySelector('#vaccine-status');
        const dateInput = root.querySelector('#vaccine-date');
        const syncDate = () => { dateInput.max = statusInput.value === 'taken' ? todayKey : ''; };
        statusInput.onchange = syncDate;
        syncDate();
        root.querySelector('#vaccine-baby')?.addEventListener('change', (event) => navigate(`vacinas-bebe?b=${encodeURIComponent(event.target.value)}`, { replace: true }));
        root.querySelector('[data-save-vaccine]').onclick = async () => {
          try {
            update((current) => saveBabyVaccine(current, {
              id: existing?.id, babyName: selected, name: root.querySelector('#vaccine-name').value,
              dose: root.querySelector('#vaccine-dose').value, status: statusInput.value, date: dateInput.value,
              notes: root.querySelector('#vaccine-notes').value,
            }));
          } catch (error) { toast(error.message); return; }
          if (statusInput.value === 'scheduled' && permission() === 'default') await requestPermission();
          addJourney('shield', 'Primeira vacina registrada', 'cuidados de vacinação acompanhados no Florescer Baby');
          scheduleReminders();
          haptic(14);
          toast('Vacina salva no histórico.');
          navigate(`vacinas-bebe?b=${encodeURIComponent(selected)}`, { replace: true });
        };
        root.querySelectorAll('[data-edit-vaccine]').forEach((button) => { button.onclick = () => navigate(`vacinas-bebe?b=${encodeURIComponent(selected)}&id=${encodeURIComponent(button.dataset.editVaccine)}`); });
        root.querySelectorAll('[data-take-vaccine]').forEach((button) => {
          button.onclick = () => {
            update((current) => markVaccineTaken(current, button.dataset.takeVaccine, todayKey));
            scheduleReminders();
            haptic(14);
            toast('Vacina marcada como tomada hoje.');
            navigate(`vacinas-bebe?b=${encodeURIComponent(selected)}`, { replace: true });
          };
        });
        root.querySelector('[data-delete-vaccine]')?.addEventListener('click', async () => {
          const confirmed = await confirmSheet({ title: 'Excluir vacina?', message: 'Este registro será removido do histórico e do calendário.', confirmLabel: 'Excluir', danger: true });
          if (!confirmed) return;
          update((current) => deleteBabyVaccine(current, existing.id));
          scheduleReminders();
          toast('Vacina excluída.');
          navigate(`vacinas-bebe?b=${encodeURIComponent(selected)}`, { replace: true });
        });
      },
    };
  },
};

function vaccineCard(vaccine, todayKey) {
  const overdue = vaccine.status === 'scheduled' && vaccine.date < todayKey;
  return `<article class="card vaccinecard ${overdue ? 'vaccinecard--overdue' : ''}"><span class="vaccinecard__ico">${icon(vaccine.status === 'taken' ? 'check' : 'shield', 19)}</span>
    <div class="grow"><b>${esc(vaccine.name)}${vaccine.dose ? ` · ${esc(vaccine.dose)}` : ''}</b><span>${esc(fmtFull(fromKey(vaccine.date)))}${overdue ? ' · data passada' : ''}${vaccine.notes ? ` · ${esc(vaccine.notes)}` : ''}</span></div>
    <div class="vaccinecard__actions">${vaccine.legacy ? `<button class="btn btn--soft btn--sm btn--auto" data-nav="status-bebe">Ver status</button>` : `${vaccine.status === 'scheduled' ? `<button class="iconbtn iconbtn--ghost" data-take-vaccine="${esc(vaccine.id)}" aria-label="Marcar como tomada">${icon('check', 17)}</button>` : ''}<button class="iconbtn iconbtn--ghost" data-edit-vaccine="${esc(vaccine.id)}" aria-label="Editar vacina">${icon('edit', 17)}</button>`}</div>
  </article>`;
}
