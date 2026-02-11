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
      console.log('🔧 Service Worker: Installing...');
      // Cache assets individually to handle failures gracefully
      return Promise.allSettled(
        ASSETS_TO_CACHE.map(url => 
          cache.add(url).catch(err => {
            console.warn(`⚠️ Failed to cache: ${url}`, err.message);
          })
        )
      ).then(() => {
        console.log('✅ Service Worker: Installation complete');
      });
    })
  );
  self.skipWaiting();
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker: Activated');
    })
  );
  self.clients.claim();
});

// Fetch Event - Cache First Strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip unsupported schemes (chrome-extension, data, blob, etc.)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    console.log('⏭️ Skipping unsupported scheme:', url.protocol);
    return;
  }

  // Skip GitHub authentication and dev server requests
  if (
    url.hostname.includes('github.dev') || 
    url.pathname.includes('/auth/') ||
    url.pathname.includes('/__vite') ||
    url.pathname.includes('/@vite') ||
    url.pathname.includes('/@fs/')
  ) {
    return;
  }

  // Don't cache non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Network first for Firebase/API calls
  if (
    url.pathname.includes('/api/') || 
    url.hostname.includes('firebaseio.com') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('firestore.googleapis.com')
  ) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache successful responses
          if (response && response.ok && response.status === 200) {
            const cacheCopy = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, cacheCopy).catch(err => {
                console.warn('Failed to cache API response:', err.message);
              });
            });
          }
          return response;
        })
        .catch((error) => {
          console.log('📡 Network failed, checking cache for:', url.pathname);
          return caches.match(request).then((cached) => {
            if (cached) {
              console.log('✅ Serving from cache:', url.pathname);
              return cached;
            }
            return new Response(
              JSON.stringify({ error: 'Offline: Resource not available' }), 
              { 
                status: 503,
                headers: { 'Content-Type': 'application/json' }
              }
            );
          });
        })
    );
  } else {
    // Cache first for static assets
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          console.log('💾 Serving from cache:', url.pathname);
          return cached;
        }

        console.log('🌐 Fetching from network:', url.pathname);
        return fetch(request).then((response) => {
          // Don't cache if response is not valid
          if (!response || response.status !== 200 || response.type === 'error' || response.type === 'opaque') {
            return response;
          }

          const cacheCopy = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, cacheCopy).catch(err => {
              console.warn('Failed to cache asset:', url.pathname, err.message);
            });
          });
          return response;
        }).catch((error) => {
          console.error('❌ Fetch failed:', url.pathname, error.message);
          return new Response('Offline: Asset not available', { 
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      })
    );
  }
});

// Background Sync for offline data
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag);
  if (event.tag === 'sync-members') {
    event.waitUntil(syncMembers());
  }
});

async function syncMembers() {
  try {
    console.log('📤 Starting member sync...');
    const db = await openIndexDB();
    const tx = db.transaction('pendingMembers', 'readonly');
    const store = tx.objectStore('pendingMembers');
    const members = await store.getAll();

    console.log(`Found ${members.length} pending members to sync`);

    for (const member of members) {
      try {
        const response = await fetch('/api/members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(member)
        });

        if (response.ok) {
          // Delete from pending after successful upload
          const txDelete = db.transaction('pendingMembers', 'readwrite');
          await txDelete.objectStore('pendingMembers').delete(member.id);
          console.log('✅ Synced member:', member.id);
        } else {
          console.error('❌ Sync failed for member:', member.id, response.status);
        }
      } catch (error) {
        console.error('❌ Sync failed for member:', member.id, error.message);
      }
    }
    
    console.log('✅ Member sync complete');
  } catch (error) {
    console.error('❌ Background sync error:', error);
    throw error; // Re-throw to retry later
  }
}

function openIndexDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('MembresiaDB', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pendingMembers')) {
        db.createObjectStore('pendingMembers', { keyPath: 'id' });
      }
    };
  });
}

// Message handler for force cache refresh
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('⚡ Force activating new service worker');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('🗑️ Clearing cache by request');
    event.waitUntil(
      caches.delete(CACHE_NAME).then(() => {
        console.log('✅ Cache cleared');
      })
    );
  }
});
