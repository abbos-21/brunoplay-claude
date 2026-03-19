import type { ReactNode } from 'react';
import { useRole } from '../../hooks/useRole';
import type { AdminRole } from '../../types';

interface RoleGuardProps {
  minRole: AdminRole;
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleGuard({ minRole, children, fallback = null }: RoleGuardProps) {
  const { hasMinRole } = useRole();
  if (!hasMinRole(minRole)) return <>{fallback}</>;
  return <>{children}</>;
}
