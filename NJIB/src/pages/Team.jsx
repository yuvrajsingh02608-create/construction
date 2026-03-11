import { useState, useEffect } from 'react';
import { Plus, X, Trash2, Shield, Briefcase } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

const ROLE_COLORS = {
  owner: 'bg-red-100 text-[#CC0000]',
  manager: 'bg-gray-100 text-gray-700',
  supervisor: 'bg-green-100 text-green-700',
};

export default function Team() {
  const { showToast, projects, setProjects, users: members, setUsers: setMembers } = useApp();
  const { currentUser } = useAuth();
  
  const [loading, setLoading] = useState(false);
  
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: 'demopassword123', role: 'supervisor', phone: '' });

  // Assign Projects Modal State
  const [assignUser, setAssignUser] = useState(null);
  const [checkedProjects, setCheckedProjects] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    // Users are now managed via AppContext state
    setLoading(false);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) return;
    try {
      // Mock UI addition for now since actual Firebase creation requires Admin SDK or complex flows
      showToast(`${form.name} feature requires Admin SDK in production!`, 'warning');
      setShowForm(false);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleRemove = async (id) => {
    try {
      await api.deleteUser(id);
      setMembers(prev => prev.filter(m => m._id !== id));
      showToast('Member removed from team', 'warning');
      setDeleteConfirm(null);
    } catch (e) {
      showToast('Failed to remove: ' + e.message, 'error');
    }
  };

  const openAssignModal = (user) => {
    setAssignUser(user);
    const initialChecked = {};
    projects.forEach(p => {
      const arr = user.role === 'manager' ? p.assignedManagers : p.assignedSupervisors;
      initialChecked[p.id] = (arr || []).includes(user._id);
    });
    setCheckedProjects(initialChecked);
  };

  const handleAssignSave = async () => {
    try {
      const promises = projects.map(p => {
        const isAssigned = checkedProjects[p.id];
        let arr = userRoleArray(p, assignUser.role);
        const originallyAssigned = arr.includes(assignUser._id);
        
        if (isAssigned && !originallyAssigned) {
          arr = [...arr, assignUser._id];
          return api.assignProject(p.id, getAssignPayload(assignUser.role, arr));
        } else if (!isAssigned && originallyAssigned) {
          arr = arr.filter(id => id !== assignUser._id);
          return api.assignProject(p.id, getAssignPayload(assignUser.role, arr));
        }
        return null;
      }).filter(Boolean);

      if (promises.length > 0) {
        await Promise.all(promises);
        const updatedProjects = await api.getProjects();
        const mapId = (arr) => arr.map(x => ({ ...x, id: x._id || x.id }));
        setProjects(mapId(updatedProjects));
        showToast('Project assignments updated!', 'success');
      }
      setAssignUser(null);
    } catch (e) {
      showToast('Error updating assignments: ' + e.message, 'error');
    }
  };

  const userRoleArray = (project, role) => role === 'manager' ? (project.assignedManagers || []) : (project.assignedSupervisors || []);
  const getAssignPayload = (role, newArray) => role === 'manager' ? { assignedManagers: newArray } : { assignedSupervisors: newArray };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading team...</div>;

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-header dark:text-white">Team Members</h2>
          <p className="text-sm text-gray-500">
            {currentUser?.role === 'owner' ? `${members.length} total members` : 'Assigned team members'}
          </p>
        </div>
        {true && (
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Add Member
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map(m => (
          <div key={m._id} className="card dark:bg-gray-800 hover:shadow-xl transition-shadow flex flex-col justify-between">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1A1A1A] to-[#CC0000] flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                {m.avatar || m.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-800 dark:text-white">{m.name}</h3>
                <p className="text-sm text-gray-500 truncate">{m.email}</p>
                {m.phone && <p className="text-xs text-gray-400 mt-0.5">{m.phone}</p>}
              </div>
            </div>
            
            <div className="mt-auto pt-4 border-t dark:border-gray-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className={`badge flex items-center gap-1 ${ROLE_COLORS[m.role]}`}>
                  <Shield size={12} /> {m.role}
                </span>
                {m._id !== currentUser?.id && (
                  <button onClick={() => setDeleteConfirm(m._id)}
                    className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              
              {m.role !== 'owner' && m._id !== currentUser?.id && (
                <button onClick={() => openAssignModal(m)} className="w-full flex justify-center items-center gap-2 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-[#CC0000] font-medium hover:bg-red-50 dark:hover:bg-gray-600 transition-colors">
                  <Briefcase size={14} /> Assign Projects
                </button>
              )}
            </div>
          </div>
        ))}
        {members.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center text-gray-400">
            <p>No team members found.</p>
          </div>
        )}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
             <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
               <h3 className="text-lg font-bold text-[#1A1A1A] dark:text-white">Add Team Member</h3>
               <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
             </div>
             <form onSubmit={handleAdd} className="p-6 space-y-4">
               {[['name', 'Full Name', 'text'], ['email', 'Email', 'email'], ['phone', 'Phone', 'tel']].map(([key, label, type]) => (
                 <div key={key}>
                   <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">{label}</label>
                   <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                     className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600" required={key !== 'phone'} />
                 </div>
               ))}
               <div>
                 <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Role</label>
                  <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600">
                    <option value="supervisor">supervisor</option>
                    {currentUser?.role === 'owner' && !members.some(m => m.role === 'manager') && (
                      <option value="manager">manager</option>
                    )}
                    {currentUser?.role === 'owner' && !members.some(m => m.role === 'owner') && (
                      <option value="owner">owner</option>
                    )}
                  </select>
               </div>
               <div className="flex gap-3 pt-2">
                 <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                 <button type="submit" className="btn-primary flex-1">Add Member</button>
               </div>
             </form>
          </div>
        </div>
      )}

      {assignUser && (
        <div className="modal-overlay">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <div>
                <h3 className="font-bold text-gray-800 dark:text-white">Assign Projects</h3>
                <p className="text-xs text-gray-500">For {assignUser.name}</p>
              </div>
              <button onClick={() => setAssignUser(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-4 max-h-[300px] overflow-y-auto space-y-2">
              {projects.length === 0 ? <p className="text-sm text-gray-500 text-center">No active projects found.</p> : null}
              {projects.map(p => (
                <label key={p.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                  <input type="checkbox" className="w-4 h-4 text-[#CC0000] rounded"
                    checked={!!checkedProjects[p.id]}
                    onChange={(e) => setCheckedProjects(prev => ({ ...prev, [p.id]: e.target.checked }))}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-800 dark:text-white truncate">{p.name}</p>
                    <p className="text-xs text-gray-500 truncate">{p.client}</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex gap-3">
              <button onClick={() => setAssignUser(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleAssignSave} className="btn-primary flex-1">Save Setup</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="font-bold text-gray-800 dark:text-white text-lg mb-2">Remove Member?</h3>
            <p className="text-gray-500 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => handleRemove(deleteConfirm)} className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
