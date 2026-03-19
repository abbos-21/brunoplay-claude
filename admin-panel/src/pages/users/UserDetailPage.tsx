import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { getUser, blockUser, unblockUser, adjustCoins, adjustStars, resetStreak, getUserActions } from '../../api/users';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Pagination } from '../../components/ui/Pagination';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { RoleGuard } from '../../components/ui/RoleGuard';
import type { UserAction } from '../../types';

export default function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const uid = Number(userId);

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', uid],
    queryFn: () => getUser(uid),
  });

  const [actionsPage, setActionsPage] = useState(1);
  const actions = useQuery({
    queryKey: ['user-actions', uid, actionsPage],
    queryFn: () => getUserActions(uid, { page: actionsPage, limit: 20 }),
  });

  const [showAdjustCoins, setShowAdjustCoins] = useState(false);
  const [showAdjustStars, setShowAdjustStars] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [showResetStreak, setShowResetStreak] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['user', uid] });
    qc.invalidateQueries({ queryKey: ['users'] });
  };

  const blockMutation = useMutation({
    mutationFn: () => (user?.isBlocked ? unblockUser(uid) : blockUser(uid)),
    onSuccess: () => { toast.success(user?.isBlocked ? 'User unblocked' : 'User blocked'); invalidate(); setShowBlockConfirm(false); },
    onError: () => toast.error('Action failed'),
  });

  const coinsMutation = useMutation({
    mutationFn: () => adjustCoins(uid, Number(adjustAmount), adjustReason),
    onSuccess: () => { toast.success('Coins adjusted'); invalidate(); setShowAdjustCoins(false); setAdjustAmount(''); setAdjustReason(''); },
    onError: () => toast.error('Failed to adjust coins'),
  });

  const starsMutation = useMutation({
    mutationFn: () => adjustStars(uid, Number(adjustAmount), adjustReason),
    onSuccess: () => { toast.success('Stars adjusted'); invalidate(); setShowAdjustStars(false); setAdjustAmount(''); setAdjustReason(''); },
    onError: () => toast.error('Failed to adjust stars'),
  });

  const resetMutation = useMutation({
    mutationFn: () => resetStreak(uid),
    onSuccess: () => { toast.success('Streak reset'); invalidate(); setShowResetStreak(false); },
    onError: () => toast.error('Failed to reset streak'),
  });

  if (isLoading) return <LoadingSpinner />;
  if (!user) return <p>User not found</p>;

  const actionColumns: Column<UserAction>[] = [
    { key: 'type', header: 'Action', render: (a) => <Badge>{a.type}</Badge> },
    { key: 'data', header: 'Details', render: (a) => <span className="text-xs text-gray-500">{JSON.stringify(a.data)}</span> },
    { key: 'ip', header: 'IP', render: (a) => a.ip },
    { key: 'time', header: 'Time', render: (a) => new Date(a.time).toLocaleString() },
  ];

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/users')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft size={16} /> Back to Users
      </button>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{user.firstName} {user.lastName}</h1>
          <p className="text-sm text-gray-500">@{user.username || user.telegramId} &middot; ID: {user.id}</p>
        </div>
        <div className="flex gap-2">
          <RoleGuard minRole="ADMIN">
            <Button variant={user.isBlocked ? 'success' : 'danger'} size="sm" onClick={() => setShowBlockConfirm(true)}>
              {user.isBlocked ? 'Unblock' : 'Block'}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setShowResetStreak(true)}>Reset Streak</Button>
          </RoleGuard>
          <RoleGuard minRole="SUPER_ADMIN">
            <Button variant="secondary" size="sm" onClick={() => setShowAdjustCoins(true)}>Adjust Coins</Button>
            <Button variant="secondary" size="sm" onClick={() => setShowAdjustStars(true)}>Adjust Stars</Button>
          </RoleGuard>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <p className="text-xs text-gray-500">Status</p>
          <StatusBadge status={user.isBlocked ? 'blocked' : 'active'} />
        </Card>
        <Card>
          <p className="text-xs text-gray-500">Level</p>
          <p className="text-xl font-bold">{user.level}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500">Coins</p>
          <p className="text-xl font-bold">{user.coins.toLocaleString()}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500">Stars</p>
          <p className="text-xl font-bold">{user.starsBalance}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500">Total Earned</p>
          <p className="text-xl font-bold">{user.totalCoinsEarned.toLocaleString()}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500">Login Streak</p>
          <p className="text-xl font-bold">{user.loginStreak}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500">Mining Rate</p>
          <p className="text-xl font-bold">{user.miningRate}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500">Tank Capacity</p>
          <p className="text-xl font-bold">{user.tankCapacity.toLocaleString()}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500">Referral Earnings</p>
          <p className="text-xl font-bold">{user.referralEarnings.toLocaleString()}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500">Referrals</p>
          <p className="text-xl font-bold">{user._count?.referrals ?? 0}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500">Language</p>
          <p className="text-xl font-bold">{user.language}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500">Joined</p>
          <p className="text-sm font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
        </Card>
      </div>

      <Card className="p-0">
        <div className="border-b border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900">User Actions</h3>
        </div>
        <DataTable columns={actionColumns} data={actions.data?.data || []} isLoading={actions.isLoading} rowKey={(a) => a.id} emptyMessage="No actions found" />
        {actions.data && <Pagination page={actions.data.page} totalPages={actions.data.totalPages} onPageChange={setActionsPage} />}
      </Card>

      <ConfirmDialog
        open={showBlockConfirm}
        onClose={() => setShowBlockConfirm(false)}
        onConfirm={() => blockMutation.mutate()}
        title={user.isBlocked ? 'Unblock User' : 'Block User'}
        message={user.isBlocked ? 'This user will regain access.' : 'This user will be blocked from the app.'}
        confirmLabel={user.isBlocked ? 'Unblock' : 'Block'}
        variant={user.isBlocked ? 'primary' : 'danger'}
        loading={blockMutation.isPending}
      />

      <ConfirmDialog
        open={showResetStreak}
        onClose={() => setShowResetStreak(false)}
        onConfirm={() => resetMutation.mutate()}
        title="Reset Login Streak"
        message={`Reset login streak for ${user.firstName}? Current streak: ${user.loginStreak}`}
        confirmLabel="Reset"
        variant="danger"
        loading={resetMutation.isPending}
      />

      <Modal open={showAdjustCoins} onClose={() => setShowAdjustCoins(false)} title="Adjust Coins">
        <div className="space-y-4">
          <Input label="Amount" type="number" value={adjustAmount} onChange={(e) => setAdjustAmount(e.target.value)} placeholder="Use negative to deduct" />
          <Input label="Reason" value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)} placeholder="Reason for adjustment" />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowAdjustCoins(false)}>Cancel</Button>
            <Button onClick={() => coinsMutation.mutate()} loading={coinsMutation.isPending} disabled={!adjustAmount || !adjustReason}>Adjust</Button>
          </div>
        </div>
      </Modal>

      <Modal open={showAdjustStars} onClose={() => setShowAdjustStars(false)} title="Adjust Stars">
        <div className="space-y-4">
          <Input label="Amount" type="number" value={adjustAmount} onChange={(e) => setAdjustAmount(e.target.value)} placeholder="Use negative to deduct" />
          <Input label="Reason" value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)} placeholder="Reason for adjustment" />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowAdjustStars(false)}>Cancel</Button>
            <Button onClick={() => starsMutation.mutate()} loading={starsMutation.isPending} disabled={!adjustAmount || !adjustReason}>Adjust</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
