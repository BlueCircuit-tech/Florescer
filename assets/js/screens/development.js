import { getState, update, addJourney } from '../store.js';
import { babyNamesFromProfile } from '../babies.js';
import {
  DEVELOPMENT_MILESTONES,
  deleteDevelopmentRecord,
  developmentMilestone,
  listDevelopmentRecords,
  saveDevelopmentRecord,
} from '../development.js';
import { icon } from '../icons.js';
import { confirmSheet, esc, haptic, toast } from '../ui.js';
import { navigate } from '../router.js';
import { calendarAge, fmtFull, fromKey, today, toKey } from '../cycle.js';

export default {
  id: 'desenvolvimento-bebe',
  tab: null,
  render(route = { params: {} }) {
    const state = getState();
    const names = babyNamesFromProfile(state.profile);
    const existing = (state.babyDevelopmentRecords || []).find((record) => record.id === route.params.id);
    const selected = existing?.babyName || (names.includes(route.params.b) ? route.params.b : names[0] || 'Bebê');
    const records = listDevelopmentRecords(state, selected);
    const type = existing?.milestoneType || DEVELOPMENT_MILESTONES[0].id;
    const todayKey = toKey(today());

    return {
      appbar: { title: 'Registro de Desenvolvimento', sub: selected },
      html: `<div class="section pb-24 stagger">
        <div class="card diaryintro">
          <span class="floatcard__ico">${icon('sparkle', 22)}</span>
          <div><b>Cada descoberta merece ser lembrada</b><p>Registre os momentos especiais para formar a linha do tempo do desenvolvimento do seu bebê.</p></div>
        </div>

        ${names.length > 1 ? `<div class="field mt-16"><label for="development-baby">Qual bebê?</label><select id="development-baby">
          ${names.map((name) => `<option value="${esc(name)}" ${name === selected ? 'selected' : ''}>${esc(name)}</option>`).join('')}
        </select></div>` : ''}

        <div class="section__head" style="padding:0"><h2>${existing ? 'Editar marco' : 'Registrar novo marco'}</h2><span>${records.length} ${records.length === 1 ? 'memória' : 'memórias'}</span></div>
        <div class="field"><label for="development-type">O que aconteceu?</label><select id="development-type">
          ${DEVELOPMENT_MILESTONES.map((milestone) => `<option value="${milestone.id}" ${milestone.id === type ? 'selected' : ''}>${milestone.emoji} ${esc(milestone.label)}</option>`).join('')}
        </select></div>
        <div class="field" data-custom-title ${type === 'custom' ? '' : 'hidden'}><label for="development-title">Nome do marco</label><input id="development-title" maxlength="100" value="${esc(existing?.milestoneType === 'custom' ? existing.title : '')}" placeholder="Ex.: Primeiro dia na escolinha"></div>
        <div class="field"><label for="development-date">Quando aconteceu?</label><input id="development-date" type="date" value="${existing?.happenedOn || todayKey}" min="${state.profile.birthDate || ''}" max="${todayKey}"></div>
        <div class="field"><label for="development-notes">Conte essa história (opcional)</label><textarea id="development-notes" maxlength="1000" placeholder="Onde vocês estavam, como foi e o que tornou esse momento especial...">${esc(existing?.notes || '')}</textarea></div>
        <button class="btn mt-16" data-save-development>${icon('check', 19)} ${existing ? 'Salvar alterações' : 'Guardar esta memória'}</button>
        ${existing ? `<button class="btn btn--ghost mt-8" data-delete-development>${icon('trash', 18)} Excluir registro</button>` : ''}
        <div class="note mt-16">${icon('heart', 17)}<span>Estas são memórias afetivas, não uma avaliação clínica. Cada bebê se desenvolve no próprio ritmo.</span></div>

        <div class="section__head" style="padding:0"><h2>Linha do tempo</h2></div>
        ${records.length ? `<div class="vaccinelist">${records.map((record) => developmentCard(record, state.profile.birthDate)).join('')}</div>` : `<div class="card"><p class="fs-13 muted">As descobertas de ${esc(selected)} aparecerão aqui em ordem cronológica.</p></div>`}
      </div>`,
      mount(root) {
        const typeInput = root.querySelector('#development-type');
        const customTitle = root.querySelector('[data-custom-title]');
        const syncCustomTitle = () => { customTitle.hidden = typeInput.value !== 'custom'; };
        typeInput.onchange = syncCustomTitle;
        syncCustomTitle();

        root.querySelector('#development-baby')?.addEventListener('change', (event) => {
          navigate(`desenvolvimento-bebe?b=${encodeURIComponent(event.target.value)}`, { replace: true });
        });
        root.querySelector('[data-save-development]').onclick = () => {
          try {
            update((current) => saveDevelopmentRecord(current, {
              id: existing?.id,
              babyName: selected,
              milestoneType: typeInput.value,
              title: root.querySelector('#development-title').value,
              happenedOn: root.querySelector('#development-date').value,
              notes: root.querySelector('#development-notes').value,
            }));
          } catch (error) { toast(error.message); return; }
          addJourney('sparkle', 'Primeiro marco do bebê registrado', 'memórias do desenvolvimento guardadas no Florescer Baby');
          haptic(14);
          toast(existing ? 'Marco atualizado.' : 'Memória guardada na linha do tempo.');
          navigate(`desenvolvimento-bebe?b=${encodeURIComponent(selected)}`, { replace: true });
        };
        root.querySelectorAll('[data-edit-development]').forEach((button) => {
          button.onclick = () => navigate(`desenvolvimento-bebe?b=${encodeURIComponent(selected)}&id=${encodeURIComponent(button.dataset.editDevelopment)}`);
        });
        root.querySelector('[data-delete-development]')?.addEventListener('click', async () => {
          const confirmed = await confirmSheet({
            title: 'Excluir esta memória?',
            message: 'O marco será removido permanentemente da linha do tempo.',
            confirmLabel: 'Excluir',
            danger: true,
          });
          if (!confirmed) return;
          update((current) => deleteDevelopmentRecord(current, existing.id));
          toast('Registro excluído.');
          navigate(`desenvolvimento-bebe?b=${encodeURIComponent(selected)}`, { replace: true });
        });
      },
    };
  },
};

function developmentCard(record, birthDate) {
  const milestone = developmentMilestone(record.milestoneType);
  const age = birthDate ? calendarAge(fromKey(birthDate), fromKey(record.happenedOn)).age : '';
  return `<article class="card vaccinecard">
    <span class="vaccinecard__ico" aria-hidden="true">${milestone?.emoji || '✨'}</span>
    <div class="grow"><b>${esc(record.title)}</b><span>${esc(fmtFull(fromKey(record.happenedOn)))}${age ? ` · ${esc(age)} de vida` : ''}${record.notes ? ` · ${esc(record.notes)}` : ''}</span></div>
    <div class="vaccinecard__actions"><button class="iconbtn iconbtn--ghost" data-edit-development="${esc(record.id)}" aria-label="Editar ${esc(record.title)}">${icon('edit', 17)}</button></div>
  </article>`;
}
