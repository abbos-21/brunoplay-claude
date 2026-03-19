import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listAuditLogs } from '../../api/auditLog';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Pagination } from '../../components/ui/Pagination';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { SearchInput } from '../../components/ui/SearchInput';
import type { AuditLogEntry } from '../../types';

export default function AuditLogPage() {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['audit-log', page, action],
    queryFn: () => listAuditLogs({ page, limit: 30, action: action || undefined }),
  });

  const columns: Column<AuditLogEntry>[] = [
    { key: 'id', header: 'ID', render: (e) => e.id },
    {
      key: 'admin',
      header: 'Admin',
      render: (e) => (
        <div>
          <span className="font-medium">{e.admin?.username}</span>
          <Badge color="gray" >{e.admin?.role}</Badge>
        </div>
      ),
    },
    { key: 'action', header: 'Action', render: (e) => <Badge color="blue">{e.action}</Badge> },
    { key: 'target', header: 'Target', render: (e) => e.targetType ? `${e.targetType}:${e.targetId}` : '-' },
    {
      key: 'details',
      header: 'Details',
      render: (e) => (
        <span className="max-w-xs truncate text-xs text-gray-500" title={JSON.stringify(e.details)}>
          {e.details ? JSON.stringify(e.details).slice(0, 80) : '-'}
        </span>
      ),
    },
    { key: 'ip', header: 'IP', render: (e) => e.ip },
    { key: 'createdAt', header: 'Time', render: (e) => new Date(e.createdAt).toLocaleString() },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
      <Card className="p-0">
        <div className="border-b border-gray-200 p-4">
          <div className="w-64">
            <SearchInput value={action} onChange={(v) => { setAction(v); setPage(1); }} placeholder="Filter by action..." />
          </div>
        </div>
        <DataTable columns={columns} data={data?.data || []} isLoading={isLoading} rowKey={(e) => e.id} />
        {data && <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />}
      </Card>
    </div>
  );
}
