/// <reference lib="webworker" />

const CACHE_NAME = 'svg-viewer-v1';

const PRECACHE_URLS = [
  '/',
];

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

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Skip blob URLs and browser-extension URLs
  if (request.url.startsWith('blob:') || request.url.startsWith('chrome-extension:')) return;

  e.respondWith(
    fetch(request)
      .then((response) => {
        // Clone and cache successful responses
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clone);
          });
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
