import { useState } from 'react';
import { Plus, X, Edit, Trash2, Search, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'];

const getStockStatus = (m) => {
  const stock = m.received - m.used;
  if (stock < m.alertLevel) return { label: 'Critical', classes: 'bg-red-100 text-red-700' };
  if (stock < m.alertLevel * 1.5) return { label: 'Low', classes: 'bg-yellow-100 text-yellow-700' };
  return { label: 'OK', classes: 'bg-green-100 text-green-700' };
};

const DEFAULT_FORM = { name: '', unit: '', ordered: '', received: '', used: '', unitPrice: '', alertLevel: '' };

export default function Materials() {
  const { currentUser } = useAuth();
  const { materials, addMaterial, updateMaterial, deleteMaterial, projects, commonMaterials, showToast, globalProject, setGlobalProject } = useApp();
  const [selectedProject, setSelectedProject] = useState(globalProject || projects[0]?.id || '');

  const handleProjectChange = (e) => {
    setSelectedProject(e.target.value);
    setGlobalProject(e.target.value);
  };
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const canEdit = true; // All roles (Owner, Manager, Supervisor) can now edit

  const projectMaterials = materials.filter(m =>
    m.projectId === selectedProject &&
    (m.name.toLowerCase().includes(search.toLowerCase()))
  );

  const openAdd = () => { setEditItem(null); setForm(DEFAULT_FORM); setShowModal(true); };
  const openEdit = (m) => { setEditItem(m); setForm({ ...m }); setShowModal(true); };
  const handleDelete = (id) => { deleteMaterial(id); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name) return;
    const item = { 
      ...form, 
      ordered: Number(form.ordered || 0), 
      received: Number(form.received || 0), 
      used: Number(form.used || 0), 
      unitPrice: Number(form.unitPrice), 
      alertLevel: Number(form.alertLevel), 
      projectId: selectedProject 
    };
    if (editItem) {
      updateMaterial(editItem.id, item);
    } else {
      addMaterial(item);
    }
    setShowModal(false);
  };

  const totalValue = projectMaterials.reduce((s, m) => s + m.received * m.unitPrice, 0);
  const lowStockCount = projectMaterials.filter(m => (m.received - m.used) < m.alertLevel).length;
  const wastage = projectMaterials.reduce((s, m) => s + (m.received - m.used), 0);
  const wastageTotal = projectMaterials.reduce((s, m) => s + m.received, 0);
  const wastePct = wastageTotal > 0 ? ((1 - wastage / wastageTotal) * 100).toFixed(1) : 0;

  const chartData = projectMaterials.map(m => ({
    name: m.name.split(' ')[0],
    Ordered: m.ordered,
    Received: m.received,
    Used: m.used,
  }));
  const pieData = projectMaterials.map(m => ({ name: m.name.split(' ')[0], value: Math.round(m.received * m.unitPrice) }));

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="section-header dark:text-white">Materials Management</h2>
        {canEdit && (
          <button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus size={18} /> Add Material</button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 card dark:bg-gray-800">
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Project</label>
          <select value={selectedProject} onChange={handleProjectChange} className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600">
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Search</label>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search materials..." className="input-field pl-9 dark:bg-gray-700 dark:text-white dark:border-gray-600" />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Value', value: `₹${(totalValue / 100000).toFixed(1)}L`, color: '#CC0000' },
          { label: 'Total Materials', value: projectMaterials.length, color: '#1A1A1A' },
          { label: 'Low Stock Items', value: lowStockCount, color: '#D32F2F' },
          { label: 'Usage Rate', value: `${wastePct}%`, color: '#2E7D32' },
        ].map(s => (
          <div key={s.label} className="card dark:bg-gray-800 p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card dark:bg-gray-800 overflow-x-auto">
        {lowStockCount > 0 && (
          <div className="flex items-center gap-2 text-orange-600 bg-orange-50 dark:bg-orange-900/20 rounded-lg px-4 py-2 mb-4 text-sm">
            <AlertTriangle size={16} /> {lowStockCount} material(s) below alert level
          </div>
        )}
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full min-w-[800px]">
            <thead>
            <tr className="bg-[#F0F4F8] dark:bg-gray-700">
              {['Material', 'Unit', 'Ordered', 'Received', 'Used', 'In Stock', 'Unit Price', 'Total Value', 'Status', ...(canEdit ? ['Actions'] : [])].map(h => (
                <th key={h} className="text-left p-3 text-xs font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {projectMaterials.map(m => {
              const stock = m.received - m.used;
              const status = getStockStatus(m);
              return (
                <tr key={m.id} className={`border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${stock < m.alertLevel ? 'bg-red-50/30 dark:bg-red-900/10' : ''}`}>
                  <td className="p-3 text-sm font-medium text-gray-800 dark:text-white whitespace-nowrap">{m.name}</td>
                  <td className="p-3 text-sm text-gray-500">{m.unit}</td>
                  <td className="p-3 text-sm text-gray-600 dark:text-gray-400">{m.ordered.toLocaleString()}</td>
                  <td className="p-3 text-sm text-gray-600 dark:text-gray-400">{m.received.toLocaleString()}</td>
                  <td className="p-3 text-sm text-gray-600 dark:text-gray-400">{m.used.toLocaleString()}</td>
                  <td className="p-3 text-sm font-semibold text-gray-800 dark:text-white">{stock.toLocaleString()}</td>
                  <td className="p-3 text-sm text-gray-500">₹{m.unitPrice}</td>
                  <td className="p-3 text-sm font-medium text-[#CC0000]">₹{(m.received * m.unitPrice).toLocaleString('en-IN')}</td>
                  <td className="p-3"><span className={`badge text-xs ${status.classes}`}>{status.label}</span></td>
                  {canEdit && (
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(m)} className="text-[#CC0000] hover:text-[#AA0000] transition-colors"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(m.id)} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
        {projectMaterials.length === 0 && <p className="text-center text-gray-400 py-8">No materials found</p>}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="card dark:bg-gray-800">
          <h3 className="section-header dark:text-white mb-4 text-base">Ordered vs Received vs Used</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Ordered" fill="#f59e0b" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Received" fill="#10b981" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Used" fill="#3b82f6" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card dark:bg-gray-800">
          <h3 className="section-header dark:text-white mb-4 text-base">Material Cost Distribution</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={v => `₹${v.toLocaleString('en-IN')}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay p-4 sm:p-6" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b dark:border-gray-700">
              <h3 className="text-lg font-bold text-[#1A1A1A] dark:text-white">{editItem ? 'Edit Material' : 'Add Material'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
              <div className="space-y-4">
                <div className="relative">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Material Name *</label>
                  <input 
                    value={form.name} 
                    onChange={e => {
                      setForm(f => ({ ...f, name: e.target.value }));
                      setShowSuggestions(true);
                    }} 
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600 w-full" 
                    placeholder="Search or type material name..." 
                    required 
                  />
                  {showSuggestions && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                      {[...new Set([...commonMaterials, ...materials.map(m => m.name)])]
                        .filter(name => name.toLowerCase().includes(form.name.toLowerCase()))
                        .map(name => (
                          <div 
                            key={name} 
                            onClick={() => {
                              setForm(f => ({ ...f, name }));
                              setShowSuggestions(false);
                            }}
                            className="px-4 py-2.5 text-sm hover:bg-[#CC0000]/10 dark:hover:bg-gray-600 cursor-pointer text-gray-700 dark:text-gray-200 border-b last:border-0 dark:border-gray-600"
                          >
                            {name}
                          </div>
                        ))
                      }
                      {form.name && ![...commonMaterials, ...materials.map(m => m.name)].some(n => n.toLowerCase() === form.name.toLowerCase()) && (
                        <div className="px-4 py-2.5 text-xs text-gray-400 italic">
                          Press Enter to use "{form.name}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Unit</label>
                    <input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600 w-full" placeholder="Bags, Kg..." />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Unit Price (₹)</label>
                    <input type="number" value={form.unitPrice} onChange={e => setForm(f => ({ ...f, unitPrice: e.target.value }))} className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600 w-full" placeholder="0" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Minimum Units (Alert Level)</label>
                    <input type="number" value={form.alertLevel} onChange={e => setForm(f => ({ ...f, alertLevel: e.target.value }))} className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600 w-full" placeholder="0" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">{editItem ? 'Update' : 'Add'} Material</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
