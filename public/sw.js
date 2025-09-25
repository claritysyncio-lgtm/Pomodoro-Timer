// Simple service worker for PWA functionality
const CACHE_NAME = 'pomodoro-timer-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.js',
  '/src/style.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});
