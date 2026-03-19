import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { sendBroadcast } from '../../api/broadcast';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

export default function BroadcastPage() {
  const [text, setText] = useState('');
  const [parseMode, setParseMode] = useState<'HTML' | 'Markdown' | 'MarkdownV2'>('HTML');
  const [showConfirm, setShowConfirm] = useState(false);

  const mutation = useMutation({
    mutationFn: () => sendBroadcast({ text, parseMode }),
    onSuccess: () => { toast.success('Broadcast sent successfully'); setText(''); setShowConfirm(false); },
    onError: () => toast.error('Failed to send broadcast'),
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Broadcast</h1>
      <Card>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Message (max 4096 chars)</label>
            <textarea
              className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              rows={8}
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={4096}
              placeholder="Enter your broadcast message..."
            />
            <p className="mt-1 text-xs text-gray-500">{text.length}/4096</p>
          </div>
          <Select
            label="Parse Mode"
            value={parseMode}
            onChange={(e) => setParseMode(e.target.value as typeof parseMode)}
            options={[
              { value: 'HTML', label: 'HTML' },
              { value: 'Markdown', label: 'Markdown' },
              { value: 'MarkdownV2', label: 'MarkdownV2' },
            ]}
          />
          <div className="flex justify-end">
            <Button onClick={() => setShowConfirm(true)} disabled={!text.trim()}>
              Send Broadcast
            </Button>
          </div>
        </div>
      </Card>

      <ConfirmDialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => mutation.mutate()}
        title="Send Broadcast"
        message="This will send the message to ALL users. Are you sure?"
        confirmLabel="Send"
        variant="primary"
        loading={mutation.isPending}
      />
    </div>
  );
}
