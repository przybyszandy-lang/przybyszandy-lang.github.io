const CACHE_NAME = "donkeyapp-v2";

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
  "/icon-512.png"
];


// Install event
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch event
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
