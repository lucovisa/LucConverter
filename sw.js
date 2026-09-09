const CACHE_NAME = 'lucconverter-v2';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.url.includes('cdn.jsdelivr.net') || 
      event.request.url.includes('cdnjs.cloudflare.com') ||
      event.request.url.includes('unpkg.com') ||
      event.request.url.includes('cdn.skypack.dev')) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});