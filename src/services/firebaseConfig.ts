import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
// Initialize auth with error handling for development environments
let authInstance = null;
try {
  authInstance = getAuth(app);
} catch (error) {
  console.warn('Firebase Auth initialization warning:', error);
}

export const auth = authInstance;

// Initialize anonymous auth for public access to members data
if (authInstance) {
  signInAnonymously(authInstance).catch((error) => {
    console.warn('Anonymous sign-in not required for development:', error);
  });
}
export const storage = getStorage(app);

export default app;
