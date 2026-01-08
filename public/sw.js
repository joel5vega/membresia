const CACHE_NAME = 'membresia-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.svg',
  '/icons/icon-256x256.svg',
  '/icons/icon-384x384.svg',
  '/icons/icon-512x512.svg',
  '/icons/apple-touch-icon.png'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching assets');
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('Service Worker: Some assets failed to cache', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Cache First Strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Don't cache non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Network first for API calls
  if (url.pathname.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const cacheCopy = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, cacheCopy);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            return cached || new Response('Offline: Resource not available', { status: 503 });
          });
        })
    );
  } else {
    // Cache first for assets
    event.respondWith(
      caches.match(request).then((cached) => {
        return cached || fetch(request).then((response) => {
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }
          const cacheCopy = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, cacheCopy);
          });
          return response;
        }).catch(() => {
          return caches.match(request) || new Response('Offline: Asset not available', { status: 503 });
        });
      })
    );
  }
});

// Background Sync for offline data
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-members') {
    event.waitUntil(syncMembers());
  }
});

async function syncMembers() {
  try {
    const db = await openIndexDB();
    const tx = db.transaction('pendingMembers', 'readonly');
    const store = tx.objectStore('pendingMembers');
    const members = await store.getAll();

    for (const member of members) {
      try {
        await fetch('/api/members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(member)
        });
        // Delete from pending after successful upload
        const txDelete = db.transaction('pendingMembers', 'readwrite');
        txDelete.objectStore('pendingMembers').delete(member.id);
      } catch (error) {
        console.error('Sync failed for member:', member.id, error);
      }
    }
  } catch (error) {
    console.error('Background sync error:', error);
  }
}

function openIndexDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('MembresiaDB', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}
