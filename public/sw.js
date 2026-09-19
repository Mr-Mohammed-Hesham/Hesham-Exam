// Progressive Web App Service Worker
const CACHE_NAME = 'mr-mohamed-hesham-pwa-v1';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './favicon.png',
  './favicon.ico',
  './apple-touch-icon.png',
  './teacher-logo.jpg',
  './web-app-manifest-192x192.png',
  './web-app-manifest-512x512.png',
  './site.webmanifest'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch(() => {});
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Pass non-GET requests directly to network
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  // Do not intercept external requests, Firebase Firestore, Google Auth, etc.
  if (
    url.origin !== self.location.origin ||
    url.pathname.includes('/api/') ||
    url.hostname.includes('firebase') ||
    url.hostname.includes('googleapis') ||
    url.hostname.includes('gstatic')
  ) {
    return;
  }

  // Stale-while-revalidate or Network-first strategy
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html') || caches.match('/');
          }
          return new Response('Network error occurred', { status: 408, headers: { 'Content-Type': 'text/plain' } });
        });
      })
  );
});
