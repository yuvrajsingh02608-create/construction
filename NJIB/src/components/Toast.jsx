import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const ICONS = {
  success: { Icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
  error: { Icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
  warning: { Icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
  info: { Icon: Info, color: 'text-[#CC0000]', bg: 'bg-red-50 border-red-200' },
};

function ToastItem({ id, message, type }) {
  const { dismissToast } = useApp();
  const { Icon, color, bg } = ICONS[type] || ICONS.info;
  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg slide-in max-w-sm ${bg}`}>
      <Icon size={20} className={`flex-shrink-0 mt-0.5 ${color}`} />
      <p className="text-sm text-gray-700 flex-1">{message}</p>
      <button onClick={() => dismissToast(id)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
        <X size={16} />
      </button>
    </div>
  );
}

export default function Toast() {
  const { toasts } = useApp();
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map(t => <ToastItem key={t.id} {...t} />)}
    </div>
  );
}
