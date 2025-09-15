const CACHE_NAME = 'invoice-maker-v1';
const ASSET_CACHE = ['/','/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSET_CACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k)))))
  );
  self.clients.claim();
});

// Simple strategy: network-first for navigations (HTML), cache-first for static assets
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then((res)=>{
        const copy = res.clone();
        caches.open(CACHE_NAME).then((c)=>c.put(req, copy));
        return res;
      }).catch(()=>caches.match(req).then((r)=>r || caches.match('/')))
    );
    return;
  }
  if (url.origin === self.location.origin) {
    // static
    event.respondWith(
      caches.match(req).then((hit)=> hit || fetch(req).then((res)=>{
        const copy = res.clone();
        caches.open(CACHE_NAME).then((c)=>c.put(req, copy));
        return res;
      }))
    );
  }
});

