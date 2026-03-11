import { useState } from 'react';
import { Plus, X, List, LayoutGrid } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { USERS } from '../data/mockData';

const COLUMNS = [
  { key: 'todo', label: 'To Do', color: '#888888', bg: '#88888815' },
  { key: 'inprogress', label: 'In Progress', color: '#CC0000', bg: '#CC000015' },
  { key: 'review', label: 'Review', color: '#F57F17', bg: '#F57F1715' },
  { key: 'done', label: 'Done', color: '#2E7D32', bg: '#2E7D3215' },
];

const PRIORITY_COLORS = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-green-100 text-green-700',
};

function TaskCard({ task, projects, onEdit, onDragStart }) {
  const project = projects.find(p => p.id === task.projectId);
  const assignee = USERS.find(u => u.id === task.assigneeId);
  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'done';
  return (
    <div
      draggable
      onDragStart={e => { e.dataTransfer.setData('taskId', task.id); onDragStart(); }}
      onClick={() => onEdit(task)}
      className={`bg-white dark:bg-gray-700 rounded-xl p-3 shadow-sm cursor-pointer
        hover:shadow-md transition-all duration-200 border
        ${isOverdue ? 'border-red-400' : 'border-transparent hover:border-[#CC0000]/30'}`}
    >
      <p className="text-sm font-semibold text-gray-800 dark:text-white mb-1.5">{task.title}</p>
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`badge text-xs ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</span>
        {project && <span className="text-xs text-gray-400 truncate max-w-[100px]">{project.name.split(' ')[0]}</span>}
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className={`text-xs ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
          {isOverdue ? '⚠️ ' : ''}{task.dueDate}
        </span>
        {assignee && (
          <div className="w-6 h-6 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white text-xs font-bold">
            {assignee.avatar}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Tasks() {
  const { currentUser } = useAuth();
  const { tasks, setTasks, projects, users, addTask, updateTask, deleteTask, showToast } = useApp();
  const [view, setView] = useState('kanban');
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', projectId: '', assigneeId: currentUser?.id, priority: 'medium', status: 'todo', dueDate: '' });
  const [errors, setErrors] = useState({});
  const [filterProject, setFilterProject] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [dragging, setDragging] = useState(false);
  const [sortCol, setSortCol] = useState('dueDate');
  const [sortDir, setSortDir] = useState('asc');

  const canManage = currentUser?.role === 'owner' || currentUser?.role === 'manager'; // Only owners and managers can add tasks
  const canEditTask = true; // All roles can edit tasks they are authorized to see (supervisors only see their own due to AppContext filter)
  const openAdd = (status = 'todo') => {
    setEditTask(null);
    setForm({ title: '', description: '', projectId: projects[0]?.id || '', assigneeId: currentUser?.id, priority: 'medium', status, dueDate: '' });
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (task) => {
    setEditTask(task);
    setForm({ ...task, assigneeId: String(task.assigneeId) });
    setErrors({});
    setShowModal(true);
  };

  const handleSubmit = () => {
    const errs = {};
    if (!form.title) errs.title = 'Required';
    if (!form.projectId) errs.projectId = 'Required';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    if (editTask) {
      updateTask(editTask.id, form);
    } else {
      addTask({ 
        ...form, 
        projectId: form.projectId, 
        assigneeId: form.assigneeId, 
        createdAt: new Date().toISOString().split('T')[0] 
      });
    }
    setShowModal(false);
  };

  const handleDrop = (e, targetStatus) => {
    const id = e.dataTransfer.getData('taskId');
    const task = tasks.find(t => t.id === id);
    if (task && task.status !== targetStatus) {
      updateTask(id, { status: targetStatus });
    }
    setDragging(false);
  };

  const handleDelete = (id) => {
    deleteTask(id);
    setShowModal(false);
  };

  const filteredTasks = tasks.filter(t =>
    (!filterProject || t.projectId === filterProject) &&
    (!filterPriority || t.priority === filterPriority) &&
    (!filterStatus || t.status === filterStatus)
  ).sort((a, b) => {
    const av = a[sortCol] || '', bv = b[sortCol] || '';
    return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
  });

  const toggleSort = (col) => { if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortCol(col); setSortDir('asc'); } };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="section-header dark:text-white">Task Management</h2>
          <p className="text-sm text-gray-500">{tasks.length} total tasks</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button onClick={() => setView('kanban')} className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 text-sm transition-all ${view === 'kanban' ? 'bg-white dark:bg-gray-700 shadow text-[#CC0000]' : 'text-gray-500'}`}>
              <LayoutGrid size={16} /> Kanban
            </button>
            <button onClick={() => setView('list')} className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 text-sm transition-all ${view === 'list' ? 'bg-white dark:bg-gray-700 shadow text-[#CC0000]' : 'text-gray-500'}`}>
              <List size={16} /> List
            </button>
          </div>
          {canManage && <button onClick={() => openAdd()} className="btn-primary flex items-center gap-2"><Plus size={18} /> Add Task</button>}
        </div>
      </div>

      {/* Kanban */}
      {view === 'kanban' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {COLUMNS.map(col => {
            const colTasks = tasks.filter(t => t.status === col.key);
            return (
              <div key={col.key}
                onDragOver={e => e.preventDefault()}
                onDrop={e => handleDrop(e, col.key)}
                className={`rounded-xl p-3 min-h-[200px] transition-all ${dragging ? 'ring-2 ring-dashed ring-gray-300' : ''}`}
                style={{ backgroundColor: col.bg }}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm" style={{ color: col.color }}>{col.label}</h3>
                  <span className="w-6 h-6 rounded-full text-xs font-bold text-white flex items-center justify-center" style={{ backgroundColor: col.color }}>
                    {colTasks.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {colTasks.map(task => (
                    <TaskCard key={task.id} task={task} projects={projects} onEdit={canEditTask ? openEdit : () => {}} onDragStart={() => setDragging(false)} />
                  ))}
                </div>
                {canManage && (
                  <button onClick={() => openAdd(col.key)} className="w-full mt-3 py-2 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl flex items-center justify-center gap-1 hover:border-gray-300 transition-colors">
                    <Plus size={14} /> Add Task
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="card dark:bg-gray-800">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            <select value={filterProject} onChange={e => setFilterProject(e.target.value)} className="input-field w-auto dark:bg-gray-700 dark:text-white dark:border-gray-600 text-sm">
              <option value="">All Projects</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="input-field w-auto dark:bg-gray-700 dark:text-white dark:border-gray-600 text-sm">
              <option value="">All Priorities</option>
              {['high', 'medium', 'low'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input-field w-auto dark:bg-gray-700 dark:text-white dark:border-gray-600 text-sm">
              <option value="">All Statuses</option>
              {['todo', 'inprogress', 'review', 'done'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full min-w-[700px]">
              <thead><tr className="bg-[#F0F4F8] dark:bg-gray-700">
                {[['title', 'Title'], ['projectId', 'Project'], ['priority', 'Priority'], ['status', 'Status'], ['dueDate', 'Due Date'], [null, 'Actions']].map(([col, label]) => (
                  <th key={label} className={`text-left p-3 text-sm font-semibold text-gray-600 dark:text-gray-300 ${col ? 'cursor-pointer hover:text-[#CC0000]' : ''}`}
                    onClick={() => col && toggleSort(col)}>
                    {label} {sortCol === col ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                  </th>
                ))}
              </tr></thead>
              <tbody>
                {filteredTasks.map(t => {
                  const project = projects.find(p => p.id === t.projectId);
                  const isOverdue = new Date(t.dueDate) < new Date() && t.status !== 'done';
                  return (
                    <tr key={t.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="p-3 text-sm font-medium text-gray-800 dark:text-white">{t.title}</td>
                      <td className="p-3 text-sm text-gray-500 dark:text-gray-400">{project?.name.split(' ').slice(0,2).join(' ')}</td>
                      <td className="p-3"><span className={`badge text-xs ${PRIORITY_COLORS[t.priority]}`}>{t.priority}</span></td>
                      <td className="p-3">
                        <span className={`badge text-xs ${t.status === 'done' ? 'bg-green-100 text-green-700' : t.status === 'inprogress' ? 'bg-red-50 text-red-700' : t.status === 'review' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                          {t.status}
                        </span>
                      </td>
                      <td className={`p-3 text-sm ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-500'}`}>{t.dueDate}</td>
                      <td className="p-3">
                        {canEditTask && <button onClick={() => openEdit(t)} className="text-[#CC0000] text-sm hover:underline">Edit</button>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredTasks.length === 0 && <p className="text-center text-gray-400 py-8">No tasks found</p>}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay p-4 sm:p-6" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b dark:border-gray-700">
              <h3 className="text-lg font-bold text-[#1A1A1A] dark:text-white">{editTask ? 'Edit Task' : 'Add Task'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className={`input-field dark:bg-gray-700 dark:text-white dark:border-gray-600 ${errors.title ? 'border-red-400' : ''}`} placeholder="Task title" />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Description</label>
                <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600 resize-none" placeholder="Task details..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Project *</label>
                  <select value={form.projectId} onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))} className={`input-field dark:bg-gray-700 dark:text-white dark:border-gray-600 ${errors.projectId ? 'border-red-400' : ''}`}>
                    <option value="">Select...</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Assignee</label>
                  <select value={form.assigneeId} onChange={e => setForm(f => ({ ...f, assigneeId: e.target.value }))} className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600">
                    <option value="">Select Supervisor</option>
                    {users.filter(u => u.role === 'supervisor').map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Priority</label>
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600">
                    {['high', 'medium', 'low'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600">
                    {['todo', 'inprogress', 'review', 'done'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Due Date</label>
                <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600" />
              </div>
              <div className="flex gap-3 pt-2">
                {editTask && canManage && (
                  <button onClick={() => deleteTask(editTask.id)} className="px-4 py-2 rounded-lg text-red-600 border border-red-200 hover:bg-red-50 text-sm font-medium transition-colors">Delete</button>
                )}
                <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleSubmit} className="btn-primary flex-1">{editTask ? 'Update' : 'Create'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
