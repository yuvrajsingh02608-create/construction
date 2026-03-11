import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MapPin, Users, TrendingUp, X, Search, Calendar, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import MapPicker from '../components/MapPicker';

const STATUS_TABS = ['All', 'active', 'completed', 'onhold'];

export default function Projects() {
  const { currentUser } = useAuth();
  const { projects, addProject, workers, users, showToast } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', location: '', client: '', startDate: '', endDate: '', budget: '', description: '', managerId: '', supervisorId: '', geofenceLat: '', geofenceLng: '', geofenceRadius: 300 });
  const [errors, setErrors] = useState({});

  const filtered = projects.filter(p => {
    const matchTab = activeTab === 'All' || p.status === activeTab;
    const matchSearch = (p.name || '').toLowerCase().includes(search.toLowerCase()) || (p.client || '').toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name) errs.name = 'Required';
    if (!form.client) errs.client = 'Required';
    if (!form.budget) errs.budget = 'Required';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const projectData = {
      ...form,
      budget: Number(form.budget),
      spent: 0,
      progress: 0,
      status: 'active',
      workers: 0,
      managerId: currentUser?.role === 'owner' ? form.managerId : (form.managerId || currentUser?.id),
      supervisorId: form.supervisorId,
      geofence: {
        lat: form.geofenceLat ? Number(form.geofenceLat) : null,
        lng: form.geofenceLng ? Number(form.geofenceLng) : null,
        radius: form.geofenceRadius ? Number(form.geofenceRadius) : 300
      }
    };

    addProject(projectData);
    setShowModal(false);
    setForm({ name: '', location: '', client: '', startDate: '', endDate: '', budget: '', description: '', managerId: '', supervisorId: '', geofenceLat: '', geofenceLng: '', geofenceRadius: 300 });
    setErrors({});
  };

  const statusColor = (s) => {
    if (s === 'active') return 'bg-green-100 text-green-700';
    if (s === 'completed') return 'bg-red-100 text-red-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="section-header dark:text-white">Projects</h2>
          <p className="text-sm text-gray-500">
            {currentUser?.role === 'owner' ? `${projects.length} total projects` : 
             currentUser?.role === 'manager' ? `${projects.length} assigned projects` : 
             `${projects.length} assigned site${projects.length === 1 ? '' : 's'}`}
          </p>
        </div>
        {(currentUser?.role === 'owner' || currentUser?.role === 'manager') && (
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Add Project
          </button>
        )}
      </div>

      {/* Search + Tabs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)}
            className="input-field pl-9" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize
                ${activeTab === tab ? 'bg-[#CC0000] text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map(p => {
          const workerCount = workers.filter(w => w.projectId === p.id).length;
          const budgetPct = Math.round(p.spent / p.budget * 100);
          return (
            <div key={p.id} className="card dark:bg-gray-800 hover:shadow-xl transition-shadow duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 dark:text-white truncate">{p.name || 'Unnamed Project'}</h3>
                  <p className="text-sm text-gray-500">{p.client || 'Unknown Client'}</p>
                </div>
                <span className={`badge ml-2 flex-shrink-0 ${statusColor(p.status)}`}>{p.status || 'unknown'}</span>
              </div>

              <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                <MapPin size={14} /> {p.location}
              </div>

              {/* Progress */}
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Progress</span>
                  <span className="font-semibold text-[#CC0000]">{p.progress}%</span>
                </div>
                <div className="bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div className="h-2 rounded-full bg-gradient-to-r from-[#CC0000] to-[#AA0000]" style={{ width: `${p.progress}%` }} />
                </div>
              </div>

              {/* Budget */}
              {/* Budget visibility for all roles */}
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Budget Used</span>
                  <span className={`font-semibold ${budgetPct > 80 ? 'text-red-600' : 'text-gray-700 dark:text-gray-200'}`}>{budgetPct}%</span>
                </div>
                <div className="bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div className={`h-2 rounded-full ${budgetPct > 80 ? 'bg-red-500' : 'bg-[#FF6F00]'}`} style={{ width: `${Math.min(budgetPct, 100)}%` }} />
                </div>
                <div className="flex justify-between text-xs mt-1 text-gray-400">
                  <span>₹{((p.spent || 0) / 100000).toFixed(1)}L spent</span>
                  <span>₹{((p.budget || 0) / 100000).toFixed(1)}L total</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Users size={14} /> {workerCount} workers
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Calendar size={14} /> {p.endDate}
                </div>
              </div>

              <button onClick={() => navigate(`/projects/${p.id}`)}
                className="btn-primary w-full mt-4 text-sm py-2">
                View Details
              </button>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">
            <Building2 size={48} className="mx-auto mb-2 opacity-30" />
            <p>No projects found</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay p-4 sm:p-6" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b dark:border-gray-700">
              <h3 className="text-lg font-bold text-[#1A1A1A] dark:text-white">Add New Project</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
              {[
                { key: 'name', label: 'Project Name', type: 'text', placeholder: 'e.g. Residential Tower B' },
                { key: 'client', label: 'Client Name', type: 'text', placeholder: 'e.g. ABC Developers' },
                { key: 'location', label: 'Location', type: 'text', placeholder: 'e.g. Sector 62, Noida' },
                { key: 'budget', label: 'Budget (₹)', type: 'number', placeholder: 'e.g. 5000000' },
                { key: 'startDate', label: 'Start Date', type: 'date' },
                { key: 'endDate', label: 'End Date', type: 'date' },
              ].map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">{label}</label>
                  <input type={type} placeholder={placeholder} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className={`input-field dark:bg-gray-700 dark:text-white dark:border-gray-600 ${errors[key] ? 'border-red-400 focus:ring-red-400' : ''}`} />
                  {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
                </div>
              ))}

              {/* Geofencing Section */}
              <div className="pt-4 border-t dark:border-gray-700">
                <h4 className="text-sm font-bold text-[#CC0000] mb-3">Site Geofencing (Attendance)</h4>
                
                <MapPicker 
                  lat={form.geofenceLat || 28.6139} 
                  lng={form.geofenceLng || 77.2090} 
                  radius={Number(form.geofenceRadius)} 
                  onLocationChange={(lat, lng) => setForm(f => ({ ...f, geofenceLat: lat, geofenceLng: lng }))}
                />

                <div className="mt-4">
                  <label className="text-xs font-medium text-gray-500 block mb-1">Tracking Radius (Meters)</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" 
                      min="50" 
                      max="1000" 
                      step="50"
                      value={form.geofenceRadius} 
                      onChange={e => setForm(f => ({ ...f, geofenceRadius: e.target.value }))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#CC0000]"
                    />
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300 w-16">{form.geofenceRadius}m</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Description</label>
                <textarea rows={3} placeholder="Project description..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600 resize-none" />
              </div>

              {currentUser?.role === 'owner' && (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Assign Manager</label>
                  <select 
                    value={form.managerId} 
                    onChange={e => setForm(f => ({ ...f, managerId: e.target.value }))}
                    className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  >
                    <option value="">Select a Manager</option>
                    {users.filter(u => u.role === 'manager').map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {(currentUser?.role === 'owner' || currentUser?.role === 'manager') && (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Assign Site Supervisor</label>
                  <select 
                    value={form.supervisorId} 
                    onChange={e => setForm(f => ({ ...f, supervisorId: e.target.value }))}
                    className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  >
                    <option value="">Select a Supervisor</option>
                    {users.filter(u => u.role === 'supervisor').map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
