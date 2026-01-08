// PWA Utilities for offline detection and notifications

export function setupOfflineDetection() {
  // Listen for online/offline events
  window.addEventListener('online', () => {
    console.log('App is back online');
    showNotification('Conexión restaurada', 'La aplicación está de nuevo en línea');
    // Trigger background sync for pending data
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.sync.register('sync-members').catch((err) => {
          console.warn('Background sync registration failed:', err);
        });
      });
    }
  });

  window.addEventListener('offline', () => {
    console.log('App is offline');
    showNotification('Sin conexión', 'Trabajando en modo offline. Los cambios se sincronizarán cuando vuelva a conectarse.');
  });

  // Initial offline check
  if (!navigator.onLine) {
    showNotification('Sin conexión', 'Está en modo offline');
  }
}

export function showNotification(title, message, options = {}) {
  // Use browser notification API if available
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body: message,
      icon: '/icons/icon-192x192.svg',
      ...options
    });
  } else if ('Notification' in window && Notification.permission !== 'denied') {
    // Ask for permission if not denied
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        new Notification(title, {
          body: message,
          icon: '/icons/icon-192x192.svg',
          ...options
        });
      }
    });
  } else {
    // Fallback: use console
    console.log(`[${title}] ${message}`);
  }
}

export function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        console.log('Notification permission granted');
      }
    });
  }
}

export function isOnline() {
  return navigator.onLine;
}

export async function checkAppInstalled() {
  if ('getInstalledRelatedApps' in navigator) {
    const apps = await navigator.getInstalledRelatedApps();
    return apps.length > 0;
  }
  return false;
}

export function promptInstall() {
  let deferredPrompt;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    // Show install button
    const installBtn = document.getElementById('install-btn');
    if (installBtn) {
      installBtn.style.display = 'block';
      installBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          console.log(`User response to the install prompt: ${outcome}`);
          deferredPrompt = null;
        }
      });
    }
  });

  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    showNotification('Instalación exitosa', 'Membresia ha sido instalada en tu dispositivo');
    const installBtn = document.getElementById('install-btn');
    if (installBtn) {
      installBtn.style.display = 'none';
    }
  });
}
