import { LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Badge } from '../ui/Badge';

export function Header() {
  const { admin, logout } = useAuth();

  const roleColor = {
    SUPER_ADMIN: 'purple' as const,
    ADMIN: 'blue' as const,
    MODERATOR: 'gray' as const,
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div />
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">{admin?.username}</span>
          <Badge color={roleColor[admin?.role || 'MODERATOR']}>{admin?.role}</Badge>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  );
}
