const CACHE_NAME = 'eyes-everywhere-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/app.css',      // ajusta para os teus ficheiros reais
  '/js/app.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Instalacao do SW e cache dos recursos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Ativacao do SW - limpeza cache antiga
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    )
  );
});

// Interceptar pedidos e servir do cache quando offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});
