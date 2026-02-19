const CACHE_NAME = 'aura-ai-v2'; // Изменено с v1 на v2
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon_192.png',
  '/icon_512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting(); // Принудительно активируем новый SW
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name)) // Удаляем старый кэш
      );
    })
  );
  self.clients.claim(); // Захватываем контроль над страницами
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) return response;
        return fetch(event.request);
      })
  );
});
