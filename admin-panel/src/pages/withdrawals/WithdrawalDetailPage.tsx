import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { getWithdrawal, approveWithdrawal, rejectWithdrawal } from '../../api/withdrawals';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { RoleGuard } from '../../components/ui/RoleGuard';
import { useState } from 'react';

export default function WithdrawalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const wid = Number(id);

  const { data: withdrawal, isLoading } = useQuery({
    queryKey: ['withdrawal', wid],
    queryFn: () => getWithdrawal(wid),
  });

  const [showApprove, setShowApprove] = useState(false);
  const [showReject, setShowReject] = useState(false);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['withdrawal', wid] });
    qc.invalidateQueries({ queryKey: ['withdrawals'] });
  };

  const approveMut = useMutation({
    mutationFn: () => approveWithdrawal(wid),
    onSuccess: () => { toast.success('Withdrawal approved'); invalidate(); setShowApprove(false); },
    onError: () => toast.error('Failed to approve'),
  });

  const rejectMut = useMutation({
    mutationFn: () => rejectWithdrawal(wid),
    onSuccess: () => { toast.success('Withdrawal rejected'); invalidate(); setShowReject(false); },
    onError: () => toast.error('Failed to reject'),
  });

  if (isLoading) return <LoadingSpinner />;
  if (!withdrawal) return <p>Withdrawal not found</p>;

  const isPending = withdrawal.status === 'PENDING';

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/withdrawals')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft size={16} /> Back to Withdrawals
      </button>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Withdrawal #{withdrawal.id}</h1>
          <StatusBadge status={withdrawal.status} />
        </div>
        {isPending && (
          <div className="flex gap-2">
            <RoleGuard minRole="ADMIN">
              <Button variant="danger" onClick={() => setShowReject(true)}>Reject</Button>
            </RoleGuard>
            <RoleGuard minRole="SUPER_ADMIN">
              <Button variant="success" onClick={() => setShowApprove(true)}>Approve</Button>
            </RoleGuard>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <Card>
          <p className="text-xs text-gray-500">User ID</p>
          <p className="text-lg font-bold cursor-pointer text-blue-600 hover:underline" onClick={() => navigate(`/users/${withdrawal.userId}`)}>{withdrawal.userId}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500">Amount (Coins)</p>
          <p className="text-lg font-bold">{withdrawal.amountCoins.toLocaleString()}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500">Amount (TON)</p>
          <p className="text-lg font-bold">{withdrawal.amountTon.toFixed(4)}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500">Target Address</p>
          <p className="break-all text-sm font-mono">{withdrawal.targetAddress}</p>
        </Card>
        {withdrawal.txHash && (
          <Card>
            <p className="text-xs text-gray-500">TX Hash</p>
            <p className="break-all text-sm font-mono">{withdrawal.txHash}</p>
          </Card>
        )}
        {withdrawal.errorMessage && (
          <Card>
            <p className="text-xs text-gray-500">Error</p>
            <p className="text-sm text-red-600">{withdrawal.errorMessage}</p>
          </Card>
        )}
        <Card>
          <p className="text-xs text-gray-500">Created</p>
          <p className="text-sm">{new Date(withdrawal.createdAt).toLocaleString()}</p>
        </Card>
        {withdrawal.processedAt && (
          <Card>
            <p className="text-xs text-gray-500">Processed</p>
            <p className="text-sm">{new Date(withdrawal.processedAt).toLocaleString()}</p>
          </Card>
        )}
      </div>

      <ConfirmDialog
        open={showApprove}
        onClose={() => setShowApprove(false)}
        onConfirm={() => approveMut.mutate()}
        title="Approve Withdrawal"
        message={`Approve withdrawal of ${withdrawal.amountTon.toFixed(4)} TON to ${withdrawal.targetAddress}?`}
        confirmLabel="Approve"
        variant="primary"
        loading={approveMut.isPending}
      />
      <ConfirmDialog
        open={showReject}
        onClose={() => setShowReject(false)}
        onConfirm={() => rejectMut.mutate()}
        title="Reject Withdrawal"
        message="Reject this withdrawal? Coins will be refunded to the user."
        confirmLabel="Reject"
        variant="danger"
        loading={rejectMut.isPending}
      />
    </div>
  );
}
