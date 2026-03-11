import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Moon, Sun, Search, Menu, ChevronDown, LogOut, User, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/projects': 'Projects',
  '/daily-logs': 'Daily Logs',
  '/tasks': 'Tasks',
  '/attendance': 'Attendance',
  '/materials': 'Materials',
  '/reports': 'Reports & Analytics',
  '/team': 'Team Management',
  '/files': 'Project Files',
  '/notifications': 'Notifications',
};

export default function Navbar({ setMobileOpen }) {
  const { currentUser, userProfile, logout } = useAuth();
  // Use Firebase profile if available, fall back to mock user
  const user = userProfile || currentUser;
  const { notifications, darkMode, toggleDarkMode, projects, tasks } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const dropRef = useRef(null);
  const searchRef = useRef(null);
  const unread = notifications.filter(n => !n.read).length;
  const title = PAGE_TITLES[location.pathname] || (location.pathname.startsWith('/projects/') ? 'Project Details' : 'NJIB');

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropdownOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (q) => {
    setSearchQuery(q);
    if (!q.trim()) { setSearchResults([]); return; }
    const lq = q.toLowerCase();
    const results = [];
    projects.forEach(p => {
      if (p.name.toLowerCase().includes(lq) || p.client.toLowerCase().includes(lq))
        results.push({ type: 'Project', label: p.name, sub: p.client, to: `/projects/${p.id}` });
    });
    tasks.forEach(t => {
      if (t.title.toLowerCase().includes(lq))
        results.push({ type: 'Task', label: t.title, sub: t.status, to: '/tasks' });
    });
    setSearchResults(results.slice(0, 6));
    setSearchOpen(true);
  };

  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 z-30 bg-[#F0F4F8]/80 backdrop-blur-md dark:bg-gray-900/80 transition-all duration-300 flex flex-col safe-pt shadow-sm">
      <div className="flex items-center gap-4 w-full px-4 h-16">
        {/* Hamburger */}
        <button onClick={() => setMobileOpen(true)} className="md:hidden text-gray-600 dark:text-gray-300 hover:text-[#CC0000]">
          <Menu size={22} />
        </button>

        {/* Title */}
        <h2 className="text-lg font-bold text-[#1A1A1A] dark:text-white hidden sm:block">{title}</h2>

        {/* Search */}
        <div className="flex-1 max-w-md relative" ref={searchRef}>
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 gap-2">
            <Search size={16} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search projects, tasks..."
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              onFocus={() => searchResults.length > 0 && setSearchOpen(true)}
              className="bg-transparent text-sm outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400 w-full"
            />
            {searchQuery && <button onClick={() => { setSearchQuery(''); setSearchResults([]); }}><X size={14} className="text-gray-400" /></button>}
          </div>
          {searchOpen && searchResults.length > 0 && (
            <div className="absolute top-full mt-1 left-0 right-0 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
              {searchResults.map((r, i) => (
                <button key={i} onClick={() => { navigate(r.to); setSearchOpen(false); setSearchQuery(''); }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                    ${r.type === 'Project' ? 'bg-red-50 text-[#CC0000]' : 'bg-green-100 text-green-700'}`}>
                    {r.type}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-white">{r.label}</p>
                    <p className="text-xs text-gray-500">{r.sub}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Dark mode */}
          <button onClick={toggleDarkMode}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Notifications */}
          <button onClick={() => navigate('/notifications')}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative">
            <Bell size={20} />
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#CC0000] rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                {unread}
              </span>
            )}
          </button>

          {/* User dropdown */}
          <div className="relative" ref={dropRef}>
            <button onClick={() => setDropdownOpen(d => !d)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center text-xs font-bold text-white">
                  {user?.avatar || user?.displayName?.[0] || '?'}
                </div>
              )}
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:block">{user?.name || user?.displayName}</span>
              <ChevronDown size={14} className="text-gray-400" />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">{user?.name || user?.displayName}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role || 'supervisor'}</p>
                </div>
                <button className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <User size={16} /> Profile
                </button>
                <button onClick={() => logout()}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
