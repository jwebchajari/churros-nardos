// Service worker mínimo: habilita la instalación (PWA) y sirve una copia de la carta sin conexión.
// No cachea /api, /dashboard ni /login. Los precios siempre se confirman con red en /comprar.
const CACHE = "churros-nardo-s-v1";
// En localhost no se cachea nada: los chunks de desarrollo cambian sin cambiar de nombre.
const DEV_HOST = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(self.location.hostname);
const PRECACHE = ["/", "/logo-hero.webp", "/logo-sm.webp", "/icons/icon-192.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (DEV_HOST) return;
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (/^\/(api|dashboard|login)(\/|$)/.test(url.pathname)) return;

  // Navegaciones: red primero, copia guardada si no hay conexión.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok && url.pathname === "/") {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put("/", copy));
          }
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match("/")))
    );
    return;
  }

  // Estáticos con hash de Next: cache primero.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(req, copy));
            }
            return res;
          })
      )
    );
  }
});
