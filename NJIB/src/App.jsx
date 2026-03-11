import { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Toast from './components/Toast';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import DailyLogs from './pages/DailyLogs';
import Tasks from './pages/Tasks';
import Attendance from './pages/Attendance';
import Materials from './pages/Materials';
import Reports from './pages/Reports';
import Team from './pages/Team';
import Files from './pages/Files';
import Logistics from './pages/Logistics';
import Notifications from './pages/Notifications';
import { useGeofenceTracker } from './hooks/useGeofenceTracker';

function AppLayout() {
  const { currentUser } = useAuth();
  const { darkMode } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Activate Geofencing
  useGeofenceTracker();

  if (!currentUser) return null;

  return (
    <div className={`${darkMode ? 'dark' : ''} min-h-screen bg-[#F0F4F8] dark:bg-gray-900`}>
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <div className={`transition-all duration-300 ${collapsed ? 'md:ml-16' : 'md:ml-64'}`}>
        <Navbar setMobileOpen={setMobileOpen} />
        <main className="p-4 md:p-6 min-h-screen" style={{ paddingTop: 'var(--navbar-height)' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/daily-logs" element={<DailyLogs />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/materials" element={<Materials />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/team" element={<Team />} />
            <Route path="/logistics" element={<Logistics />} />
            <Route path="/files" element={<Files />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      <Toast />
    </div>
  );
}

function AuthGate() {
  const { isAuthenticated } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/*" element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <AppProvider>
          <AuthGate />
        </AppProvider>
      </AuthProvider>
    </HashRouter>
  );
}
