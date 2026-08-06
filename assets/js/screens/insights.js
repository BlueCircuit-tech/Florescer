/**
 * Relatórios e análises — tudo calculado a partir dos registros da usuária.
 * Curva de temperatura e relatório para consulta são recursos Premium.
 */
import { getState } from '../store.js';
import { icon } from '../icons.js';
import { esc, barChart, lineChart, emptyState, note, downloadFile, toast } from '../ui.js';
import {
  cycleInfo, cycleLengths, periodsFromLogs, streak, toKey, fromKey, today,
  addDays, diffDays, fmtMonthShort, fmtShort, fmtLong, median, plural,
} from '../cycle.js';
import { MOODS, SYMPTOMS } from '../content.js';

export default {
  id: 'relatorios',
  tab: 'ciclo',
  render() {
    const state = getState();
    const info = cycleInfo(state);
    const cycles = cycleLengths(state);
    const periods = periodsFromLogs(state.logs);
    const st = streak(state);
    const logs = Object.entries(state.logs).sort(([a], [b]) => a.localeCompare(b));

    if (!logs.length && !cycles.length) {
      return {
        appbar: { title: 'Relatórios' },
        html: emptyState('chart', 'Ainda não há dados suficientes',
          'Registre pelo menos alguns dias do seu ciclo para ver padrões, médias e a curva de temperatura.',
          { label: 'Fazer meu primeiro registro', to: 'registro' }),
      };
    }

    /* ---- métricas ---- */
    const lens = cycles.map((c) => c.length);
    const variacao = lens.length > 1 ? Math.max(...lens) - Math.min(...lens) : null;
    const periodLen = median(periods.map((p) => p.length));

    const chartCiclos = barChart(
      cycles.slice(-6).map((c) => ({ label: fmtMonthShort(fromKey(c.start)), value: c.length })),
      { unit: 'd' },
    );

    /* ---- temperatura do ciclo atual ---- */
    const start = info.known ? info.cycleStart : addDays(today(), -28);
    const temps = [];
    for (let d = 0; d <= diffDays(today(), start); d++) {
      const date = addDays(start, d);
      const l = state.logs[toKey(date)];
      temps.push({ label: String(d + 1), value: l?.temperature ?? null });
    }
    const chartTemp = lineChart(temps);

    /* ---- sintomas e humor ---- */
    const symCount = {};
    let moodSum = 0, moodN = 0, sexCount = 0;
    for (const [, l] of logs) {
      (l.symptoms || []).forEach((s) => { symCount[s] = (symCount[s] || 0) + 1; });
      if (typeof l.mood === 'number') { moodSum += l.mood; moodN++; }
      if (l.intercourse) sexCount++;
    }
    const topSym = Object.entries(symCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const moodAvg = moodN ? moodSum / moodN : null;

    const lockedBlock = (title, text) => `
      <div class="card card--tint center" style="padding:24px 18px">
        <div class="empty__ico" style="margin:0 auto 10px">${icon('lock', 26)}</div>
        <b style="font-family:var(--font-display)">${esc(title)}</b>
        <p class="fs-13 muted mt-4">${esc(text)}</p>
        <button class="btn btn--lilac btn--sm mt-12" data-nav="premium">${icon('crown', 17)} Desbloquear no Premium</button>
      </div>`;

    return {
      appbar: {
        title: 'Relatórios',
        sub: `${plural(logs.length, 'dia registrado', 'dias registrados')} · ${plural(cycles.length, 'ciclo completo', 'ciclos completos')}`,
        actions: [{ icon: 'download', label: 'Exportar relatório', action: 'export' }],
      },
      html: `<div class="section pb-24 stagger">
        <div class="stats">
          ${stat('Ciclo médio', info.avgLength ? `${info.avgLength}d` : '—', cycles.length ? `${plural(cycles.length, 'ciclo', 'ciclos')} analisados` : 'valor informado no cadastro')}
          ${stat('Variação', variacao === null ? '—' : `${variacao}d`, variacao === null ? 'precisa de 2 ciclos' : variacao <= 4 ? 'ciclo regular 🌿' : 'ciclo irregular')}
          ${stat('Menstruação', periodLen ? `${periodLen}d` : '—', 'duração média registrada')}
          ${stat('Sequência', `${st.current}d`, `recorde de ${plural(st.best, 'dia', 'dias')}`)}
        </div>

        ${cycles.length ? `
          <div class="section__head" style="padding:0"><h2>Duração dos seus ciclos</h2></div>
          <div class="card">${chartCiclos}
            <p class="fs-12 muted mt-8">Ciclos entre 21 e 35 dias são considerados regulares. Variações de até 4 dias entre ciclos são normais.</p>
          </div>` : `
          <div class="section__head" style="padding:0"><h2>Duração dos seus ciclos</h2></div>
          ${note('Assim que você registrar duas menstruações, o gráfico de ciclos aparece aqui.')}`}

        <div class="section__head" style="padding:0"><h2>Temperatura basal</h2></div>
        ${state.premium
          ? (chartTemp
            ? `<div class="card">${chartTemp}
                <p class="fs-12 muted mt-8">A elevação sustentada de 0,2 a 0,5 °C indica que a ovulação já ocorreu. Meça sempre no mesmo horário.</p>
              </div>`
            : note('Registre a temperatura por alguns dias seguidos para ver a curva do ciclo atual.'))
          : lockedBlock('Curva de temperatura basal', 'Veja a confirmação da ovulação e o padrão dos seus ciclos.')}

        ${topSym.length ? `
          <div class="section__head" style="padding:0"><h2>Sintomas mais frequentes</h2></div>
          <div class="card card--flush">
            ${topSym.map(([s, n]) => `
              <div class="kv">
                <span class="kv__k">${esc(s)}</span>
                <span class="kv__v">${plural(n, 'dia', 'dias')}</span>
              </div>`).join('')}
          </div>` : ''}

        <div class="section__head" style="padding:0"><h2>Resumo do período</h2></div>
        <div class="card card--flush">
          <div class="kv"><span class="kv__k">Humor médio</span><span class="kv__v">${moodAvg === null ? '—' : `${MOODS[Math.round(moodAvg)].emoji} ${MOODS[Math.round(moodAvg)].label}`}</span></div>
          <div class="kv"><span class="kv__k">Dias com intimidade</span><span class="kv__v">${sexCount}</span></div>
          <div class="kv"><span class="kv__k">Confiança da previsão</span><span class="kv__v">${info.known ? `${info.confidence}%` : '—'}</span></div>
          <div class="kv"><span class="kv__k">Próxima menstruação</span><span class="kv__v">${info.known ? fmtShort(info.nextPeriod) : '—'}</span></div>
        </div>

        ${state.premium
          ? `<button class="btn btn--soft mt-16" data-export2>${icon('download', 18)} Baixar relatório para a consulta</button>`
          : lockedBlock('Relatório para a consulta', 'Um resumo dos seus ciclos, sintomas e temperaturas para levar ao médico.')}

        ${note('Estes números são estatísticos e valem como apoio à conversa com o seu médico — não como diagnóstico.')}
      </div>`,

      mount(root) {
        const doExport = () => {
          if (!state.premium) { toast('Relatório completo disponível no Premium ✨'); return; }
          downloadFile(`florescer-relatorio-${toKey(today())}.txt`, buildReport(state, info, cycles, periods, topSym), 'text/plain');
          toast('Relatório baixado 💛');
        };
        root.querySelector('[data-export2]')?.addEventListener('click', doExport);
        document.querySelector('#appbar [data-action="export"]')?.addEventListener('click', doExport);
      },
    };
  },
};

const stat = (k, v, m) => `<div class="stat"><div class="k">${esc(k)}</div><div class="v">${esc(v)}</div><div class="m">${esc(m)}</div></div>`;

function buildReport(state, info, cycles, periods, topSym) {
  const L = [];
  L.push('FLORESCER — RELATÓRIO DE CICLO');
  L.push(`Gerado em ${fmtLong(today())}`);
  L.push(`Usuária: ${state.profile.name || '—'}`);
  L.push('');
  L.push('RESUMO');
  L.push(`Ciclo médio: ${info.avgLength || '—'} dias`);
  L.push(`Duração da menstruação: ${median(periods.map((p) => p.length)) || '—'} dias`);
  L.push(`Ciclos completos registrados: ${cycles.length}`);
  if (info.known) {
    L.push(`Dia do ciclo hoje: ${info.dayOfCycle}`);
    L.push(`Ovulação estimada: ${fmtShort(info.ovulation)}`);
    L.push(`Próxima menstruação prevista: ${fmtShort(info.nextPeriod)}`);
  }
  L.push('');
  L.push('CICLOS');
  cycles.forEach((c) => L.push(`  Início ${fmtShort(fromKey(c.start))} — duração ${c.length} dias`));
  L.push('');
  L.push('MENSTRUAÇÕES REGISTRADAS');
  periods.forEach((p) => L.push(`  ${fmtShort(fromKey(p.start))} a ${fmtShort(fromKey(p.end))} (${p.length} dias)`));
  L.push('');
  L.push('SINTOMAS MAIS FREQUENTES');
  topSym.forEach(([s, n]) => L.push(`  ${s}: ${n} dias`));
  L.push('');
  L.push('TEMPERATURA BASAL (últimos registros)');
  Object.entries(state.logs)
    .filter(([, l]) => l.temperature)
    .slice(-40)
    .forEach(([k, l]) => L.push(`  ${fmtShort(fromKey(k))}: ${l.temperature} °C`));
  L.push('');
  L.push('Documento gerado pelo app Florescer a partir dos registros da própria usuária.');
  L.push('Não constitui diagnóstico nem laudo médico.');
  return L.join('\n');
}
