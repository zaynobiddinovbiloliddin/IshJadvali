// v3 — clone bug fixed: always clone synchronously before returning response
const CACHE = "ishjadvali-v3";

// Pre-cache critical shell on install
self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then((c) =>
      c.addAll(["/", "/manifest.json"]).catch(() => {})
    )
  );
});

// Delete old caches on activate
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

// Safe cache write: clone SYNCHRONOUSLY before any async operation
function putInCache(request, response) {
  if (!response || !response.ok || response.status === 0) return;
  const clone = response.clone(); // must be synchronous
  caches.open(CACHE).then((c) => c.put(request, clone)).catch(() => {});
}

self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== location.origin) return;

  // API va uploads — har doim tarmoqdan (fresh data)
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/uploads/")) return;

  // Hashed assets — Cache First (1 yillik, o'zgarmas)
  if (url.pathname.startsWith("/assets/")) {
    e.respondWith(
      caches.open(CACHE).then((c) =>
        c.match(request).then((hit) => {
          if (hit) return hit;
          return fetch(request).then((res) => {
            putInCache(request, res); // clone va cache safe
            return res;
          }).catch(() => Response.error());
        })
      )
    );
    return;
  }

  // HTML, manifest va boshqalar — Network First, keyin cache
  e.respondWith(
    fetch(request)
      .then((res) => {
        putInCache(request, res); // clone va cache safe
        return res;
      })
      .catch(() =>
        caches.match(request).then((cached) => cached || Response.error())
      )
  );
});
