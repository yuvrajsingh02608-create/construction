import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../api';
import { PROJECTS, TASKS, WORKERS, ATTENDANCE, MATERIALS, DAILY_LOGS, NOTIFICATIONS, USERS, COMMON_MATERIALS, PROJECTS_FILES } from '../data/mockData';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { companyId, currentUser } = useAuth();
  const isDemo = currentUser?.isDemo || !currentUser;
  const cId = (x) => {
    if (!x) return x;
    const id = x._id || x.id || Date.now();
    return { ...x, id: String(id) };
  };

  // Helper to load from localStorage or default to mock
  const getInitial = (key, defaultValue) => {
    if (!isDemo) return [];
    try {
      const saved = localStorage.getItem(`bt_${key}`);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (e) { return defaultValue; }
  };

  // State
  const [projects, setProjects] = useState(() => getInitial('projects', PROJECTS));
  const [tasks, setTasks] = useState(() => getInitial('tasks', TASKS));
  const [workers, setWorkers] = useState(() => getInitial('workers', WORKERS));
  const [attendance, setAttendance] = useState(() => getInitial('attendance', ATTENDANCE));
  const [materials, setMaterials] = useState(() => getInitial('materials', MATERIALS));
  const [dailyLogs, setDailyLogs] = useState(() => getInitial('daily_logs', DAILY_LOGS));
  const [notifications, setNotifications] = useState(() => getInitial('notifications', NOTIFICATIONS));
  const [users, setUsers] = useState(() => getInitial('users', USERS));
  const [logistics, setLogistics] = useState([]);
  const [files, setFiles] = useState(() => getInitial('files', PROJECTS_FILES));

  // Sync back to localStorage in Demo Mode
  useEffect(() => {
    if (!isDemo) return;
    localStorage.setItem('bt_projects', JSON.stringify(projects));
    localStorage.setItem('bt_tasks', JSON.stringify(tasks));
    localStorage.setItem('bt_workers', JSON.stringify(workers));
    localStorage.setItem('bt_attendance', JSON.stringify(attendance));
    localStorage.setItem('bt_materials', JSON.stringify(materials));
    localStorage.setItem('bt_daily_logs', JSON.stringify(dailyLogs));
    localStorage.setItem('bt_notifications', JSON.stringify(notifications));
    localStorage.setItem('bt_users', JSON.stringify(users));
    localStorage.setItem('bt_logistics', JSON.stringify(logistics));
    localStorage.setItem('bt_files', JSON.stringify(files));
  }, [isDemo, projects, tasks, workers, attendance, materials, dailyLogs, notifications, users, logistics, files]);
  
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('buildtrack_dark') === 'true');
  const [globalProject, setGlobalProject] = useState('');
  const [toasts, setToasts] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('buildtrack_dark', darkMode);
  }, [darkMode]);

  // Fetch all data if logged in with real account
  useEffect(() => {
    if (isDemo || !currentUser?.token) return;
    const fetchAll = async () => {
      setDataLoading(true);
      try {
        const [ps, ts, ws, ms, ls, ns, us, fs, logis] = await Promise.all([
          api.getProjects(), api.getTasks(), api.getWorkers(),
          api.getMaterials(), api.getLogs(), api.getNotifications(),
          api.getUsers(), api.getFiles(), api.getLogistics()
        ]);
        // Normalize _id to id for frontend compatibility
        const mapId = (arr) => arr.map(x => ({ ...x, id: x._id || x.id }));
        setProjects(mapId(ps)); setTasks(mapId(ts)); setWorkers(mapId(ws));
        setMaterials(mapId(ms)); setDailyLogs(mapId(ls)); setNotifications(mapId(ns));
        setUsers(mapId(us)); setFiles(mapId(fs)); setLogistics(mapId(logis || []));
      } catch (e) {
        showToast('Error loading data: ' + e.message, 'error');
      } finally {
        setDataLoading(false);
      }
    };
    fetchAll();
  }, [currentUser?.token, isDemo]);

  // Toast system
  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);
  const dismissToast = useCallback((id) => setToasts(prev => prev.filter(t => t.id !== id)), []);
  const toggleDarkMode = () => setDarkMode(d => !d);

  // Wrappers for optimistic UI + API calls
  const execute = async (apiCall, localUpdate, successMsg) => {
    try {
      let resData = null;
      if (!isDemo) resData = await apiCall();
      localUpdate(resData);
      if (successMsg) showToast(successMsg, 'success');
    } catch (e) { showToast(e.message || 'Error occurred', 'error'); }
  };

  // Apply RBAC Filtering & Dynamic Budget Calculation
  const enrichedProjects = projects.map(p => {
    const pid = String(p.id);
    const pLogs = dailyLogs.filter(l => String(l.projectId) === pid);
    
    // 1. Material Cost: Received * UnitPrice
    const pMaterials = materials.filter(m => String(m.projectId) === pid);
    const matCost = pMaterials.reduce((sum, m) => sum + (Number(m.received) * Number(m.unitPrice)), 0);

    // 2. Labour Cost: (Attendance * Wage) + (Daily Log Workers * Hours * 100)
    const pAttendance = attendance.filter(a => {
      const worker = workers.find(w => String(w.id) === String(a.workerId));
      return worker && String(worker.projectId) === pid && (a.status === 'present' || a.status === 'halfday');
    });
    const attLabCost = pAttendance.reduce((sum, a) => {
      const worker = workers.find(w => String(w.id) === String(a.workerId));
      const wage = Number(worker?.dailyWage || 0);
      return sum + (a.status === 'halfday' ? wage / 2 : wage);
    }, 0);

    const logLabCost = pLogs.reduce((sum, l) => {
      const dailyLab = (l.labor || []).reduce((lsum, lb) => lsum + (Number(lb.count || 0) * Number(lb.hours || 0) * 100), 0);
      return sum + dailyLab;
    }, 0);

    const labCost = attLabCost + logLabCost;

    // 3. Equipment Cost: Log Hours * Rate (Assume ₹1000/hr)
    const eqCost = pLogs.reduce((sum, l) => {
      const logEq = (l.equipment || []).reduce((esum, e) => esum + (Number(e.hours || 0) * 1000), 0);
      return sum + logEq;
    }, 0);

    const totalSpent = Number(p.spent || 0) + matCost + labCost + eqCost;

    return { 
      ...p, 
      spent: totalSpent,
      matCost,
      labCost,
      eqCost
    };
  });

  // Calculate dynamic inventory: materials[usage] = SUM(dailyLogs.material.quantity)
  const enrichedMaterials = materials.map(m => {
    const usage = dailyLogs
      .filter(l => String(l.projectId) === String(m.projectId))
      .flatMap(l => l.materials || [])
      .filter(logMat => logMat.name?.toLowerCase() === m.name?.toLowerCase())
      .reduce((sum, logMat) => sum + Number(logMat.quantity || 0), 0);
    
    return { ...m, used: Number(m.used || 0) + usage };
  });

  const filteredProjects = enrichedProjects; // All roles can see and edit all projects as per latest request

  const filteredTasks = tasks; // All roles can see and edit all tasks

  // Logistics functions
  const addLogistics = data => execute(() => api.addLogistics(data), res => setLogistics(prev => [cId(res || data), ...prev]), 'Movement recorded!');
  const updateLogistics = (id, data) => execute(() => api.updateLogistics(id, data), res => setLogistics(prev => prev.map(item => item.id === id ? { ...item, ...(res || data) } : item)), 'Tracking updated!');
  const deleteLogistics = id => execute(() => api.deleteLogistics(id), () => setLogistics(prev => prev.filter(item => item.id !== id)), 'Logistics entry deleted!');


  return (
    <AppContext.Provider value={{
      projects: filteredProjects, tasks: filteredTasks, workers, attendance, materials: enrichedMaterials, dailyLogs, notifications, users,
      commonMaterials: COMMON_MATERIALS, files, logistics, setUsers, setLogistics, setProjects,
      darkMode, toggleDarkMode, toasts, showToast, dismissToast, dataLoading,
      globalProject, setGlobalProject,
      
      // Projects
      addProject: data => execute(() => api.addProject(data), res => setProjects(p => [cId(res || data), ...p]), 'Project created!'),
      updateProject: (id, data) => execute(() => api.updateProject(id, data), res => setProjects(p => p.map(x => x.id === id ? { ...x, ...(res || data) } : x)), 'Project updated!'),
      deleteProject: id => execute(() => api.deleteProject(id), () => setProjects(p => p.filter(x => x.id !== id)), 'Project deleted'),
      
      // Tasks
      addTask: data => execute(() => api.addTask(data), res => setTasks(p => [cId(res || data), ...p]), 'Task created!'),
      updateTask: (id, data) => execute(() => api.updateTask(id, data), res => setTasks(p => p.map(x => x.id === id ? { ...x, ...(res || data) } : x)), 'Task updated!'),
      deleteTask: id => execute(() => api.deleteTask(id), () => setTasks(p => p.filter(x => x.id !== id)), 'Task deleted'),
      
      // Workers
      addWorker: data => execute(() => api.addWorker(data), res => setWorkers(p => [cId(res || data), ...p]), 'Worker added!'),
      updateWorker: (id, data) => execute(() => api.updateWorker(id, data), res => setWorkers(p => p.map(x => x.id === id ? { ...x, ...(res || data) } : x)), 'Worker updated!'),
      deleteWorker: id => execute(() => api.deleteWorker(id), () => setWorkers(p => p.filter(x => x.id !== id)), 'Worker removed'),
      
      // Materials
      addMaterial: data => execute(() => api.addMaterial(data), res => setMaterials(p => [cId(res || data), ...p]), 'Material added!'),
      updateMaterial: (id, data) => execute(() => api.updateMaterial(id, data), res => setMaterials(p => p.map(x => x.id === id ? { ...x, ...(res || data) } : x)), 'Material updated!'),
      deleteMaterial: id => execute(() => api.deleteMaterial(id), () => setMaterials(p => p.filter(x => x.id !== id)), 'Material deleted'),
      
      // Logs
      addDailyLog: data => execute(() => api.addLog(data), res => setDailyLogs(p => [cId(res || data), ...p]), 'Log saved!'),
      updateDailyLog: (id, data) => execute(() => api.updateLog(id, data), res => setDailyLogs(p => p.map(x => x.id === id ? { ...x, ...(res || data) } : x)), 'Log updated!'),
      deleteDailyLog: id => execute(() => api.deleteLog(id), () => setDailyLogs(p => p.filter(x => x.id !== id)), 'Log deleted'),
      
      // Attendance
      saveAttendance: async (records) => {
        try {
          if (!isDemo) await api.saveAttendance(records);
          setAttendance(prev => {
            const filtered = prev.filter(a => !records.some(r => r.workerId === a.workerId && r.date === a.date));
            return [...filtered, ...records.map(r => ({ id: Date.now() + r.workerId, ...r }))];
          });
          showToast('Attendance saved!', 'success');
        } catch (e) { showToast('Error saving attendance', 'error'); }
      },

      // Notifications
      markNotificationRead: async id => {
        setNotifications(p => p.map(n => n.id === id ? { ...n, read: true } : n));
        if (!isDemo) { try { await api.removeNotification(id); } catch (e) {} }
      },
      markAllRead: async () => {
        setNotifications(p => p.map(n => ({ ...n, read: true })));
        showToast('All marked as read', 'success');
        if (!isDemo) { try { await api.markAllRead(); } catch (e) {} }
      },
      removeNotification: async id => {
        setNotifications(p => p.filter(n => String(n.id) !== String(id)));
        if (!isDemo) { try { await api.removeNotification(id); } catch (e) {} }
      },

      // Files
      uploadFile: data => execute(() => api.uploadFile(data), res => setFiles(f => [cId(res || data), ...f]), 'File uploaded!'),
      deleteFile: id => execute(() => api.deleteFile(id), () => setFiles(f => f.filter(x => x.id !== id)), 'File deleted'),
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
