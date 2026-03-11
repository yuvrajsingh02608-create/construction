# 🔥 Firebase Setup Guide — BuildTrack Pro

## Step 1: Create Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add Project** → Name: `buildtrack-pro` → Enable Analytics → Create
3. Enable these services (from the left sidebar):
   - **Authentication** → Sign-in method → Enable **Email/Password** + **Google**
   - **Firestore Database** → Create in **production mode**, choose region
   - **Storage** → Start in production mode
   - **Hosting** (optional, for deployment)

---

## Step 2: Get Your Config Keys

1. Project Overview → ⚙️ Project Settings → **Your apps** → Web (`</>`)
2. Register app (name: `BuildTrack Web`) → Copy the `firebaseConfig` object
3. Open `.env` in your project and fill in the values:

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=buildtrack-pro.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=buildtrack-pro
VITE_FIREBASE_STORAGE_BUCKET=buildtrack-pro.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:123456:web:abc123
```

> [!CAUTION]
> Never commit `.env` to git. It is already in `.gitignore`.

---

## Step 3: Firestore Security Rules

Go to **Firestore → Rules** and paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAuthenticated() { return request.auth != null; }
    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }
    function isOwner() { return getUserData().role == 'owner'; }
    function isManager() { return getUserData().role == 'manager' || isOwner(); }
    function isSameCompany(companyId) { return getUserData().companyId == companyId; }

    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if request.auth.uid == userId || isOwner();
      allow delete: if isOwner();
    }
    match /companies/{companyId} {
      allow read, write: if isAuthenticated();
    }
    match /projects/{projectId} {
      allow read: if isAuthenticated() && isSameCompany(resource.data.companyId);
      allow create: if isAuthenticated() && isManager();
      allow update: if isAuthenticated() && isManager();
      allow delete: if isAuthenticated() && isOwner();
    }
    match /tasks/{taskId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && isManager();
      allow update: if isAuthenticated();
      allow delete: if isAuthenticated() && isManager();
    }
    match /workers/{workerId} {
      allow read: if isAuthenticated();
      allow create, update: if isAuthenticated() && isManager();
      allow delete: if isAuthenticated() && isOwner();
    }
    match /dailyLogs/{logId} {
      allow read: if isAuthenticated();
      allow create, update: if isAuthenticated();
      allow delete: if isAuthenticated() && isManager();
    }
    match /attendance/{attendanceId} {
      allow read: if isAuthenticated();
      allow create, update: if isAuthenticated();
      allow delete: if isAuthenticated() && isManager();
    }
    match /materials/{materialId} {
      allow read: if isAuthenticated();
      allow create, update: if isAuthenticated() && isManager();
      allow delete: if isAuthenticated() && isOwner();
    }
    match /notifications/{notifId} {
      allow read: if request.auth.uid == resource.data.userId;
      allow create: if isAuthenticated();
      allow update, delete: if request.auth.uid == resource.data.userId;
    }
    match /purchaseOrders/{orderId} {
      allow read: if isAuthenticated();
      allow create, update: if isAuthenticated() && isManager();
      allow delete: if isAuthenticated() && isOwner();
    }
  }
}
```

---

## Step 4: Firebase Storage Rules

Go to **Storage → Rules** and paste:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /photos/{companyId}/{projectId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
        && request.resource.size < 10 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }
    match /documents/{companyId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
        && request.resource.size < 50 * 1024 * 1024;
    }
    match /avatars/{userId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId
        && request.resource.size < 2 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }
  }
}
```

---

## Step 5: FCM Push Notifications (Optional)

1. Project Settings → **Cloud Messaging** tab
2. Generate a **VAPID key pair** → copy the public key
3. Add to `.env`: `VITE_FIREBASE_VAPID_KEY=your_vapid_key`
4. Update `public/firebase-messaging-sw.js` with your actual config values
5. The app will request notification permission on login automatically

---

## Step 6: Deploy to Firebase Hosting

```bash
# Install Firebase CLI (once)
npm install -g firebase-tools
firebase login

# Initialize hosting (run in project root)
firebase init hosting
# → Use existing project: buildtrack-pro
# → Public directory: dist
# → Single-page app: Yes
# → Overwrite index.html: No

# Build and deploy
npm run build
firebase deploy
```

Your app will be live at `https://buildtrack-pro.web.app`

### Set Environment Variables for Hosting

```bash
# Or just build with .env already set — Vite bakes them into the bundle at build time
npm run build   # VITE_ vars are included automatically
firebase deploy
```

---

## Step 7: First Login Flow

When you first log in after configuring Firebase:

1. **Register** with the "Create Account" tab (choose Owner role)
2. The app automatically seeds Firestore with the demo projects, tasks, workers, and materials
3. Real-time listeners activate — all data is now in Firestore

> [!TIP]
> After the first login, you can delete the `PROJECTS`, `TASKS`, etc. exports from `mockData.js` if you want to start with clean data.

---

## Step 8: Cloud Functions (Blaze Plan Required)

```bash
npm install -g firebase-tools
firebase init functions   # choose TypeScript or JavaScript
```

Recommended triggers:
- `onTaskDueSoon` — daily scheduler, notifications for tasks due in 24h
- `onMaterialLowStock` — Firestore trigger when stock < alertLevel  
- `onAttendancePending` — daily 10 AM check, reminder if not marked
- `generateWeeklyReport` — Monday email summary to owner

Deploy: `firebase deploy --only functions`

---

## Checklist

- [ ] `.env` filled with real Firebase credentials
- [ ] Email/Password auth enabled in Firebase Console
- [ ] Google sign-in enabled in Firebase Console
- [ ] Firestore security rules pasted and published
- [ ] Storage security rules pasted and published
- [ ] App runs and real-time data appears in Firestore
- [ ] Photos upload to Firebase Storage
- [ ] FCM notifications work (VAPID key set)
- [ ] Deployed to Firebase Hosting
