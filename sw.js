const CACHE = "pharmacy-v2";
const SHELL = ["./", "./index.html"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  /* Let Apps Script calls go to network — never cache them */
  if (e.request.url.includes("script.google.com")) return;

  /* Everything else: cache first, then network */
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request))
  );
});
