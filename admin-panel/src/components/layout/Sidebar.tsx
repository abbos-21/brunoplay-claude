import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ArrowDownCircle,
  Settings,
  ListTodo,
  Grid3X3,
  Trophy,
  Layers,
  CreditCard,
  Megaphone,
  FileText,
  Fish,
} from 'lucide-react';
import { useRole } from '../../hooks/useRole';
import type { AdminRole } from '../../types';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  minRole: AdminRole;
}

const navItems: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={18} />, minRole: 'MODERATOR' },
  { to: '/users', label: 'Users', icon: <Users size={18} />, minRole: 'MODERATOR' },
  { to: '/withdrawals', label: 'Withdrawals', icon: <ArrowDownCircle size={18} />, minRole: 'MODERATOR' },
  { to: '/settings', label: 'Settings', icon: <Settings size={18} />, minRole: 'MODERATOR' },
  { to: '/tasks', label: 'Tasks', icon: <ListTodo size={18} />, minRole: 'MODERATOR' },
  { to: '/daily-combo', label: 'Daily Combo', icon: <Grid3X3 size={18} />, minRole: 'MODERATOR' },
  { to: '/tournaments', label: 'Tournaments', icon: <Trophy size={18} />, minRole: 'MODERATOR' },
  { to: '/seasons', label: 'Seasons', icon: <Layers size={18} />, minRole: 'MODERATOR' },
  { to: '/card-requirements', label: 'Card Requirements', icon: <CreditCard size={18} />, minRole: 'MODERATOR' },
  { to: '/broadcast', label: 'Broadcast', icon: <Megaphone size={18} />, minRole: 'SUPER_ADMIN' },
  { to: '/audit-log', label: 'Audit Log', icon: <FileText size={18} />, minRole: 'MODERATOR' },
];

export function Sidebar() {
  const { hasMinRole } = useRole();

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-gray-200 bg-white">
      <div className="flex items-center gap-2 border-b border-gray-200 px-5 py-4">
        <Fish size={24} className="text-blue-600" />
        <span className="text-lg font-bold text-gray-900">Bruno Admin</span>
      </div>
      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {navItems
            .filter((item) => hasMinRole(item.minRole))
            .map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              </li>
            ))}
        </ul>
      </nav>
    </aside>
  );
}
