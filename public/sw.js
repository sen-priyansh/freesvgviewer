/// <reference lib="webworker" />

const CACHE_NAME = 'svg-viewer-v2';

const PRECACHE_URLS = [
  '/',
  '/privacy',
];

function isCacheableRequest(request) {
  const url = new URL(request.url);

  return (
    request.method === 'GET' &&
    url.origin === self.location.origin &&
    (request.mode === 'navigate' ||
      ['script', 'style', 'image', 'font', 'manifest'].includes(request.destination))
  );
}

// Install: precache the app shell
self.addEventListener('install', (event) => {
  const e = event;
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  const e = event;
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch: network first, fall back to cache for navigation
self.addEventListener('fetch', (event) => {
  const e = event;
  const request = e.request;

  if (!isCacheableRequest(request)) return;

  e.respondWith(
    fetch(request)
      .then((response) => {
        // Clone and cache successful responses
        if (response.ok) {
          const clone = response.clone();
          e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(request, clone)));
        }
        return response;
      })
      .catch(() => {
        // Offline: serve from cache
        return caches.match(request).then((cached) => {
          if (cached) return cached;
          // For navigation requests, serve the cached index page
          if (request.mode === 'navigate') {
            return caches.match('/');
          }
          return new Response('Offline', { status: 503 });
        });
      })
  );
});
