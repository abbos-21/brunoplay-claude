import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { listTasks, createTask, updateTask, deleteTask } from '../../api/tasks';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { RoleGuard } from '../../components/ui/RoleGuard';
import type { Task } from '../../types';

export default function TasksPage() {
  const qc = useQueryClient();
  const { data: tasks, isLoading } = useQuery({ queryKey: ['tasks'], queryFn: listTasks });

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [form, setForm] = useState({
    category: 'MAIN' as const,
    type: 'CHANNEL_JOIN' as const,
    title: '',
    description: '',
    channelUsername: '',
    requiredInvites: 0,
    rewardCoins: 0,
    isActive: true,
    sortOrder: 0,
  });

  const resetForm = () => {
    setForm({ category: 'MAIN', type: 'CHANNEL_JOIN', title: '', description: '', channelUsername: '', requiredInvites: 0, rewardCoins: 0, isActive: true, sortOrder: 0 });
    setEditing(null);
    setShowForm(false);
  };

  const openEdit = (task: Task) => {
    setEditing(task);
    setForm({
      category: task.category,
      type: task.type,
      title: task.title,
      description: task.description,
      channelUsername: task.channelUsername || '',
      requiredInvites: task.requiredInvites || 0,
      rewardCoins: task.rewardCoins,
      isActive: task.isActive,
      sortOrder: task.sortOrder,
    });
    setShowForm(true);
  };

  const saveMutation = useMutation({
    mutationFn: () => editing ? updateTask(editing.id, form) : createTask(form),
    onSuccess: () => { toast.success(editing ? 'Task updated' : 'Task created'); qc.invalidateQueries({ queryKey: ['tasks'] }); resetForm(); },
    onError: () => toast.error('Failed to save task'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTask(id),
    onSuccess: () => { toast.success('Task deleted'); qc.invalidateQueries({ queryKey: ['tasks'] }); setDeleteId(null); },
    onError: () => toast.error('Failed to delete task'),
  });

  const columns: Column<Task>[] = [
    { key: 'id', header: 'ID', render: (t) => t.id },
    { key: 'title', header: 'Title', render: (t) => <span className="font-medium">{t.title}</span> },
    { key: 'category', header: 'Category', render: (t) => <Badge color={t.category === 'MAIN' ? 'blue' : 'gray'}>{t.category}</Badge> },
    { key: 'type', header: 'Type', render: (t) => <Badge>{t.type}</Badge> },
    { key: 'rewardCoins', header: 'Reward', render: (t) => t.rewardCoins.toLocaleString() },
    { key: 'isActive', header: 'Active', render: (t) => <Badge color={t.isActive ? 'green' : 'gray'}>{t.isActive ? 'Yes' : 'No'}</Badge> },
    { key: 'completions', header: 'Completions', render: (t) => t._count?.completions ?? 0 },
    {
      key: 'actions',
      header: '',
      render: (t) => (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <RoleGuard minRole="ADMIN"><Button variant="ghost" size="sm" onClick={() => openEdit(t)}>Edit</Button></RoleGuard>
          <RoleGuard minRole="SUPER_ADMIN"><Button variant="ghost" size="sm" onClick={() => setDeleteId(t.id)} className="text-red-600">Delete</Button></RoleGuard>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
        <RoleGuard minRole="ADMIN">
          <Button onClick={() => { resetForm(); setShowForm(true); }}>Create Task</Button>
        </RoleGuard>
      </div>

      <Card className="p-0">
        <DataTable columns={columns} data={tasks || []} isLoading={isLoading} rowKey={(t) => t.id} />
      </Card>

      <Modal open={showForm} onClose={resetForm} title={editing ? 'Edit Task' : 'Create Task'} size="lg">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as 'MAIN' | 'OTHER' })} options={[{ value: 'MAIN', label: 'Main' }, { value: 'OTHER', label: 'Other' }]} />
          <Select label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as 'CHANNEL_JOIN' | 'INVITE_FRIENDS' })} options={[{ value: 'CHANNEL_JOIN', label: 'Channel Join' }, { value: 'INVITE_FRIENDS', label: 'Invite Friends' }]} />
          {form.type === 'CHANNEL_JOIN' && <Input label="Channel Username" value={form.channelUsername} onChange={(e) => setForm({ ...form, channelUsername: e.target.value })} />}
          {form.type === 'INVITE_FRIENDS' && <Input label="Required Invites" type="number" value={form.requiredInvites} onChange={(e) => setForm({ ...form, requiredInvites: Number(e.target.value) })} />}
          <Input label="Reward Coins" type="number" value={form.rewardCoins} onChange={(e) => setForm({ ...form, rewardCoins: Number(e.target.value) })} />
          <Input label="Sort Order" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
          <Select label="Active" value={form.isActive ? 'true' : 'false'} onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })} options={[{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }]} />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={resetForm}>Cancel</Button>
          <Button onClick={() => saveMutation.mutate()} loading={saveMutation.isPending}>Save</Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete Task"
        message="Are you sure you want to delete this task?"
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
