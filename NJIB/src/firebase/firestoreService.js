import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, onSnapshot, serverTimestamp, Timestamp,
} from "firebase/firestore";
import { db, FIREBASE_CONFIGURED } from "./config";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const toDate = (ts) => ts?.toDate ? ts.toDate().toISOString().split("T")[0] : ts;
const mapDoc = (d) => ({ id: d.id, ...d.data() });

function safeQuery(...args) {
  if (!FIREBASE_CONFIGURED) return null;
  return query(...args);
}

// ─── PROJECTS ─────────────────────────────────────────────────────────────────
export const subscribeToProjects = (companyId, callback) => {
  if (!FIREBASE_CONFIGURED) { callback([]); return () => {}; }
  const q = query(collection(db, "projects"), where("companyId", "==", companyId), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => callback(snap.docs.map(mapDoc)));
};

export const addProject = async (data) => {
  if (!FIREBASE_CONFIGURED) return;
  return addDoc(collection(db, "projects"), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp(), spent: 0, progress: 0, photos: [], workerIds: [] });
};

export const updateProject = async (id, data) => {
  if (!FIREBASE_CONFIGURED) return;
  return updateDoc(doc(db, "projects", id), { ...data, updatedAt: serverTimestamp() });
};

export const deleteProject = async (id) => {
  if (!FIREBASE_CONFIGURED) return;
  return deleteDoc(doc(db, "projects", id));
};

// ─── TASKS ────────────────────────────────────────────────────────────────────
export const subscribeToTasks = (companyId, callback) => {
  if (!FIREBASE_CONFIGURED) { callback([]); return () => {}; }
  const q = query(collection(db, "tasks"), where("companyId", "==", companyId), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => callback(snap.docs.map(mapDoc)));
};

export const addTask = async (data) => {
  if (!FIREBASE_CONFIGURED) return;
  return addDoc(collection(db, "tasks"), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp(), comments: [] });
};

export const updateTask = async (id, data) => {
  if (!FIREBASE_CONFIGURED) return;
  return updateDoc(doc(db, "tasks", id), { ...data, updatedAt: serverTimestamp() });
};

export const deleteTask = async (id) => {
  if (!FIREBASE_CONFIGURED) return;
  return deleteDoc(doc(db, "tasks", id));
};

// ─── WORKERS ──────────────────────────────────────────────────────────────────
export const subscribeToWorkers = (companyId, callback) => {
  if (!FIREBASE_CONFIGURED) { callback([]); return () => {}; }
  const q = query(collection(db, "workers"), where("companyId", "==", companyId));
  return onSnapshot(q, (snap) => callback(snap.docs.map(mapDoc)));
};

export const addWorker = async (data) => {
  if (!FIREBASE_CONFIGURED) return;
  return addDoc(collection(db, "workers"), { ...data, joinDate: serverTimestamp() });
};

export const updateWorker = async (id, data) => {
  if (!FIREBASE_CONFIGURED) return;
  return updateDoc(doc(db, "workers", id), data);
};

export const deleteWorker = async (id) => {
  if (!FIREBASE_CONFIGURED) return;
  return deleteDoc(doc(db, "workers", id));
};

// ─── ATTENDANCE ───────────────────────────────────────────────────────────────
export const subscribeToAttendance = (companyId, dateStr, callback) => {
  if (!FIREBASE_CONFIGURED) { callback([]); return () => {}; }
  const startOfDay = Timestamp.fromDate(new Date(dateStr + "T00:00:00"));
  const endOfDay = Timestamp.fromDate(new Date(dateStr + "T23:59:59"));
  const q = query(
    collection(db, "attendance"),
    where("companyId", "==", companyId),
    where("date", ">=", startOfDay),
    where("date", "<=", endOfDay)
  );
  return onSnapshot(q, (snap) => callback(snap.docs.map(mapDoc)));
};

export const getAttendanceByMonth = async (companyId, yearMonth) => {
  if (!FIREBASE_CONFIGURED) return [];
  const start = Timestamp.fromDate(new Date(`${yearMonth}-01T00:00:00`));
  const daysInMonth = new Date(yearMonth.split("-")[0], yearMonth.split("-")[1], 0).getDate();
  const end = Timestamp.fromDate(new Date(`${yearMonth}-${daysInMonth}T23:59:59`));
  const q = query(collection(db, "attendance"), where("companyId", "==", companyId), where("date", ">=", start), where("date", "<=", end));
  const snap = await getDocs(q);
  return snap.docs.map(mapDoc);
};

export const upsertAttendance = async (data) => {
  if (!FIREBASE_CONFIGURED) return;
  // Check for existing record for same worker + date
  const dateTs = Timestamp.fromDate(new Date(data.dateStr + "T00:00:00"));
  const q = query(collection(db, "attendance"), where("workerId", "==", data.workerId), where("date", "==", dateTs));
  const existing = await getDocs(q);
  const record = { ...data, date: dateTs, markedAt: serverTimestamp() };
  delete record.dateStr;
  if (!existing.empty) {
    return updateDoc(doc(db, "attendance", existing.docs[0].id), record);
  }
  return addDoc(collection(db, "attendance"), record);
};

// ─── MATERIALS ────────────────────────────────────────────────────────────────
export const subscribeToMaterials = (companyId, callback) => {
  if (!FIREBASE_CONFIGURED) { callback([]); return () => {}; }
  const q = query(collection(db, "materials"), where("companyId", "==", companyId));
  return onSnapshot(q, (snap) => callback(snap.docs.map(mapDoc)));
};

export const addMaterial = async (data) => {
  if (!FIREBASE_CONFIGURED) return;
  return addDoc(collection(db, "materials"), { ...data, lastUpdated: serverTimestamp() });
};

export const updateMaterial = async (id, data) => {
  if (!FIREBASE_CONFIGURED) return;
  return updateDoc(doc(db, "materials", id), { ...data, lastUpdated: serverTimestamp() });
};

export const deleteMaterial = async (id) => {
  if (!FIREBASE_CONFIGURED) return;
  return deleteDoc(doc(db, "materials", id));
};

// ─── DAILY LOGS ───────────────────────────────────────────────────────────────
export const subscribeToDailyLogs = (companyId, callback) => {
  if (!FIREBASE_CONFIGURED) { callback([]); return () => {}; }
  const q = query(collection(db, "dailyLogs"), where("companyId", "==", companyId), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => callback(snap.docs.map(mapDoc)));
};

export const addDailyLog = async (data) => {
  if (!FIREBASE_CONFIGURED) return;
  return addDoc(collection(db, "dailyLogs"), { ...data, createdAt: serverTimestamp() });
};

export const updateDailyLog = async (id, data) => {
  if (!FIREBASE_CONFIGURED) return;
  return updateDoc(doc(db, "dailyLogs", id), data);
};

export const deleteDailyLog = async (id) => {
  if (!FIREBASE_CONFIGURED) return;
  return deleteDoc(doc(db, "dailyLogs", id));
};

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
export const subscribeToNotifications = (userId, callback) => {
  if (!FIREBASE_CONFIGURED) { callback([]); return () => {}; }
  const q = query(collection(db, "notifications"), where("userId", "==", userId), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => callback(snap.docs.map(mapDoc)));
};

export const addNotification = async (data) => {
  if (!FIREBASE_CONFIGURED) return;
  return addDoc(collection(db, "notifications"), { ...data, createdAt: serverTimestamp(), read: false });
};

export const markNotifRead = async (id) => {
  if (!FIREBASE_CONFIGURED) return;
  return updateDoc(doc(db, "notifications", id), { read: true });
};

export const markAllNotifsRead = async (userId) => {
  if (!FIREBASE_CONFIGURED) return;
  const q = query(collection(db, "notifications"), where("userId", "==", userId), where("read", "==", false));
  const snap = await getDocs(q);
  const updates = snap.docs.map((d) => updateDoc(doc(db, "notifications", d.id), { read: true }));
  return Promise.all(updates);
};

export const deleteNotification = async (id) => {
  if (!FIREBASE_CONFIGURED) return;
  return deleteDoc(doc(db, "notifications", id));
};

// ─── PURCHASE ORDERS ──────────────────────────────────────────────────────────
export const subscribeToPurchaseOrders = (companyId, callback) => {
  if (!FIREBASE_CONFIGURED) { callback([]); return () => {}; }
  const q = query(collection(db, "purchaseOrders"), where("companyId", "==", companyId), orderBy("orderDate", "desc"));
  return onSnapshot(q, (snap) => callback(snap.docs.map(mapDoc)));
};

export const addPurchaseOrder = async (data) => {
  if (!FIREBASE_CONFIGURED) return;
  return addDoc(collection(db, "purchaseOrders"), { ...data, orderDate: serverTimestamp() });
};

export const updatePurchaseOrder = async (id, data) => {
  if (!FIREBASE_CONFIGURED) return;
  return updateDoc(doc(db, "purchaseOrders", id), data);
};

// ─── SEED: Push mock data to Firestore ────────────────────────────────────────
// Call this once after login to populate Firestore with initial demo data
export const seedFirestore = async (companyId, userId, mockData) => {
  if (!FIREBASE_CONFIGURED) return;
  const { PROJECTS, TASKS, WORKERS, MATERIALS, NOTIFICATIONS } = mockData;

  const projectIdMap = {};
  for (const p of PROJECTS) {
    const ref = await addDoc(collection(db, "projects"), {
      ...p, id: undefined, companyId, createdBy: userId,
      createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
      photos: [], workerIds: [],
    });
    projectIdMap[p.id] = ref.id;
  }

  for (const t of TASKS) {
    await addDoc(collection(db, "tasks"), {
      ...t, id: undefined, companyId,
      projectId: projectIdMap[t.projectId] || t.projectId,
      createdAt: serverTimestamp(), updatedAt: serverTimestamp(), comments: [],
    });
  }

  for (const w of WORKERS) {
    await addDoc(collection(db, "workers"), {
      ...w, id: undefined, companyId,
      projectId: projectIdMap[w.projectId] || w.projectId,
      joinDate: serverTimestamp(),
    });
  }

  for (const m of MATERIALS) {
    await addDoc(collection(db, "materials"), {
      ...m, id: undefined, companyId,
      projectId: projectIdMap[m.projectId] || m.projectId,
      lastUpdated: serverTimestamp(), updatedBy: userId,
    });
  }

  for (const n of NOTIFICATIONS) {
    await addDoc(collection(db, "notifications"), {
      ...n, id: undefined, userId, companyId, createdAt: serverTimestamp(),
    });
  }

  console.log("✅ Firestore seeded with demo data");
};
