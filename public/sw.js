self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip unsupported schemes
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // Skip Vite dev server internals & HMR — NEVER intercept these
  if (
    url.pathname.includes('/@vite') ||
    url.pathname.includes('/__vite') ||
    url.pathname.includes('/@fs/') ||
    url.pathname.includes('/@react-refresh') ||
    url.pathname.includes('/?token=') ||
      url.pathname.includes('/node_modules/vite/') ||  // ← AÑADIR
  url.pathname.includes('/src/main.jsx') ||         // ← AÑADIR
    url.protocol === 'wss:'
  ) return;

  // Skip non-GET
  if (request.method !== 'GET') return;

  // SPA root — cache first, fallback to /membresia/
  if (url.pathname === '/membresia/' || url.pathname === '/') {
    event.respondWith(
      caches.match(request).then(cached =>
        cached || fetch(request).catch(() => caches.match('/membresia/'))
      )
    );
    return;  // ✅ valid — inside addEventListener callback
  }

  // Firebase/API — network first
  if (
    url.pathname.includes('/api/') ||
    url.hostname.includes('firebaseio.com') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('firestore.googleapis.com')
  ) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response?.ok) {
            caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()));
          }
          return response;
        })
        .catch(() => caches.match(request).then(cached =>
          cached || new Response(JSON.stringify({ error: 'Offline' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          })
        ))
    );
    return;
  }

  // All other static assets — cache first
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (!response || response.status !== 200 || response.type === 'opaque') return response;
        caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()));
        return response;
      }).catch(() => new Response('Offline', { status: 503 }));
    })
  );
});