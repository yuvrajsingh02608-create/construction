import { useState } from 'react';
import { Printer, Download } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'];

export default function Reports() {
  const { currentUser } = useAuth();
  const { projects, materials, workers, attendance, globalProject, setGlobalProject } = useApp();
  const [selectedProject, setSelectedProject] = useState(globalProject || projects[0]?.id || '');

  // Keep globalProject in sync
  const handleProjectChange = (e) => {
    setSelectedProject(e.target.value);
    setGlobalProject(e.target.value);
  };
  const [fromDate, setFromDate] = useState('2024-11-01');
  const [toDate, setToDate] = useState('2024-12-10');

  const project = projects.find(p => p.id === selectedProject);
  const projectMaterials = materials.filter(m => m.projectId === selectedProject);
  const projectWorkers = workers.filter(w => w.projectId === selectedProject);

  const laborData = projectWorkers.map(w => {
    const recs = attendance.filter(a => a.workerId === w.id && a.date >= fromDate && a.date <= toDate);
    const days = recs.filter(a => a.status === 'present').length + recs.filter(a => a.status === 'halfday').length * 0.5;
    return { ...w, days: Math.round(days), hours: Math.round(days * 8), total: Math.round(days * w.dailyWage) };
  });
  const totalLaborCost = laborData.reduce((s, w) => s + w.total, 0);

  const materialCost = projectMaterials.reduce((s, m) => s + m.used * m.unitPrice, 0);
  const totalWasted = projectMaterials.reduce((s, m) => s + (m.received - m.used), 0);

  const weeklyProgress = [
    { week: 'W1 Nov', progress: 18 }, { week: 'W2 Nov', progress: 22 }, { week: 'W3 Nov', progress: 28 },
    { week: 'W4 Nov', progress: 33 }, { week: 'W1 Dec', progress: 38 }, { week: 'W2 Dec', progress: project?.progress || 42 },
  ];

  const monthlyExpenses = [
    { month: 'Sep', amount: 850000 }, { month: 'Oct', amount: 995000 },
    { month: 'Nov', amount: 1100000 }, { month: 'Dec', amount: 620000 },
  ];

  const budgetPie = [
    { name: 'Labor', value: Math.round(totalLaborCost) },
    { name: 'Material', value: Math.round(materialCost) },
    { name: 'Equipment', value: Math.round((project?.spent || 0) * 0.15) },
    { name: 'Other', value: Math.round((project?.spent || 0) * 0.05) },
  ].filter(item => item.value > 0);

  const exportCSV = () => {
    const rows = [['Report for', project?.name], ['Period', `${fromDate} to ${toDate}`], [''], ['Labor Report'], ['Worker', 'Days', 'Hours'],
    ...laborData.map(w => [w.name, w.days, w.hours]),
    [''], ['Material Report'],
    ['Material', 'Unit', 'Ordered', 'Used', 'Wastage', 'Cost'],
    ...projectMaterials.map(m => [m.name, m.unit, m.ordered, m.used, m.received - m.used, m.used * m.unitPrice])];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `report-${project?.name}-${fromDate}.csv`; a.click();
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 no-print">
        <h2 className="section-header dark:text-white">Reports & Analytics</h2>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-[#CC0000] transition-colors">
            <Download size={16} /> Export CSV
          </button>
          <button onClick={() => window.print()} className="btn-primary flex items-center gap-2">
            <Printer size={16} /> Print Report
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card dark:bg-gray-800 flex flex-col sm:flex-row gap-4 no-print">
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Project</label>
          <select value={selectedProject} onChange={handleProjectChange} className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600">
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">From</label>
          <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">To</label>
          <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600" />
        </div>
      </div>

      {/* Executive Summary */}
      {project && (
        <div>
          <h3 className="section-header dark:text-white mb-4">Executive Summary</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Budget', value: `₹${(project.budget / 100000).toFixed(1)}L`, color: '#CC0000' },
              { label: 'Amount Spent', value: `₹${(project.spent / 100000).toFixed(1)}L`, color: '#1A1A1A' },
              { label: 'Balance', value: `₹${((project.budget - project.spent) / 100000).toFixed(1)}L`, color: '#2E7D32' },
              { label: 'Completion', value: `${project.progress}%`, color: project.progress > 80 ? '#2E7D32' : '#CC0000' },
            ].map(s => (
              <div key={s.label} className="card dark:bg-gray-800 p-4 text-center">
                <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
                <p className="text-sm text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="card dark:bg-gray-800">
          <h3 className="font-bold text-gray-800 dark:text-white mb-4">Weekly Progress (%)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weeklyProgress}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} unit="%" />
              <Tooltip />
              <Line type="monotone" dataKey="progress" stroke="#CC0000" strokeWidth={2} dot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card dark:bg-gray-800">
          <h3 className="font-bold text-gray-800 dark:text-white mb-4">Monthly Expenses (₹)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyExpenses}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card dark:bg-gray-800">
          <h3 className="font-bold text-gray-800 dark:text-white mb-4">Budget Breakdown</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={budgetPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {budgetPie.map((item, i) => {
                  const colorIndex = ['Labor', 'Material', 'Equipment', 'Other'].indexOf(item.name);
                  return <Cell key={i} fill={COLORS[colorIndex >= 0 ? colorIndex : i % COLORS.length]} />;
                })}
              </Pie>
              <Tooltip formatter={v => `₹${v.toLocaleString('en-IN')}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Labor Report */}
      <div className="card dark:bg-gray-800">
        <h3 className="section-header dark:text-white mb-4">Labor Report</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-[#F0F4F8] dark:bg-gray-700">
              {['Worker', 'Role', 'Days Present', 'Hours'].map(h => (
                <th key={h} className="text-left p-3 text-sm font-semibold text-gray-600 dark:text-gray-300">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {laborData.map((w, i) => (
                <tr key={i} className="border-b dark:border-gray-700">
                  <td className="p-3 text-sm font-medium text-gray-800 dark:text-white">{w.name}</td>
                  <td className="p-3 text-sm text-gray-500">{w.role}</td>
                  <td className="p-3 text-sm text-gray-600 dark:text-gray-400">{w.days}</td>
                  <td className="p-3 text-sm text-gray-600 dark:text-gray-400">{w.hours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Material Report */}
      <div className="card dark:bg-gray-800">
        <h3 className="section-header dark:text-white mb-4">Material Report</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-[#F0F4F8] dark:bg-gray-700">
              {['Material', 'Unit', 'Ordered', 'Used', 'In Stock', 'Cost'].map(h => (
                <th key={h} className="text-left p-3 text-sm font-semibold text-gray-600 dark:text-gray-300">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {projectMaterials.map(m => (
                <tr key={m.id} className="border-b dark:border-gray-700">
                  <td className="p-3 text-sm font-medium text-gray-800 dark:text-white">{m.name}</td>
                  <td className="p-3 text-sm text-gray-500">{m.unit}</td>
                  <td className="p-3 text-sm text-gray-600 dark:text-gray-400">{m.ordered.toLocaleString()}</td>
                  <td className="p-3 text-sm text-gray-600 dark:text-gray-400">{m.used.toLocaleString()}</td>
                  <td className="p-3 text-sm text-gray-600 dark:text-gray-400">{(m.received - m.used).toLocaleString()}</td>
                  <td className="p-3 text-sm font-semibold text-[#1A1A1A]">₹{(m.used * m.unitPrice).toLocaleString('en-IN')}</td>
                </tr>
              ))}
              <tr className="bg-gray-50 dark:bg-gray-900/20 font-semibold">
                <td className="p-3 text-sm" colSpan={5}>Total Material Cost</td>
                <td className="p-3 text-sm text-[#1A1A1A]">₹{materialCost.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
