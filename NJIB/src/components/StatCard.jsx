import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ title, value, icon: Icon, color = '#CC0000', trend, subtitle, bgGradient }) {
  const isPositive = trend > 0;
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-3 md:p-5 flex items-start gap-2 md:gap-4 hover:shadow-lg transition-shadow duration-200`}>
      <div className="rounded-xl p-2 md:p-3 flex-shrink-0" style={{ backgroundColor: color + '20' }}>
        <Icon size={20} className="md:w-6 md:h-6" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] md:text-sm text-gray-500 dark:text-gray-400 font-medium leading-tight">{title}</p>
        <p className="text-lg md:text-2xl font-bold mt-0.5" style={{ color }}>{value}</p>
        {subtitle && <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 truncate">{subtitle}</p>}
        {trend !== undefined && (
          <div className={`flex items-center gap-1 mt-1 text-[10px] md:text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
            {isPositive ? <TrendingUp size={12} className="md:w-3.5 md:h-3.5" /> : <TrendingDown size={12} className="md:w-3.5 md:h-3.5" />}
            <span className="truncate">{Math.abs(trend)}% this month</span>
          </div>
        )}
      </div>
    </div>
  );
}
