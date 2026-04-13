// public/sw.js
// Rate. PWA Service Worker — Manual minimal implementation
// Strategy: cache-first for static assets, network-first for everything else.
// No Workbox dependency — pure browser SW API.

const CACHE_NAME = 'rate-pwa-v1';

// Static assets worth caching long-term (fonts, icons, images)
const STATIC_EXTENSIONS = ['.ttf', '.otf', '.woff', '.woff2', '.png', '.jpg', '.jpeg', '.svg', '.ico', '.webp'];

function isStaticAsset(url) {
  return STATIC_EXTENSIONS.some(ext => url.pathname.endsWith(ext));
}

function isExternalAPI(url) {
  const externalHosts = [
    'api.themoviedb.org',
    'api.rawg.io',
    'www.googleapis.com',
    'itunes.apple.com',
    'covers.openlibrary.org',
    'books.google.com',
  ];
  return externalHosts.some(host => url.hostname.includes(host));
}

// Install: activate immediately, no waiting
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Rate. service worker v1');
  self.skipWaiting();
});

// Activate: claim all clients immediately
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Rate. service worker v1');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: routing logic
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests and chrome-extension requests
  if (event.request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;

  // Skip external API calls — always network, never cache
  if (isExternalAPI(url)) return;

  // Skip Supabase calls — always network
  if (url.hostname.includes('supabase.co')) return;

  if (isStaticAsset(url)) {
    // Cache-first for static assets (fonts, icons, images)
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }
          const toCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, toCache));
          return response;
        });
      })
    );
    return;
  }

  // Network-first for everything else (JS bundles, CSS, HTML, app routes)
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }
        const toCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, toCache));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
