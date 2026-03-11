import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Briefcase, FileText, CheckSquare,
  UserCheck, Package, Folder, BarChart3, Users, Bell, ChevronLeft,
  ChevronRight, Truck, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: Briefcase, label: 'Projects' },
  { to: '/daily-logs', icon: FileText, label: 'Daily Logs' },
  { to: '/attendance', icon: UserCheck, label: 'Attendance' },
  { to: '/materials', icon: Package, label: 'Materials' },
  { to: '/logistics', icon: Truck, label: 'Machine' },
  { to: '/files', icon: Folder, label: 'Files' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
];

const roleColors = {
  owner: 'bg-njib-red/10 text-njib-red',
  manager: 'bg-gray-100 text-gray-800',
  supervisor: 'bg-green-100 text-green-800',
};

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const { currentUser, logout } = useAuth();
  const { notifications } = useApp();
  const navigate = useNavigate();
  const unread = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
  };

  const items = (currentUser?.role === 'owner' || currentUser?.role === 'manager')
    ? [...navItems, { to: '/team', icon: Users, label: 'Team' }]
    : navItems;

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full z-50 flex flex-col
        bg-[#1A1A1A] text-white safe-pt
        transition-all duration-300 ease-in-out shadow-2xl
        ${collapsed ? 'w-16' : 'w-64'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-[#333333]">
          <div className="flex-shrink-0 w-9 h-9 bg-white rounded-lg flex items-center justify-center p-1 overflow-hidden">
            <img src="/njib-logo.png" alt="NJIB Logo" className="w-full h-full object-contain" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-bold leading-tight">NJIB</h1>
              <p className="text-xs text-gray-400">Construction Management</p>
            </div>
          )}
          <button onClick={() => setMobileOpen(false)} className="md:hidden text-white/70 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {items.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
                ${isActive
                  ? 'bg-[#CC0000] text-white font-semibold shadow-lg'
                  : 'text-gray-300 hover:bg-[#333333] hover:text-white'
                }`
              }
            >
              <Icon size={20} className="flex-shrink-0" />
              {!collapsed && <span className="text-sm truncate">{label}</span>}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md
                  opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                  {label}
                </div>
              )}
            </NavLink>
          ))}

          {/* Notifications */}
          <NavLink to="/notifications"
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative group
              ${isActive ? 'bg-[#CC0000] text-white font-semibold shadow-lg' : 'text-gray-300 hover:bg-[#333333] hover:text-white'}`
            }
          >
            <div className="relative flex-shrink-0">
              <Bell size={20} />
              {unread > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#CC0000] rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                  {unread}
                </span>
              )}
            </div>
            {!collapsed && <span className="text-sm">Notifications</span>}
            {collapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md
                opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                Notifications
              </div>
            )}
          </NavLink>
        </nav>

        {/* Collapse button */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="hidden md:flex items-center justify-center p-3 border-t border-[#333333] hover:bg-[#333333] transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

        {/* User profile */}
        {!collapsed && currentUser && (
          <div className="p-4 border-t border-[#333333]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#CC0000] flex items-center justify-center text-sm font-bold flex-shrink-0">
                {currentUser.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{currentUser.name}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColors[currentUser.role]}`}>
                  {currentUser.role}
                </span>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
