import { useState, useEffect } from 'react';
import { Plus, X, CloudSun, Cloud, CloudRain, Wind } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

const WEATHER_OPTIONS = [
  { value: 'Sunny', label: 'Sunny', emoji: '☀️', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { value: 'Cloudy', label: 'Cloudy', emoji: '⛅', color: 'bg-gray-100 text-gray-700 border-gray-300' },
  { value: 'Rainy', label: 'Rainy', emoji: '🌧️', color: 'bg-gray-100 text-gray-700 border-gray-300' },
  { value: 'Windy', label: 'Windy', emoji: '💨', color: 'bg-red-50 text-[#CC0000] border-red-200' },
];

export default function DailyLogs() {
  const { currentUser } = useAuth();
  const { projects, dailyLogs, addDailyLog, updateDailyLog, deleteDailyLog, materials: allMaterials, commonMaterials, globalProject, setGlobalProject } = useApp();
  const [selectedProject, setSelectedProject] = useState(globalProject || projects[0]?.id || '');

  // Sync project select
  const handleProjectChange = (e) => {
    setSelectedProject(e.target.value);
    setGlobalProject(e.target.value);
  };
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showForm, setShowForm] = useState(false);
  const [editLog, setEditLog] = useState(null);
  const [expanded, setExpanded] = useState(null);
  
  // Ensure selectedProject is set when projects load
  useEffect(() => {
    if (!selectedProject && projects.length > 0) setSelectedProject(projects[0].id);
  }, [projects, selectedProject]);

  const [weather, setWeather] = useState('Sunny');
  const [notes, setNotes] = useState('');
  const [equipment, setEquipment] = useState([{ name: '', hours: 0, operator: '' }]);
  const [materials, setMaterials] = useState([{ name: '', quantity: '', unit: '' }]);
  const [activeSuggestionRow, setActiveSuggestionRow] = useState(null);

  const filteredLogs = dailyLogs.filter(l => String(l.projectId) === String(selectedProject)).sort((a, b) => b.date.localeCompare(a.date));

  const addRow = (setter, template) => setter(prev => [...prev, { ...template }]);
  const removeRow = (setter, idx) => setter(prev => prev.filter((_, i) => i !== idx));
  const updateRow = (setter, idx, key, val) => setter(prev => prev.map((r, i) => i === idx ? { ...r, [key]: val } : r));

  const openAdd = () => {
    setEditLog(null);
    setWeather('Sunny');
    setNotes('');
    setEquipment([{ name: '', hours: 0, operator: '' }]);
    setMaterials([{ name: '', quantity: '', unit: '' }]);
    setShowForm(true);
  };

  const openEdit = (log) => {
    setEditLog(log);
    setSelectedDate(log.date);
    setWeather(log.weather || 'Sunny');
    setNotes(log.notes || '');
    setEquipment(log.equipment || [{ name: '', hours: 0, operator: '' }]);
    setMaterials(log.materials || [{ name: '', quantity: '', unit: '' }]);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!selectedProject) { return; }
    const logData = {
      projectId: selectedProject, 
      date: selectedDate, 
      weather,
      equipment: equipment.map(e => ({ ...e, hours: Number(e.hours || 0) })), 
      materials, 
      notes, 
      photos: [],
    };
    if (editLog) {
      updateDailyLog(editLog.id, logData);
    } else {
      addDailyLog(logData);
    }
    setShowForm(false);
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="section-header dark:text-white">Daily Logs</h2>
        {currentUser?.role !== 'owner' && (
          <button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus size={18} /> New Log Entry</button>
        )}
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

      {/* Log Form Modal */}
      {showForm && (
        <div className="modal-overlay p-4 sm:p-6" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
              <h3 className="text-lg font-bold text-[#1A1A1A] dark:text-white">{editLog ? 'Edit Daily Log' : 'New Daily Log Entry'}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              {/* General */}
              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Weather Conditions</h4>
                <div className="flex gap-3 flex-wrap">
                  {WEATHER_OPTIONS.map(w => (
                    <button key={w.value} onClick={() => setWeather(w.value)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all
                        ${weather === w.value ? w.color + ' border-current' : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600'}`}>
                      {w.emoji} {w.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-2">Site Notes</label>
                <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Daily observations, issues, progress..."
                  className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600 resize-none" />
              </div>

              {/* Equipment */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300">Equipment</h4>
                </div>
                <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                  <table className="w-full text-sm min-w-[500px]">
                    <thead><tr className="bg-gray-50 dark:bg-gray-700">
                      {['Equipment Name', 'Hours Used', 'Operator', ''].map(h => <th key={h} className="text-left p-2 text-xs text-gray-500">{h}</th>)}
                    </tr></thead>
                  <tbody>
                    {equipment.map((e, i) => (
                      <tr key={i}>
                        <td className="p-1"><input value={e.name || ''} onChange={ev => updateRow(setEquipment, i, 'name', ev.target.value)} className="input-field py-1.5 text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600" placeholder="e.g. Tower Crane" /></td>
                        <td className="p-1 w-24"><input type="number" value={e.hours || 0} onChange={ev => updateRow(setEquipment, i, 'hours', ev.target.value)} className="input-field py-1.5 text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600" /></td>
                        <td className="p-1"><input value={e.operator || ''} onChange={ev => updateRow(setEquipment, i, 'operator', ev.target.value)} className="input-field py-1.5 text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600" placeholder="Operator" /></td>
                        <td className="p-1 w-8"><button onClick={() => removeRow(setEquipment, i)} className="text-red-400 hover:text-red-600"><X size={14} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
                <button onClick={() => addRow(setEquipment, { name: '', hours: 0, operator: '' })} className="mt-2 text-sm text-[#1565C0] hover:underline flex items-center gap-1">
                  <Plus size={14} /> Add Equipment Row
                </button>
              </div>

              {/* Materials Used */}
              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Materials Used</h4>
                <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                  <table className="w-full text-sm min-w-[500px]">
                    <thead><tr className="bg-gray-50 dark:bg-gray-700">
                      {['Material Name', 'Quantity', 'Unit', ''].map(h => <th key={h} className="text-left p-2 text-xs text-gray-500">{h}</th>)}
                    </tr></thead>
                  <tbody>
                    {materials.map((m, i) => (
                      <tr key={i}>
                        <td className="p-1 relative">
                          <input 
                            value={m.name || ''} 
                            onChange={e => {
                              updateRow(setMaterials, i, 'name', e.target.value);
                              setActiveSuggestionRow(i);
                            }} 
                            onFocus={() => setActiveSuggestionRow(i)}
                            onBlur={() => setTimeout(() => setActiveSuggestionRow(null), 200)}
                            className="input-field py-1.5 text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600" 
                            placeholder="e.g. Cement" 
                          />
                          {activeSuggestionRow === i && m.name && (
                            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-xl shadow-xl max-h-40 overflow-y-auto left-0">
                              {[...new Set([...commonMaterials, ...allMaterials.map(mat => mat.name)])]
                                .filter(name => name.toLowerCase().includes(m.name.toLowerCase()))
                                .map(name => (
                                  <div 
                                    key={name} 
                                    onClick={() => {
                                      updateRow(setMaterials, i, 'name', name);
                                      setActiveSuggestionRow(null);
                                    }}
                                    className="px-3 py-2 text-xs hover:bg-[#1565C0]/10 dark:hover:bg-gray-600 cursor-pointer text-gray-700 dark:text-gray-200 border-b last:border-0 dark:border-gray-600"
                                  >
                                    {name}
                                  </div>
                                ))
                              }
                            </div>
                          )}
                        </td>
                        <td className="p-1 w-24"><input type="number" value={m.quantity || 0} onChange={e => updateRow(setMaterials, i, 'quantity', e.target.value)} className="input-field py-1.5 text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600" /></td>
                        <td className="p-1 w-24"><input value={m.unit || ''} onChange={e => updateRow(setMaterials, i, 'unit', e.target.value)} className="input-field py-1.5 text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600" placeholder="Bags" /></td>
                        <td className="p-1 w-8"><button onClick={() => removeRow(setMaterials, i)} className="text-red-400 hover:text-red-600"><X size={14} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
                <button onClick={() => addRow(setMaterials, { name: '', quantity: '', unit: '' })} className="mt-2 text-sm text-[#1565C0] hover:underline flex items-center gap-1">
                  <Plus size={14} /> Add Material Row
                </button>
              </div>

              <div className="flex gap-3 pt-2 border-t dark:border-gray-700">
                {editLog && (
                  <button onClick={() => { deleteDailyLog(editLog.id); setShowForm(false); }} className="px-4 py-2 rounded-lg text-red-600 border border-red-200 hover:bg-red-50 text-sm font-medium transition-colors">Delete</button>
                )}
                <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleSubmit} className="btn-primary flex-1">{editLog ? 'Update Log' : 'Save Log Entry'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Past Logs */}
      {filteredLogs.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p>No logs for this project yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLogs.map(log => (
            <div key={log.id} className="card dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <button className="flex-1 flex items-center gap-4 text-left" onClick={() => setExpanded(expanded === log.id ? null : log.id)}>
                  <span className="text-3xl">{log.weather === 'Sunny' ? '☀️' : log.weather === 'Cloudy' ? '⛅' : log.weather === 'Rainy' ? '🌧️' : '💨'}</span>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">{log.date}</p>
                    <p className="text-sm text-gray-500">{log.weather} · {log.materials.length} materials</p>
                  </div>
                </button>
                <div className="flex items-center gap-3">
                  <button onClick={() => openEdit(log)} className="text-[#CC0000] text-sm font-medium hover:underline">Edit</button>
                  <span className="text-gray-300">|</span>
                  <button className="text-gray-400 text-sm" onClick={() => setExpanded(expanded === log.id ? null : log.id)}>
                    {expanded === log.id ? '▲' : '▼'}
                  </button>
                </div>
              </div>
              {expanded === log.id && (
                <div className="mt-4 pt-4 border-t dark:border-gray-700 space-y-4 fade-in">
                  {log.notes && <p className="text-sm text-gray-600 dark:text-gray-400 italic">"{log.notes}"</p>}
                  {log.labor.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Labor</p>
                      {log.labor.map((l, i) => (
                        <div key={i} className="flex justify-between text-sm py-1">
                          <span className="text-gray-700 dark:text-gray-300">{l.name || 'Worker'} ({l.role})</span>
                          <span className="text-gray-500">{l.count} × {l.hours}h</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {log.materials.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Materials</p>
                      {log.materials.map((m, i) => (
                        <div key={i} className="flex justify-between text-sm py-1">
                          <span className="text-gray-700 dark:text-gray-300">{m.name}</span>
                          <span className="text-gray-500">{m.quantity} {m.unit}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
