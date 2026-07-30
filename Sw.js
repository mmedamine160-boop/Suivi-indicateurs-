const CACHE_NAME = "suivi-production-v2";
const ASSETS = ["./index.html", "./manifest.json", "./icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Ne jamais intercepter les requêtes vers Firestore, Google APIs, polices, CDN, etc.
  // Cela évite de casser la connexion temps réel avec la base de données.
  if (url.origin !== self.location.origin || event.request.method !== "GET") {
    return; // laisse le navigateur gérer la requête normalement
  }

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
