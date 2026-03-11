import { useState } from 'react';
import { Bell, CheckCheck, Trash2, AlertTriangle, CheckCircle, Info, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';

const TYPE_CONFIG = {
  warning: { Icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
  task: { Icon: CheckCircle, color: 'text-red-700', bg: 'bg-red-50 dark:bg-red-900/20' },
  attendance: { Icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  info: { Icon: Info, color: 'text-gray-600', bg: 'bg-gray-50 dark:bg-gray-700' },
  success: { Icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
};

const FILTER_TABS = ['All', 'Unread', 'Tasks', 'Alerts', 'Info'];

export default function Notifications() {
  const { notifications, markAllRead, markNotificationRead, removeNotification, showToast } = useApp();
  const [filter, setFilter] = useState('All');

  const deleteOne = (id) => { removeNotification(id); showToast('Notification removed', 'info'); };

  const filtered = notifications.filter(n => {
    if (filter === 'Unread') return !n.read;
    if (filter === 'Tasks') return n.type === 'task';
    if (filter === 'Alerts') return n.type === 'warning' || n.type === 'attendance';
    if (filter === 'Info') return n.type === 'info' || n.type === 'success';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6 fade-in max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-header dark:text-white">Notifications</h2>
          <p className="text-sm text-gray-500">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-green-400 hover:text-green-600 transition-colors">
            <CheckCheck size={16} /> Mark All Read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {FILTER_TABS.map(tab => (
          <button key={tab} onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${filter === tab ? 'bg-[#CC0000] text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-[#CC0000]'}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Bell size={64} className="mx-auto mb-4 opacity-20" />
          <h3 className="text-lg font-medium">No notifications</h3>
          <p className="text-sm mt-1">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(n => {
            const { Icon, color, bg } = TYPE_CONFIG[n.type] || TYPE_CONFIG.info;
            return (
              <div key={n.id} onClick={() => markNotificationRead(n.id)}
                className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all hover:shadow-md
                  ${n.read ? 'bg-white dark:bg-gray-800' : bg + ' border border-current/10'}
                  ${!n.read ? 'shadow-sm' : ''}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${!n.read ? bg : 'bg-gray-100 dark:bg-gray-700'}`}>
                  <Icon size={20} className={color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className={`text-sm font-semibold ${n.read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-800 dark:text-white'}`}>{n.title}</p>
                      <p className="text-sm text-gray-500 mt-0.5 whitespace-pre-wrap">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!n.read && <span className="w-2 h-2 rounded-full bg-[#CC0000]" />}
                      <button onClick={e => { e.stopPropagation(); deleteOne(n.id); }} className="p-1 text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
