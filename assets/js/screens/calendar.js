/**
 * Calendário do ciclo: menstruação registrada, previsões, janela fértil,
 * ovulação e marcações do dia. Navega por qualquer mês.
 */
import { getState, saveIntercourse } from '../store.js';
import { icon } from '../icons.js';
import { esc, openSheet, closeSheet, haptic, toast } from '../ui.js';
import { navigate } from '../router.js';
import {
  cycleInfo, dayInfo, monthMatrix, weekdayLabels, today, toKey, fromKey,
  fmtMonth, fmtFull, fmtShort, isSameDay, diffDays, relativeDay, plural, cap,
} from '../cycle.js';
import { MOODS, FLOWS } from '../content.js';
import { notifyAchievements } from '../notify.js';
import { babyCareOnDate, babyEvents } from '../babyStatus.js';
import { CALENDAR_TYPES, scheduledEventsOnDate, upcomingScheduledEvents } from '../planner.js';

let cursor = null; // mês exibido

export default {
  id: 'ciclo',
  tab: 'ciclo',
  render() {
    const state = getState();
    const info = cycleInfo(state);
    const phase = state.profile.phase;
    const postpartum = phase === 'posparto';
    const pregnant = phase === 'gravida';
    const trying = phase === 'tentante';
    const upcomingBabyEvents = postpartum ? babyEvents(state).filter((event) => event.status !== 'taken' && event.date >= toKey(today())).slice(0, 4) : [];
    const upcomingPlannerEvents = upcomingScheduledEvents(state, toKey(today()), 5);
    const upcoming = [
      ...upcomingPlannerEvents.map((event) => ({ ...event, date: event.occurrenceDate, source: 'planner' })),
      ...upcomingBabyEvents.map((event) => ({ ...event, title: event.label, person: event.babyName, source: 'baby' })),
    ].sort((a, b) => a.date.localeCompare(b.date) || (a.time || '99:99').localeCompare(b.time || '99:99')).slice(0, 5);
    if (!cursor) cursor = new Date(today().getFullYear(), today().getMonth(), 1);

    const cells = monthMatrix(cursor.getFullYear(), cursor.getMonth());
    const isCurrentMonth = cursor.getMonth() === today().getMonth() && cursor.getFullYear() === today().getFullYear();

    const grid = weekdayLabels.map((w) => `<div class="cal__wd">${w}</div>`).join('')
      + cells.map((d) => {
        if (!d) return '<div class="day day--pad"></div>';
        const di = dayInfo(state, d, info);
        const babyCare = postpartum ? babyCareOnDate(state, di.key) : { statuses: [], events: [] };
        const planned = scheduledEventsOnDate(state, di.key);
        const cls = ['day'];
        if (trying && di.menst) cls.push('day--menst');
        else if (trying && di.ovulation) cls.push('day--ovul');
        else if (trying && di.fertile) cls.push('day--fert');
        else if (trying && di.predPeriod) cls.push('day--pred');
        if (di.future) cls.push('day--future');
        if (isSameDay(d, today())) cls.push('day--today');
        const marks = [];
        if (trying && di.log?.intercourse) marks.push('<i class="love" aria-hidden="true">♥</i>');
        if (!postpartum && di.log && (!trying || !di.log.intercourse)) marks.push('<i class="log"></i>');
        if (babyCare.statuses.length) marks.push('<i class="baby-status" aria-hidden="true">●</i>');
        if (babyCare.events.some((event) => event.type === 'vaccine')) marks.push('<i class="baby-care baby-care--vaccine" aria-hidden="true">V</i>');
        if (babyCare.events.some((event) => event.type === 'appointment')) marks.push('<i class="baby-care baby-care--appointment" aria-hidden="true">C</i>');
        if (planned.length) marks.push(`<i class="planner-mark" aria-hidden="true">${planned.length}</i>`);
        const relationshipLabel = di.log?.intercourse ? ', relação registrada' : '';
        const babyLabel = babyCare.statuses.length || babyCare.events.length ? `, ${babyCare.statuses.length ? 'status do bebê' : ''}${babyCare.statuses.length && babyCare.events.length ? ', ' : ''}${babyCare.events.length ? 'cuidado agendado' : ''}` : '';
        const plannerLabel = planned.length ? `, ${plural(planned.length, 'compromisso', 'compromissos')}` : '';
        return `<button class="${cls.join(' ')}" data-day="${di.key}" aria-label="${fmtFull(d)}${relationshipLabel}${babyLabel}${plannerLabel}">
          ${d.getDate()}${marks.length ? `<span class="day__marks">${marks.join('')}</span>` : ''}
        </button>`;
      }).join('');

    const cycleSummary = trying && info.known ? `
      <div class="card mt-16" style="display:flex;gap:13px;align-items:center">
        <span class="floatcard__ico" style="background:var(--lilac-50);color:var(--lilac-600)">${icon('sparkle', 22)}</span>
        <div class="grow">
          <b style="font-size:14px">Previsão do próximo ciclo</b>
          <div class="fs-12 muted mt-4">
            Menstruação ${fmtShort(info.nextPeriod)} · janela fértil ${fmtShort(info.fertileStart)}–${fmtShort(info.fertileEnd)}<br>
            Confiança ${info.confidence}% · ${info.cyclesTracked ? plural(info.cyclesTracked, 'ciclo registrado', 'ciclos registrados') : 'baseado nos dados do cadastro'}
          </div>
        </div>
      </div>` : trying ? `
      <div class="card mt-16">
        <b style="font-size:14px">Ainda não temos o seu ciclo</b>
        <p class="fs-13 muted mt-4">Informe a data da última menstruação no perfil ou marque o fluxo em um dia do calendário.</p>
        <button class="btn btn--soft btn--sm mt-12" data-nav="perfil">Ir para o perfil</button>
      </div>` : '';

    const agendaSummary = `<div class="card mt-16">
      <div class="row row--between"><b style="font-size:14px">Próximos compromissos</b><button class="btn btn--soft btn--sm btn--auto" data-nav="agenda">${icon('plus', 16)} Agendar</button></div>
      ${upcoming.length ? `<div class="itemlist mt-8">${upcoming.map((event) => {
        const type = CALENDAR_TYPES[event.type] || { icon: event.type === 'vaccine' ? 'shield' : 'calendar', label: event.type === 'vaccine' ? 'Vacina' : 'Consulta' };
        return `<${event.source === 'planner' ? 'button' : 'div'} class="item" ${event.source === 'planner' ? `data-nav="agenda?id=${encodeURIComponent(event.id)}"` : ''}>
          <span class="item__ico">${icon(type.icon, 18)}</span><span class="item__body"><b>${esc(event.title)}${event.person ? ` · ${esc(event.person)}` : ''}</b><span>${fmtShort(fromKey(event.date))}${event.time ? ` às ${esc(event.time)}` : ''} · ${esc(type.label)}</span></span>
          ${event.source === 'planner' ? `<span class="item__end">${icon('chevron', 16)}</span>` : ''}</${event.source === 'planner' ? 'button' : 'div'}>`;
      }).join('')}</div>` : '<p class="fs-13 muted mt-8">Nenhum compromisso agendado. Use “Agendar” para organizar seus próximos cuidados.</p>'}
    </div>`;

    return {
      appbar: {
          title: postpartum ? 'Calendário do bebê' : pregnant ? 'Calendário da gestação' : 'Meu ciclo',
          sub: postpartum ? 'Cuidados da mãe e dos bebês' : pregnant ? 'Pré-natal e acompanhamento' : info.known ? `Dia ${info.dayOfCycle} · ciclo médio de ${info.avgLength} dias` : 'Ciclo e cuidados',
        back: false,
        actions: [{ icon: 'plus', label: 'Agendar compromisso', to: 'agenda' }, ...(trying ? [{ icon: 'chart', label: 'Relatórios', to: 'relatorios' }] : [])],
      },
      html: `
        <div class="cal__head">
          <button class="iconbtn iconbtn--ghost" data-move="-1" aria-label="Mês anterior">${icon('back', 18)}</button>
          <span class="cal__month">${cap(fmtMonth(cursor))}</span>
          <button class="iconbtn iconbtn--ghost" data-move="1" aria-label="Próximo mês">${icon('chevron', 18)}</button>
        </div>
        <div class="cal__grid">${grid}</div>
        <div class="legend">
          ${postpartum ? `<span><b class="legend__baby-status">●</b>Status</span>
          <span><b class="legend__baby-care legend__baby-care--vaccine">V</b>Vacina</span>
          <span><b class="legend__baby-care legend__baby-care--appointment">C</b>Consulta</span>
          <span><b class="legend__planner">1</b>Agenda</span>` : pregnant ? `<span><i style="background:var(--lilac-500)"></i>Diário</span><span><b class="legend__planner">1</b>Agenda</span>` : `
          <span><i style="background:var(--c-menst)"></i>Menstruação</span>
          <span><i style="background:var(--c-pred-tint);box-shadow:inset 0 0 0 1.5px var(--c-pred)"></i>Previsão</span>
          <span><i style="background:var(--leaf-200)"></i>Janela fértil</span>
          <span><i style="background:var(--c-ovul)"></i>Ovulação</span>
          <span><b class="legend__heart" aria-hidden="true">♥</b>Relação</span>
          <span><i style="background:var(--lilac-500);border-radius:99px;width:8px;height:8px"></i>Registro</span>
          <span><b class="legend__planner">1</b>Agenda</span>`}
        </div>
        <div class="section pb-24">
          ${cycleSummary}${agendaSummary}
          ${!isCurrentMonth ? '<button class="btn btn--soft btn--sm mt-12" data-move="0">Voltar para hoje</button>' : ''}
          <p class="center fs-11 faint mt-16">Toque em um dia para ver e registrar o que aconteceu.</p>
        </div>`,

      mount(root) {
        root.querySelectorAll('[data-move]').forEach((b) => {
          b.onclick = () => {
            const n = +b.dataset.move;
            cursor = n === 0 ? new Date(today().getFullYear(), today().getMonth(), 1)
              : new Date(cursor.getFullYear(), cursor.getMonth() + n, 1);
            haptic();
            import('../router.js').then((m) => m.render());
          };
        });
        root.querySelectorAll('[data-day]').forEach((b) => {
          b.onclick = () => openDay(b.dataset.day);
        });
      },
    };
  },
};

function openDay(key) {
  const state = getState();
  if (state.profile.phase === 'posparto') { openBabyDay(key, state); return; }
  const pregnant = state.profile.phase === 'gravida';
  const date = fromKey(key);
  const info = cycleInfo(state);
  const di = dayInfo(state, date, info);
  const log = di.log;
  const planned = scheduledEventsOnDate(state, key);
  haptic();

  const status = pregnant ? 'Acompanhamento da gestação'
    : di.menst ? 'Menstruação registrada'
    : di.ovulation ? 'Ovulação estimada'
      : di.fertile ? 'Janela fértil'
        : di.predPeriod ? 'Menstruação prevista'
          : 'Dia comum do ciclo';

  const cycleDay = !pregnant && info.known ? diffDays(date, info.cycleStart) + 1 : null;
  const canRegisterRelationship = state.profile.phase === 'tentante' && !di.future && !log?.intercourse;
  const detalhes = log ? `
    <div class="card card--tint mt-12">
      ${log.flow ? row('drop', 'Fluxo', FLOWS.find((f) => f.id === log.flow)?.label || log.flow) : ''}
      ${log.mood !== null ? row('heart', 'Humor', `${MOODS[log.mood].emoji} ${MOODS[log.mood].label}`) : ''}
      ${log.symptoms?.length ? row('note', 'Sintomas', log.symptoms.join(', ')) : ''}
      ${log.systolicPressure != null && log.diastolicPressure != null ? row('heart', 'Pressão arterial', `${log.systolicPressure}/${log.diastolicPressure} mmHg`) : ''}
      ${log.weight != null ? row('chart', 'Peso', `${String(log.weight).replace('.', ',')} kg`) : ''}
      ${log.glucose != null ? row('drop', 'Glicemia', `${log.glucose} mg/dL`) : ''}
      ${log.symptomNotes ? row('note', 'Observações dos sintomas', log.symptomNotes) : ''}
      ${log.intercourse ? row('heartFill', 'Intimidade', log.protected ? 'com proteção' : 'registrada') : ''}
      ${log.temperature ? row('thermometer', 'Temperatura basal', `${log.temperature} °C`) : ''}
      ${log.notes ? row('note', 'Observações', log.notes) : ''}
    </div>` : '<p class="fs-13 muted mt-8">Nada registrado neste dia ainda.</p>';

  openSheet({
    title: fmtFull(date),
    subtitle: `${status}${cycleDay && cycleDay > 0 ? ` · dia ${cycleDay} do ciclo` : ''} · ${relativeDay(date)}`,
    body: `${plannerList(planned)}${detalhes}
      ${canRegisterRelationship ? `<button class="btn btn--soft mt-16" data-relationship>${icon('heartFill', 18)} Registrar relação</button>` : ''}
      <button class="btn btn--soft mt-16" data-schedule>${icon('calendar', 18)} Agendar compromisso</button>
      <button class="btn mt-8" data-go>${icon('edit', 18)} ${log ? 'Editar registro' : 'Registrar este dia'}</button>`,
    onMount(sheet) {
      bindPlannerLinks(sheet);
      sheet.querySelector('[data-relationship]')?.addEventListener('click', () => {
        const result = saveIntercourse(key);
        notifyAchievements(result.achievements);
        closeSheet();
        haptic(14);
        toast('Relação registrada no calendário.');
        import('../router.js').then((module) => module.render());
      });
      sheet.querySelector('[data-schedule]').onclick = () => { closeSheet(); navigate(`agenda?d=${key}`); };
      sheet.querySelector('[data-go]').onclick = () => { closeSheet(); navigate(`registro?d=${key}`); };
    },
  });
}

function openBabyDay(key, state) {
  const date = fromKey(key);
  const care = babyCareOnDate(state, key);
  const planned = scheduledEventsOnDate(state, key);
  const statuses = care.statuses.map((status) => `<div class="card card--tint mt-12">
    <b>${esc(status.babyName)}</b>
    ${status.weight != null ? row('chart', 'Peso', `${String(status.weight).replace('.', ',')} kg`) : ''}
    ${status.height != null ? row('baby', 'Altura', `${String(status.height).replace('.', ',')} cm`) : ''}
    ${status.headCircumference != null ? row('chart', 'Perímetro cefálico', `${String(status.headCircumference).replace('.', ',')} cm`) : ''}
  </div>`).join('');
  const events = care.events.length ? `<div class="card card--tint mt-12">${care.events.map((event) =>
    row(event.type === 'vaccine' ? 'shield' : 'calendar', event.type === 'vaccine' ? (event.status === 'taken' ? 'Vacina tomada' : 'Vacina') : 'Consulta', `${event.label} · ${event.babyName}`)).join('')}</div>` : '';

  openSheet({
    title: fmtFull(date),
    subtitle: care.events.length || planned.length ? plural(care.events.length + planned.length, 'cuidado agendado', 'cuidados agendados') : 'Calendário do Florescer Baby',
    body: `${plannerList(planned)}${statuses}${events}${!statuses && !events && !planned.length ? '<p class="fs-13 muted mt-8">Nenhum status ou cuidado registrado neste dia.</p>' : ''}
      <button class="btn btn--soft mt-16" data-schedule>${icon('calendar', 18)} Agendar compromisso</button>
      <button class="btn mt-8" data-baby-status>${icon('baby', 18)} Registrar status do bebê</button>`,
    onMount(sheet) {
      bindPlannerLinks(sheet);
      sheet.querySelector('[data-schedule]').onclick = () => { closeSheet(); navigate(`agenda?d=${key}`); };
      sheet.querySelector('[data-baby-status]').onclick = () => { closeSheet(); navigate('status-bebe'); };
    },
  });
}

function plannerList(events) {
  if (!events.length) return '';
  return `<div class="card card--tint mt-12"><b class="fs-13">Agenda</b><div class="itemlist mt-4">${events.map((event) => {
    const type = CALENDAR_TYPES[event.type];
    return `<button class="item" data-edit-event="${encodeURIComponent(event.id)}"><span class="item__ico">${icon(type.icon, 17)}</span>
      <span class="item__body"><b>${esc(event.title)}${event.person ? ` · ${esc(event.person)}` : ''}</b><span>${event.time ? `${esc(event.time)} · ` : ''}${esc(type.label)}${event.recurrence === 'daily' ? ' · diário' : ''}${event.notes ? ` · ${esc(event.notes)}` : ''}</span></span><span class="item__end">${icon('chevron', 16)}</span></button>`;
  }).join('')}</div></div>`;
}

function bindPlannerLinks(sheet) {
  sheet.querySelectorAll('[data-edit-event]').forEach((button) => {
    button.onclick = () => { closeSheet(); navigate(`agenda?id=${button.dataset.editEvent}`); };
  });
}

const row = (ic, k, v) => `<div class="kv">
  <span class="kv__k" style="display:flex;align-items:center;gap:8px">${icon(ic, 16)} ${esc(k)}</span>
  <span class="kv__v" style="font-weight:600;max-width:60%">${esc(v)}</span>
</div>`;
