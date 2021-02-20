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
self.addEventListener("activate", (evt) => {
  evt.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log("Removing old cache data", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});


