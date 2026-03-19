import { Badge } from './Badge';
import type { WithdrawalStatus } from '../../types';

const statusColors: Record<string, 'gray' | 'blue' | 'green' | 'red' | 'yellow' | 'purple'> = {
  PENDING: 'yellow',
  PROCESSING: 'blue',
  COMPLETED: 'green',
  FAILED: 'red',
  CANCELLED: 'gray',
  active: 'green',
  inactive: 'gray',
  blocked: 'red',
};

interface StatusBadgeProps {
  status: WithdrawalStatus | string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return <Badge color={statusColors[status] || 'gray'}>{status}</Badge>;
}
