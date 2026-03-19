import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { listWithdrawals, getWithdrawalStats } from '../../api/withdrawals';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Pagination } from '../../components/ui/Pagination';
import { Select } from '../../components/ui/Select';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/charts/StatCard';
import { ArrowDownCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import type { Withdrawal } from '../../types';

export default function WithdrawalsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { data, isLoading } = useQuery({
    queryKey: ['withdrawals', page, status, sortBy, sortOrder],
    queryFn: () => listWithdrawals({ page, limit: 20, status: status || undefined, sortBy, sortOrder }),
  });

  const stats = useQuery({ queryKey: ['withdrawals', 'stats'], queryFn: getWithdrawalStats });

  const handleSort = (key: string) => {
    if (sortBy === key) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else { setSortBy(key); setSortOrder('desc'); }
    setPage(1);
  };

  const columns: Column<Withdrawal>[] = [
    { key: 'id', header: 'ID', render: (w) => w.id },
    { key: 'userId', header: 'User ID', render: (w) => w.userId },
    { key: 'amountCoins', header: 'Coins', render: (w) => w.amountCoins.toLocaleString(), sortable: true },
    { key: 'amountTon', header: 'TON', render: (w) => w.amountTon.toFixed(4), sortable: true },
    { key: 'status', header: 'Status', render: (w) => <StatusBadge status={w.status} /> },
    { key: 'createdAt', header: 'Created', render: (w) => new Date(w.createdAt).toLocaleString(), sortable: true },
  ];

  const s = stats.data;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Withdrawals</h1>

      {s && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Pending" value={s.totalPending} icon={<Clock size={20} />} color="yellow" />
          <StatCard title="Pending Amount" value={`${s.totalPendingAmount?.toFixed(2)} TON`} icon={<ArrowDownCircle size={20} />} color="yellow" />
          <StatCard title="Completed" value={s.totalCompleted} icon={<CheckCircle size={20} />} color="green" />
          <StatCard title="Failed" value={s.totalFailed} icon={<XCircle size={20} />} color="red" />
        </div>
      )}

      <Card className="p-0">
        <div className="flex items-center gap-3 border-b border-gray-200 p-4">
          <Select
            options={[
              { value: '', label: 'All Status' },
              { value: 'PENDING', label: 'Pending' },
              { value: 'PROCESSING', label: 'Processing' },
              { value: 'COMPLETED', label: 'Completed' },
              { value: 'FAILED', label: 'Failed' },
              { value: 'CANCELLED', label: 'Cancelled' },
            ]}
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          />
        </div>
        <DataTable
          columns={columns}
          data={data?.data || []}
          isLoading={isLoading}
          rowKey={(w) => w.id}
          onRowClick={(w) => navigate(`/withdrawals/${w.id}`)}
          onSort={handleSort}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />
        {data && <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />}
      </Card>
    </div>
  );
}
