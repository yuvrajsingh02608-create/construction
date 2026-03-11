import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Check if Firebase is configured
console.log("Firebase config loaded:", {
  hasKey: !!firebaseConfig.apiKey,
  keyLength: firebaseConfig.apiKey ? firebaseConfig.apiKey.length : 0,
  keyPrefix: firebaseConfig.apiKey ? firebaseConfig.apiKey.substring(0, 5) : null
});
const isConfigured = Boolean(firebaseConfig.apiKey);

let app, auth, db, storage;

if (isConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);

  // Enable offline persistence
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Firestore persistence failed: multiple tabs open');
    } else if (err.code === 'unimplemented') {
      console.warn('Firestore persistence not available in this browser');
    }
  });
} else {
  console.warn('⚠️ Firebase not configured. Add credentials to .env file. Running in demo mode.');
}

export { app, auth, db, storage };
export const FIREBASE_CONFIGURED = isConfigured;
export default app;
