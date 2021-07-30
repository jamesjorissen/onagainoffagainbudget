const CACHE_NAME = "static-cache-v1";
const DATA_CACHE_NAME = "data-cache-v1";

const urls = [
    "/",
    "/db.js",
    "/index.js",
    "/manifest.json",
    "/styles.css",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
];
self.addEventListener("install", function (evt) {
    // Perform install steps
    evt.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            console.log("Open");
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener("fetch", function (evt) {
    if (evt.request.url.includes("/api/")) {
        evt.respondWith(
            caches
                .open(DATA_CACHE_NAME)
                .then((cache) => {
                    return fetch(evt.request)
                        .then((response) => {

                            if (response.status === 200) {
                                cache.put(evt.request.url, response.clone());
                            }
                            return response;
                        })
                        .catch((err) => {
                            return cache.match(evt.request);
                        });
                })
                .catch((err) => console.log(err))
        );
        return;
    }

    evt.respondWith(
        fetch(evt.request).catch(function () {
            return caches.match(evt.request).then(function (response) {
                if (response) {
                    return response;
                } else if (evt.request.headers.get("accept").includes("text/html")) {
                    // return the cached home page for all requests for html pages
                    return caches.match("/");
                }
            });
        })
    );
});