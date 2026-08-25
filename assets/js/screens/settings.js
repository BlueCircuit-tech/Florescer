/**
 * Configurações, lembretes, privacidade (LGPD), ajuda e sobre.
 */
import { getState, update, applyTheme, exportData, importData, resetAll } from '../store.js';
import { icon, markSvg } from '../icons.js';
import { esc, toast, note, confirmSheet, openSheet, closeSheet, downloadFile, toggleRow, haptic } from '../ui.js';
import { navigate } from '../router.js';
import { cycleInfo, isFertileReminderEligible, fmtShort, fmtLong, fmtFull, fmtWeekday, cap, today, toKey, plural } from '../cycle.js';
import * as cms from '../cms.js';
import { changePhase } from './profile.js';
import { permission, requestPermission, scheduleReminders, sendTestNotification, supported } from '../notify.js';

const rerender = () => import('../router.js').then((m) => m.render());
export const APP_VERSION = '1.0.0';

/* ---------- configurações ---------- */
export default {
  id: 'configuracoes',
  render() {
    const state = getState();
    const s = state.settings;

    return {
      appbar: { title: 'Configurações' },
      html: `<div class="section pb-24">
        <div class="section__head" style="margin-top:6px"><h2>Administração</h2></div>
        <button class="card card--link" data-nav="admin" style="background:var(--grad-lilac);color:#fff;border:0">
          <span class="challenge__ico">${icon('settings', 21)}</span>
          <span class="grow" style="text-align:left">
            <b style="display:block;font-family:var(--font-display);font-size:var(--fs-15)">Painel da administradora</b>
            <span class="fs-12" style="display:block;color:rgba(255,255,255,.85);margin-top:2px">Conteúdo, comunidade e publicação</span>
          </span>
          <span style="flex:none">${icon('chevron', 18)}</span>
        </button>

        <div class="section__head"><h2>Meu ciclo</h2></div>
        <div class="card card--flush">
          <div class="kv">
            <span class="kv__k">Fase lútea<small>dias entre a ovulação e a menstruação (padrão: 14)</small></span>
            <input class="input input--inline" id="c-luteal" type="number" min="10" max="16" value="${s.lutealPhase}" style="width:64px">
          </div>
          <button class="kv" data-phase>
            <span class="kv__k">Minha fase<small>tentante, grávida ou pós-parto</small></span>
            <span class="kv__v">Alterar ${icon('chevron', 15)}</span>
          </button>
          <button class="kv" data-nav="perfil/ciclo">
            <span class="kv__k">Datas e duração<small>última menstruação, ciclo e fluxo</small></span>
            <span class="kv__v">Editar ${icon('chevron', 15)}</span>
          </button>
        </div>

        <div class="section__head"><h2>Conteúdo</h2></div>
        <div class="card card--flush">
          ${toggleRow('Sugestões diárias', s.tipsOptIn, 'tipsOptIn', 'geradas no seu aparelho a partir da sua fase')}
          <button class="kv" data-nav="lembretes">
            <span class="kv__k">Lembretes<small>${permission() === 'granted' ? 'ativados neste aparelho' : 'não ativados'}</small></span>
            <span class="kv__v">Abrir ${icon('chevron', 15)}</span>
          </button>
        </div>

        <div class="section__head"><h2>Privacidade e dados</h2></div>
        <div class="card card--flush">
          <button class="kv" data-export>
            <span class="kv__k">Exportar meus dados<small>arquivo .json com tudo o que está salvo</small></span>
            <span class="kv__v">${icon('download', 18)}</span>
          </button>
          <button class="kv" data-import>
            <span class="kv__k">Importar backup<small>restaura um arquivo exportado antes</small></span>
            <span class="kv__v">${icon('upload', 18)}</span>
          </button>
          <button class="kv" data-nav="privacidade">
            <span class="kv__k">Como tratamos seus dados<small>LGPD e armazenamento local</small></span>
            <span class="kv__v">${icon('shield', 18)}</span>
          </button>
          <button class="kv" data-reset>
            <span class="kv__k" style="color:var(--red-500)">Apagar tudo<small>remove registros, perfil e preferências</small></span>
            <span class="kv__v" style="color:var(--red-500)">${icon('trash', 18)}</span>
          </button>
        </div>

        <div class="section__head"><h2>Sobre</h2></div>
        <div class="card card--flush">
          <button class="kv" data-nav="ajuda"><span class="kv__k">Ajuda e perguntas frequentes</span><span class="kv__v">${icon('chevron', 15)}</span></button>
          <button class="kv" data-nav="sobre"><span class="kv__k">Sobre o Florescer</span><span class="kv__v">v${APP_VERSION} ${icon('chevron', 15)}</span></button>
        </div>

        ${note('Nenhum dado sai deste aparelho. Se você limpar os dados do navegador, o histórico é perdido — exporte de tempos em tempos.')}
      </div>`,

      mount(root) {
        root.querySelector('#c-luteal').onchange = (e) => {
          const v = Math.min(16, Math.max(10, +e.target.value || 14));
          update((st) => { st.settings.lutealPhase = v; });
          toast('Previsões recalculadas.');
        };
        root.querySelector('[data-phase]').onclick = changePhase;
        root.querySelectorAll('[data-toggle]').forEach((b) => {
          b.onclick = () => {
            const k = b.dataset.toggle;
            update((st) => { st.settings[k] = !st.settings[k]; });
            b.setAttribute('aria-checked', String(getState().settings[k]));
            haptic();
          };
        });
        root.querySelector('[data-export]').onclick = () => {
          downloadFile(`florescer-backup-${toKey(today())}.json`, exportData());
          toast('Backup baixado. Guarde em um lugar seguro 💛');
        };
        root.querySelector('[data-import]').onclick = () => importSheet();
        root.querySelector('[data-reset]').onclick = async () => {
          const ok = await confirmSheet({
            title: 'Apagar todos os dados?',
            message: 'Registros, perfil, publicações e preferências serão removidos deste aparelho. Não há como desfazer.',
            confirmLabel: 'Apagar tudo', danger: true,
          });
          if (!ok) return;
          resetAll();
          applyTheme();
          toast('Tudo apagado. Recomeçando do zero.');
          navigate('inicio', { replace: true });
          rerender();
        };
      },
    };
  },
};

function importSheet() {
  openSheet({
    title: 'Importar backup',
    subtitle: 'Escolha o arquivo .json exportado pelo Florescer. Os dados atuais serão substituídos.',
    body: `<input type="file" accept="application/json,.json" id="imp-file" class="input">
      <button class="btn mt-12" data-do>Importar</button>`,
    onMount(sheet) {
      sheet.querySelector('[data-do]').onclick = async () => {
        const file = sheet.querySelector('#imp-file').files?.[0];
        if (!file) { toast('Escolha um arquivo primeiro'); return; }
        try {
          importData(await file.text());
          applyTheme();
          closeSheet();
          toast('Backup restaurado 🌸');
          navigate('home');
          rerender();
        } catch (err) {
          toast('Arquivo inválido. Use um backup exportado pelo Florescer.');
        }
      };
    },
  });
}

/* ---------- lembretes ---------- */
export const remindersScreen = {
  id: 'lembretes',
  render() {
    const state = getState();
    const n = state.settings.notifications;
    const perm = permission();
    const info = cycleInfo(state);

    const statusCard = !supported()
      ? note('Este navegador não permite notificações. Instale o app na tela inicial para receber lembretes.')
      : perm === 'granted'
        ? `<div class="card" style="display:flex;gap:13px;align-items:center">
            <span class="floatcard__ico" style="background:var(--leaf-50);color:var(--leaf-600)">${icon('check', 22)}</span>
            <div class="grow"><b class="fs-14">Lembretes ativados</b>
              <div class="fs-12 muted mt-4">Enviados às ${n.time} enquanto o app estiver instalado neste aparelho.</div></div>
            ${isFertileReminderEligible(state) ? '<button class="btn btn--soft btn--sm btn--auto" data-test>Testar</button>' : ''}
          </div>`
        : `<div class="card" style="display:flex;gap:13px;align-items:center">
            <span class="floatcard__ico" style="background:var(--amber-50);color:var(--amber-600)">${icon('bell', 22)}</span>
            <div class="grow"><b class="fs-14">Ativar lembretes</b>
              <div class="fs-12 muted mt-4">${perm === 'denied' ? 'Você bloqueou as notificações. Libere nas configurações do navegador.' : 'Avisamos sobre janela fértil, menstruação e registro do dia.'}</div></div>
            ${perm === 'denied' ? '' : '<button class="btn btn--sm btn--auto" data-ask>Ativar</button>'}
          </div>`;

    return {
      appbar: { title: 'Lembretes' },
      html: `<div class="section pb-24">
        ${statusCard}

        <div class="section__head"><h2>O que você quer receber</h2></div>
        <div class="card card--flush">
          ${toggleRow('Período fértil', n.fertile, 'fertile', 'somente enquanto você estiver na janela fértil')}
          ${toggleRow('Menstruação prevista', n.period, 'period', 'um dia antes da data estimada')}
          ${toggleRow('Registro diário', n.dailyLog, 'dailyLog', 'só se você ainda não registrou o dia')}
          ${toggleRow('Sugestão do dia', n.tip, 'tip', 'conteúdo escolhido para a sua fase')}
          ${toggleRow('Atividade da comunidade', n.community, 'community', 'respostas às suas publicações')}
          <div class="kv">
            <span class="kv__k">Horário<small>quando os lembretes do dia chegam</small></span>
            <input class="input input--inline" type="time" id="n-time" value="${n.time}" style="width:auto">
          </div>
        </div>

        <div class="section__head"><h2>Como fica no seu celular</h2></div>
        <div class="lockscreen">
          <div class="lockscreen__time">${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}</div>
          <div class="lockscreen__date">${cap(fmtWeekday(today()))}, ${fmtFull(today())}</div>
          <div class="push">
            <span class="push__ico">${markSvg(22, '#fff', '#FFD34D')}</span>
            <div class="grow">
              <b>Florescer 🌸</b>
              <p>${esc((state.profile.name || '').split(' ')[0] || 'Oi')}, você está na janela fértil. Um bom momento para o casal aproveitar junto, com leveza e sem pressão. 💛</p>
            </div>
            <time>agora</time>
          </div>
        </div>

        ${info.known ? `<div class="card mt-16 card--flush">
          <div class="kv"><span class="kv__k">Avisos de janela fértil</span><span class="kv__v">de ${fmtShort(info.fertileStart)} a ${fmtShort(info.fertileEnd)}</span></div>
          <div class="kv"><span class="kv__k">Próximo aviso de menstruação</span><span class="kv__v">${fmtShort(info.nextPeriod)}</span></div>
        </div>` : ''}

        ${note('Os lembretes são locais: ficam agendados no seu aparelho. Se o app for fechado pelo sistema por muito tempo, o aviso pode chegar na próxima abertura.')}
      </div>`,

      mount(root) {
        root.querySelector('[data-ask]')?.addEventListener('click', async () => {
          const res = await requestPermission();
          if (res === 'granted') { scheduleReminders(); toast('Lembretes ativados 🌸'); }
          else toast('Sem problema — você pode ativar depois.');
          rerender();
        });
        root.querySelector('[data-test]')?.addEventListener('click', async () => {
          const ok = await sendTestNotification();
          toast(ok ? 'Enviamos uma notificação de teste 🌸' : 'Não foi possível enviar agora.');
        });
        root.querySelectorAll('[data-toggle]').forEach((b) => {
          b.onclick = () => {
            const k = b.dataset.toggle;
            update((s) => { s.settings.notifications[k] = !s.settings.notifications[k]; });
            b.setAttribute('aria-checked', String(getState().settings.notifications[k]));
            haptic();
            scheduleReminders();
          };
        });
        root.querySelector('#n-time').onchange = (e) => {
          update((s) => { s.settings.notifications.time = e.target.value || '09:00'; });
          scheduleReminders();
          toast(`Lembretes às ${e.target.value}`);
        };
      },
    };
  },
};

/* ---------- privacidade (LGPD) ---------- */
export const privacyScreen = {
  id: 'privacidade',
  render() {
    const state = getState();
    const size = new Blob([exportData()]).size;
    return {
      appbar: { title: 'Privacidade e dados' },
      html: `<div class="section article pb-24">
        <div class="article__body">
          <h2>Onde ficam os seus dados</h2>
          <p>Tudo o que você registra no Florescer — ciclo, sintomas, humor, observações, publicações — é gravado apenas no armazenamento local deste aparelho. Não enviamos nada para servidores e não há criação de conta.</p>
          <h2>O que isso significa na prática</h2>
          <li>Ninguém além de quem usa este aparelho tem acesso aos seus registros.</li>
          <li>Se você limpar os dados do navegador ou desinstalar o app, as informações são apagadas.</li>
          <li>Para trocar de aparelho, use a exportação e depois a importação do arquivo.</li>
          <h2>Seus direitos (LGPD)</h2>
          <p>Como os dados não saem do aparelho, você exerce diretamente os direitos de acesso, portabilidade e eliminação: exportar gera uma cópia completa e legível; apagar remove tudo de forma definitiva.</p>
          <h2>Saúde é dado sensível</h2>
          <p>Informações sobre ciclo e fertilidade são dados pessoais sensíveis. Recomendamos proteger o aparelho com senha ou biometria e evitar registrar dados em dispositivos compartilhados.</p>
        </div>
        <div class="card card--flush mt-16">
          <div class="kv"><span class="kv__k">Dias registrados</span><span class="kv__v">${Object.keys(state.logs).length}</span></div>
          <div class="kv"><span class="kv__k">Publicações suas</span><span class="kv__v">${state.posts.length}</span></div>
          <div class="kv"><span class="kv__k">Tamanho dos seus dados</span><span class="kv__v">${(size / 1024).toFixed(1)} KB</span></div>
        </div>
        <button class="btn btn--soft mt-16" data-exp>${icon('download', 18)} Exportar meus dados</button>
        <button class="btn btn--danger mt-8" data-nav="configuracoes">${icon('trash', 18)} Ir para apagar tudo</button>
      </div>`,
      mount(root) {
        root.querySelector('[data-exp]').onclick = () => {
          downloadFile(`florescer-backup-${toKey(today())}.json`, exportData());
          toast('Backup baixado 💛');
        };
      },
    };
  },
};

/* ---------- ajuda ---------- */
export const helpScreen = {
  id: 'ajuda',
  render() {
    return {
      appbar: { title: 'Ajuda' },
      html: `<div class="section pb-24">
        <div class="card card--flush">
          ${cms.getFaq().map((f, i) => `
            <div class="kv" style="display:block;cursor:pointer" data-faq="${i}">
              <div class="row row--between">
                <b class="fs-14 grow">${esc(f.q)}</b>
                <span class="muted" data-caret>${icon('chevronDown', 18)}</span>
              </div>
              <p class="fs-13 muted mt-8" hidden data-answer style="line-height:1.6">${esc(f.a)}</p>
            </div>`).join('')}
        </div>

        <div class="section__head"><h2>Ainda com dúvida?</h2></div>
        <div class="card">
          <p class="fs-13 muted">Escreva para a equipe do Florescer. Respondemos em até dois dias úteis.</p>
          <a class="btn btn--soft mt-12" href="mailto:contato@florescer.app?subject=Ajuda%20no%20app%20Florescer">${icon('send', 18)} contato@florescer.app</a>
        </div>

        ${note('Emergência ou dúvida clínica não deve ser resolvida por aqui: procure o seu médico. Em caso de sofrimento emocional, o CVV atende 24h pelo 188.')}
      </div>`,
      mount(root) {
        root.querySelectorAll('[data-faq]').forEach((el) => {
          el.onclick = () => {
            const a = el.querySelector('[data-answer]');
            a.hidden = !a.hidden;
            el.querySelector('[data-caret]').innerHTML = icon(a.hidden ? 'chevronDown' : 'chevronUp', 18);
          };
        });
      },
    };
  },
};

/* ---------- sobre ---------- */
export const aboutScreen = {
  id: 'sobre',
  render() {
    return {
      appbar: { title: 'Sobre' },
      html: `<div class="section center pb-24">
        <img src="icons/logo-app.png" width="190" height="190" alt="Florescer" style="margin:8px auto 6px;filter:drop-shadow(0 14px 30px rgba(78,32,54,.16))">
        <p class="fs-13 muted">Versão ${APP_VERSION}</p>
        <div class="card mt-24" style="text-align:left">
          <p class="fs-13 muted" style="line-height:1.7">
            O Florescer acompanha a mulher da tentativa à maternidade: ciclo menstrual, janela fértil,
            diário, conteúdos revisados, comunidade e acompanhamento da gestação e do pós-parto.
            Funciona offline e guarda os dados apenas no seu aparelho.
          </p>
        </div>
        <div class="card card--flush mt-16" style="text-align:left">
          <button class="kv" data-nav="privacidade"><span class="kv__k">Privacidade e dados</span><span class="kv__v">${icon('chevron', 15)}</span></button>
          <button class="kv" data-nav="ajuda"><span class="kv__k">Ajuda</span><span class="kv__v">${icon('chevron', 15)}</span></button>
          <div class="kv"><span class="kv__k">Conteúdo</span><span class="kv__v">Revisado por profissionais parceiros</span></div>
        </div>
        ${note('O Florescer é uma ferramenta de acompanhamento e educação em saúde. Não realiza diagnóstico, não substitui consulta médica e não deve ser usado como método contraceptivo.')}
      </div>`,
    };
  },
};
