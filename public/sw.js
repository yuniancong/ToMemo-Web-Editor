const CACHE = 'tomemo-web-editor-v1'
self.addEventListener('install', (event) => event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(['/']))))
self.addEventListener('fetch', (event) => event.respondWith(caches.match(event.request).then(async (cached) => {
  if (cached) return cached
  const response = await fetch(event.request)
  if (event.request.method === 'GET' && new URL(event.request.url).origin === self.location.origin && response.ok) {
    const cache = await caches.open(CACHE)
    await cache.put(event.request, response.clone())
  }
  return response
})))
