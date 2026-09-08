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
  '/LucConverter/icon-512.png',
  '/LucConverter/og-image-1200x630.png',
  '/LucConverter/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
});