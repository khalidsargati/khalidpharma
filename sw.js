/* Pharmacy PWA — Service Worker
   Caches the app shell so it opens instantly,
   even with no network connection. */

const CACHE_NAME = "pharmacy-shell-v1";
const SHELL_FILES = [
  "./",
  "./index.html"
];

/* Install: cache the shell immediately */
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

/* Activate: delete old caches */
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

/* Fetch: shell files come from cache first.
   Sync calls to Apps Script go straight to network (no caching). */
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);

  // Let Apps Script calls go straight to network
  if (url.hostname.includes("script.google.com") ||
      url.hostname.includes("googleapis.com")) {
    return; // browser default (network)
  }

  // Everything else: cache-first
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(resp => {
        // Cache same-origin responses
        if (resp && resp.status === 200 && e.request.method === "GET") {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        }
        return resp;
      });
    })
  );
});
