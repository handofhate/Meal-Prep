const CACHE = 'mealprep-v1';

// Cache everything on first fetch (network-first with cache fallback)
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', e => {
  // Remove old caches when the SW version changes
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Only handle same-origin GET requests
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(e.request).then(cached => {
        // Try network first, fall back to cache
        const networkFetch = fetch(e.request)
          .then(resp => {
            if (resp.ok) cache.put(e.request, resp.clone());
            return resp;
          })
          .catch(() => cached);
        return cached || networkFetch;
      })
    )
  );
});
