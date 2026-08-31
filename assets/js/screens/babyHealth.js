import { getState, update, addJourney } from '../store.js';
import { babyNamesFromProfile } from '../babies.js';
import { BABY_HEALTH_FIELDS, babyHealthSummary, saveBabyHealthRecord } from '../babyHealth.js';
import { icon } from '../icons.js';
import { esc, haptic, toast } from '../ui.js';
import { navigate } from '../router.js';
import { fmtFull, fromKey, today, toKey } from '../cycle.js';

const FIELD_META = {
  symptoms: ['thermometer', 'Sintomas do bebê', 'Ex.: tosse, febre, resfriado, vômito e quando começaram'],
  medications: ['bottle', 'Medicamentos administrados', 'Nome, dose, horário e orientação recebida'],
  allergies: ['leaf', 'Alergias do bebê', 'Substância, reação observada e orientação médica'],
  hospitalizations: ['baby', 'Internações', 'Motivo, hospital, período e orientações de alta'],
  appointments: ['calendar', 'Consultas', 'Profissional, motivo, avaliação e recomendações'],
  exams: ['note', 'Exames', 'Nome do exame, resultado e observações'],
};

export default {
  id: 'saude-bebe',
  tab: null,
  render() {
    const state = getState();
    const names = babyNamesFromProfile(state.profile);
    const recent = (state.babyHealthRecords || []).slice(0, 3);
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    return {
      appbar: { title: 'Registro de Saúde', sub: 'Histórico de saúde do bebê' },
      html: `<div class="section pb-24 stagger">
        <div class="card diaryintro">
          <span class="floatcard__ico">${icon('shield', 22)}</span>
          <div><b>Informações importantes em um só lugar</b><p>Registre acontecimentos de saúde para consultar quando precisar.</p></div>
        </div>

        ${names.length > 1 ? `<div class="field mt-16"><label for="health-baby">Qual bebê?</label>
          <select id="health-baby">${names.map((name) => `<option value="${esc(name)}">${esc(name)}</option>`).join('')}</select></div>` : ''}
        <div class="healthdate mt-16">
          <div class="field"><label for="health-date">Data do registro</label><input id="health-date" type="date" value="${toKey(today())}" min="${state.profile.birthDate || ''}" max="${toKey(today())}"></div>
          <div class="field"><label for="health-time">Horário</label><input id="health-time" type="time" value="${currentTime}"></div>
        </div>

        <div class="section__head" style="padding:0"><h2>O que deseja registrar?</h2></div>
        ${Object.entries(FIELD_META).map(([field, [fieldIcon, label, placeholder]]) => `<div class="field healthfield">
          <label for="health-${field}">${icon(fieldIcon, 17)} ${label}</label>
          <textarea id="health-${field}" maxlength="1200" placeholder="${placeholder}"></textarea>
        </div>`).join('')}

        <div class="note mt-16">${icon('info', 17)}<span>Este histórico não substitui avaliação médica. Procure atendimento imediatamente diante de sinais de urgência.</span></div>
        <button class="btn mt-16" data-save-health>${icon('check', 19)} Salvar registro de saúde</button>

        ${recent.length ? `<div class="section__head" style="padding:0"><h2>Registros recentes</h2></div><div class="healthhistory">
          ${recent.map((record) => `<article class="card healthrecord">
            <div class="row row--between"><b>${esc(record.babyName)}</b><span class="muted fs-12">${esc(fmtFull(fromKey(record.recordedOn)))}${record.recordedAt ? ` · ${esc(record.recordedAt)}` : ''}</span></div>
            <span class="healthrecord__summary">${babyHealthSummary(record).map(esc).join(' · ')}</span>
            <div class="healthrecord__details">${Object.entries(BABY_HEALTH_FIELDS).filter(([field]) => record[field]).map(([field, label]) => `<p><b>${label}</b><span>${esc(record[field])}</span></p>`).join('')}</div>
          </article>`).join('')}
        </div>` : ''}
      </div>`,
      mount(root) {
        root.querySelector('[data-save-health]').onclick = () => {
          const input = {
            babyName: root.querySelector('#health-baby')?.value || names[0] || 'Bebê',
            recordedOn: root.querySelector('#health-date').value,
            recordedAt: root.querySelector('#health-time').value,
          };
          Object.keys(BABY_HEALTH_FIELDS).forEach((field) => { input[field] = root.querySelector(`#health-${field}`).value; });
          try {
            update((current) => saveBabyHealthRecord(current, input));
          } catch (error) {
            toast(error.message);
            return;
          }
          addJourney('shield', 'Primeiro registro de saúde do bebê', 'um cuidado importante guardado no Florescer Baby');
          haptic(14);
          toast('Registro de saúde salvo.');
          navigate('home');
        };
      },
    };
  },
};
