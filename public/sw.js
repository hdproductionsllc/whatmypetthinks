const CACHE_NAME = "whatmypetthinks-v3";
const STATIC_ASSETS = [
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/og-image.png",
  "/samples/cat-judging.jpg",
  "/samples/cat-judging-thumb.jpg",
  "/samples/cat-stare.jpg",
  "/samples/cat-stare-thumb.jpg",
  "/samples/dog-begging.jpg",
  "/samples/dog-begging-thumb.jpg",
  "/samples/dog-guilty.jpg",
  "/samples/dog-guilty-thumb.jpg",
  "/samples/kitten-surprised.jpg",
  "/samples/kitten-surprised-thumb.jpg",
  "/samples/puppy-mess.jpg",
  "/samples/puppy-mess-thumb.jpg",
];

// Install — cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch — network first, cache fallback for static assets only
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Skip non-GET and API requests
  if (request.method !== "GET" || request.url.includes("/api/")) {
    return;
  }

  // Never intercept navigation requests — let the browser handle HTML pages directly
  // This prevents stale cached pages from trapping users after deploys
  if (request.mode === "navigate") {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Only cache static assets (images, icons, manifest), not JS/CSS chunks
        if (response.ok && response.type === "basic") {
          const url = new URL(request.url);
          const isStaticAsset = STATIC_ASSETS.some((asset) => url.pathname === asset);
          if (isStaticAsset) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone);
            });
          }
        }
        return response;
      })
      .catch(() => {
        // Network failed — try cache for static assets only
        return caches.match(request).then((cached) => {
          if (cached) return cached;
          return new Response("Offline", { status: 503 });
        });
      })
  );
});
