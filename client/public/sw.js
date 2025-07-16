// 開発環境対応Service Worker
const CACHE_NAME = 'habit-tracker-v2';
const isProduction = location.hostname !== 'localhost' && !location.hostname.includes('127.0.0.1');

// 開発環境では最小限のキャッシュのみ
const urlsToCache = isProduction ? [
  '/',
  '/manifest.json'
] : [];

self.addEventListener('install', function(event) {
  if (isProduction) {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then(function(cache) {
          return cache.addAll(urlsToCache);
        })
    );
  }
  // 即座にアクティベート
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  // 開発環境では全てのリクエストをキャッシュしない
  if (!isProduction) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // APIリクエストは常に新しいデータを取得
  if (event.request.url.includes('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // 本番環境のみキャッシュ優先
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        return response || fetch(event.request);
      })
  );
});