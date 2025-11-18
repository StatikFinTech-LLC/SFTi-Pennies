/**
 * Service Worker for SFTi-Pennies Trading Journal PWA
 * Provides basic caching and offline functionality
 */

const CACHE_NAME = 'sfti-pennies-v1';
const BASE_PATH = '/SFTi-Pennies';

// Resources to cache on install
const urlsToCache = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/manifest.json`,
  `${BASE_PATH}/index.directory/assets/css/main.css`,
  `${BASE_PATH}/index.directory/assets/css/glass-effects.css`,
  `${BASE_PATH}/index.directory/assets/css/modals.css`,
  `${BASE_PATH}/index.directory/assets/css/glowing-bubbles.css`,
  `${BASE_PATH}/index.directory/assets/js/utils.js`,
  `${BASE_PATH}/index.directory/assets/js/eventBus.js`,
  `${BASE_PATH}/index.directory/assets/js/chartConfig.js`,
  `${BASE_PATH}/index.directory/assets/js/navbar.js`,
  `${BASE_PATH}/index.directory/assets/js/footer.js`,
  `${BASE_PATH}/index.directory/assets/js/background.js`,
  `${BASE_PATH}/index.directory/assets/js/auth.js`,
  `${BASE_PATH}/index.directory/assets/js/glowing-bubbles.js`,
  `${BASE_PATH}/index.directory/assets/js/accountManager.js`,
  `${BASE_PATH}/index.directory/assets/js/modals.js`,
  `${BASE_PATH}/index.directory/assets/js/app.js`,
  `${BASE_PATH}/index.directory/assets/js/charts.js`,
  `${BASE_PATH}/index.directory/assets/icons/icon-192.png`,
  `${BASE_PATH}/index.directory/assets/icons/icon-512.png`
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache');
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip external resources (CDN, fonts, etc.)
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request).then(fetchResponse => {
          // Cache new resources dynamically
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      })
      .catch(() => {
        // If both cache and network fail, return offline page if available
        if (event.request.destination === 'document') {
          return caches.match(`${BASE_PATH}/`);
        }
      })
  );
});
