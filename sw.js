const CACHE = "visitor-v1";

const urls = [
  "./",
  "./index.html",
  "./app.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", e => {

    e.waitUntil(
        caches.open(CACHE)
        .then(cache => cache.addAll(urls))
    );

});

self.addEventListener("fetch", e => {

    e.respondWith(

        caches.match(e.request)
        .then(res => res || fetch(e.request))

    );

});