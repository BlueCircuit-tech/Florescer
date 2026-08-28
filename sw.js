/**
 * Service worker do Florescer.
 * Estratégia: cache-first para a casca do app (funciona 100% offline),
 * network-first para o HTML (para pegar atualizações quando houver rede).
 */
const VERSION = 'florescer-v1.19.0';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/css/app.css',
  './assets/js/app.js',
  './assets/js/router.js',
  './assets/js/store.js',
  './assets/js/ui.js',
  './assets/js/icons.js',
  './assets/js/cycle.js',
  './assets/js/pregnancy.js',
  './assets/js/pregnancyTest.js',
  './assets/js/pregnancyProfile.js',
  './assets/js/media.js',
  './assets/js/babies.js',
  './assets/js/postpartum.js',
  './assets/js/achievements.js',
  './assets/js/babyStatus.js',
  './assets/js/breastfeeding.js',
  './assets/js/babyHealth.js',
  './assets/js/planner.js',
  './assets/js/diapers.js',
  './assets/js/missions.js',
  './assets/js/welcome.js',
  './assets/js/content.js',
  './assets/js/cms.js',
  './assets/js/notify.js',
  './assets/js/screens/onboarding.js',
  './assets/js/screens/welcome.js',
  './assets/js/screens/home.js',
  './assets/js/screens/calendar.js',
  './assets/js/screens/log.js',
  './assets/js/screens/add.js',
  './assets/js/screens/pregnancySetup.js',
  './assets/js/screens/babyStatus.js',
  './assets/js/screens/babyGrowth.js',
  './assets/js/screens/breastfeeding.js',
  './assets/js/screens/babyHealth.js',
  './assets/js/screens/schedule.js',
  './assets/js/screens/diapers.js',
  './assets/js/screens/missions.js',
  './assets/js/screens/tips.js',
  './assets/js/screens/community.js',
  './assets/js/screens/insights.js',
  './assets/js/screens/profile.js',
  './assets/js/screens/premium.js',
  './assets/js/screens/settings.js',
  './assets/js/screens/admin.js',
  './icons/logo-app.png',
  './icons/badge.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
      .catch((err) => console.warn('[sw] falha ao preencher o cache:', err)),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== location.origin) return;

  // HTML: rede primeiro, cache como reserva (offline)
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put('./index.html', copy));
          return res;
        })
        .catch(() => caches.match('./index.html').then((r) => r || caches.match('./'))),
    );
    return;
  }

  // demais recursos: responde do cache e revalida em segundo plano
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request).then((res) => {
        if (res.ok && res.type === 'basic') {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(request, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    }),
  );
});

/* Abrir o app ao tocar em uma notificação */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = event.notification.data?.url || './';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ('focus' in client) { client.navigate?.(target); return client.focus(); }
      }
      return self.clients.openWindow(target);
    }),
  );
});
