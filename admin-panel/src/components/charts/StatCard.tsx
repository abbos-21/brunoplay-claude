import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  change?: string;
  color?: string;
}

export function StatCard({ title, value, icon, change, color = 'blue' }: StatCardProps) {
  const bgMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{typeof value === 'number' ? value.toLocaleString() : value}</p>
          {change && <p className="mt-1 text-xs text-green-600">{change}</p>}
        </div>
        <div className={`rounded-lg p-2.5 ${bgMap[color] || bgMap.blue}`}>{icon}</div>
      </div>
    </div>
  );
}
