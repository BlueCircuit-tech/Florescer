/**
 * Registro diário — diário da tentante.
 * Aceita ?d=YYYY-MM-DD para editar qualquer data; sem parâmetro, edita hoje.
 */
import { getState, getLog, saveLog, update, addJourney } from '../store.js';
import { icon } from '../icons.js';
import { esc, toast, haptic, confirmSheet } from '../ui.js';
import { navigate, back } from '../router.js';
import { toKey, today, fromKey, fmtFull, relativeDay, streak, cycleInfo, diffDays, plural } from '../cycle.js';
import { validateSymptomMeasurements } from '../pregnancy.js';
import { compressPhoto } from '../media.js';
import { notifyAchievements } from '../notify.js';
import { MOODS, SYMPTOMS, CONTROL_SYMPTOMS, PREGNANCY_EMOTIONS, FLOWS, MUCUS, OV_TESTS } from '../content.js';

const MAX_PHOTOS_PER_KIND = 2;
// ponytail: fotos ficam comprimidas no localStorage; ao virar uma galeria longa, migrar os blobs para IndexedDB.
const safePhotos = (photos) => (photos || []).filter((src) => typeof src === 'string' && src.startsWith('data:image/jpeg;base64,'));

function photoGrid(photos, kind) {
  return safePhotos(photos).map((src, i) => `
    <figure class="diaryphoto">
      <img src="${src}" alt="${kind === 'bumpPhotos' ? 'Foto da barriga' : 'Foto de exame'} ${i + 1}">
      <button type="button" data-remove-photo="${kind}:${i}" aria-label="Remover foto">${icon('close', 16)}</button>
    </figure>`).join('');
}

function symptomControlFields(draft, standalone = false) {
  return `
    <section id="symptom-control" aria-label="Controle de Sintomas">
      ${standalone ? `<div class="card diaryintro">
        <span class="floatcard__ico">${icon('thermometer', 22)}</span>
        <div><b>Acompanhe como você está</b><p>Registre sintomas e medições para consultar depois ou mostrar à sua equipe de saúde.</p></div>
      </div>` : ''}
      <div class="section__head" style="padding:0"><h2>Sintomas</h2></div>
      <div class="chipwrap">
        ${CONTROL_SYMPTOMS.map((symptom) => `<button class="chip" data-sym="${esc(symptom)}" aria-pressed="${draft.symptoms.includes(symptom)}">${esc(symptom)}</button>`).join('')}
      </div>

      <div class="section__head" style="padding:0"><h2>Medições</h2></div>
      <div class="card card--flush">
        <div class="kv">
          <span class="kv__k">Pressão arterial<small>sistólica / diastólica, em mmHg</small></span>
          <span class="measurementpair">
            <input class="input input--inline" id="l-systolic" type="number" inputmode="numeric" min="60" max="250" value="${draft.systolicPressure ?? ''}" aria-label="Pressão sistólica" placeholder="120">
            <span>/</span>
            <input class="input input--inline" id="l-diastolic" type="number" inputmode="numeric" min="40" max="150" value="${draft.diastolicPressure ?? ''}" aria-label="Pressão diastólica" placeholder="80">
          </span>
        </div>
        <div class="kv">
          <span class="kv__k">Peso<small>em quilogramas</small></span>
          <span class="measurement"><input class="input input--inline" id="l-weight" inputmode="decimal" value="${draft.weight ?? ''}" aria-label="Peso" placeholder="68,5"><b>kg</b></span>
        </div>
        <div class="kv">
          <span class="kv__k">Glicemia<small>registre quando houver orientação</small></span>
          <span class="measurement"><input class="input input--inline" id="l-glucose" type="number" inputmode="numeric" min="20" max="600" value="${draft.glucose ?? ''}" aria-label="Glicemia" placeholder="92"><b>mg/dL</b></span>
        </div>
      </div>
      <div class="field mt-16">
        <label for="l-symptom-notes">Observações dos sintomas</label>
        <textarea id="l-symptom-notes" rows="3" maxlength="1000" placeholder="Intensidade, horário, duração ou algo que ajudou…">${esc(draft.symptomNotes)}</textarea>
      </div>
      <div class="note mb-16">${icon('info', 17)}<span>Sangramento, dor forte, falta de ar intensa, pressão muito elevada ou vômitos persistentes precisam de avaliação profissional. Em caso de urgência, procure atendimento.</span></div>
    </section>`;
}

function pregnancyDiaryFields(draft) {
  return `
    <div class="card diaryintro">
      <span class="floatcard__ico">${icon('heart', 22)}</span>
      <div><b>Um espaço para guardar esta fase</b><p>Registre o que você sentiu e as memórias que deseja levar com você.</p></div>
    </div>

    <div class="section__head" style="padding:0"><h2>Como está seu humor?</h2></div>
    <div class="moodrow">
      ${MOODS.map((m, i) => `<button class="mood" data-mood="${i}" aria-pressed="${draft.mood === i}"><em>${m.emoji}</em>${m.label}</button>`).join('')}
    </div>

    <div class="section__head" style="padding:0"><h2>Emoções</h2></div>
    <div class="chipwrap">
      ${PREGNANCY_EMOTIONS.map((emotion) => `<button class="chip" data-emotion="${esc(emotion)}" aria-pressed="${draft.emotions.includes(emotion)}">${esc(emotion)}</button>`).join('')}
    </div>

    <div class="section__head" style="padding:0"><h2>Memórias da gestação</h2></div>
    <div class="diaryuploads">
      <div class="diaryupload">
        <div><b>Fotos da barriga</b><span>Acompanhe as mudanças ao longo das semanas.</span></div>
        <label class="btn btn--soft btn--sm btn--auto" for="bump-photo">${icon('plus', 17)} Adicionar</label>
        <input class="sr-only" id="bump-photo" type="file" accept="image/*" capture="environment">
        <div class="diaryphotos" data-photo-grid="bumpPhotos">${photoGrid(draft.bumpPhotos, 'bumpPhotos')}</div>
      </div>
      <div class="diaryupload">
        <div><b>Fotos dos exames</b><span>Guarde ultrassons e outros registros importantes.</span></div>
        <label class="btn btn--soft btn--sm btn--auto" for="exam-photo">${icon('plus', 17)} Adicionar</label>
        <input class="sr-only" id="exam-photo" type="file" accept="image/*">
        <div class="diaryphotos" data-photo-grid="examPhotos">${photoGrid(draft.examPhotos, 'examPhotos')}</div>
      </div>
    </div>

    <div class="field mt-16">
      <label for="l-thoughts">Pensamentos</label>
      <textarea id="l-thoughts" rows="4" maxlength="2000" placeholder="O que passou pelo seu coração hoje?">${esc(draft.thoughts)}</textarea>
    </div>
    <div class="field">
      <label for="l-gratitude">Gratidão do dia</label>
      <textarea id="l-gratitude" rows="3" maxlength="1000" placeholder="Hoje sou grata por…">${esc(draft.gratitude)}</textarea>
    </div>`;
}

export default {
  id: 'registro',
  tab: null,
  render(route) {
    const state = getState();
    const key = route.params.d && /^\d{4}-\d{2}-\d{2}$/.test(route.params.d) ? route.params.d : toKey(today());
    const date = fromKey(key);
    const future = diffDays(date, today()) > 0;
    const draft = getLog(key);
    const pregnant = state.profile.phase === 'gravida';
    const symptomControl = route.params.s === 'sintomas';
    draft.emotions = draft.emotions || [];
    draft.bumpPhotos = safePhotos(draft.bumpPhotos);
    draft.examPhotos = safePhotos(draft.examPhotos);
    const existed = !!state.logs[key];
    const st = streak(state);
    const info = cycleInfo(state);
    const cycleDay = info.known ? diffDays(date, info.cycleStart) + 1 : null;

    const dropIcons = (n) => Array.from({ length: n }, () => icon('drop', 19)).join('');

    return {
      appbar: {
        title: symptomControl ? 'Controle de Sintomas' : pregnant ? 'Diário da Mamãe' : relativeDay(date) === 'hoje' ? 'Meu dia' : fmtFull(date),
        sub: `${fmtFull(date)}${!pregnant && cycleDay && cycleDay > 0 ? ` · dia ${cycleDay} do ciclo` : ''}`,
        actions: existed ? [{ icon: 'trash', label: 'Apagar registro', action: 'del' }] : [],
      },
      html: `<div class="section pb-24 stagger">
        ${future ? `<div class="note mb-16">${icon('info', 17)}<span>Este dia ainda não chegou. Você pode registrar previsões, mas o ideal é anotar no próprio dia.</span></div>` : ''}

        ${!existed && st.current > 0 ? `
          <div class="streak">
            <span class="streak__ico">${icon('sparkle', 20)}</span>
            <div class="grow">
              <b>Sequência de ${plural(st.current, 'dia', 'dias')}!</b>
              <span>Registre hoje para continuar · recorde: ${st.best}</span>
            </div>
          </div>` : ''}

        ${symptomControl ? symptomControlFields(draft, true) : pregnant ? pregnancyDiaryFields(draft) : `
        <div class="section__head" style="padding:0"><h2>Menstruação</h2></div>
        <div class="flowrow">
          <button class="flow" data-flow="" aria-pressed="${!draft.flow}">${icon('close', 19)}<span>Nenhum</span></button>
          ${FLOWS.map((f) => `
            <button class="flow" data-flow="${f.id}" aria-pressed="${draft.flow === f.id}">
              <span class="row" style="gap:1px">${dropIcons(f.drops)}</span><span>${f.label}</span>
            </button>`).join('')}
        </div>

        <div class="section__head" style="padding:0"><h2>Como você está?</h2></div>
        <div class="moodrow">
          ${MOODS.map((m, i) => `
            <button class="mood" data-mood="${i}" aria-pressed="${draft.mood === i}"><em>${m.emoji}</em>${m.label}</button>`).join('')}
        </div>

        <div class="section__head" style="padding:0"><h2>Sintomas</h2></div>
        <div class="chipwrap">
          ${SYMPTOMS.map((s) => `
            <button class="chip" data-sym="${esc(s)}" aria-pressed="${draft.symptoms.includes(s)}">${esc(s)}</button>`).join('')}
        </div>

        <div class="section__head" style="padding:0"><h2>Fertilidade</h2></div>
        <div class="card card--flush">
          <div class="kv">
            <span class="kv__k">Relação hoje<small>marca 💗 no calendário</small></span>
            <button class="toggle" role="switch" aria-checked="${draft.intercourse}" data-t="intercourse" aria-label="Relação hoje"></button>
          </div>
          <div class="kv" data-only-sex hidden>
            <span class="kv__k">Com proteção</span>
            <button class="toggle" role="switch" aria-checked="${draft.protected}" data-t="protected" aria-label="Com proteção"></button>
          </div>
          <div class="kv">
            <span class="kv__k">Temperatura basal<small>ao acordar, antes de levantar</small></span>
            <span class="row" style="gap:6px">
              <input class="input input--inline" id="l-temp" inputmode="decimal" maxlength="5" style="width:76px"
                value="${draft.temperature ?? ''}" placeholder="36,5"><span class="fs-13 muted">°C</span>
            </span>
          </div>
          <div class="kv">
            <span class="kv__k">Muco cervical</span>
            <select class="input input--inline" id="l-mucus" style="width:auto">
              <option value="">Não observei</option>
              ${MUCUS.map((m) => `<option value="${m.id}" ${draft.mucus === m.id ? 'selected' : ''}>${m.label}</option>`).join('')}
            </select>
          </div>
          <div class="kv">
            <span class="kv__k">Teste de ovulação</span>
            <select class="input input--inline" id="l-ov" style="width:auto">
              ${OV_TESTS.map((t) => `<option value="${t.id}" ${(draft.ovTest || 'nao_fiz') === t.id ? 'selected' : ''}>${t.label}</option>`).join('')}
            </select>
          </div>
        </div>
        `}

        ${pregnant || symptomControl ? '' : `<div class="field mt-16">
          <label for="l-notes">Observações</label>
          <textarea id="l-notes" rows="3" maxlength="1000" placeholder="Como foi o seu dia? Escreva com carinho…">${esc(draft.notes)}</textarea>
        </div>`}

        <button class="btn" data-save>${icon('check', 19)} ${symptomControl ? 'Salvar controle de sintomas' : pregnant ? 'Salvar no Diário da Mamãe' : 'Salvar meu dia'}</button>
      </div>`,

      mount(root) {
        const sexRow = root.querySelector('[data-only-sex]');
        const syncSex = () => { if (sexRow) sexRow.hidden = !draft.intercourse; };
        syncSex();

        root.querySelectorAll('[data-flow]').forEach((b) => {
          b.onclick = () => {
            draft.flow = b.dataset.flow || null;
            haptic();
            root.querySelectorAll('[data-flow]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
          };
        });
        root.querySelectorAll('[data-mood]').forEach((b) => {
          b.onclick = () => {
            draft.mood = draft.mood === +b.dataset.mood ? null : +b.dataset.mood;
            haptic();
            root.querySelectorAll('[data-mood]').forEach((x) => x.setAttribute('aria-pressed', String(+x.dataset.mood === draft.mood)));
          };
        });
        root.querySelectorAll('[data-sym]').forEach((b) => {
          b.onclick = () => {
            const s = b.dataset.sym;
            const i = draft.symptoms.indexOf(s);
            if (i >= 0) draft.symptoms.splice(i, 1); else draft.symptoms.push(s);
            b.setAttribute('aria-pressed', String(i < 0));
            haptic();
          };
        });
        root.querySelectorAll('[data-emotion]').forEach((b) => {
          b.onclick = () => {
            const emotion = b.dataset.emotion;
            const i = draft.emotions.indexOf(emotion);
            if (i >= 0) draft.emotions.splice(i, 1); else draft.emotions.push(emotion);
            b.setAttribute('aria-pressed', String(i < 0));
            haptic();
          };
        });
        root.querySelectorAll('[data-t]').forEach((b) => {
          b.onclick = () => {
            const k = b.dataset.t;
            draft[k] = !draft[k];
            b.setAttribute('aria-checked', String(draft[k]));
            if (k === 'intercourse') syncSex();
            haptic();
          };
        });

        const syncPhotoGrid = (kind) => {
          const grid = root.querySelector(`[data-photo-grid="${kind}"]`);
          if (!grid) return;
          grid.innerHTML = photoGrid(draft[kind], kind);
          grid.querySelectorAll('[data-remove-photo]').forEach((button) => {
            button.onclick = () => {
              const index = +button.dataset.removePhoto.split(':')[1];
              draft[kind].splice(index, 1);
              syncPhotoGrid(kind);
              haptic();
            };
          });
        };

        const bindPhotoInput = (id, kind) => {
          syncPhotoGrid(kind);
          const input = root.querySelector(id);
          if (!input) return;
          input.onchange = async () => {
            const file = input.files?.[0];
            input.value = '';
            if (!file) return;
            if (draft[kind].length >= MAX_PHOTOS_PER_KIND) {
              toast('Você pode guardar até 2 fotos de cada tipo por dia.');
              return;
            }
            try {
              draft[kind].push(await compressPhoto(file));
              syncPhotoGrid(kind);
              toast('Foto adicionada. Salve o dia para guardar.');
            } catch (err) {
              toast(err.message || 'Não foi possível adicionar a foto.');
            }
          };
        };
        bindPhotoInput('#bump-photo', 'bumpPhotos');
        bindPhotoInput('#exam-photo', 'examPhotos');

        root.querySelector('[data-save]').onclick = () => {
          if (symptomControl) {
            const measurement = (selector) => {
              const value = root.querySelector(selector)?.value.replace(',', '.').trim();
              return value ? Number(value) : null;
            };
            draft.systolicPressure = measurement('#l-systolic');
            draft.diastolicPressure = measurement('#l-diastolic');
            draft.weight = measurement('#l-weight');
            draft.glucose = measurement('#l-glucose');
            draft.symptomNotes = root.querySelector('#l-symptom-notes').value.trim();
            const error = validateSymptomMeasurements(draft);
            if (error) { toast(error); return; }
          }

          if (pregnant && !symptomControl) {
            draft.thoughts = root.querySelector('#l-thoughts').value.trim();
            draft.gratitude = root.querySelector('#l-gratitude').value.trim();
          } else if (!symptomControl) {
            const t = root.querySelector('#l-temp').value.replace(',', '.').trim();
            const temp = t ? Number(t) : null;
            if (temp !== null && (Number.isNaN(temp) || temp < 34 || temp > 42)) {
              toast('Temperatura fora do intervalo esperado (34–42 °C)');
              return;
            }
            draft.temperature = temp;
            draft.mucus = root.querySelector('#l-mucus').value || null;
            draft.ovTest = root.querySelector('#l-ov').value;
            draft.notes = root.querySelector('#l-notes').value;
          }

          const result = saveLog(key, draft);
          if (!result.saved) { toast('Nada para salvar neste dia ainda.'); return; }
          notifyAchievements(result.achievements);

          const s2 = streak(getState());
          if (s2.current === 7) addJourney('sparkle', 'Sequência de 7 dias de registro', 'constância que melhora as previsões');
          if (draft.flow) addJourney('drop', 'Primeiro fluxo registrado', 'as previsões ficam mais precisas a cada ciclo');
          if (pregnant) addJourney('heart', 'Primeiro registro no Diário da Mamãe', 'memórias da gestação guardadas com carinho');
          if (symptomControl) addJourney('thermometer', 'Primeiro controle de sintomas', 'sintomas e medições registrados');
          haptic(14);
          toast(symptomControl ? 'Controle de sintomas salvo.' : pregnant ? 'Diário da Mamãe salvo com carinho 🌸' : s2.current > 1 ? `Dia salvo! Sequência de ${plural(s2.current, 'dia', 'dias')} 🌸` : 'Dia salvo com carinho 🌸');
          navigate('home');
        };

        document.querySelector('#appbar [data-action="del"]')?.addEventListener('click', async () => {
          const ok = await confirmSheet({ title: 'Apagar este registro?', message: `Tudo que você anotou em ${fmtFull(date)} será removido.`, confirmLabel: 'Apagar', danger: true });
          if (!ok) return;
          update((s) => { delete s.logs[key]; });
          toast('Registro apagado.');
          navigate(pregnant || symptomControl ? 'home' : 'ciclo');
        });
      },
    };
  },
};
