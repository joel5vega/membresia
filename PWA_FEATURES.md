# PWA Features - Sistema de Membresia (Iglesia Canan)

## Overview
The Membresia application has been transformed into a Progressive Web App (PWA) that can be installed and used offline on smartphones, tablets, and computers.

## Key PWA Features Implemented

### 1. Service Worker (`public/sw.js`)
- **Offline Support**: Caches essential assets and allows the app to work without internet connection
- **Cache-First Strategy**: For static assets (HTML, CSS, JS)
- **Network-First Strategy**: For API calls, with fallback to cached data
- **Background Sync**: Syncs member data to the server when reconnected
- **Auto-Update Check**: Checks for app updates every minute

### 2. Web App Manifest (`public/manifest.json`)
Defines PWA metadata including:
- App name: "Membresia - Sistema de Gestion de Iglesia"
- Display mode: Standalone (full-screen app)
- Theme color: Blue (#3B82F6)
- App icons for various device sizes (192x192, 256x256, 384x384, 512x512)
- Maskable icons for adaptive display
- Start URL and scope configuration

### 3. IndexedDB for Offline Data (`src/services/indexedDBService.js`)
**Database Name**: `MembresiaDB`
**Stores**:
- **members**: Stores cached member data
  - Indexes: nombre, apellido, ci
- **pendingMembers**: Stores changes made offline
  - Index: status

**Available Functions**:
```javascript
import {
  initDB,
  saveMember,
  getMember,
  getAllMembers,
  deleteMember,
  savePendingMember,
  getPendingMembers,
  deletePendingMember,
  clearAllData
} from './services/indexedDBService';
```

### 4. PWA Utilities (`src/services/pwaUtils.js`)
**Features**:
- Offline/Online detection with notifications
- Browser notification API integration
- App installation prompt handling
- Background sync registration

**Available Functions**:
```javascript
import {
  setupOfflineDetection,   // Monitor online/offline status
  showNotification,        // Show system notifications
  requestNotificationPermission,
  isOnline,               // Check current online status
  checkAppInstalled,      // Check if PWA is installed
  promptInstall           // Handle installation prompts
} from './services/pwaUtils';
```

### 5. Service Worker Registration (`src/main.jsx`)
- Automatically registers the service worker on app load
- Initializes IndexedDB for offline storage
- Checks for app updates every minute
- Handles registration errors gracefully

### 6. PWA Meta Tags (`index.html`)
```html
<meta name="theme-color" content="#3B82F6" />
<meta name="description" content="Sistema de gestion de membresía para iglesias" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="Membresia" />
<link rel="manifest" href="/manifest.json" />
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
```

## How to Install the PWA

### On Android
1. Open the app in Chrome or compatible browser
2. Click the menu (three dots) → "Instalar aplicación"
3. Or tap the install banner that appears
4. The app will be added to your home screen

### On iOS
1. Open the app in Safari
2. Click the share button
3. Tap "Añadir a Pantalla de Inicio"
4. The app will be added to your home screen

### On Desktop (Windows/Mac/Linux)
1. Open the app in a compatible browser (Chrome, Edge, Brave)
2. Click the install icon in the address bar (if available)
3. Or open the menu → "Instalar 'Membresia'"
4. The app will be installed as a standalone application

## Offline Functionality

### What works offline:
- ✅ Viewing cached member data
- ✅ Adding new members (stored locally)
- ✅ Editing members (stored locally)
- ✅ Viewing member details
- ✅ Searching members
- ✅ All form interactions

### Automatic Sync:
- When the user comes back online, pending changes automatically sync
- Background Sync API registers changes for upload
- Pending data is stored in IndexedDB until synchronized

### What requires connection:
- Real-time sync to server
- Fetching fresh data from database
- Authentication (initial login)

## Technical Specifications

### Cache Strategy
```
API Calls: Network → Cache → Offline Message
Static Assets: Cache → Network (update in background)
```

### Service Worker Scopes
- Scope: `/`
- Start URL: `/`

### Browser Support
- ✅ Chrome/Chromium (Full Support)
- ✅ Firefox (Full Support)
- ✅ Edge (Full Support)
- ✅ Safari (Partial - iOS 15.1+, macOS 13+)
- ✅ Samsung Internet
- ✅ Opera

## User Notifications

### Automatic Notifications:
1. **Offline Mode**: "Sin conexión - Trabajando en modo offline"
2. **Back Online**: "Conexión restaurada"
3. **Installation Success**: "Instalación exitosa - Membresia ha sido instalada"
4. **Sync Status**: Updates when background sync completes

## Data Persistence

All member data is stored in two locations:
1. **Browser Cache**: For performance (Service Worker cache)
2. **IndexedDB**: For offline access and pending changes
3. **Server Database**: Source of truth (when online)

## Development Notes

### Testing Offline Mode
```javascript
// In browser DevTools:
// 1. Open DevTools (F12)
// 2. Go to Application → Service Workers
// 3. Check "Offline" checkbox
// 4. Or use Network tab to throttle connection
```

### Clearing PWA Data
```javascript
import { clearAllData } from './services/indexedDBService';
await clearAllData(); // Clears all cached member data
```

### Checking Online Status
```javascript
import { isOnline } from './services/pwaUtils';
if (isOnline()) {
  // Perform network operations
}
```

## Security Considerations

✅ HTTPS Required (automatically enforced on production)
✅ Service Worker scope limited to app path
✅ IndexedDB same-origin policy
✅ Notification permission user-controlled
✅ Background Sync authenticated via existing session

## Future Enhancements

- [ ] Push notifications for event updates
- [ ] Periodic background sync for fresh data
- [ ] Offline form validation improvements
- [ ] Media synchronization for member photos
- [ ] Web Workers for heavy computations
- [ ] Add to Home Screen custom prompt

## Troubleshooting

### Service Worker not registering
- Check browser console for errors
- Ensure HTTPS is enabled
- Clear browser cache and reload
- Check DevTools → Application → Service Workers

### Offline mode not working
- Verify service worker is registered
- Check if assets are cached
- Try uninstalling and reinstalling the app

### Data not syncing
- Check online/offline status
- Review IndexedDB pending members store
- Check browser console for sync errors
- Try manually triggering sync via DevTools

## References

- [MDN Web Docs - PWA](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web.dev - PWA Checklist](https://web.dev/pwa-checklist/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
