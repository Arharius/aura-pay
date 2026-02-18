const CACHE_NAME = 'aura-ai-v1';
const urlsToCache = [
  '/',
  '/index.html',
  'https://unpkg.com/tesseract.js@4.1.1/dist/tesseract.min.js'
];

// Установка - кэшируем файлы
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Кэширование ресурсов');
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.log('Ошибка кэширования:', err))
  );
  self.skipWaiting();
});

// Активация - удаляем старые кэши
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Перехват запросов - отдаем из кэша или сети
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Если есть в кэше - отдаем из кэша
        if (response) {
          return response;
        }
        // Иначе идем в сеть
        return fetch(event.request)
          .then(networkResponse => {
            // Кэшируем новые запросы (картинки, API)
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
            return networkResponse;
          });
      })
      .catch(() => {
        // Если оффлайн и нет в кэше - отдаем заглушку
        return new Response('Оффлайн режим');
      })
  );
});