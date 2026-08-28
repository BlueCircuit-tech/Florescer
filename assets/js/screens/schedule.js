import { getState, update, addJourney } from '../store.js';
import { babyNamesFromProfile } from '../babies.js';
import { CALENDAR_TYPES, calendarTypesForPhase, deleteScheduledEvent, saveScheduledEvent } from '../planner.js';
import { icon } from '../icons.js';
import { confirmSheet, esc, haptic, toast } from '../ui.js';
import { navigate } from '../router.js';
import { addDays, fromKey, today, toKey } from '../cycle.js';
import { permission, requestPermission, scheduleReminders } from '../notify.js';

const PHASE_COPY = {
  tentante: ['Organize seu cuidado', 'Agende consultas, exames, medicamentos e vitaminas.'],
  gravida: ['Acompanhe cada etapa', 'Organize pré-natal, ultrassons, exames e tratamentos.'],
  posparto: ['Cuidados da família', 'Agende compromissos para você ou para cada bebê.'],
};

export default {
  id: 'agenda',
  tab: null,
  render(route = { params: {} }) {
    const state = getState();
    const phase = state.profile.phase;
    const existing = (state.calendarEvents || []).find((event) => event.id === route.params.id);
    const types = calendarTypesForPhase(phase);
    const initialType = existing?.type || types[0].id;
    const initialReminder = existing?.reminderDays ?? (['medication', 'vitamin'].includes(initialType) ? 0 : 1);
    const initialDate = existing?.date || route.params.d || toKey(today());
    const defaultEnd = toKey(addDays(fromKey(initialDate), 30));
    const names = babyNamesFromProfile(state.profile);
    const [introTitle, introText] = PHASE_COPY[phase];

    return {
      appbar: { title: existing ? 'Editar compromisso' : 'Novo compromisso', sub: 'Agenda inteligente' },
      html: `<div class="section pb-24 stagger">
        <div class="card diaryintro">
          <span class="floatcard__ico">${icon('calendar', 22)}</span>
          <div><b>${introTitle}</b><p>${introText}</p></div>
        </div>

        <div class="field mt-16"><label for="event-type">Tipo</label><select id="event-type">
          ${types.map((type) => `<option value="${type.id}" ${type.id === initialType ? 'selected' : ''}>${esc(type.label)}</option>`).join('')}
        </select></div>
        <div class="field"><label for="event-title">Título</label><input id="event-title" maxlength="100" value="${esc(existing?.title || '')}" placeholder="Ex.: Consulta com Dra. Ana"></div>

        ${phase === 'posparto' ? `<div class="field"><label for="event-person">Para quem?</label><select id="event-person">
          ${['Mamãe', ...names].map((name) => `<option value="${esc(name)}" ${name === existing?.person ? 'selected' : ''}>${esc(name)}</option>`).join('')}
        </select></div>` : ''}

        <div class="healthdate">
          <div class="field"><label for="event-date">Data</label><input id="event-date" type="date" value="${initialDate}"></div>
          <div class="field"><label for="event-time">Horário</label><input id="event-time" type="time" value="${existing?.time || ''}"></div>
        </div>

        <div data-recurrence-box>
          <div class="field"><label for="event-recurrence">Repetição</label><select id="event-recurrence">
            <option value="once">Não repetir</option><option value="daily" ${existing?.recurrence === 'daily' ? 'selected' : ''}>Todos os dias</option>
          </select></div>
          <div class="field" data-end-date><label for="event-end">Repetir até</label><input id="event-end" type="date" value="${existing?.endDate || defaultEnd}" min="${initialDate}"></div>
        </div>

        <div class="field"><label for="event-reminder">Notificação</label><select id="event-reminder">
          <option value="-1" ${initialReminder === -1 ? 'selected' : ''}>Sem lembrete</option>
          <option value="0" ${initialReminder === 0 ? 'selected' : ''}>No mesmo dia</option>
          <option value="1" ${initialReminder === 1 ? 'selected' : ''}>1 dia antes</option>
          <option value="2" ${initialReminder === 2 ? 'selected' : ''}>2 dias antes</option>
          <option value="7" ${initialReminder === 7 ? 'selected' : ''}>1 semana antes</option>
        </select></div>
        <div class="field"><label for="event-notes">Observações (opcional)</label><textarea id="event-notes" maxlength="800" placeholder="Local, preparo necessário, dose ou orientação profissional">${esc(existing?.notes || '')}</textarea></div>

        <div class="note">${icon('bell', 17)}<span>Medicamentos e vitaminas podem se repetir diariamente. Os avisos são locais e dependem da permissão de notificações do aparelho.</span></div>
        <button class="btn mt-16" data-save-event>${icon('check', 19)} ${existing ? 'Salvar alterações' : 'Adicionar ao calendário'}</button>
        ${existing ? `<button class="btn btn--ghost mt-8" data-delete-event>${icon('trash', 18)} Excluir compromisso</button>` : ''}
      </div>`,
      mount(root) {
        const typeInput = root.querySelector('#event-type');
        const recurrenceInput = root.querySelector('#event-recurrence');
        const personInput = root.querySelector('#event-person');
        const recurrenceBox = root.querySelector('[data-recurrence-box]');
        const endDate = root.querySelector('[data-end-date]');
        const reminderInput = root.querySelector('#event-reminder');
        const syncRecurrence = (changedType = false) => {
          const repeats = ['medication', 'vitamin'].includes(typeInput.value);
          recurrenceBox.hidden = !repeats;
          if (!repeats) recurrenceInput.value = 'once';
          if (changedType && !existing) reminderInput.value = repeats ? '0' : '1';
          if (changedType && !existing && typeInput.value === 'vaccine' && names.length) personInput.value = names[0];
          endDate.hidden = recurrenceInput.value !== 'daily';
        };
        typeInput.onchange = () => syncRecurrence(true);
        recurrenceInput.onchange = () => syncRecurrence();
        root.querySelector('#event-date').onchange = (event) => {
          root.querySelector('#event-end').min = event.target.value;
        };
        syncRecurrence();

        root.querySelector('[data-save-event]').onclick = async () => {
          try {
            update((current) => saveScheduledEvent(current, {
              id: existing?.id,
              phase,
              type: typeInput.value,
              title: root.querySelector('#event-title').value,
              person: root.querySelector('#event-person')?.value || '',
              date: root.querySelector('#event-date').value,
              time: root.querySelector('#event-time').value,
              recurrence: recurrenceInput.value,
              endDate: root.querySelector('#event-end').value,
              reminderDays: reminderInput.value,
              notes: root.querySelector('#event-notes').value,
            }));
          } catch (error) {
            toast(error.message);
            return;
          }
          addJourney(CALENDAR_TYPES[typeInput.value].icon, 'Primeiro compromisso agendado', 'um cuidado importante organizado no calendário');
          if (reminderInput.value !== '-1' && permission() === 'default') await requestPermission();
          scheduleReminders();
          haptic(14);
          toast(existing ? 'Compromisso atualizado.' : 'Compromisso adicionado ao calendário.');
          navigate('ciclo');
        };

        root.querySelector('[data-delete-event]')?.addEventListener('click', async () => {
          const confirmed = await confirmSheet({
            title: 'Excluir compromisso?',
            message: existing.recurrence === 'daily' ? 'Todos os lembretes desta repetição serão excluídos.' : 'Este compromisso será removido do calendário.',
            confirmLabel: 'Excluir',
            danger: true,
          });
          if (!confirmed) return;
          update((current) => deleteScheduledEvent(current, existing.id));
          scheduleReminders();
          toast('Compromisso excluído.');
          navigate('ciclo');
        });
      },
    };
  },
};
