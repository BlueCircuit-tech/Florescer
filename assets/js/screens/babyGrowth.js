import { getState } from '../store.js';
import { babyNamesFromProfile } from '../babies.js';
import { babyGrowthSeries } from '../babyStatus.js';
import { icon } from '../icons.js';
import { emptyState, esc, lineChart } from '../ui.js';
import { navigate } from '../router.js';
import { fmtShort, fromKey, plural } from '../cycle.js';

const METRICS = [
  { field: 'weight', title: 'Peso', unit: ' kg', decimals: 2, icon: 'chart' },
  { field: 'height', title: 'Altura', unit: ' cm', decimals: 1, icon: 'baby' },
  { field: 'headCircumference', title: 'Perímetro cefálico', unit: ' cm', decimals: 1, icon: 'baby' },
];

export default {
  id: 'crescimento-bebe',
  tab: null,
  render(route = { params: {} }) {
    const state = getState();
    const names = babyNamesFromProfile(state.profile);
    const selected = names.includes(route.params.b) ? route.params.b : names[0] || 'Bebê';
    const series = babyGrowthSeries(state, selected);

    return {
      appbar: { title: 'Crescimento', sub: selected },
      html: `<div class="section pb-24 stagger">
        ${names.length > 1 ? `<div class="field"><label for="growth-baby">Qual bebê?</label><select id="growth-baby">
          ${names.map((name) => `<option value="${esc(name)}" ${name === selected ? 'selected' : ''}>${esc(name)}</option>`).join('')}
        </select></div>` : ''}

        <div class="card diaryintro">
          <span class="floatcard__ico">${icon('chart', 22)}</span>
          <div><b>A evolução de ${esc(selected)}</b><p>Peso, altura e perímetro cefálico reunidos em uma linha do tempo.</p></div>
        </div>

        ${series.length ? METRICS.map((metric) => growthCard(series, metric)).join('') : emptyState(
          'chart', 'Ainda não há medidas registradas', 'Registre peso, altura ou perímetro cefálico para começar a acompanhar a evolução.',
          { label: 'Registrar medidas', to: 'status-bebe' },
        )}

        ${series.length ? `<div class="card card--flush"><div class="kv"><span class="kv__k">Histórico utilizado</span><span class="kv__v">${plural(series.length, 'registro', 'registros')}</span></div>
          <div class="kv"><span class="kv__k">Primeira medição</span><span class="kv__v">${fmtShort(fromKey(series[0].date))}</span></div>
          <div class="kv"><span class="kv__k">Última medição</span><span class="kv__v">${fmtShort(fromKey(series.at(-1).date))}</span></div></div>` : ''}
        <div class="note mt-16">${icon('info', 17)}<span>Os gráficos mostram somente a evolução das medidas registradas. A avaliação de curvas de crescimento e percentis deve ser realizada pelo pediatra.</span></div>
      </div>`,
      mount(root) {
        root.querySelector('#growth-baby')?.addEventListener('change', (event) => {
          navigate(`crescimento-bebe?b=${encodeURIComponent(event.target.value)}`, { replace: true });
        });
      },
    };
  },
};

function growthCard(series, metric) {
  const measured = series.filter((entry) => entry[metric.field] != null);
  const first = measured[0];
  const latest = measured.at(-1);
  if (!latest) return `<section class="card growthcard"><div class="growthcard__head"><span>${icon(metric.icon, 19)}</span><div><b>${metric.title}</b><small>Nenhuma medição</small></div></div><p class="fs-12 muted mt-12">Inclua esta medida no próximo registro do bebê.</p></section>`;
  const values = series.map((entry) => ({ label: fmtShort(fromKey(entry.date)), value: entry[metric.field] }));
  const difference = latest[metric.field] - first[metric.field];
  const chart = lineChart(values, {
    width: 320,
    height: 130,
    unit: metric.unit,
    ariaLabel: `Evolução de ${metric.title.toLowerCase()}`,
    preserveAspectRatio: 'xMidYMid meet',
  });
  return `<section class="card growthcard">
    <div class="growthcard__head"><span>${icon(metric.icon, 19)}</span><div><b>${metric.title}</b><small>${plural(measured.length, 'medição', 'medições')}</small></div>
      <strong>${formatValue(latest[metric.field], metric.decimals)}${metric.unit}</strong></div>
    ${chart || '<p class="fs-12 muted mt-16">Registre mais uma medição para formar a curva de evolução.</p>'}
    <div class="growthcard__foot"><span>${fmtShort(fromKey(first.date))}</span><b>${measured.length > 1 ? `${difference >= 0 ? '+' : ''}${formatValue(difference, metric.decimals)}${metric.unit}` : 'primeira medida'}</b><span>${fmtShort(fromKey(latest.date))}</span></div>
  </section>`;
}

function formatValue(value, decimals) {
  return Number(value.toFixed(decimals)).toLocaleString('pt-BR', { maximumFractionDigits: decimals });
}
