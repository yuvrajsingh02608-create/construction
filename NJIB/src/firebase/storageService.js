import { ref, uploadBytes, getDownloadURL, deleteObject, uploadBytesResumable } from "firebase/storage";
import { storage, FIREBASE_CONFIGURED } from "./config";

// ─── Upload a single project photo ───────────────────────────────────────────
export const uploadPhoto = async (file, companyId, projectId) => {
  if (!FIREBASE_CONFIGURED) return null;
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `photos/${companyId}/${projectId}/${timestamp}_${safeName}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

// ─── Upload multiple photos in parallel ──────────────────────────────────────
export const uploadMultiplePhotos = async (files, companyId, projectId, onProgress) => {
  if (!FIREBASE_CONFIGURED) return [];
  let completed = 0;
  const urls = await Promise.all(
    Array.from(files).map(async (file) => {
      const url = await uploadPhoto(file, companyId, projectId);
      completed++;
      if (onProgress) onProgress(Math.round((completed / files.length) * 100));
      return url;
    })
  );
  return urls.filter(Boolean);
};

// ─── Upload user avatar ───────────────────────────────────────────────────────
export const uploadAvatar = async (file, userId) => {
  if (!FIREBASE_CONFIGURED) return null;
  const path = `avatars/${userId}/avatar`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

// ─── Upload a document (invoice, report, etc.) ───────────────────────────────
export const uploadDocument = async (file, companyId) => {
  if (!FIREBASE_CONFIGURED) return null;
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `documents/${companyId}/${timestamp}_${safeName}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

// ─── Upload with progress tracking ───────────────────────────────────────────
export const uploadWithProgress = (file, path, onProgress) => {
  if (!FIREBASE_CONFIGURED) return Promise.resolve(null);
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, path);
    const task = uploadBytesResumable(storageRef, file);
    task.on(
      "state_changed",
      (snapshot) => {
        const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        if (onProgress) onProgress(pct);
      },
      reject,
      async () => resolve(await getDownloadURL(task.snapshot.ref))
    );
  });
};

// ─── Delete a file by its download URL ───────────────────────────────────────
export const deleteFile = async (url) => {
  if (!FIREBASE_CONFIGURED || !url) return;
  try {
    const fileRef = ref(storage, url);
    await deleteObject(fileRef);
  } catch (e) {
    console.warn("Could not delete file:", e.message);
  }
};
