// ===============================
// Service Worker - Sistema Logística v10
// ===============================

// Cambiá el número de versión cada vez que subas algo nuevo
const CACHE_NAME = "lts-cache-v5";
const URLS_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// Instalación: cachea los archivos base
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE))
  );
  self.skipWaiting();
});

// Activación: limpia cachés viejos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch: usa cache-first, pero si falla intenta red
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Evita cachear peticiones dinámicas (por ejemplo API o cámara QR)
  if (req.url.includes("html5-qrcode") || req.method !== "GET") {
    event.respondWith(fetch(req).catch(() => caches.match("./index.html")));
    return;
  }

  event.respondWith(
    caches.match(req).then((cachedRes) => {
      return (
        cachedRes ||
        fetch(req)
          .then((res) => {
            const resClone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
            return res;
          })
          .catch(() => caches.match("./index.html"))
      );
    })
  );
});
