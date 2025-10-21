const CACHE_VERSION = 'v1';
const CACHE_NAME = `drone-reports-${CACHE_VERSION}`;
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './data.json',
  './manifest.json'
];

// Встановлення Service Worker
self.addEventListener('install', event => {
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // Примусово активувати новий Service Worker
        return self.skipWaiting();
      })
  );
});

// Активація Service Worker та очищення старого кешу
self.addEventListener('activate', event => {
  console.log('[SW] Activating Service Worker...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Примусово взяти контроль над усіма клієнтами
      return self.clients.claim();
    })
  );
});

// Стратегія: Network First (спочатку мережа, потім кеш)
// Для HTML, CSS, JS - завжди намагаємось отримати свіжу версію
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ігноруємо запити до інших доменів
  if (url.origin !== location.origin) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then(response => {
        // Якщо отримали відповідь, оновлюємо кеш
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(request, responseToCache);
            });
        }
        return response;
      })
      .catch(() => {
        // Якщо мережа недоступна, використовуємо кеш
        console.log('[SW] Fetch failed, returning from cache:', request.url);
        return caches.match(request);
      })
  );
});
