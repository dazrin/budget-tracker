const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/assets/css/styles.css',
  '/dist/index.bundle.js',
  '/dist/manifest.json',
  '/dist/assets/icons/icon_40x40.png',
  '/dist/assets/icons/icon_96x96.png',
  '/dist/assets/icons/icon_128x128.png',
  '/dist/assets/icons/icon_192x192.png',
  '/dist/assets/icons/icon_256x256.png',
  '/dist/assets/icons/icon_384x384.png',
  '/dist/assets/icons/icon_512x512.png',
  '/assets/img/icons/apple-touch-icon.png',
  '/assets/img/icons/favicon.ico',
  'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.4.1/semantic.min.css',
];

const CACHE_NAME = 'static-cache-v2';
const DATA_CACHE_NAME = 'data-cache-v1';

// Install service worker
self.addEventListener('install', function (evt) {
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Your files were pre-cached successfully!');
      return cache.addAll(FILES_TO_CACHE);
    }),
  );

  self.skipWaiting();
});

// Activate service worker
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

// Fetch data
self.addEventListener('fetch', (evt) => {

  // Cache successful requests to the API
  if (evt.request.url.includes('/api/')) {
    evt.respondWith(
      caches.open(DATA_CACHE_NAME).then((cache) => fetch(evt.request)
        .then((response) => {

          // If response is successful, store it in cache
          if (response.status === 200) {
            cache.put(evt.request.url, response.clone());
          }

          return response;
        })
        .catch((err) =>

        // If request fails, attempt to get data from cache
          cache.match(evt.request))).catch((err) => console.log(err)),
    );
    return;
  }

  // If request isn't for API, serve static assets
  evt.respondWith(
    caches.match(evt.request).then((response) => response || fetch(evt.request)),
  );
});
