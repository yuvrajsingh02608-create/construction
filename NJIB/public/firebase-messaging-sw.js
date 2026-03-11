importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
// These values must match your .env
firebase.initializeApp({
  apiKey: self.FIREBASE_API_KEY || '',
  authDomain: self.FIREBASE_AUTH_DOMAIN || '',
  projectId: self.FIREBASE_PROJECT_ID || '',
  storageBucket: self.FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: self.FIREBASE_MESSAGING_SENDER_ID || '',
  appId: self.FIREBASE_APP_ID || '',
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Background message:', payload);
  const { title, body, icon } = payload.notification || {};
  self.registration.showNotification(title || 'BuildTrack Pro', {
    body: body || 'You have a new notification',
    icon: icon || '/icon-192.png',
    badge: '/icon-72.png',
    tag: payload.data?.type || 'general',
    data: payload.data,
  });
});
