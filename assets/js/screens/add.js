import { getState, update, addJourney, saveIntercourse } from '../store.js';
import { recordPregnancyTest, PREGNANCY_TEST_RESULTS } from '../pregnancyTest.js';
import { icon } from '../icons.js';
import { esc, toast, haptic, confirmSheet } from '../ui.js';
import { navigate } from '../router.js';
import { today, toKey, fromKey, fmtFull, diffDays } from '../cycle.js';
import { babyNamesFromProfile, formatBabyNames } from '../babies.js';
import { registerBirth } from '../postpartum.js';
import { notifyAchievements } from '../notify.js';

const resultOptions = [
  ['positivo', 'Positivo', 'O teste indicou gravidez.'],
  ['negativo', 'Negativo', 'O teste não indicou gravidez.'],
  ['inconclusivo', 'Inconclusivo', 'O resultado não ficou claro.'],
];

export default {
  id: 'adicionar',
  tab: null,
  render() {
    const state = getState();
    const pregnant = state.profile.phase === 'gravida';
    const postpartum = state.profile.phase === 'posparto';
    const names = babyNamesFromProfile(state.profile);
    const multiple = state.profile.pregnancyType === 'gemelar' || names.length > 1;
    const babies = names.length ? formatBabyNames(names) : multiple ? 'seus bebês' : 'seu bebê';

    return {
      appbar: { title: 'Adicionar' },
      html: `<div class="section pb-24 stagger">
        <div class="section__head" style="padding:0"><h2>O que você deseja adicionar?</h2></div>
        <div class="card card--flush">
          <div class="itemlist">
            ${pregnant ? `<button class="item" data-nav="registro">
              <span class="item__ico">${icon('note', 20)}</span>
              <span class="item__body"><b>Adicionar um Registro</b><span>Guarde seu humor, emoções e memórias da gestação.</span></span>
              <span class="item__end">${icon('chevron', 17)}</span>
            </button>
            <button class="item" data-nav="registro?s=sintomas">
              <span class="item__ico">${icon('thermometer', 20)}</span>
              <span class="item__body"><b>Adicionar um Sintoma</b><span>Registre sintomas, pressão, peso ou glicemia.</span></span>
              <span class="item__end">${icon('chevron', 17)}</span>
            </button>
            <button class="item" data-register-birth>
              <span class="item__ico">${icon('baby', 20)}</span>
              <span class="item__body"><b>Registrar Nascimento</b><span>Inicie o Florescer Baby após o nascimento.</span></span>
              <span class="item__end">${icon('chevron', 17)}</span>
            </button>` : postpartum ? `<button class="item" data-nav="status-bebe">
              <span class="item__ico">${icon('baby', 20)}</span>
              <span class="item__body"><b>Registrar Status do Bebê</b><span>Peso, altura, próxima vacina e consulta.</span></span>
              <span class="item__end">${icon('chevron', 17)}</span>
            </button>
            <button class="item" data-nav="amamentacao">
              <span class="item__ico">${icon('heart', 20)}</span>
              <span class="item__body"><b>Registrar Amamentação</b><span>Cronômetro, lado, extração e estoque de leite.</span></span>
              <span class="item__end">${icon('chevron', 17)}</span>
            </button>
            <button class="item" data-nav="fraldas">
              <span class="item__ico">${icon('drop', 20)}</span>
              <span class="item__body"><b>Registrar Fralda</b><span>Urina, fezes e frequência diária.</span></span>
              <span class="item__end">${icon('chevron', 17)}</span>
            </button>
            <button class="item" data-nav="saude-bebe">
              <span class="item__ico">${icon('shield', 20)}</span>
              <span class="item__body"><b>Registro de Saúde</b><span>Sintomas, medicamentos, alergias, internações, consultas e exames.</span></span>
              <span class="item__end">${icon('chevron', 17)}</span>
            </button>
            <button class="item" data-nav="registro">
              <span class="item__ico">${icon('note', 20)}</span>
              <span class="item__body"><b>Diário da Mamãe</b><span>Emoções, conquistas, gratidão e observações.</span></span>
              <span class="item__end">${icon('chevron', 17)}</span>
            </button>` : `<button class="item" data-nav="teste-gravidez">
              <span class="item__ico">${icon('test', 20)}</span>
              <span class="item__body"><b>Adicionar um Teste</b><span>Inclua o resultado do seu teste de gravidez.</span></span>
              <span class="item__end">${icon('chevron', 17)}</span>
            </button>
            <button class="item" data-nav="relacao">
              <span class="item__ico">${icon('heartFill', 20)}</span>
              <span class="item__body"><b>Registrar Relação</b><span>Marque no calendário sem preencher o registro completo.</span></span>
              <span class="item__end">${icon('chevron', 17)}</span>
            </button>
            <button class="item" data-nav="registro">
              <span class="item__ico">${icon('note', 20)}</span>
              <span class="item__body"><b>Fazer um Registro</b><span>Anote seu ciclo, sintomas e como foi o seu dia.</span></span>
              <span class="item__end">${icon('chevron', 17)}</span>
            </button>`}
            <button class="item" data-nav="sono">
              <span class="item__ico">${icon('moon', 20)}</span>
              <span class="item__body"><b>Registrar Sono</b><span>Sono noturno, cochilos, total de horas e dicas.</span></span>
              <span class="item__end">${icon('chevron', 17)}</span>
            </button>
          </div>
        </div>
      </div>`,
      mount(root) {
        root.querySelector('[data-register-birth]')?.addEventListener('click', async () => {
          const confirmed = await confirmSheet({
            title: multiple ? 'Registrar o nascimento dos seus bebês?' : 'Registrar o nascimento do seu bebê?',
            message: `Vamos registrar hoje como a data de nascimento de ${babies}. Ao confirmar, o aplicativo mudará para o Florescer Baby.`,
            confirmLabel: 'Registrar nascimento',
          });
          if (!confirmed) return;
          update((current) => registerBirth(current, toKey(today())));
          addJourney('baby', multiple ? 'Meus bebês nasceram' : 'Meu bebê nasceu', 'início do Florescer Baby');
          haptic(14);
          toast('Nascimento registrado. Bem-vinda ao Florescer Baby!');
          navigate('boas-vindas', { replace: true });
        });
      },
    };
  },
};

export const relationshipScreen = {
  id: 'relacao',
  tab: null,
  render() {
    let protectedValue = false;
    return {
      appbar: { title: 'Registrar Relação', sub: 'Acompanhamento do ciclo' },
      html: `<div class="section pb-24 stagger">
        <div class="card diaryintro">
          <span class="floatcard__ico">${icon('heartFill', 22)}</span>
          <div><b>Um registro simples e privado</b><p>A relação aparecerá como um pequeno coração no seu calendário.</p></div>
        </div>
        <div class="field mt-16">
          <label for="relationship-date">Data da relação</label>
          <input id="relationship-date" type="date" value="${toKey(today())}" max="${toKey(today())}">
        </div>
        <div class="card card--flush mt-16">
          <div class="kv">
            <span class="kv__k">Com proteção<small>opcional</small></span>
            <button class="toggle" role="switch" aria-checked="false" data-protected aria-label="Relação com proteção"></button>
          </div>
        </div>
        <div class="note mt-16">${icon('lock', 17)}<span>Este é um dado sensível e permanece somente neste aparelho.</span></div>
        <button class="btn mt-16" data-save-relationship>${icon('heart', 19)} Registrar relação</button>
      </div>`,
      mount(root) {
        const toggle = root.querySelector('[data-protected]');
        toggle.onclick = () => {
          protectedValue = !protectedValue;
          toggle.setAttribute('aria-checked', String(protectedValue));
          haptic();
        };
        root.querySelector('[data-save-relationship]').onclick = () => {
          const date = root.querySelector('#relationship-date').value;
          if (!date) { toast('Informe a data da relação.'); return; }
          if (diffDays(fromKey(date), today()) > 0) { toast('A data não pode estar no futuro.'); return; }
          const result = saveIntercourse(date, { protected: protectedValue });
          notifyAchievements(result.achievements);
          haptic(14);
          toast('Relação registrada no calendário.');
          navigate('ciclo');
        };
      },
    };
  },
};

export const pregnancyTestScreen = {
  id: 'teste-gravidez',
  tab: null,
  render() {
    const tests = (getState().pregnancyTests || []).slice(0, 5);
    let result = null;

    return {
      appbar: { title: 'Teste de gravidez', sub: 'Registre o resultado' },
      html: `<div class="section pb-24 stagger">
        <div class="card diaryintro">
          <span class="floatcard__ico">${icon('test', 22)}</span>
          <div><b>Seu resultado, no seu tempo</b><p>Guarde o resultado aqui para acompanhar cada etapa da sua jornada.</p></div>
        </div>

        <div class="field mt-16">
          <label for="test-date">Data do teste</label>
          <input class="input" id="test-date" type="date" value="${toKey(today())}" max="${toKey(today())}">
        </div>

        <div class="section__head" style="padding:0"><h2>Qual foi o resultado?</h2></div>
        <div class="quiz__opts">
          ${resultOptions.map(([id, label, description]) => `<button class="opt" data-result="${id}" aria-pressed="false">
            <span class="opt__ico">${icon(id === 'positivo' ? 'heart' : id === 'negativo' ? 'close' : 'help', 18)}</span>
            <span class="grow"><b>${label}</b><small style="display:block;color:var(--muted);font-weight:500">${description}</small></span>
            <span class="opt__check">${icon('check', 18)}</span>
          </button>`).join('')}
        </div>

        <div class="note mt-16">${icon('info', 17)}<span>Um resultado positivo mudará automaticamente o aplicativo para o Florescer Gestação. Confirme o resultado e procure acompanhamento pré-natal.</span></div>
        <button class="btn mt-16" data-save disabled>${icon('check', 19)} Salvar resultado</button>

        ${tests.length ? `<div class="section__head" style="padding:0"><h2>Testes recentes</h2></div>
          <div class="card card--flush"><div class="itemlist">${tests.map((test) => `<div class="item">
            <span class="item__ico">${icon('test', 19)}</span>
            <span class="item__body"><b>${esc(PREGNANCY_TEST_RESULTS[test.result] || test.result)}</b><span>${esc(fmtFull(fromKey(test.date)))}</span></span>
          </div>`).join('')}</div></div>` : ''}
      </div>`,
      mount(root) {
        const save = root.querySelector('[data-save]');
        root.querySelectorAll('[data-result]').forEach((button) => {
          button.onclick = () => {
            result = button.dataset.result;
            root.querySelectorAll('[data-result]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
            save.disabled = false;
            haptic();
          };
        });

        save.onclick = () => {
          const date = root.querySelector('#test-date').value;
          if (!date) { toast('Informe a data do teste.'); return; }
          if (diffDays(fromKey(date), today()) > 0) { toast('A data do teste não pode estar no futuro.'); return; }

          try {
            update((state) => recordPregnancyTest(state, { date, result }));
          } catch (err) {
            toast(err.message);
            return;
          }

          haptic(14);
          if (result === 'positivo') {
            addJourney('pregnant', 'Descobri que estou grávida', 'teste de gravidez positivo registrado');
            toast('Resultado salvo. Bem-vinda ao Florescer Gestação!');
            navigate('gestacao-inicio', { replace: true });
          } else {
            toast('Resultado do teste salvo.');
            navigate('home');
          }
        };
      },
    };
  },
};
