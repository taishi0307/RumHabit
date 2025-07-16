// Empty service worker - disabled in development
console.log('Service Worker disabled in development mode');

// Immediately skip waiting and claim clients
self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    })
  );
  self.clients.claim();
});

// Don't cache anything - pass through all requests
self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request));
});