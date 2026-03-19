import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { listDailyCombos, createDailyCombo } from '../../api/dailyCombo';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { RoleGuard } from '../../components/ui/RoleGuard';
import type { DailyCombo } from '../../types';

export default function DailyComboPage() {
  const qc = useQueryClient();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [formDate, setFormDate] = useState('');
  const [formItems, setFormItems] = useState('1,2,3,4');

  const { data: combos, isLoading } = useQuery({
    queryKey: ['daily-combos', startDate, endDate],
    queryFn: () => listDailyCombos({ startDate: startDate || undefined, endDate: endDate || undefined }),
  });

  const createMutation = useMutation({
    mutationFn: () => createDailyCombo({
      date: formDate,
      correctItems: formItems.split(',').map(Number),
    }),
    onSuccess: () => { toast.success('Combo created'); qc.invalidateQueries({ queryKey: ['daily-combos'] }); setShowCreate(false); },
    onError: () => toast.error('Failed to create combo'),
  });

  const columns: Column<DailyCombo>[] = [
    { key: 'id', header: 'ID', render: (c) => c.id },
    { key: 'date', header: 'Date', render: (c) => c.date },
    { key: 'correctItems', header: 'Correct Items', render: (c) => c.correctItems.join(', ') },
    { key: 'createdAt', header: 'Created', render: (c) => new Date(c.createdAt).toLocaleDateString() },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Daily Combo</h1>
        <RoleGuard minRole="ADMIN">
          <Button onClick={() => setShowCreate(true)}>Create Combo</Button>
        </RoleGuard>
      </div>

      <Card className="p-0">
        <div className="flex items-center gap-3 border-b border-gray-200 p-4">
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} placeholder="Start date" />
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="End date" />
        </div>
        <DataTable columns={columns} data={combos || []} isLoading={isLoading} rowKey={(c) => c.id} />
      </Card>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Daily Combo">
        <div className="space-y-4">
          <Input label="Date (YYYY-MM-DD)" type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
          <Input label="Correct Items (comma-separated, 1-8)" value={formItems} onChange={(e) => setFormItems(e.target.value)} placeholder="1,2,3,4" />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate()} loading={createMutation.isPending}>Create</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
