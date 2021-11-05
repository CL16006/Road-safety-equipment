const staticMapBoxApp = "mapbox-app-site-v1";
const assets = [
  "/",
  "/index.html",
  "/verGps.html",
  "/verRutas.html",
  "/mostrarDistancia.html",
  "/css/style.css",
  "/css/style-index.css",
  "/js/app.js",
  "/js/calcularDistancia.js",
  "/js/verGps.js",
  "/js/verRutas.js",
  "/images/loader.gif",
  "/images/logo.png"
];

self.addEventListener("install", installEvent => {
  installEvent.waitUntil(
    caches.open(staticMapBoxApp).then(cache => {
      cache.addAll(assets);
    })
  );
});

self.addEventListener("fetch", fetchEvent => {
  fetchEvent.respondWith(
    caches.match(fetchEvent.request).then(res => {
      return res || fetch(fetchEvent.request);
    })
  );
});