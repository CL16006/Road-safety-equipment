const staticMapBoxApp = "Road-safety-equipment-v1";
const assets = [
  "/",
  "/index.html",
  "/verGps.html",
  "/verRutas.html",
  "/mostrarDistancia.html",
  "/css/style.css",
  "/css/style2.css",
  "/css/style-index.css",
  "/js/app.js",
  "/js/calcularDistancia.js",
  "/js/verGps.js",
  "/js/verRutas.js",
  "/images/loader.gif",
  "/images/logo.png",
  "/images/slack-new-logo.svg",
  "/images/undraw_activity_re_2lvv.svg",
  "/images/undraw_adventure_map_hnin.svg",
  "/images/undraw_bike_ride_7xit.svg",
  "/images/undraw_fitness_stats_sht6.svg"
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