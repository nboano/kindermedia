var currentCache = 'kindermedia_pwa_files';
self.addEventListener('install', e => {
    console.log('PWA Service Worker installing.');
    let timeStamp = Date.now();
});
self.addEventListener('activate', event => {
    console.log('PWA Service Worker activating.');
    event.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then((cacheResponse) => {
            if (cacheResponse) {
                fetch(event.request).then((networkResponse) => {
                    return caches.open(currentCache).then((cache) => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    })
                });
                return cacheResponse;
            } else {
                return fetch(event.request).then((networkResponse) => {
                    return caches.open(currentCache).then((cache) => {
                        if (!event.request.url.endsWith('.ts') && !event.request.url.endsWith('.mp4')) cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    })
                });
            }
        })
    );
});
