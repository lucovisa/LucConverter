const CACHE_NAME = 'lucconverter-v1';
const ASSETS = [
  '/LucConverter/',
  '/LucConverter/index.html',
  '/LucConverter/style.css',
  '/LucConverter/js/script.js',
  '/LucConverter/js/support.js',
  '/LucConverter/js/file-converter.js',
  '/LucConverter/js/currency-converter.js',
  '/LucConverter/js/media-shop.js',
  '/LucConverter/js/unit-converter.js',
  '/LucConverter/js/photo-editor.js',
  '/LucConverter/js/link-converter.js',
  '/LucConverter/js/text-editor.js',
  '/LucConverter/js/calculator.js',
  '/LucConverter/js/archive-worker.js',
  '/LucConverter/icon-512.png',
  '/LucConverter/og-image-1200x630.png',
  '/LucConverter/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  if (event.request.url.includes('cdn.jsdelivr.net') || 
      event.request.url.includes('cdnjs.cloudflare.com') ||
      event.request.url.includes('unpkg.com')) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        return response;
      }
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });
        return response;
      }).catch(() => {
        return new Response('', { status: 502, statusText: 'Network error' });
      });
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});