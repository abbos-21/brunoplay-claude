import { useAuth } from './useAuth';
import type { AdminRole } from '../types';

const ROLE_HIERARCHY: Record<AdminRole, number> = {
  MODERATOR: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3,
};

export function hasMinRole(current: AdminRole | undefined, required: AdminRole): boolean {
  if (!current) return false;
  return ROLE_HIERARCHY[current] >= ROLE_HIERARCHY[required];
}

export function useRole() {
  const { admin } = useAuth();

  return {
    role: admin?.role,
    hasMinRole: (required: AdminRole) => hasMinRole(admin?.role, required),
    isSuperAdmin: admin?.role === 'SUPER_ADMIN',
    isAdmin: hasMinRole(admin?.role, 'ADMIN'),
    isModerator: hasMinRole(admin?.role, 'MODERATOR'),
  };
}
