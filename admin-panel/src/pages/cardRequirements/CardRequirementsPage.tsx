import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { listCardRequirements, createCardRequirement, updateCardRequirement, deleteCardRequirement } from '../../api/cardRequirements';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { RoleGuard } from '../../components/ui/RoleGuard';
import type { CardRequirement } from '../../types';

export default function CardRequirementsPage() {
  const qc = useQueryClient();
  const { data: requirements, isLoading } = useQuery({ queryKey: ['card-requirements'], queryFn: listCardRequirements });

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CardRequirement | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState({
    cardName: 'COIN_CAPACITY' as 'COIN_CAPACITY' | 'MINING_RATE',
    level: 1,
    description: '',
    requirementType: '',
    requirementValue: '',
  });

  const resetForm = () => {
    setForm({ cardName: 'COIN_CAPACITY', level: 1, description: '', requirementType: '', requirementValue: '' });
    setEditing(null);
    setShowForm(false);
  };

  const openEdit = (r: CardRequirement) => {
    setEditing(r);
    setForm({ cardName: r.cardName, level: r.level, description: r.description, requirementType: r.requirementType, requirementValue: r.requirementValue });
    setShowForm(true);
  };

  const saveMutation = useMutation({
    mutationFn: () => editing ? updateCardRequirement(editing.id, form) : createCardRequirement(form),
    onSuccess: () => { toast.success(editing ? 'Requirement updated' : 'Requirement created'); qc.invalidateQueries({ queryKey: ['card-requirements'] }); resetForm(); },
    onError: () => toast.error('Failed to save'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCardRequirement(id),
    onSuccess: () => { toast.success('Requirement deleted'); qc.invalidateQueries({ queryKey: ['card-requirements'] }); setDeleteId(null); },
    onError: () => toast.error('Failed to delete'),
  });

  const columns: Column<CardRequirement>[] = [
    { key: 'id', header: 'ID', render: (r) => r.id },
    { key: 'cardName', header: 'Card', render: (r) => <Badge color={r.cardName === 'COIN_CAPACITY' ? 'blue' : 'purple'}>{r.cardName}</Badge> },
    { key: 'level', header: 'Level', render: (r) => r.level },
    { key: 'description', header: 'Description', render: (r) => r.description },
    { key: 'requirementType', header: 'Type', render: (r) => r.requirementType },
    { key: 'requirementValue', header: 'Value', render: (r) => r.requirementValue },
    {
      key: 'actions', header: '', render: (r) => (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <RoleGuard minRole="ADMIN"><Button variant="ghost" size="sm" onClick={() => openEdit(r)}>Edit</Button></RoleGuard>
          <RoleGuard minRole="SUPER_ADMIN"><Button variant="ghost" size="sm" onClick={() => setDeleteId(r.id)} className="text-red-600">Delete</Button></RoleGuard>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Card Requirements</h1>
        <RoleGuard minRole="ADMIN"><Button onClick={() => { resetForm(); setShowForm(true); }}>Create Requirement</Button></RoleGuard>
      </div>
      <Card className="p-0">
        <DataTable columns={columns} data={requirements || []} isLoading={isLoading} rowKey={(r) => r.id} />
      </Card>

      <Modal open={showForm} onClose={resetForm} title={editing ? 'Edit Requirement' : 'Create Requirement'} size="lg">
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Card Name" value={form.cardName} onChange={(e) => setForm({ ...form, cardName: e.target.value as 'COIN_CAPACITY' | 'MINING_RATE' })} options={[{ value: 'COIN_CAPACITY', label: 'Coin Capacity' }, { value: 'MINING_RATE', label: 'Mining Rate' }]} />
          <Input label="Level" type="number" min={1} max={13} value={form.level} onChange={(e) => setForm({ ...form, level: Number(e.target.value) })} />
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Input label="Requirement Type" value={form.requirementType} onChange={(e) => setForm({ ...form, requirementType: e.target.value })} />
          <Input label="Requirement Value" value={form.requirementValue} onChange={(e) => setForm({ ...form, requirementValue: e.target.value })} />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={resetForm}>Cancel</Button>
          <Button onClick={() => saveMutation.mutate()} loading={saveMutation.isPending}>Save</Button>
        </div>
      </Modal>

      <ConfirmDialog open={deleteId !== null} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && deleteMutation.mutate(deleteId)} title="Delete Requirement" message="Are you sure?" confirmLabel="Delete" loading={deleteMutation.isPending} />
    </div>
  );
}
