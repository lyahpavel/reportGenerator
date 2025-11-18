// Змінюй цю версію при кожному оновленні додатку!
const CACHE_VERSION = 'v1.12';
const CACHE_NAME = `drone-reports-${CACHE_VERSION}`;
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './auth.js',
  './supabase-functions.js',
  './reports-history.js',
  './data.json',
  './manifest.json',
  './version-info.json'
];

// Обробка повідомлень (для примусового оновлення)
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] 🚀 Примусова активація нової версії');
    self.skipWaiting();
  }
});

// Встановлення Service Worker
self.addEventListener('install', event => {
  console.log('[SW] 📦 Встановлення Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] 💾 Кешування файлів додатку');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[SW] ✅ Всі файли закешовано');
        // НЕ викликаємо skipWaiting автоматично, чекаємо підтвердження користувача
      })
  );
});

// Активація Service Worker та очищення старого кешу
self.addEventListener('activate', event => {
  console.log('[SW] 🔄 Активація Service Worker...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] 🗑️ Видалення старого кешу:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] ✅ Активовано, контроль над сторінками');
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
  
  // Ігноруємо запити до інших доменів (Supabase, CDN тощо)
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
        console.log('[SW] 📡 Офлайн режим, використання кешу:', request.url);
        return caches.match(request);
      })
  );
});
