import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { listTournaments, createTournament, updateTournament, deleteTournament, finalizeTournament } from '../../api/tournaments';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { RoleGuard } from '../../components/ui/RoleGuard';
import type { Tournament } from '../../types';

export default function TournamentsPage() {
  const qc = useQueryClient();
  const { data: tournaments, isLoading } = useQuery({ queryKey: ['tournaments'], queryFn: listTournaments });

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Tournament | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [finalizeId, setFinalizeId] = useState<number | null>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    startAt: '',
    endAt: '',
    isActive: true,
    rewards: '{"1": 1000, "2": 500, "3": 250}',
  });

  const resetForm = () => {
    setForm({ name: '', description: '', startAt: '', endAt: '', isActive: true, rewards: '{"1": 1000, "2": 500, "3": 250}' });
    setEditing(null);
    setShowForm(false);
  };

  const openEdit = (t: Tournament) => {
    setEditing(t);
    setForm({
      name: t.name,
      description: t.description,
      startAt: t.startAt.slice(0, 16),
      endAt: t.endAt.slice(0, 16),
      isActive: t.isActive,
      rewards: JSON.stringify(t.rewards, null, 2),
    });
    setShowForm(true);
  };

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = { ...form, rewards: JSON.parse(form.rewards) };
      return editing ? updateTournament(editing.id, payload) : createTournament(payload);
    },
    onSuccess: () => { toast.success(editing ? 'Tournament updated' : 'Tournament created'); qc.invalidateQueries({ queryKey: ['tournaments'] }); resetForm(); },
    onError: () => toast.error('Failed to save'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTournament(id),
    onSuccess: () => { toast.success('Tournament deleted'); qc.invalidateQueries({ queryKey: ['tournaments'] }); setDeleteId(null); },
    onError: () => toast.error('Failed to delete'),
  });

  const finalizeMutation = useMutation({
    mutationFn: (id: number) => finalizeTournament(id),
    onSuccess: () => { toast.success('Tournament finalized'); qc.invalidateQueries({ queryKey: ['tournaments'] }); setFinalizeId(null); },
    onError: () => toast.error('Failed to finalize'),
  });

  const columns: Column<Tournament>[] = [
    { key: 'id', header: 'ID', render: (t) => t.id },
    { key: 'name', header: 'Name', render: (t) => <span className="font-medium">{t.name}</span> },
    { key: 'startAt', header: 'Start', render: (t) => new Date(t.startAt).toLocaleString() },
    { key: 'endAt', header: 'End', render: (t) => new Date(t.endAt).toLocaleString() },
    { key: 'entries', header: 'Entries', render: (t) => t._count?.entries ?? 0 },
    { key: 'isActive', header: 'Active', render: (t) => <Badge color={t.isActive ? 'green' : 'gray'}>{t.isActive ? 'Yes' : 'No'}</Badge> },
    {
      key: 'actions', header: '', render: (t) => (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <RoleGuard minRole="ADMIN"><Button variant="ghost" size="sm" onClick={() => openEdit(t)}>Edit</Button></RoleGuard>
          <RoleGuard minRole="SUPER_ADMIN">
            <Button variant="ghost" size="sm" onClick={() => setFinalizeId(t.id)}>Finalize</Button>
            <Button variant="ghost" size="sm" onClick={() => setDeleteId(t.id)} className="text-red-600">Delete</Button>
          </RoleGuard>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tournaments</h1>
        <RoleGuard minRole="ADMIN"><Button onClick={() => { resetForm(); setShowForm(true); }}>Create Tournament</Button></RoleGuard>
      </div>
      <Card className="p-0">
        <DataTable columns={columns} data={tournaments || []} isLoading={isLoading} rowKey={(t) => t.id} />
      </Card>

      <Modal open={showForm} onClose={resetForm} title={editing ? 'Edit Tournament' : 'Create Tournament'} size="lg">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Input label="Start" type="datetime-local" value={form.startAt} onChange={(e) => setForm({ ...form, startAt: e.target.value })} />
          <Input label="End" type="datetime-local" value={form.endAt} onChange={(e) => setForm({ ...form, endAt: e.target.value })} />
          <Select label="Active" value={form.isActive ? 'true' : 'false'} onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })} options={[{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }]} />
        </div>
        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">Rewards (JSON)</label>
          <textarea className="w-full rounded-lg border border-gray-300 p-3 font-mono text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none" rows={4} value={form.rewards} onChange={(e) => setForm({ ...form, rewards: e.target.value })} />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={resetForm}>Cancel</Button>
          <Button onClick={() => saveMutation.mutate()} loading={saveMutation.isPending}>Save</Button>
        </div>
      </Modal>

      <ConfirmDialog open={deleteId !== null} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && deleteMutation.mutate(deleteId)} title="Delete Tournament" message="Are you sure?" confirmLabel="Delete" loading={deleteMutation.isPending} />
      <ConfirmDialog open={finalizeId !== null} onClose={() => setFinalizeId(null)} onConfirm={() => finalizeId && finalizeMutation.mutate(finalizeId)} title="Finalize Tournament" message="This will distribute rewards. Are you sure?" confirmLabel="Finalize" variant="primary" loading={finalizeMutation.isPending} />
    </div>
  );
}
