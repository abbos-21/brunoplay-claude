import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { listUsers } from '../../api/users';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Pagination } from '../../components/ui/Pagination';
import { SearchInput } from '../../components/ui/SearchInput';
import { Select } from '../../components/ui/Select';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Card } from '../../components/ui/Card';
import type { User } from '../../types';

export default function UsersListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isBlocked, setIsBlocked] = useState<string>('');
  const [level, setLevel] = useState<string>('');

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, search, sortBy, sortOrder, isBlocked, level],
    queryFn: () =>
      listUsers({
        page,
        limit: 20,
        search: search || undefined,
        sortBy,
        sortOrder,
        isBlocked: isBlocked ? isBlocked === 'true' : undefined,
        level: level ? Number(level) : undefined,
      }),
  });

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const columns: Column<User>[] = [
    { key: 'id', header: 'ID', render: (u) => u.id, sortable: true },
    {
      key: 'username',
      header: 'User',
      render: (u) => (
        <div>
          <p className="font-medium text-gray-900">{u.firstName} {u.lastName}</p>
          <p className="text-xs text-gray-500">@{u.username || u.telegramId}</p>
        </div>
      ),
    },
    { key: 'level', header: 'Level', render: (u) => u.level, sortable: true },
    {
      key: 'coins',
      header: 'Coins',
      render: (u) => u.coins.toLocaleString(),
      sortable: true,
    },
    {
      key: 'totalCoinsEarned',
      header: 'Total Earned',
      render: (u) => u.totalCoinsEarned.toLocaleString(),
      sortable: true,
    },
    {
      key: 'status',
      header: 'Status',
      render: (u) => <StatusBadge status={u.isBlocked ? 'blocked' : 'active'} />,
    },
    {
      key: 'createdAt',
      header: 'Joined',
      render: (u) => new Date(u.createdAt).toLocaleDateString(),
      sortable: true,
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Users</h1>

      <Card className="p-0">
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 p-4">
          <div className="w-64">
            <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search users..." />
          </div>
          <Select
            options={[
              { value: '', label: 'All Status' },
              { value: 'false', label: 'Active' },
              { value: 'true', label: 'Blocked' },
            ]}
            value={isBlocked}
            onChange={(e) => { setIsBlocked(e.target.value); setPage(1); }}
          />
          <Select
            options={[
              { value: '', label: 'All Levels' },
              ...Array.from({ length: 13 }, (_, i) => ({ value: String(i + 1), label: `Level ${i + 1}` })),
            ]}
            value={level}
            onChange={(e) => { setLevel(e.target.value); setPage(1); }}
          />
        </div>
        <DataTable
          columns={columns}
          data={data?.data || []}
          isLoading={isLoading}
          rowKey={(u) => u.id}
          onRowClick={(u) => navigate(`/users/${u.id}`)}
          onSort={handleSort}
          sortBy={sortBy}
          sortOrder={sortOrder}
          emptyMessage="No users found"
        />
        {data && <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />}
      </Card>
    </div>
  );
}
