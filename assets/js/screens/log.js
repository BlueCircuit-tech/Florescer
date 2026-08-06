/**
 * Registro diário — diário da tentante.
 * Aceita ?d=YYYY-MM-DD para editar qualquer data; sem parâmetro, edita hoje.
 */
import { getState, getLog, saveLog, update, addJourney } from '../store.js';
import { icon } from '../icons.js';
import { esc, toast, haptic, confirmSheet } from '../ui.js';
import { navigate, back } from '../router.js';
import { toKey, today, fromKey, fmtFull, relativeDay, streak, cycleInfo, diffDays, plural } from '../cycle.js';
import { MOODS, SYMPTOMS, FLOWS, MUCUS, OV_TESTS } from '../content.js';

export default {
  id: 'registro',
  tab: null,
  render(route) {
    const state = getState();
    const key = route.params.d && /^\d{4}-\d{2}-\d{2}$/.test(route.params.d) ? route.params.d : toKey(today());
    const date = fromKey(key);
    const future = diffDays(date, today()) > 0;
    const draft = getLog(key);
    const existed = !!state.logs[key];
    const st = streak(state);
    const info = cycleInfo(state);
    const cycleDay = info.known ? diffDays(date, info.cycleStart) + 1 : null;

    const dropIcons = (n) => Array.from({ length: n }, () => icon('drop', 19)).join('');

    return {
      appbar: {
        title: relativeDay(date) === 'hoje' ? 'Meu dia' : fmtFull(date),
        sub: `${fmtFull(date)}${cycleDay && cycleDay > 0 ? ` · dia ${cycleDay} do ciclo` : ''}`,
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

        <div class="field mt-16">
          <label for="l-notes">Observações</label>
          <textarea id="l-notes" rows="3" maxlength="1000" placeholder="Como foi o seu dia? Escreva com carinho…">${esc(draft.notes)}</textarea>
        </div>

        <button class="btn" data-save>${icon('check', 19)} Salvar meu dia</button>
      </div>`,

      mount(root) {
        const sexRow = root.querySelector('[data-only-sex]');
        const syncSex = () => { sexRow.hidden = !draft.intercourse; };
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
        root.querySelectorAll('[data-t]').forEach((b) => {
          b.onclick = () => {
            const k = b.dataset.t;
            draft[k] = !draft[k];
            b.setAttribute('aria-checked', String(draft[k]));
            if (k === 'intercourse') syncSex();
            haptic();
          };
        });

        root.querySelector('[data-save]').onclick = () => {
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

          const saved = saveLog(key, draft);
          if (!saved) { toast('Nada para salvar neste dia ainda.'); return; }

          const s2 = streak(getState());
          if (s2.current === 7) addJourney('sparkle', 'Sequência de 7 dias de registro', 'constância que melhora as previsões');
          if (draft.flow) addJourney('drop', 'Primeiro fluxo registrado', 'as previsões ficam mais precisas a cada ciclo');
          haptic(14);
          toast(s2.current > 1 ? `Dia salvo! Sequência de ${plural(s2.current, 'dia', 'dias')} 🌸` : 'Dia salvo com carinho 🌸');
          navigate('home');
        };

        document.querySelector('#appbar [data-action="del"]')?.addEventListener('click', async () => {
          const ok = await confirmSheet({ title: 'Apagar este registro?', message: `Tudo que você anotou em ${fmtFull(date)} será removido.`, confirmLabel: 'Apagar', danger: true });
          if (!ok) return;
          update((s) => { delete s.logs[key]; });
          toast('Registro apagado.');
          navigate('ciclo');
        });
      },
    };
  },
};
