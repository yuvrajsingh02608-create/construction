import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Users, DollarSign, AlertTriangle, Plus, X, Upload, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { uploadMultiplePhotos } from '../firebase/storageService';
import { FIREBASE_CONFIGURED } from '../firebase/config';

const TABS = ['Overview', 'Daily Logs', 'Tasks', 'Team', 'Photos'];

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const { projects, tasks, workers, dailyLogs, updateProject, showToast } = useApp();
  const [tab, setTab] = useState('Overview');
  const [photos, setPhotos] = useState([]);
  const [lightbox, setLightbox] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const userRole = userProfile?.role || currentUser?.role;

  const project = projects.find(p => String(p.id) === String(id));
  if (!project) return (
    <div className="text-center py-20 fade-in">
      <p className="text-gray-400 text-lg">Project not found</p>
      <button onClick={() => navigate('/projects')} className="btn-primary mt-4">← Back to Projects</button>
    </div>
  );

  const projectTasks = tasks.filter(t => t.projectId === project.id);
  const projectWorkers = workers.filter(w => w.projectId === project.id);
  const projectLogs = dailyLogs.filter(l => l.projectId === project.id);
  const budgetPct = Math.round(project.spent / project.budget * 100);
  const daysRemaining = Math.ceil((new Date(project.endDate) - new Date()) / (1000 * 60 * 60 * 24));

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true); setUploadProgress(0);
    try {
      if (FIREBASE_CONFIGURED && userProfile?.companyId) {
        // Upload to Firebase Storage
        const urls = await uploadMultiplePhotos(
          files, userProfile.companyId, String(project.id),
          setUploadProgress
        );
        const newPhotos = urls.map(src => ({ src, name: src.split('/').pop() }));
        setPhotos(prev => [...prev, ...newPhotos]);
        // Save URLs to project document
        const allUrls = [...(project.photos || []), ...urls];
        await updateProject(project.id, { photos: allUrls });
        showToast(`${urls.length} photo(s) uploaded!`, 'success');
      } else {
        // Demo mode: use local FileReader
        files.forEach(file => {
          const reader = new FileReader();
          reader.onload = (ev) => setPhotos(prev => [...prev, { src: ev.target.result, name: file.name }]);
          reader.readAsDataURL(file);
        });
        showToast('Photos added (demo mode — not saved to cloud)', 'info');
      }
    } catch (err) {
      showToast('Upload failed: ' + err.message, 'error');
    } finally { setUploading(false); }
  };

  const taskStatus = { todo: 0, inprogress: 0, review: 0, done: 0 };
  projectTasks.forEach(t => { taskStatus[t.status] = (taskStatus[t.status] || 0) + 1; });

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/projects')} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
        </button>
        <div className="flex-1">
          <h2 className="section-header dark:text-white">{project.name}</h2>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
            <MapPin size={14} /> {project.location} · {project.client}
          </div>
        </div>
        <span className={`badge ${project.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-50 text-[#CC0000]'}`}>
          {project.status}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl overflow-x-auto">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
              ${tab === t ? 'bg-white dark:bg-gray-700 text-[#CC0000] shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'Overview' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Workers', value: projectWorkers.length, icon: Users, color: '#1A1A1A' },
                { label: 'Tasks', value: projectTasks.length, icon: Plus, color: '#CC0000' },
                { label: 'Days Left', value: Math.max(daysRemaining, 0), icon: Calendar, color: '#2E7D32' },
                { label: 'Budget %', value: `${budgetPct}%`, icon: DollarSign, color: budgetPct > 80 ? '#CC0000' : '#888888' },
              ].map(s => (
                <div key={s.label} className="card dark:bg-gray-800 p-4 text-center">
                  <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: s.color + '20' }}>
                    <s.icon size={20} style={{ color: s.color }} />
                  </div>
                  <p className="text-xl font-bold text-gray-800 dark:text-white">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Budget Tracker */}
            <div className="card dark:bg-gray-800">
              <h3 className="font-bold text-gray-800 dark:text-white mb-4">Budget Tracker</h3>
              {budgetPct > 80 && (
                <div className="flex items-center gap-2 text-orange-600 bg-orange-50 dark:bg-orange-900/20 rounded-lg px-3 py-2 mb-3 text-sm">
                  <AlertTriangle size={16} /> Budget usage above 80% — review expenses
                </div>
              )}
              <div className="space-y-3">
                {[
                  { label: 'Labor Cost', value: project.labCost || 0, color: '#CC0000' },
                  { label: 'Material Cost', value: project.matCost || 0, color: (project.matCost / project.budget) > 1 ? '#CC0000' : '#1A1A1A' },
                  { label: 'Equipment Cost', value: project.eqCost || 0, color: '#888888' },
                ].map(item => {
                  const pct = Math.round(item.value / project.budget * 100);
                  return (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                        <span className="font-medium text-gray-800 dark:text-white">₹{(item.value / 100000).toFixed(1)}L ({pct}%)</span>
                      </div>
                      <div className="bg-gray-200 dark:bg-gray-600 rounded-full h-2 overflow-hidden">
                        <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: item.color }} />
                      </div>
                    </div>
                  );
                })}
                <div className="pt-2 border-t dark:border-gray-700 flex justify-between font-semibold">
                  <span className="text-gray-700 dark:text-gray-300">Total Spent</span>
                  <span className="text-[#CC0000]">₹{(project.spent / 100000).toFixed(1)}L / ₹{(project.budget / 100000).toFixed(1)}L</span>
                </div>
              </div>
            </div>

            {/* Task Summary */}
            <div className="card dark:bg-gray-800">
              <h3 className="font-bold text-gray-800 dark:text-white mb-4">Task Summary</h3>
              <div className="grid grid-cols-4 gap-3">
                {Object.entries({ todo: ['To Do', '#888888'], inprogress: ['In Progress', '#CC0000'], review: ['Review', '#F57F17'], done: ['Done', '#2E7D32'] }).map(([k, [label, color]]) => (
                  <div key={k} className="text-center p-3 rounded-xl" style={{ backgroundColor: color + '15' }}>
                    <p className="text-2xl font-bold" style={{ color }}>{taskStatus[k] || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Project Info */}
          <div className="card dark:bg-gray-800 h-fit">
            <h3 className="font-bold text-gray-800 dark:text-white mb-4">Project Info</h3>
            <div className="space-y-3">
              {[
                { label: 'Client', value: project.client },
                { label: 'Location', value: project.location },
                { label: 'Start Date', value: project.startDate },
                { label: 'End Date', value: project.endDate },
                { label: 'Description', value: project.description },
              ].map(({ label, value }) => (
                <div key={label} className="border-b dark:border-gray-700 pb-3">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-200 mt-0.5">{value || '—'}</p>
                </div>
              ))}
            </div>
            {/* Progress Ring */}
            <div className="mt-4 flex flex-col items-center">
              <div className="relative w-28 h-28">
                <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" stroke="#e5e7eb" strokeWidth="12" fill="none" />
                  <circle cx="60" cy="60" r="50" stroke="#CC0000" strokeWidth="12" fill="none"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - project.progress / 100)}`}
                    strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-[#CC0000]">{project.progress}%</span>
                  <span className="text-xs text-gray-400">Complete</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Daily Logs Tab */}
      {tab === 'Daily Logs' && (
        <div className="space-y-4">
          {projectLogs.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p>No logs yet for this project.</p>
            </div>
          )}
          {projectLogs.map(log => (
            <div key={log.id} className="card dark:bg-gray-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {log.weather === 'Sunny' ? '☀️' : log.weather === 'Cloudy' ? '⛅' : log.weather === 'Rainy' ? '🌧️' : '💨'}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">{log.date}</p>
                    <p className="text-xs text-gray-400">{log.weather}</p>
                  </div>
                </div>
                <div className="flex gap-4 text-sm text-gray-500">
                  <span>{log.labor.reduce((s, l) => s + l.count, 0)} workers</span>
                  <span>{log.materials.length} materials</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{log.notes}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tasks Tab */}
      {tab === 'Tasks' && (
        <div className="space-y-3">
          {projectTasks.map(t => (
            <div key={t.id} className={`card dark:bg-gray-800 border-l-4 ${t.priority === 'high' ? 'border-red-500' : t.priority === 'medium' ? 'border-yellow-400' : 'border-green-500'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-800 dark:text-white">{t.title}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{t.description}</p>
                </div>
                <div className="flex flex-col items-end gap-2 ml-4">
                  <span className={`badge text-xs ${t.status === 'done' ? 'bg-green-100 text-green-700' : t.status === 'inprogress' ? 'bg-red-50 text-[#CC0000]' : t.status === 'review' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                    {t.status}
                  </span>
                  <span className={`text-xs ${t.priority === 'high' ? 'text-red-600' : t.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'}`}>
                    {t.priority} priority
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">Due: {t.dueDate}</p>
            </div>
          ))}
        </div>
      )}

      {/* Team Tab */}
      {tab === 'Team' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projectWorkers.map(w => (
            <div key={w.id} className="card dark:bg-gray-800 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white font-bold flex-shrink-0">
                {w.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-white">{w.name}</p>
                <p className="text-sm text-gray-500">{w.role}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Photos Tab */}
      {tab === 'Photos' && (
        <div className="space-y-4">
          <label className={`btn-primary flex items-center gap-2 w-fit cursor-pointer ${uploading ? 'opacity-60 cursor-not-allowed' : ''}`}>
            {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
            {uploading ? `Uploading ${uploadProgress}%...` : 'Upload Photos'}
            <input type="file" multiple accept="image/*" className="hidden" disabled={uploading} onChange={handlePhotoUpload} />
          </label>
          {photos.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Upload size={48} className="mx-auto mb-2 opacity-30" />
              <p>No photos uploaded yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((ph, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-shadow" onClick={() => setLightbox(ph.src)}>
                  <img src={ph.src} alt={ph.name} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
          {lightbox && (
            <div className="modal-overlay" onClick={() => setLightbox(null)}>
              <div className="relative max-w-4xl max-h-[90vh]">
                <img src={lightbox} alt="fullscreen" className="max-w-full max-h-[90vh] rounded-xl object-contain" />
                <button onClick={() => setLightbox(null)} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1"><X size={20} /></button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
