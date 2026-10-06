/**
 * Mudanças no corpo da mãe.
 * Reúne, para a fase atual da gestação, os sintomas esperados, as alterações
 * hormonais, o desenvolvimento da barriga e as mudanças emocionais — e deixa
 * navegar pelas fases anteriores para entender o percurso.
 */
import { getState } from '../store.js';
import { pregnancyInfo } from '../cycle.js';
import { pregnancyWeekGuide } from '../pregnancy.js';
import { icon } from '../icons.js';
import { emptyState, esc, note } from '../ui.js';
import { navigate } from '../router.js';

/** Fases que espelham os estágios de MATERNAL_CHANGES em pregnancy.js. */
const STAGES = [
  { until: 6, label: 'Até a 6ª semana', short: '4–6' },
  { until: 10, label: 'Da 7ª à 10ª semana', short: '7–10' },
  { until: 13, label: 'Da 11ª à 13ª semana', short: '11–13' },
  { until: 17, label: 'Da 14ª à 17ª semana', short: '14–17' },
  { until: 22, label: 'Da 18ª à 22ª semana', short: '18–22' },
  { until: 27, label: 'Da 23ª à 27ª semana', short: '23–27' },
  { until: 32, label: 'Da 28ª à 32ª semana', short: '28–32' },
  { until: 36, label: 'Da 33ª à 36ª semana', short: '33–36' },
  { until: 40, label: 'Da 37ª semana ao parto', short: '37–40' },
];

const BLOCKS = [
  { key: 'symptoms', label: 'Sintomas esperados', icon: 'thermometer', tone: 'symptoms' },
  { key: 'hormones', label: 'Alterações hormonais', icon: 'sparkle', tone: 'hormones' },
  { key: 'belly', label: 'Desenvolvimento da barriga', icon: 'pregnant', tone: 'belly' },
  { key: 'emotional', label: 'Alterações emocionais', icon: 'heart', tone: 'emotional' },
];

const stageIndexForWeek = (week) => {
  const index = STAGES.findIndex((stage) => week <= stage.until);
  return index === -1 ? STAGES.length - 1 : index;
};

export default {
  id: 'corpo-da-mae',
  tab: null,
  render(route = {}) {
    const state = getState();
    const preg = pregnancyInfo(state);

    if (state.profile.phase !== 'gravida' || !preg.known) {
      return {
        appbar: { title: 'Mudanças no corpo' },
        html: emptyState('pregnant', 'Acompanhamento indisponível', 'Informe os dados da gestação para ver o que muda no seu corpo a cada fase.', { label: 'Completar perfil', to: 'perfil' }),
      };
    }

    const currentWeek = Math.max(4, Math.min(40, preg.weeks));
    const currentIndex = stageIndexForWeek(currentWeek);
    const asked = Number.parseInt(route.params?.fase, 10);
    const index = Number.isInteger(asked) ? Math.max(0, Math.min(currentIndex, asked)) : currentIndex;
    const stage = STAGES[index];
    const isNow = index === currentIndex;

    // usa a última semana da fase (limitada à semana atual) para buscar o conteúdo
    const guide = pregnancyWeekGuide(Math.min(stage.until, currentWeek));

    return {
      appbar: {
        title: 'Mudanças no corpo',
        sub: isNow ? `${currentWeek}ª semana · fase atual` : stage.label,
        actions: [{ icon: 'book', label: 'Semana a Semana', to: 'semana-a-semana' }],
      },
      html: `<div class="section pb-24 stagger">
        <header class="bodyhero">
          <span class="bodyhero__ico">${icon('pregnant', 22)}</span>
          <div class="grow">
            <span class="eyebrow">${isNow ? 'Seu corpo agora' : 'Fase anterior'}</span>
            <b>${esc(stage.label)}</b>
            <p>O que costuma acontecer com a maioria das gestantes nesta fase.</p>
          </div>
        </header>

        <div class="chiprow bodyphases" role="tablist" aria-label="Fases da gestação">
          ${STAGES.slice(0, currentIndex + 1).map((item, i) => `
            <button class="chip" role="tab" aria-selected="${i === index}" data-fase="${i}">
              ${esc(item.short)}${i === currentIndex ? ' · agora' : ''}
            </button>`).join('')}
        </div>

        <div class="bodyblocks">
          ${BLOCKS.map((block) => `
            <article class="bodyblock bodyblock--${block.tone}">
              <div>
                <b>${esc(block.label)}</b>
                <p>${esc(guide[block.key] || '')}</p>
              </div>
            </article>`).join('')}
        </div>

        <div class="card card--tint mt-16">
          <b style="display:block;font-size:var(--fs-14)">Quando procurar ajuda</b>
          <p class="fs-13 muted mt-8" style="line-height:1.6">
            Procure avaliação se tiver sangramento, perda de líquido, dor forte, febre, desmaio,
            falta de ar intensa, dor de cabeça forte com alteração visual, inchaço súbito ou
            redução dos movimentos do bebê.
          </p>
          <p class="fs-13 muted mt-8" style="line-height:1.6">
            Tristeza persistente, angústia que não passa, perda de interesse por tudo ou
            pensamentos de se machucar também pedem ajuda — e têm tratamento na gestação.
            No Brasil, o CVV atende pelo 188, 24 horas.
          </p>
        </div>

        ${note('Cada gestação é diferente: você pode sentir tudo isso, parte disso ou quase nada. A ausência de um sintoma não é sinal de problema.')}
      </div>`,

      mount(root) {
        root.querySelectorAll('[data-fase]').forEach((button) => {
          button.onclick = () => navigate(`corpo-da-mae?fase=${button.dataset.fase}`);
        });
      },
    };
  },
};
