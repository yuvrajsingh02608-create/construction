import { useState } from 'react';
import { CheckCircle, Download, User, MapPin, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

const STATUS_OPTIONS = [
  { key: 'present', label: 'Present', color: 'bg-green-100 text-green-700 hover:bg-green-200', activeColor: 'bg-green-500 text-white' },
  { key: 'absent', label: 'Absent', color: 'bg-red-100 text-red-700 hover:bg-red-200', activeColor: 'bg-red-500 text-white' },
  { key: 'halfday', label: 'Half Day', color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200', activeColor: 'bg-yellow-500 text-white' },
];

export default function Attendance() {
  const { currentUser, userProfile } = useAuth();
  const userRole = userProfile?.role || currentUser?.role;
  const { workers, attendance, saveAttendance: saveAttendanceCtx, projects, showToast, globalProject, setGlobalProject, addWorker } = useApp();
  const [selectedProject, setSelectedProject] = useState(globalProject || projects[0]?.id || '');
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [workerForm, setWorkerForm] = useState({ name: '', role: 'Laborer', phone: '' });

  // Sync project select
  const handleProjectChange = (e) => {
    setSelectedProject(e.target.value);
    setGlobalProject(e.target.value);
  };
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [todayAttendance, setTodayAttendance] = useState({});

  const projectWorkers = workers.filter(w => String(w.projectId) === String(selectedProject) && w.status === 'active');

  const getStatus = (workerId) => {
    if (todayAttendance[workerId]) return todayAttendance[workerId];
    const existing = attendance.find(a => a.workerId === workerId && a.date === selectedDate);
    return existing?.status || 'present';
  };

  const setStatus = (workerId, status) => {
    setTodayAttendance(prev => ({ ...prev, [workerId]: status }));
  };

  const markAllPresent = () => {
    const updates = {};
    projectWorkers.forEach(w => { updates[w.id] = 'present'; });
    setTodayAttendance(updates);
  };

  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsLocation, setGpsLocation] = useState(null);
  const [gpsError, setGpsError] = useState('');

  // ── GPS helpers ──────────────────────────────────────────────────────────────
  const getLocation = () => new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ lat: coords.latitude, lng: coords.longitude }),
      reject,
      { enableHighAccuracy: true, timeout: 10000 }
    )
  );

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371e3, toRad = d => d * Math.PI / 180;
    const a = Math.sin((toRad(lat2) - toRad(lat1)) / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin((toRad(lng2) - toRad(lng1)) / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const captureGPS = async () => {
    setGpsLoading(true); setGpsError('');
    try {
      const loc = await getLocation();
      setGpsLocation(loc);
      showToast(`📍 Location captured: ${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`, 'success');
    } catch {
      setGpsError('GPS unavailable or permission denied');
      showToast('GPS unavailable — attendance will save without location', 'warning');
    } finally { setGpsLoading(false); }
  };

  const saveAttendance = async () => {
    const records = projectWorkers.map(w => ({
      workerId: w.id,
      projectId: selectedProject,
      date: selectedDate,
      dateStr: selectedDate,
      status: todayAttendance[w.id] || getStatus(w.id) || 'present',
      ...(gpsLocation ? { location: gpsLocation } : {}),
    }));
    await saveAttendanceCtx(records);
    setTodayAttendance({});
  };

  const handleAddWorker = (e) => {
    e.preventDefault();
    if (!selectedProject) return showToast('Please select a project first', 'error');
    if (!workerForm.name) return;
    addWorker({
      ...workerForm,
      projectId: selectedProject,
      status: 'active',
      dailyWage: 0
    });
    setShowAddWorker(false);
    setWorkerForm({ name: '', role: 'Laborer', phone: '' });
  };

  const getSummary = () => {
    const counts = { present: 0, absent: 0, halfday: 0 };
    projectWorkers.forEach(w => {
      const s = getStatus(w.id);
      if (s && counts[s] !== undefined) counts[s]++;
    });
    return counts;
  };

  const summary = getSummary();

  // Monthly stats
  const getMonthlyStats = (workerId) => {
    const recs = attendance.filter(a => a.workerId === workerId && a.date.startsWith(selectedDate.slice(0, 7)));
    const present = recs.filter(a => a.status === 'present' || a.status === 'halfday').length;
    return { present, total: recs.length };
  };

  const exportCSV = () => {
    const data = projectWorkers.map(w => ({
      name: w.name, role: w.role, date: selectedDate, status: getStatus(w.id) || 'present',
    }));
    const headers = ['Name', 'Role', 'Date', 'Status'];
    const rows = data.map(r => [r.name, r.role, r.date, r.status]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `attendance-${selectedDate}.csv`; a.click();
    showToast('CSV exported!', 'success');
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="section-header dark:text-white">Attendance Tracking</h2>
          <p className="text-sm text-gray-500">{projectWorkers.length} workers on site</p>
        </div>
        <div className="flex gap-2">
          {(userRole === 'owner' || userRole === 'manager' || userRole === 'supervisor') && (
            <button onClick={() => setShowAddWorker(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              <User size={16} /> Add Worker
            </button>
          )}
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-[#CC0000] hover:text-[#CC0000] transition-colors">
            <Download size={16} /> Export CSV
          </button>
          {(userRole === 'owner' || userRole === 'manager' || userRole === 'supervisor') && (
            <button onClick={saveAttendance} className="btn-primary flex items-center gap-2">
              <CheckCircle size={16} /> Save Attendance
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="card dark:bg-gray-800 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Project</label>
          <select value={selectedProject} onChange={handleProjectChange} className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600">
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Date</label>
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { key: 'present', label: 'Present', color: '#2E7D32', bg: 'bg-green-50' },
          { key: 'absent', label: 'Absent', color: '#C62828', bg: 'bg-red-50' },
          { key: 'halfday', label: 'Half Day', color: '#F57F17', bg: 'bg-yellow-50' },
        ].map(s => (
          <div key={s.key} className={`${s.bg} dark:bg-gray-800 rounded-xl p-4 text-center`}>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{summary[s.key]}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* GPS Button */}
      <div className="flex items-center gap-3 card dark:bg-gray-800">
        <button onClick={captureGPS} disabled={gpsLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-50 text-[#CC0000] border border-red-200 hover:bg-red-100 transition-colors">
          {gpsLoading ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
          {gpsLoading ? 'Getting Location...' : 'Capture GPS Location'}
        </button>
        {gpsLocation && (
          <span className="text-xs text-green-600 bg-green-50 px-3 py-1 rounded-full">
            📍 {gpsLocation.lat.toFixed(4)}, {gpsLocation.lng.toFixed(4)}
          </span>
        )}
        {gpsError && <span className="text-xs text-red-500">{gpsError}</span>}
      </div>

      {/* Quick Mark All */}
      {(userRole === 'owner' || userRole === 'manager' || userRole === 'supervisor') && (
        <button onClick={markAllPresent} className="btn-secondary flex items-center gap-2">
          <CheckCircle size={16} className="text-green-600" /> Mark All Present
        </button>
      )}

      {/* Attendance Table */}
      <div className="card dark:bg-gray-800 overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="bg-[#F5F5F5] dark:bg-gray-700">
              <th className="text-left p-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Worker</th>
              <th className="text-left p-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Role</th>
              <th className="text-left p-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Status</th>
            </tr>
          </thead>
          <tbody>
            {projectWorkers.map(worker => {
              const status = getStatus(worker.id);
              return (
                <tr key={worker.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#CC0000]/10 flex items-center justify-center">
                        <User size={16} className="text-[#CC0000]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-white">{worker.name}</p>
                        <p className="text-xs text-gray-400">{worker.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-gray-600 dark:text-gray-400">{worker.role}</td>
                  <td className="p-3">
                    <div className="flex gap-1 flex-wrap">
                      {STATUS_OPTIONS.map(opt => (
                        <button key={opt.key} onClick={() => setStatus(worker.id, opt.key)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors
                            ${status === opt.key ? opt.activeColor : opt.color}`}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {projectWorkers.length === 0 && (
          <p className="text-center text-gray-400 py-8">No active workers on this project</p>
        )}
      </div>

      {/* Monthly Summary */}
      <div className="card dark:bg-gray-800">
        <h3 className="section-header dark:text-white mb-4">Monthly Summary ({selectedDate.slice(0, 7)})</h3>
        <div className="space-y-3">
          {projectWorkers.map(w => {
            const { present, total } = getMonthlyStats(w.id);
            const pct = total > 0 ? Math.round(present / total * 100) : 0;
            return (
              <div key={w.id} className="flex items-center gap-4">
                <div className="w-32 sm:w-40 text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{w.name}</div>
                <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div className={`h-2 rounded-full ${pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
                </div>
                <span className="text-sm text-gray-500 w-20 text-right">{present}/{total} days ({pct}%)</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Worker Modal */}
      {showAddWorker && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAddWorker(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between p-5 border-b dark:border-gray-700">
              <h3 className="font-bold text-gray-800 dark:text-white">Add New Worker</h3>
              <button onClick={() => setShowAddWorker(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddWorker} className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Full Name *</label>
                <input required value={workerForm.name} onChange={e => setWorkerForm(f => ({ ...f, name: e.target.value }))}
                  className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="e.g. Rahul Kumar" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Role/Trade</label>
                <input value={workerForm.role} onChange={e => setWorkerForm(f => ({ ...f, role: e.target.value }))}
                  className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="e.g. Mason, Helper..." />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Phone Number</label>
                <input type="tel" value={workerForm.phone} onChange={e => setWorkerForm(f => ({ ...f, phone: e.target.value }))}
                  className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Optional" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddWorker(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Add Worker</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
