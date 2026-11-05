/**
 * TU Food Pass — offline service worker.
 * Caches the whole app shell on first visit; afterwards everything loads with no network.
 * Bump CACHE_VERSION whenever any file below changes so phones pick up the update.
 */
const CACHE_VERSION = 'tu-food-pass-v3-4';

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/fonts.css',
  './css/app.css',
  './js/data.js',
  './js/audio.js',
  './js/core.js',
  './js/spin.js',
  './js/stalls.js',
  './js/plan.js',
  './js/wallet.js',
  './js/pass.js',
  './js/app.js',
  './img/mascot.png',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './fonts/bai-jamjuree-400-latin.woff2',
  './fonts/bai-jamjuree-400-thai.woff2',
  './fonts/bai-jamjuree-500-latin.woff2',
  './fonts/bai-jamjuree-500-thai.woff2',
  './fonts/bai-jamjuree-600-latin.woff2',
  './fonts/bai-jamjuree-600-thai.woff2',
  './fonts/bai-jamjuree-700-latin.woff2',
  './fonts/bai-jamjuree-700-thai.woff2',
  './fonts/mitr-500-latin.woff2',
  './fonts/mitr-500-thai.woff2',
  './fonts/mitr-600-latin.woff2',
  './fonts/mitr-600-thai.woff2'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Cache first (instant + offline). A fresh copy is fetched in the background when online.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((cached) => {
      const network = fetch(req).then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => cached || (req.mode === 'navigate' ? caches.match('./index.html') : undefined));
      return cached || network;
    })
  );
});
