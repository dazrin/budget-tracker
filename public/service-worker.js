// Define files to cache
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/styles.css",
  "/db.js",
  "/index.js",
  "/manifest.webmanifest",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// Defining cache + data cache
const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

// Code to install service worker
self.addEventListener("install", (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("Files were pre-cached successfully!");
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Code to enable service worker
self.addEventListener('activate', (evt) => {
  evt.waitUntil(
    caches.keys().then((keyList) => Promise.all(
      keyList.map((key) => {
        if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
          console.log('Removing old cache data', key);
          return caches.delete(key);
        }
      }),
    )),
  );

  self.clients.claim();
});

// Fetch 
self.addEventListener('fetch', (evt) => {
  // Cache successful requests to the API
  if (evt.request.url.includes('/api/')) {
    evt.respondWith(
      caches.open(DATA_CACHE_NAME).then((cache) => fetch(evt.request)
        .then((response) => {
          // If response is successful, clone it & store in cache
          if (response.status === 200) {
            cache.put(evt.request.url, response.clone());
          }

          return response;
        })
        .catch((err) =>
         // Get from cache since network failed
          cache.match(evt.request))).catch((err) => console.log(err)),
    );
    return;
  }

  // If not for api, serve static assets first
  evt.respondWith(
    caches.match(evt.request).then((response) => response || fetch(evt.request)),
  );
});

