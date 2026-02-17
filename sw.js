// sw.js (place in repo root, same level as index.html)

const CACHE_NAME = "donkeyapp-v6";

const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/styles.css",
  "/i18n.js",

  "/english.png",
  "/polish.png",
  "/german.png",
  "/spanish.png",
  "/french.png",

  "/1.png",
  "/2.png",
  "/3.png",
  "/4.png",

  "/conditions.html",
  "/cookies.html",
  "/privacy.html",
  "/addajoke.html",

  "/icon-192.png",
  "/icon-512.png",
  "/manifest.json"
];

// Allow the page to tell SW to activate immediately
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Install: pre-cache core assets
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  // DO NOT call skipWaiting() here
});

// Activate: remove old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch:
// - Network-first for HTML navigations (so updates appear quickly)
// - Cache-first for everything else (fast assets, works offline)
self.addEventListener("fetch", event => {

  // HTML page navigations
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Static assets
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        try {
          const url = new URL(event.request.url);

          if (
            event.request.method === "GET" &&
            url.origin === self.location.origin
          ) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache =>
              cache.put(event.request, copy)
            );
          }
        } catch (e) {}

        return response;
      });
    })
  );
});
