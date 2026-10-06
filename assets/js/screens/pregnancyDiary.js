/**
 * Diário Gestacional — o documento completo da gestação, pronto para virar PDF.
 *
 * Por que impressão e não uma biblioteca de PDF: o Florescer não tem etapa de
 * build e precisa funcionar offline. A impressão do próprio navegador entrega
 * texto selecionável, quebra de página correta, fotos embutidas e a opção
 * "Salvar como PDF" em todos os sistemas — sem baixar 400 KB de biblioteca e
 * sem rasterizar o texto. E, como tudo acontece no aparelho, nenhum dado da
 * gestação precisa sair dele para virar arquivo.
 */
import { getState } from '../store.js';
import { icon } from '../icons.js';
import { esc, emptyState, haptic, toast } from '../ui.js';
import { plural } from '../cycle.js';
import { PREGNANCY_TEST_RESULTS } from '../pregnancyTest.js';
import { formatBabyNames } from '../babies.js';
import { pregnancyDiary } from '../pregnancyDiary.js';

const tags = (items, variant = '') => (items.length
  ? `<ul class="dgtags ${variant}">${items.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>`
  : '');

const block = (title, text) => (text
  ? `<div class="dgtext"><b>${esc(title)}</b><p>${esc(text)}</p></div>`
  : '');

function photos(list, alt) {
  if (!list.length) return '';
  return `<div class="dgphotos">${list.map((src, index) => `<figure>
    <img src="${esc(src)}" alt="${esc(`${alt} ${index + 1}`)}">
  </figure>`).join('')}</div>`;
}

function day(entry) {
  return `<article class="dgday">
    <header class="dgday__head">
      <b>${esc(entry.label)}</b>
      <span>${esc(entry.weekLabel)}</span>
    </header>
    ${entry.mood ? `<p class="dgday__mood"><em>${entry.mood.emoji}</em>${esc(entry.mood.label)}</p>` : ''}
    ${tags(entry.emotions)}
    ${tags(entry.symptoms, 'dgtags--symptom')}
    ${block('Pensamentos', entry.thoughts)}
    ${block('Gratidão', entry.gratitude)}
    ${block('Observações', entry.notes)}
    ${block('Sobre os sintomas', entry.symptomNotes)}
    ${entry.measurements.length ? `<ul class="dgmeasures">${entry.measurements
      .map((item) => `<li><span>${esc(item.label)}</span><b>${esc(item.value)}</b></li>`).join('')}</ul>` : ''}
    ${photos(entry.bumpPhotos, 'Foto da barriga')}
    ${photos(entry.examPhotos, 'Foto de exame')}
  </article>`;
}

function cover(cover) {
  const babies = cover.babyNames.length ? formatBabyNames(cover.babyNames) : null;
  const linhas = [
    ['Última menstruação', cover.lastPeriodLabel],
    ['Data provável do parto', cover.dueLabel],
    ...(cover.birthLabel ? [['Nascimento', cover.birthLabel]] : []),
  ];

  return `<section class="dgcover">
    <span class="dgcover__mark">${icon('flower', 34)}</span>
    <p class="dgcover__kicker">Diário da gestação</p>
    ${cover.name ? `<h1>${esc(cover.name)}</h1>` : '<h1>Minha gestação</h1>'}
    ${babies ? `<p class="dgcover__babies">à espera de ${esc(babies)}</p>` : ''}
    ${cover.ultrasoundPhoto ? `<figure class="dgcover__photo"><img src="${esc(cover.ultrasoundPhoto)}" alt="Ultrassonografia"></figure>` : ''}
    <dl class="dgcover__facts">
      ${linhas.map(([label, value]) => `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('')}
    </dl>
    <p class="dgcover__stamp">Gerado em ${esc(cover.generatedLabel)} pelo Florescer</p>
  </section>`;
}

function summary(data) {
  const s = data.summary;
  const unit = (count, one, many) => (count === 1 ? one : many);
  const br = (value) => String(value).replace('.', ',');
  const numeros = [
    [s.entries, unit(s.entries, 'registro', 'registros')],
    [s.weeksWithEntries, unit(s.weeksWithEntries, 'semana acompanhada', 'semanas acompanhadas')],
    ...(s.photos ? [[s.photos, unit(s.photos, 'foto da barriga', 'fotos da barriga')]] : []),
    ...(s.exams ? [[s.exams, unit(s.exams, 'foto de exame', 'fotos de exame')]] : []),
    ...(s.appointments ? [[s.appointments, unit(s.appointments, 'compromisso', 'compromissos')]] : []),
  ];

  return `<section class="dgsection">
    <h2>A sua gestação em números</h2>
    <div class="dgstats">
      ${numeros.map(([value, label]) => `<div class="dgstat">
        <b>${esc(String(value))}</b><span>${esc(label)}</span>
      </div>`).join('')}
    </div>
    ${s.firstEntry ? `<p class="dgnote">Do primeiro registro em ${esc(s.firstEntry)} ao último em ${esc(s.lastEntry)}.</p>` : ''}
    ${s.weightGain !== null ? `<p class="dgnote">Peso registrado: de ${esc(br(s.weightStart))} kg a ${esc(br(s.weightEnd))} kg${s.weightGain > 0 ? ` (${esc(br(s.weightGain))} kg a mais)` : ''}.</p>` : ''}
    ${s.topEmotions.length ? `<div class="dgtext"><b>Emoções mais registradas</b>${tags(s.topEmotions.map((item) => `${item.label} (${item.count})`))}</div>` : ''}
    ${s.topSymptoms.length ? `<div class="dgtext"><b>Sintomas mais registrados</b>${tags(s.topSymptoms.map((item) => `${item.label} (${item.count})`), 'dgtags--symptom')}</div>` : ''}
  </section>`;
}

function journey(items) {
  if (!items.length) return '';
  return `<section class="dgsection">
    <h2>Marcos desta jornada</h2>
    <ul class="dglist">
      ${items.map((item) => `<li><b>${esc(item.title)}</b><span>${esc(item.label)}${item.note ? ` · ${esc(item.note)}` : ''}</span></li>`).join('')}
    </ul>
  </section>`;
}

function weeks(list) {
  if (!list.length) return '';
  return `<section class="dgsection dgsection--weeks">
    <h2>Semana a semana</h2>
    ${list.map((week) => `<section class="dgweek">
      <header class="dgweek__head">
        <b>${esc(week.title)}</b>
        <span>${esc(week.trimesterLabel)} · ${esc(week.range)}</span>
      </header>
      ${week.days.map(day).join('')}
    </section>`).join('')}
  </section>`;
}

function events(list, tests) {
  if (!list.length && !tests.length) return '';
  return `<section class="dgsection">
    <h2>Consultas, exames e testes</h2>
    <ul class="dglist">
      ${tests.map((test) => `<li>
        <b>Teste de gravidez — ${esc(PREGNANCY_TEST_RESULTS[test.result] || test.result)}</b>
        <span>${esc(test.label)}</span>
      </li>`).join('')}
      ${list.map((event) => `<li>
        <b>${esc(event.title)}</b>
        <span>${esc(event.label)} · ${esc(event.type)}${event.person ? ` · ${esc(event.person)}` : ''}</span>
      </li>`).join('')}
    </ul>
  </section>`;
}

export default {
  id: 'diario-gestacional',
  tab: null,
  render() {
    const state = getState();
    const data = pregnancyDiary(state);

    if (!data.available) {
      const vazio = data.reason === 'sem_datas'
        ? emptyState('pregnant', 'Faltam as datas da gestação',
          'Informe a data da última menstruação ou a data provável do parto para montarmos o seu diário.',
          { label: 'Abrir os dados da gestação', to: 'perfil' })
        : emptyState('note', 'Ainda não há registros para reunir',
          'Assim que você guardar emoções, pensamentos, fotos ou sintomas no Diário da Mamãe, eles aparecem aqui.',
          { label: 'Fazer um registro', to: 'registro' });
      return { appbar: { title: 'Diário Gestacional' }, html: `<div class="section pb-24">${vazio}</div>` };
    }

    return {
      appbar: {
        title: 'Diário Gestacional',
        sub: `${plural(data.summary.entries, 'registro', 'registros')} reunidos`,
      },
      html: `<div class="section pb-24">
        <div class="dgbar no-print">
          <div class="dgbar__text">
            <b>Tudo o que você registrou, em um documento só</b>
            <p>Ao tocar no botão, o seu aparelho abre a janela de impressão. Escolha <b>Salvar como PDF</b> para guardar o arquivo — ou imprima, se quiser em papel.</p>
          </div>
          <button class="btn" data-print>${icon('download', 19)} Gerar o PDF</button>
          <p class="dgbar__note">${icon('lock', 15)}<span>O arquivo é montado neste aparelho. Nada do seu diário é enviado para a internet.</span></p>
        </div>

        <article class="dgdoc">
          ${cover(data.cover)}
          ${summary(data)}
          ${journey(data.journey)}
          ${weeks(data.weeks)}
          ${events(data.events, data.tests)}
          <p class="dgfoot">Diário gerado pelo Florescer a partir dos seus próprios registros. É um registro afetivo e de acompanhamento: não substitui o cartão de pré-natal nem o prontuário médico.</p>
        </article>
      </div>`,

      mount(root) {
        root.querySelector('[data-print]').onclick = () => {
          haptic(14);
          // as fotos vêm de data URLs já carregadas; o quadro seguinte garante
          // que o layout de impressão esteja aplicado antes de abrir a janela
          toast('Abrindo a janela de impressão…');
          requestAnimationFrame(() => setTimeout(() => window.print(), 120));
        };
      },
    };
  },
};
