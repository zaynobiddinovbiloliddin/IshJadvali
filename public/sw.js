const CACHE = "ishjadvali-v2";

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(["/", "/manifest.json"])).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== location.origin) return;

  // API va upload fayllar — har doim network (fresh data)
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/uploads/")) return;

  // Hashed assets (/assets/*.js, /assets/*.css) — Cache First (bir yillik immutable)
  if (url.pathname.startsWith("/assets/")) {
    e.respondWith(
      caches.open(CACHE).then((c) =>
        c.match(request).then((hit) =>
          hit || fetch(request).then((res) => {
            if (res.ok) c.put(request, res.clone());
            return res;
          })
        )
      )
    );
    return;
  }

  // HTML va boshqa statik fayllar — Network First, cache fallback
  e.respondWith(
    fetch(request)
      .then((res) => {
        if (res.ok && request.method === "GET") {
          caches.open(CACHE).then((c) => c.put(request, res.clone()));
        }
        return res;
      })
      .catch(() => caches.match(request))
  );
});
