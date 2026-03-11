import { useState } from 'react';
import { Truck, Plus, CheckCircle2, Clock, MapPin, ArrowRight, Search, X, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Logistics() {
  const { logistics, projects, addLogistics, updateLogistics, deleteLogistics } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    machineName: '',
    fromProjectId: projects[0]?.id || '',
    toProjectId: projects[1]?.id || projects[0]?.id || '',
    departureDate: new Date().toISOString().split('T')[0],
    eta: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addLogistics({ ...form, status: 'in-transit' });
    setShowModal(false);
  };

  const markArrived = (item) => {
    updateLogistics(item.id, { ...item, status: 'arrived' });
  };

  const filteredLogistics = logistics.filter(l => 
    l.machineName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="section-header dark:text-white">Machine Tracking</h2>
          <p className="text-sm text-gray-500 mt-1">Track machine movement across project sites</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Truck size={18} /> Record Movement
        </button>
      </div>

      {/* Stats & Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card dark:bg-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
              <Truck size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">In-Transit</p>
              <p className="text-xl font-bold dark:text-white">{logistics.filter(l => l.status === 'in-transit').length}</p>
            </div>
          </div>
        </div>
        <div className="md:col-span-2 card dark:bg-gray-800 flex items-center px-4 py-2">
          <Search size={18} className="text-gray-400 mr-3" />
          <input 
            type="text" 
            placeholder="Search machines..." 
            className="bg-transparent border-none focus:ring-0 w-full dark:text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Logistics List */}
      <div className="space-y-4">
        {filteredLogistics.map((item) => {
          const fromProj = projects.find(p => String(p.id) === String(item.fromProjectId));
          const toProj = projects.find(p => String(p.id) === String(item.toProjectId));
          
          return (
            <div key={item.id} className="card dark:bg-gray-800 border-l-4 overflow-hidden relative" 
              style={{ borderLeftColor: item.status === 'arrived' ? '#2E7D32' : '#CC0000' }}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                {/* Machine Info */}
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${item.status === 'arrived' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-red-50 dark:bg-red-900/10 text-[#CC0000]'}`}>
                    <Truck size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg dark:text-white">{item.machineName}</h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">
                      <span className={`px-2 py-0.5 rounded-full ${item.status === 'arrived' ? 'bg-green-100 text-green-700' : 'bg-red-50 text-[#CC0000]'}`}>
                        {item.status}
                      </span>
                      <span>· Dep: {item.departureDate}</span>
                      {item.eta && <span>· ETA: {item.eta}</span>}
                    </div>
                  </div>
                </div>

                {/* Route */}
                <div className="flex items-center gap-4 flex-1 max-w-md">
                  <div className="text-center flex-1">
                    <p className="text-xs text-gray-400 uppercase">From</p>
                    <p className="text-sm font-semibold truncate dark:text-gray-200">{fromProj?.name || 'Unknown'}</p>
                    <p className="text-[10px] text-gray-500 truncate">{fromProj?.location}</p>
                  </div>
                  <div className="text-gray-300">
                    <ArrowRight size={20} />
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-xs text-gray-400 uppercase">To</p>
                    <p className="text-sm font-semibold truncate dark:text-gray-200">{toProj?.name || 'Unknown'}</p>
                    <p className="text-[10px] text-gray-500 truncate">{toProj?.location}</p>
                  </div>
                </div>

                {/* Actions */}
                  <div className="flex items-center gap-2">
                    {item.status === 'in-transit' ? (
                      <button 
                        onClick={() => markArrived(item)}
                        className="btn-primary py-1.5 px-4 text-sm flex items-center gap-2"
                      >
                        <CheckCircle2 size={16} /> Mark Arrived
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 text-green-600 font-medium text-sm px-4">
                        <CheckCircle2 size={16} /> Arrived at Site
                      </div>
                    )}
                    <button 
                      onClick={() => deleteLogistics(item.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete Entry"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
              </div>
              
              {item.notes && (
                <div className="mt-4 pt-4 border-t dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/50 -mx-6 -mb-6 p-4">
                  <span className="font-semibold text-gray-500">Notes:</span> {item.notes}
                </div>
              )}
            </div>
          );
        })}

        {filteredLogistics.length === 0 && (
          <div className="text-center py-20 card dark:bg-gray-800 opacity-60">
            <Truck size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No machine movements recorded</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay p-4 sm:p-6" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-xl font-bold dark:text-white">Record Machine Movement</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Machine Name *</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. Excavator CAT 320"
                  className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  value={form.machineName}
                  onChange={(e) => setForm({...form, machineName: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">From Project</label>
                  <select 
                    className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    value={form.fromProjectId}
                    onChange={(e) => setForm({...form, fromProjectId: e.target.value})}
                  >
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">To Project</label>
                  <select 
                    className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    value={form.toProjectId}
                    onChange={(e) => setForm({...form, toProjectId: e.target.value})}
                  >
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Departure Date</label>
                  <input 
                    type="date"
                    className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    value={form.departureDate}
                    onChange={(e) => setForm({...form, departureDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">ETA (Optional)</label>
                  <input 
                    type="date"
                    className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    value={form.eta}
                    onChange={(e) => setForm({...form, eta: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Notes</label>
                <textarea 
                  rows={3}
                  placeholder="Reason for movement, truck number, etc."
                  className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  value={form.notes}
                  onChange={(e) => setForm({...form, notes: e.target.value})}
                ></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Start Movement</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
