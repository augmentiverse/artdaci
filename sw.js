const VERSION = "artdaci-pwa-v1";
const SHELL = [
  "./",
  "./index.html",
  "./index-fr.html",
  "./index-ar.html",
  "./gallery-vr.html",
  "./cinema-vr.html",
  "./styles/site.css",
  "./styles/gallery-vr.css",
  "./styles/visitor-guide.css",
  "./scripts/gallery-vr.js",
  "./scripts/pwa.js",
  "./vendor/three.module.js",
  "./vendor/GLTFLoader.module.js",
  "./vendor/DRACOLoader.module.js",
  "./manifest.webmanifest",
  "./assets/app/artdaci-app-icon.svg",
  "./assets/app/artdaci-maskable-icon.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith("artdaci-pwa-") && key !== VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

const isHeavyMedia = (url) => /\.(?:mp4|webm|mp3|m4a|wav|glb|gltf|usdz|mind)(?:$|\?)/i.test(url.pathname);
const isCacheableAsset = (url) => /\.(?:js|css|json|svg|woff2?)(?:$|\?)/i.test(url.pathname);

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || request.headers.has("range") || isHeavyMedia(url)) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(VERSION).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => (await caches.match(request)) || caches.match("./index.html"))
    );
    return;
  }

  if (isCacheableAsset(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const update = fetch(request).then((response) => {
          if (response.ok) caches.open(VERSION).then((cache) => cache.put(request, response.clone()));
          return response;
        });
        return cached || update;
      })
    );
  }
});
