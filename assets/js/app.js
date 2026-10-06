/**
 * Ponto de entrada do Florescer.
 * Registra telas, aplica tema, liga o service worker e os lembretes.
 */
import { getState, applyTheme, subscribe } from './store.js';
import { register, initRouter, render, navigate } from './router.js';
import { $, toast, esc } from './ui.js';
import { icon } from './icons.js';
import { syncNotices } from './notify.js';
import { today, toKey } from './cycle.js';

import onboarding from './screens/onboarding.js';
import welcome from './screens/welcome.js';
import home from './screens/home.js';
import weekByWeek from './screens/weekByWeek.js';
import weekDetail from './screens/weekDetail.js';
import maternalBody from './screens/maternalBody.js';
import cycleTimeline from './screens/cycleTimeline.js';
import flor from './screens/flor.js';
import comfort from './screens/comfort.js';
import notices from './screens/notices.js';
import florDaily from './screens/florDaily.js';
import florMoment from './screens/florMoment.js';
import journeyTimelineScreen from './screens/timeline.js';
import ebooks from './screens/ebooks.js';
import pregnancyNutrition from './screens/pregnancyNutrition.js';
import calendar from './screens/calendar.js';
import log from './screens/log.js';
import add, { pregnancyTestScreen, relationshipScreen } from './screens/add.js';
import pregnancySetup from './screens/pregnancySetup.js';
import pregnancyDiaryScreen from './screens/pregnancyDiary.js';
import babyStatus from './screens/babyStatus.js';
import babyGrowth from './screens/babyGrowth.js';
import babyFeeding from './screens/babyFeeding.js';
import breastfeeding from './screens/breastfeeding.js';
import babyHealth from './screens/babyHealth.js';
import diapers from './screens/diapers.js';
import sleep from './screens/sleep.js';
import vaccines from './screens/vaccines.js';
import development from './screens/development.js';
import resources from './screens/resources.js';
import schedule from './screens/schedule.js';
import prenatal from './screens/prenatal.js';
import tips, { libraryScreen, articleScreen, savedScreen } from './screens/tips.js';
import community, { postScreen, newPostScreen } from './screens/community.js';
import insights from './screens/insights.js';
import profile from './screens/profile.js';
import premium from './screens/premium.js';
import settings, { remindersScreen, privacyScreen, helpScreen, aboutScreen } from './screens/settings.js';
import admin from './screens/admin.js';

/* ---------- telas ---------- */
[
  onboarding, welcome, home, weekByWeek, weekDetail, maternalBody, cycleTimeline, pregnancyNutrition, flor, comfort, florDaily, florMoment, journeyTimelineScreen, ebooks, calendar, log, add, pregnancyTestScreen, relationshipScreen, pregnancySetup, pregnancyDiaryScreen, babyStatus, babyGrowth, babyFeeding, breastfeeding, babyHealth, diapers, sleep, vaccines, development, resources, schedule, prenatal, tips, libraryScreen, articleScreen, savedScreen,
  community, postScreen, newPostScreen, insights, profile, premium,
  settings, remindersScreen, notices, privacyScreen, helpScreen, aboutScreen, admin,
].forEach(register);

/* ---------- service worker + instalação ---------- */
let deferredPrompt = null;

function initServiceWorker() {
  if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
  navigator.serviceWorker.register('sw.js').then((reg) => {
    reg.addEventListener('updatefound', () => {
      const sw = reg.installing;
      sw?.addEventListener('statechange', () => {
        if (sw.state === 'installed' && navigator.serviceWorker.controller) showUpdateBanner(reg);
      });
    });
  }).catch((err) => console.warn('[florescer] service worker não registrado:', err));
}

function showUpdateBanner(reg) {
  const view = $('#view');
  const el = document.createElement('div');
  el.className = 'banner';
  el.innerHTML = `<span class="banner__ico">${icon('refresh', 19)}</span>
    <span class="grow"><b>Nova versão disponível</b><span>Atualize para receber as melhorias.</span></span>
    <button class="btn btn--sm btn--auto" data-upd>Atualizar</button>`;
  view.prepend(el);
  el.querySelector('[data-upd]').onclick = () => {
    reg.waiting?.postMessage({ type: 'SKIP_WAITING' });
    setTimeout(() => location.reload(), 300);
  };
}

function initInstallPrompt() {
  addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    maybeShowInstallBanner();
  });
  addEventListener('appinstalled', () => { deferredPrompt = null; toast('Florescer instalado 🌸'); });
}

function maybeShowInstallBanner() {
  if (!deferredPrompt || !getState().onboarded) return;
  if (sessionStorage.getItem('florescer:install-dismissed')) return;
  const view = $('#view');
  if (!view || view.querySelector('[data-install]')) return;
  const el = document.createElement('div');
  el.className = 'banner';
  el.dataset.install = '1';
  el.innerHTML = `<span class="banner__ico">${icon('install', 19)}</span>
    <span class="grow"><b>Instalar o Florescer</b><span>Abre mais rápido, funciona offline e recebe lembretes.</span></span>
    <button class="btn btn--sm btn--auto" data-go>Instalar</button>
    <button class="iconbtn iconbtn--ghost" data-no aria-label="Agora não">${icon('close', 18)}</button>`;
  view.prepend(el);
  el.querySelector('[data-go]').onclick = async () => {
    el.remove();
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
  };
  el.querySelector('[data-no]').onclick = () => {
    sessionStorage.setItem('florescer:install-dismissed', '1');
    el.remove();
  };
}

/* ---------- estado offline ---------- */
function initConnectivity() {
  addEventListener('offline', () => toast('Você está offline — o Florescer continua funcionando 🌿'));
}

/* ---------- atualização diária ---------- */
let renderedDay = toKey(today());
let dailyRefreshTimer;

function refreshForNewDay() {
  const currentDay = toKey(today());
  if (currentDay === renderedDay) return;
  renderedDay = currentDay;
  render();
}

function scheduleDailyRefresh() {
  clearTimeout(dailyRefreshTimer);
  const now = new Date();
  const nextDay = new Date(now);
  nextDay.setHours(24, 0, 0, 50);
  dailyRefreshTimer = setTimeout(() => {
    refreshForNewDay();
    scheduleDailyRefresh();
  }, nextDay - now);
}

/* ---------- boot ---------- */
function boot() {
  applyTheme();
  initRouter();

  const state = getState();
  if (!state.onboarded && !location.hash.startsWith('#/inicio')) {
    history.replaceState(null, '', '#/inicio');
  }

  // os avisos do dia são calculados antes do primeiro render: o sininho
  // já aparece com a contagem certa
  syncNotices();

  render();
  initServiceWorker();
  initInstallPrompt();
  initConnectivity();
  scheduleDailyRefresh();

  // reagenda lembretes ao voltar para o app
  // voltar ao app conta como "abrir": é aqui que novos avisos entram
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      refreshForNewDay();
      scheduleDailyRefresh();
      if (syncNotices()) render();
    }
  });

  // banner de instalação depois que a primeira tela renderizou
  setTimeout(maybeShowInstallBanner, 1200);

  subscribe(() => { /* telas se redesenham sob demanda */ });
}

boot();
