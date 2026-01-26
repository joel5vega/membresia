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

// PWA Initialization
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, {
                scope: import.meta.env.BASE_URL
            });
      console.log('Service Worker registered successfully:', registration);
      
      // Initialize IndexedDB for offline data storage
      await initDB();
      console.log('IndexedDB initialized for offline support');
      
      // Check for updates periodically
      setInterval(() => {
        registration.update();
      }, 60000); // Check every minute
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  });
} else {
  console.warn('Service Workers are not supported in this browser');
}

