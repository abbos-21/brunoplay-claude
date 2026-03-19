import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { listSeasons, createSeason, updateSeason, deleteSeason } from '../../api/seasons';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { RoleGuard } from '../../components/ui/RoleGuard';
import type { Season } from '../../types';

export default function SeasonsPage() {
  const qc = useQueryClient();
  const { data: seasons, isLoading } = useQuery({ queryKey: ['seasons'], queryFn: listSeasons });

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Season | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', start: '', end: '' });

  const resetForm = () => { setForm({ name: '', start: '', end: '' }); setEditing(null); setShowForm(false); };

  const openEdit = (s: Season) => {
    setEditing(s);
    setForm({ name: s.name, start: s.start.slice(0, 16), end: s.end.slice(0, 16) });
    setShowForm(true);
  };

  const saveMutation = useMutation({
    mutationFn: () => editing ? updateSeason(editing.id, form) : createSeason(form),
    onSuccess: () => { toast.success(editing ? 'Season updated' : 'Season created'); qc.invalidateQueries({ queryKey: ['seasons'] }); resetForm(); },
    onError: () => toast.error('Failed to save'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteSeason(id),
    onSuccess: () => { toast.success('Season deleted'); qc.invalidateQueries({ queryKey: ['seasons'] }); setDeleteId(null); },
    onError: () => toast.error('Failed to delete'),
  });

  const columns: Column<Season>[] = [
    { key: 'id', header: 'ID', render: (s) => s.id },
    { key: 'name', header: 'Name', render: (s) => <span className="font-medium">{s.name}</span> },
    { key: 'start', header: 'Start', render: (s) => new Date(s.start).toLocaleString() },
    { key: 'end', header: 'End', render: (s) => new Date(s.end).toLocaleString() },
    {
      key: 'actions', header: '', render: (s) => (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <RoleGuard minRole="ADMIN"><Button variant="ghost" size="sm" onClick={() => openEdit(s)}>Edit</Button></RoleGuard>
          <RoleGuard minRole="SUPER_ADMIN"><Button variant="ghost" size="sm" onClick={() => setDeleteId(s.id)} className="text-red-600">Delete</Button></RoleGuard>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Seasons</h1>
        <RoleGuard minRole="ADMIN"><Button onClick={() => { resetForm(); setShowForm(true); }}>Create Season</Button></RoleGuard>
      </div>
      <Card className="p-0">
        <DataTable columns={columns} data={seasons || []} isLoading={isLoading} rowKey={(s) => s.id} />
      </Card>

      <Modal open={showForm} onClose={resetForm} title={editing ? 'Edit Season' : 'Create Season'}>
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Start" type="datetime-local" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} />
          <Input label="End" type="datetime-local" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={resetForm}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate()} loading={saveMutation.isPending}>Save</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={deleteId !== null} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && deleteMutation.mutate(deleteId)} title="Delete Season" message="Are you sure?" confirmLabel="Delete" loading={deleteMutation.isPending} />
    </div>
  );
}
