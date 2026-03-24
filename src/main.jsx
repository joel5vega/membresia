import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext';
import './index.css'
import { initDB } from './services/indexedDBService';

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <App />
  </AuthProvider>,
)

// PWA - only register SW in production to avoid dev reload loops
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register(
        `${import.meta.env.BASE_URL}sw.js`,
        { scope: import.meta.env.BASE_URL }
      );
      console.log('Service Worker registered successfully:', registration);

      await initDB();
      console.log('IndexedDB initialized for offline support');

      setInterval(() => registration.update(), 60000);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  });
} else if (!import.meta.env.PROD) {
  // Still init IndexedDB in dev
  initDB().catch(console.error);
} else {
  console.warn('Service Workers are not supported in this browser');
}