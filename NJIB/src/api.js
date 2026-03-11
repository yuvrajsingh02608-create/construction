const API_URL = 'http://192.168.1.4:5001/api';

const getHeaders = () => {
  const token = localStorage.getItem('buildtrack_fb_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'API Error');
  return data;
};

export const api = {
  // Auth & Users
  syncUser: (data) => fetch(`${API_URL}/auth/sync`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  getUsers: () => fetch(`${API_URL}/auth/users`, { headers: getHeaders() }).then(handleResponse),
  deleteUser: (id) => fetch(`${API_URL}/auth/users/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),

  // Projects
  getProjects: () => fetch(`${API_URL}/projects`, { headers: getHeaders() }).then(handleResponse),
  addProject: (data) => fetch(`${API_URL}/projects`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  updateProject: (id, data) => fetch(`${API_URL}/projects/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  deleteProject: (id) => fetch(`${API_URL}/projects/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),
  assignProject: (id, data) => fetch(`${API_URL}/projects/${id}/assign`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),

  // Tasks
  getTasks: () => fetch(`${API_URL}/tasks`, { headers: getHeaders() }).then(handleResponse),
  addTask: (data) => fetch(`${API_URL}/tasks`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  updateTask: (id, data) => fetch(`${API_URL}/tasks/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  deleteTask: (id) => fetch(`${API_URL}/tasks/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),

  // Workers
  getWorkers: () => fetch(`${API_URL}/workers`, { headers: getHeaders() }).then(handleResponse),
  addWorker: (data) => fetch(`${API_URL}/workers`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  updateWorker: (id, data) => fetch(`${API_URL}/workers/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  deleteWorker: (id) => fetch(`${API_URL}/workers/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),

  // Materials
  getMaterials: () => fetch(`${API_URL}/materials`, { headers: getHeaders() }).then(handleResponse),
  addMaterial: (data) => fetch(`${API_URL}/materials`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  updateMaterial: (id, data) => fetch(`${API_URL}/materials/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  deleteMaterial: (id) => fetch(`${API_URL}/materials/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),

  // Logs
  getLogs: () => fetch(`${API_URL}/logs`, { headers: getHeaders() }).then(handleResponse),
  addLog: (data) => fetch(`${API_URL}/logs`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  updateLog: (id, data) => fetch(`${API_URL}/logs/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  deleteLog: (id) => fetch(`${API_URL}/logs/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),

  // Attendance
  getAttendance: (date) => fetch(`${API_URL}/workers/attendance${date ? `?date=${date}` : ''}`, { headers: getHeaders() }).then(handleResponse),
  saveAttendance: (records) => fetch(`${API_URL}/workers/attendance/bulk`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ records }) }).then(handleResponse),
  pingLocation: (data) => fetch(`${API_URL}/attendance/ping-location`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  getSupervisorAttendance: (projectId, date) => fetch(`${API_URL}/attendance/supervisor/${projectId}${date ? `?date=${date}` : ''}`, { headers: getHeaders() }).then(handleResponse),

  // Notifications
  getNotifications: () => fetch(`${API_URL}/notifications`, { headers: getHeaders() }).then(handleResponse),
  markAllRead: () => fetch(`${API_URL}/notifications/mark-all-read`, { method: 'PUT', headers: getHeaders() }).then(handleResponse),
  removeNotification: (id) => fetch(`${API_URL}/notifications/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),

  // Files
  getFiles: () => fetch(`${API_URL}/files`, { headers: getHeaders() }).then(handleResponse),
  uploadFile: (data) => fetch(`${API_URL}/files`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  deleteFile: (id) => fetch(`${API_URL}/files/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),

  // Logistics
  getLogistics: () => fetch(`${API_URL}/logistics`, { headers: getHeaders() }).then(handleResponse),
  addLogistics: (data) => fetch(`${API_URL}/logistics`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  updateLogistics: (id, data) => fetch(`${API_URL}/logistics/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  deleteLogistics: (id) => fetch(`${API_URL}/logistics/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),
};
