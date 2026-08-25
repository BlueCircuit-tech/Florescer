/**
 * Calendário do ciclo: menstruação registrada, previsões, janela fértil,
 * ovulação e marcações do dia. Navega por qualquer mês.
 */
import { getState } from '../store.js';
import { icon } from '../icons.js';
import { esc, openSheet, closeSheet, haptic, toast } from '../ui.js';
import { navigate } from '../router.js';
import {
  cycleInfo, dayInfo, monthMatrix, weekdayLabels, today, toKey, fromKey,
  fmtMonth, fmtFull, fmtShort, isSameDay, diffDays, relativeDay, plural, cap,
} from '../cycle.js';
import { MOODS, FLOWS } from '../content.js';

let cursor = null; // mês exibido

export default {
  id: 'ciclo',
  tab: 'ciclo',
  render() {
    const state = getState();
    const info = cycleInfo(state);
    if (!cursor) cursor = new Date(today().getFullYear(), today().getMonth(), 1);

    const cells = monthMatrix(cursor.getFullYear(), cursor.getMonth());
    const isCurrentMonth = cursor.getMonth() === today().getMonth() && cursor.getFullYear() === today().getFullYear();

    const grid = weekdayLabels.map((w) => `<div class="cal__wd">${w}</div>`).join('')
      + cells.map((d) => {
        if (!d) return '<div class="day day--pad"></div>';
        const di = dayInfo(state, d, info);
        const cls = ['day'];
        if (di.menst) cls.push('day--menst');
        else if (di.ovulation) cls.push('day--ovul');
        else if (di.fertile) cls.push('day--fert');
        else if (di.predPeriod) cls.push('day--pred');
        if (di.future) cls.push('day--future');
        if (isSameDay(d, today())) cls.push('day--today');
        const marks = [];
        if (di.log?.intercourse) marks.push('<i class="love"></i>');
        if (di.log && !di.log.intercourse) marks.push('<i class="log"></i>');
        return `<button class="${cls.join(' ')}" data-day="${di.key}" aria-label="${fmtFull(d)}">
          ${d.getDate()}${marks.length ? `<span class="day__marks">${marks.join('')}</span>` : ''}
        </button>`;
      }).join('');

    const resumo = info.known ? `
      <div class="card mt-16" style="display:flex;gap:13px;align-items:center">
        <span class="floatcard__ico" style="background:var(--lilac-50);color:var(--lilac-600)">${icon('sparkle', 22)}</span>
        <div class="grow">
          <b style="font-size:14px">Previsão do próximo ciclo</b>
          <div class="fs-12 muted mt-4">
            Menstruação ${fmtShort(info.nextPeriod)} · janela fértil ${fmtShort(info.fertileStart)}–${fmtShort(info.fertileEnd)}<br>
            Confiança ${info.confidence}% · ${info.cyclesTracked ? plural(info.cyclesTracked, 'ciclo registrado', 'ciclos registrados') : 'baseado nos dados do cadastro'}
          </div>
        </div>
      </div>` : `
      <div class="card mt-16">
        <b style="font-size:14px">Ainda não temos o seu ciclo</b>
        <p class="fs-13 muted mt-4">Informe a data da última menstruação no perfil ou marque o fluxo em um dia do calendário.</p>
        <button class="btn btn--soft btn--sm mt-12" data-nav="perfil">Ir para o perfil</button>
      </div>`;

    return {
      appbar: {
        title: 'Meu ciclo',
        sub: info.known ? `Dia ${info.dayOfCycle} · ciclo médio de ${info.avgLength} dias` : 'Sem dados suficientes',
        back: false,
        actions: [{ icon: 'chart', label: 'Relatórios', to: 'relatorios' }],
      },
      html: `
        <div class="cal__head">
          <button class="iconbtn iconbtn--ghost" data-move="-1" aria-label="Mês anterior">${icon('back', 18)}</button>
          <span class="cal__month">${cap(fmtMonth(cursor))}</span>
          <button class="iconbtn iconbtn--ghost" data-move="1" aria-label="Próximo mês">${icon('chevron', 18)}</button>
        </div>
        <div class="cal__grid">${grid}</div>
        <div class="legend">
          <span><i style="background:var(--c-menst)"></i>Menstruação</span>
          <span><i style="background:var(--c-pred-tint);box-shadow:inset 0 0 0 1.5px var(--c-pred)"></i>Previsão</span>
          <span><i style="background:var(--leaf-200)"></i>Janela fértil</span>
          <span><i style="background:var(--c-ovul)"></i>Ovulação</span>
          <span><i style="background:var(--rose-600);border-radius:99px;width:8px;height:8px"></i>Intimidade</span>
          <span><i style="background:var(--lilac-500);border-radius:99px;width:8px;height:8px"></i>Registro</span>
        </div>
        <div class="section pb-24">
          ${resumo}
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
  const date = fromKey(key);
  const info = cycleInfo(state);
  const di = dayInfo(state, date, info);
  const log = di.log;
  haptic();

  const status = di.menst ? 'Menstruação registrada'
    : di.ovulation ? 'Ovulação estimada'
      : di.fertile ? 'Janela fértil'
        : di.predPeriod ? 'Menstruação prevista'
          : 'Dia comum do ciclo';

  const cycleDay = info.known ? diffDays(date, info.cycleStart) + 1 : null;
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
    body: `${detalhes}
      <button class="btn mt-16" data-go>${icon('edit', 18)} ${log ? 'Editar registro' : 'Registrar este dia'}</button>`,
    onMount(sheet) {
      sheet.querySelector('[data-go]').onclick = () => { closeSheet(); navigate(`registro?d=${key}`); };
    },
  });
}

const row = (ic, k, v) => `<div class="kv">
  <span class="kv__k" style="display:flex;align-items:center;gap:8px">${icon(ic, 16)} ${esc(k)}</span>
  <span class="kv__v" style="font-weight:600;max-width:60%">${esc(v)}</span>
</div>`;
