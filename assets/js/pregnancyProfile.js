import { icon } from './icons.js';
import { toast } from './ui.js';
import { addDays, diffDays, fromKey, today, toKey } from './cycle.js';
import { compressPhoto } from './media.js';
import { applyBabyNames, babyNamesEditor, babyNamesFromProfile, bindBabyNamesEditor } from './babies.js';

const safeUltrasound = (photo) => typeof photo === 'string' && photo.startsWith('data:image/jpeg;base64,') ? photo : null;

export function pregnancyDraft(profile = {}) {
  const lastPeriodStart = profile.lastPeriodStart || (profile.dueDate ? toKey(addDays(fromKey(profile.dueDate), -280)) : null);
  const dueDate = profile.dueDate || (profile.lastPeriodStart ? toKey(addDays(fromKey(profile.lastPeriodStart), 280)) : null);
  return {
    lastPeriodStart,
    dueDate,
    pregnancyType: profile.pregnancyType || null,
    babyNames: babyNamesFromProfile(profile),
    ultrasoundPhoto: safeUltrasound(profile.ultrasoundPhoto),
  };
}

export function applyPregnancyProfile(profile, draft) {
  profile.lastPeriodStart = draft.lastPeriodStart || null;
  profile.dueDate = draft.dueDate || null;
  profile.pregnancyType = draft.pregnancyType;
  applyBabyNames(profile, draft.babyNames, { multiple: draft.pregnancyType === 'gemelar' });
  profile.ultrasoundPhoto = safeUltrasound(draft.ultrasoundPhoto);
  return profile;
}

export function pregnancyQuizSteps(draft) {
  return [
    {
      key: 'due',
      title: 'Vamos calcular o tempo da gestação',
      sub: 'Informe a DUM ou a DPP. Ao preencher uma delas, calculamos a outra automaticamente.',
      render: () => `<div class="quiz__opts">
        <div class="field">
          <label for="q-lmp2">Primeiro dia da última menstruação (DUM)</label>
          <input id="q-lmp2" type="date" value="${draft.lastPeriodStart || ''}" max="${toKey(today())}" min="${toKey(addDays(today(), -300))}">
        </div>
        <div class="field">
          <label for="q-due">Data provável do parto (DPP)</label>
          <input id="q-due" type="date" value="${draft.dueDate || ''}" min="${toKey(addDays(today(), -30))}" max="${toKey(addDays(today(), 290))}">
        </div>
        <p class="field__hint">A estimativa usa 280 dias a partir da DUM. Sua equipe de saúde poderá ajustar a DPP após a ultrassonografia.</p>
      </div>`,
      mount: (root) => {
        const due = root.querySelector('#q-due');
        const lmp = root.querySelector('#q-lmp2');
        due.onchange = () => {
          draft.dueDate = due.value || null;
          draft.lastPeriodStart = due.value ? toKey(addDays(fromKey(due.value), -280)) : null;
          lmp.value = draft.lastPeriodStart || '';
        };
        lmp.onchange = () => {
          draft.lastPeriodStart = lmp.value || null;
          draft.dueDate = lmp.value ? toKey(addDays(fromKey(lmp.value), 280)) : null;
          due.value = draft.dueDate || '';
        };
      },
      valid: () => {
        if (!draft.lastPeriodStart || !draft.dueDate) return 'Informe a DUM ou a DPP para continuar';
        if (diffDays(fromKey(draft.lastPeriodStart), today()) > 0) return 'A última menstruação não pode estar no futuro';
        return true;
      },
    },
    {
      key: 'pregnancyType',
      title: 'Qual é o tipo de gestação?',
      sub: 'Essa informação ajuda a personalizar o acompanhamento da sua gestação.',
      options: [
        ['pregnant', 'Gestação única', 'unica'],
        ['baby', 'Gestação gemelar ou múltipla', 'gemelar'],
      ],
      field: 'pregnancyType',
    },
    {
      key: 'babyNames',
      title: draft.pregnancyType === 'gemelar' ? 'Como podemos chamar seus bebês?' : 'Como podemos chamar o seu bebê?',
      sub: draft.pregnancyType === 'gemelar' ? 'Inclua dois nomes ou adicione mais em caso de trigêmeos, quadrigêmeos ou mais.' : 'O nome é opcional e pode ser alterado depois.',
      render: () => `<div class="quiz__opts">
        ${babyNamesEditor(draft, { minimum: draft.pregnancyType === 'gemelar' ? 2 : 1, allowMore: draft.pregnancyType === 'gemelar' })}
      </div>`,
      mount: (root) => bindBabyNamesEditor(root, draft, { minimum: draft.pregnancyType === 'gemelar' ? 2 : 1, allowMore: draft.pregnancyType === 'gemelar' }),
      valid: () => true,
    },
    {
      key: 'ultrasound',
      title: 'Quer guardar sua última ultrassonografia?',
      sub: 'A foto é opcional, comprimida e armazenada somente neste aparelho.',
      render: () => `<div class="quiz__opts">
        <div class="diaryupload">
          <div><b>Última ultrassonografia</b><span>Imagem JPEG de até 12 MB.</span></div>
          <label class="btn btn--soft btn--sm btn--auto" for="q-ultrasound">${icon('upload', 17)} Escolher foto</label>
          <input class="sr-only" id="q-ultrasound" type="file" accept="image/*">
          <div class="diaryphotos" data-ultrasound-preview style="grid-column:1/-1">${ultrasoundPreview(draft.ultrasoundPhoto)}</div>
        </div>
        <p class="field__hint">Você também poderá guardar outros exames no Diário da Mamãe.</p>
      </div>`,
      mount: (root) => bindUltrasound(root, draft),
      valid: () => true,
    },
  ];
}

function ultrasoundPreview(photo) {
  return photo ? `<figure class="diaryphoto"><img src="${photo}" alt="Última ultrassonografia"><button type="button" data-remove-ultrasound aria-label="Remover foto">${icon('close', 16)}</button></figure>` : '';
}

function bindUltrasound(root, draft) {
  const input = root.querySelector('#q-ultrasound');
  const preview = root.querySelector('[data-ultrasound-preview]');
  const paint = () => {
    preview.innerHTML = ultrasoundPreview(draft.ultrasoundPhoto);
    preview.querySelector('[data-remove-ultrasound]')?.addEventListener('click', () => {
      draft.ultrasoundPhoto = null;
      paint();
    });
  };
  input.onchange = async () => {
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    try {
      draft.ultrasoundPhoto = await compressPhoto(file);
      paint();
      toast('Ultrassonografia adicionada.');
    } catch (err) {
      toast(err.message || 'Não foi possível adicionar a foto.');
    }
  };
  paint();
}
