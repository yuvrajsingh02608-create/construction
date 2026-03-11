import { useNavigate } from 'react-router-dom';
import { Building2, Users, CheckSquare, Package, Activity, TrendingUp, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { ACTIVITIES } from '../data/mockData';
import StatCard from '../components/StatCard';

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { projects, tasks, workers, materials, attendance } = useApp();
  const navigate = useNavigate();

  const activeProjects = projects.filter(p => p.status === 'active');
  const today = new Date().toISOString().split('T')[0];
  const tasksDueToday = tasks.filter(t => t.dueDate === today && t.status !== 'done').length;
  const lowStock = materials.filter(m => (m.received - m.used) < m.alertLevel).length;
  const activeWorkers = workers.filter(w => w.status === 'active').length;

  const roleMessages = {
    owner: projects.length + ' projects active',
    manager: activeProjects.length + ' active assigned',
    supervisor: projects.length + ' sites assigned'
  };

  const progressData = projects.map(p => ({ 
    name: (p.name || '').length > 10 ? (p.name || '').substring(0, 8) + '..' : p.name, 
    progress: p.progress || 0, 
    budget: Math.round((p.spent || 0) / (p.budget || 1) * 100) 
  }));
  const materialData = materials.slice(0, 4).map(m => ({ 
    name: (m.name || '').substring(0, 10), 
    value: (m.used || 0) * (m.unitPrice || 0) 
  }));
  const weeklyAttendance = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (d.getDay() - i));
    const ds = d.toISOString().split('T')[0];
    const recs = attendance.filter(a => a.date === ds);
    return {
      day,
      present: recs.filter(r => r.status === 'present').length,
      absent: recs.filter(r => r.status === 'absent').length,
    };
  }).filter(d => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(d.day)); // typical work week

  const budgetData = [
    { month: 'Sep', Labor: 320000, Material: 450000, Equipment: 80000 },
    { month: 'Oct', Labor: 380000, Material: 520000, Equipment: 95000 },
    { month: 'Nov', Labor: 420000, Material: 580000, Equipment: 110000 },
    { month: 'Dec', Labor: 450000, Material: 620000, Equipment: 120000 },
  ];

  return (
    <div className="space-y-4 md:space-y-6 fade-in">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-[#1A1A1A] to-[#CC0000] rounded-2xl p-4 md:p-6 text-white shadow-lg">
        <h2 className="text-xl md:text-2xl font-bold">Welcome back, {currentUser?.name}! 👋</h2>
        <p className="text-red-100 text-[10px] md:text-sm mt-1 capitalize">Role: {currentUser?.role} · {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p className="text-red-200 text-[10px] md:text-xs mt-1">{roleMessages[currentUser?.role || 'supervisor']}</p>
      </div>
 
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard title="Active Projects" value={activeProjects.length} icon={Building2} color="#CC0000" trend={5} subtitle={`${projects.length} total`} />
        <StatCard title="Active Workers" value={activeWorkers} icon={Users} color="#1A1A1A" trend={3} subtitle={`${workers.length} total`} />
        <StatCard title="Tasks Due Today" value={tasksDueToday} icon={CheckSquare} color="#2E7D32" subtitle={`${tasks.filter(t => t.status !== 'done').length} open`} />
        <StatCard title="Low Stock Items" value={lowStock} icon={Package} color="#CC0000" subtitle="Below alert level" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Project Progress */}
        <div className="card dark:bg-gray-800 p-4">
          <h3 className="text-sm md:text-base font-bold dark:text-white mb-4">Project Progress</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} />
              <YAxis tick={{ fontSize: 9 }} unit="%" />
              <Tooltip formatter={(v) => `${v}%`} labelStyle={{ fontSize: '10px' }} />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Bar dataKey="progress" name="Progress %" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="budget" name="Budget Used %" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Expenses */}
        <div className="card dark:bg-gray-800 p-4">
          <h3 className="text-sm md:text-base font-bold dark:text-white mb-4">Monthly Expenses</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={budgetData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 9 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={v => `₹${(v/1000).toFixed(0)}k`} labelStyle={{ fontSize: '10px' }} />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Bar dataKey="Labor" fill="#f59e0b" stackId="a" />
              <Bar dataKey="Material" fill="#3b82f6" stackId="a" />
              <Bar dataKey="Equipment" fill="#8b5cf6" stackId="a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Material Cost Pie */}
        <div className="card dark:bg-gray-800">
          <h3 className="section-header dark:text-white mb-4">Material Cost Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={materialData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {materialData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={v => `₹${(v / 1000).toFixed(0)}k`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Attendance */}
        <div className="card dark:bg-gray-800">
          <h3 className="section-header dark:text-white mb-4">Weekly Attendance</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weeklyAttendance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="present" stroke="#2E7D32" strokeWidth={2} dot={{ r: 4 }} name="Present" />
              <Line type="monotone" dataKey="absent" stroke="#C62828" strokeWidth={2} dot={{ r: 4 }} name="Absent" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="card dark:bg-gray-800">
          <h3 className="section-header dark:text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {ACTIVITIES.map(a => (
              <div key={a.id} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                  <Activity size={14} className="text-[#CC0000]" />
                </div>
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{a.description}</p>
                  <p className="text-xs text-gray-400">{a.time} · {a.user}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Projects Summary */}
      <div className="card dark:bg-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-header dark:text-white">Projects Overview</h3>
          <button onClick={() => navigate('/projects')} className="text-sm text-[#CC0000] font-medium hover:underline">View All →</button>
        </div>
        <div className="space-y-4">
          {projects.map(p => (
            <div key={p.id} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-gray-600 transition-colors cursor-pointer"
              onClick={() => navigate(`/projects/${p.id}`)}>
              <div className="w-10 h-10 rounded-xl bg-[#CC0000] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {(p.name || 'P').charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-800 dark:text-white truncate">{p.name || 'Unnamed Project'}</p>
                  <span className={`badge text-xs flex-shrink-0 ${p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {p.status || 'unknown'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full bg-[#CC0000]" style={{ width: `${p.progress || 0}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 flex-shrink-0">{p.progress || 0}%</span>
                </div>
              </div>
              {/* Budget visibility for all roles */}
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold text-gray-800 dark:text-white">₹{((p.spent || 0) / 100000).toFixed(1)}L</p>
                <p className="text-xs text-gray-400">of ₹{((p.budget || 0) / 100000).toFixed(1)}L</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStock > 0 && (
        <div className="card dark:bg-gray-800 border border-red-200">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="text-red-600" size={20} />
            <h3 className="section-header text-red-600">Material Stock Alerts</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {materials.filter(m => (m.received - m.used) < m.alertLevel).map(m => (
              <div key={m.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200">
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">{m.name}</p>
                  <p className="text-xs text-gray-500">Stock: {m.received - m.used} {m.unit}</p>
                </div>
                <span className="badge bg-red-100 text-red-700 text-xs">Critical</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
