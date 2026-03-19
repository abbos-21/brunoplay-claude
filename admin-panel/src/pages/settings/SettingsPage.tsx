import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as settingsApi from '../../api/settings';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { RoleGuard } from '../../components/ui/RoleGuard';
import type { GameSettings } from '../../types';

const tabs = [
  'General', 'Economy', 'Card Values', 'Boosters', 'Spin Tiers',
  'Roulette', 'Combo Rewards', 'Login Streak', 'Referral Rewards',
] as const;

type Tab = (typeof tabs)[number];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('General');
  const qc = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.getSettings,
  });

  if (isLoading) return <LoadingSpinner />;
  if (!settings) return <p>Failed to load settings</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      <div className="flex gap-1 overflow-x-auto border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      {activeTab === 'General' && <GeneralTab settings={settings} qc={qc} />}
      {activeTab === 'Economy' && <EconomyTab settings={settings} qc={qc} />}
      {activeTab === 'Card Values' && <CardValuesTab settings={settings} qc={qc} />}
      {activeTab === 'Boosters' && <BoostersTab settings={settings} qc={qc} />}
      {activeTab === 'Spin Tiers' && <JsonTab title="Spin Tiers" data={settings.spinTiers} onSave={(d) => settingsApi.updateSpinTiers({ spinTiers: d })} qc={qc} />}
      {activeTab === 'Roulette' && <JsonTab title="Roulette" data={{ rouletteCostStars: settings.rouletteCostStars, roulettePrizes: settings.roulettePrizes }} onSave={(d) => settingsApi.updateRoulette(d)} qc={qc} />}
      {activeTab === 'Combo Rewards' && <KeyValueTab title="Combo Rewards" data={settings.comboRewards} onSave={(d) => settingsApi.updateComboRewards(d)} qc={qc} />}
      {activeTab === 'Login Streak' && <KeyValueTab title="Login Streak Rewards" data={settings.loginStreakRewards} onSave={(d) => settingsApi.updateLoginStreakRewards(d)} qc={qc} />}
      {activeTab === 'Referral Rewards' && <KeyValueTab title="Referral Rewards" data={settings.referralRewards} onSave={(d) => settingsApi.updateReferralRewards(d)} qc={qc} />}
    </div>
  );
}

function GeneralTab({ settings, qc }: { settings: GameSettings; qc: ReturnType<typeof useQueryClient> }) {
  const [form, setForm] = useState({
    fishingDurationSeconds: settings.fishingDurationSeconds,
    rideCostStars: settings.rideCostStars,
    rideMaxCoinsPerSecond: settings.rideMaxCoinsPerSecond,
  });

  const mutation = useMutation({
    mutationFn: () => settingsApi.updateSettings(form),
    onSuccess: () => { toast.success('Settings updated'); qc.invalidateQueries({ queryKey: ['settings'] }); },
    onError: () => toast.error('Failed to update'),
  });

  return (
    <Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Input label="Fishing Duration (seconds)" type="number" value={form.fishingDurationSeconds} onChange={(e) => setForm({ ...form, fishingDurationSeconds: Number(e.target.value) })} />
        <Input label="Ride Cost (Stars)" type="number" value={form.rideCostStars} onChange={(e) => setForm({ ...form, rideCostStars: Number(e.target.value) })} />
        <Input label="Ride Max Coins/Second" type="number" value={form.rideMaxCoinsPerSecond} onChange={(e) => setForm({ ...form, rideMaxCoinsPerSecond: Number(e.target.value) })} />
      </div>
      <RoleGuard minRole="SUPER_ADMIN">
        <div className="mt-4 flex justify-end">
          <Button onClick={() => mutation.mutate()} loading={mutation.isPending}>Save Changes</Button>
        </div>
      </RoleGuard>
    </Card>
  );
}

function EconomyTab({ settings, qc }: { settings: GameSettings; qc: ReturnType<typeof useQueryClient> }) {
  const [form, setForm] = useState({
    coinToTonRate: settings.coinToTonRate,
    minimumCoinWithdrawal: settings.minimumCoinWithdrawal,
    maximumCoinWithdrawal: settings.maximumCoinWithdrawal,
    withdrawalFeeTon: settings.withdrawalFeeTon,
    tonToStarsRate: settings.tonToStarsRate,
    tonToStarsBonusPercent: settings.tonToStarsBonusPercent,
  });

  const mutation = useMutation({
    mutationFn: () => settingsApi.updateEconomy(form),
    onSuccess: () => { toast.success('Economy settings updated'); qc.invalidateQueries({ queryKey: ['settings'] }); },
    onError: () => toast.error('Failed to update'),
  });

  return (
    <Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Input label="Coin to TON Rate" type="number" step="any" value={form.coinToTonRate} onChange={(e) => setForm({ ...form, coinToTonRate: Number(e.target.value) })} />
        <Input label="Min Withdrawal (Coins)" type="number" value={form.minimumCoinWithdrawal} onChange={(e) => setForm({ ...form, minimumCoinWithdrawal: Number(e.target.value) })} />
        <Input label="Max Withdrawal (Coins)" type="number" value={form.maximumCoinWithdrawal} onChange={(e) => setForm({ ...form, maximumCoinWithdrawal: Number(e.target.value) })} />
        <Input label="Withdrawal Fee (TON)" type="number" step="any" value={form.withdrawalFeeTon} onChange={(e) => setForm({ ...form, withdrawalFeeTon: Number(e.target.value) })} />
        <Input label="TON to Stars Rate" type="number" step="any" value={form.tonToStarsRate} onChange={(e) => setForm({ ...form, tonToStarsRate: Number(e.target.value) })} />
        <Input label="TON to Stars Bonus %" type="number" value={form.tonToStarsBonusPercent} onChange={(e) => setForm({ ...form, tonToStarsBonusPercent: Number(e.target.value) })} />
      </div>
      <RoleGuard minRole="SUPER_ADMIN">
        <div className="mt-4 flex justify-end">
          <Button onClick={() => mutation.mutate()} loading={mutation.isPending}>Save Changes</Button>
        </div>
      </RoleGuard>
    </Card>
  );
}

function CardValuesTab({ settings, qc }: { settings: GameSettings; qc: ReturnType<typeof useQueryClient> }) {
  const [form, setForm] = useState(JSON.stringify(settings.cardUpgradeValues, null, 2));
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: () => {
      const parsed = JSON.parse(form);
      return settingsApi.updateCardValues(parsed);
    },
    onSuccess: () => { toast.success('Card values updated'); qc.invalidateQueries({ queryKey: ['settings'] }); setError(''); },
    onError: () => toast.error('Failed to update'),
  });

  return (
    <Card>
      <textarea
        className="w-full rounded-lg border border-gray-300 p-3 font-mono text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        rows={12}
        value={form}
        onChange={(e) => {
          setForm(e.target.value);
          try { JSON.parse(e.target.value); setError(''); } catch { setError('Invalid JSON'); }
        }}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      <RoleGuard minRole="SUPER_ADMIN">
        <div className="mt-4 flex justify-end">
          <Button onClick={() => mutation.mutate()} loading={mutation.isPending} disabled={!!error}>Save Changes</Button>
        </div>
      </RoleGuard>
    </Card>
  );
}

function BoostersTab({ settings, qc }: { settings: GameSettings; qc: ReturnType<typeof useQueryClient> }) {
  const [form, setForm] = useState<Record<string, number>>({ ...settings.boosterPrices });

  const mutation = useMutation({
    mutationFn: () => settingsApi.updateBoosters(form),
    onSuccess: () => { toast.success('Booster prices updated'); qc.invalidateQueries({ queryKey: ['settings'] }); },
    onError: () => toast.error('Failed to update'),
  });

  return (
    <Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(form).map(([key, value]) => (
          <Input
            key={key}
            label={key}
            type="number"
            value={value}
            onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) })}
          />
        ))}
      </div>
      <RoleGuard minRole="SUPER_ADMIN">
        <div className="mt-4 flex justify-end">
          <Button onClick={() => mutation.mutate()} loading={mutation.isPending}>Save Changes</Button>
        </div>
      </RoleGuard>
    </Card>
  );
}

function KeyValueTab({ title, data, onSave, qc }: { title: string; data: Record<string, number>; onSave: (d: Record<string, number>) => Promise<unknown>; qc: ReturnType<typeof useQueryClient> }) {
  const [form, setForm] = useState<Record<string, number>>({ ...data });

  const mutation = useMutation({
    mutationFn: () => onSave(form),
    onSuccess: () => { toast.success(`${title} updated`); qc.invalidateQueries({ queryKey: ['settings'] }); },
    onError: () => toast.error('Failed to update'),
  });

  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-gray-700">{title}</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(form).map(([key, value]) => (
          <Input
            key={key}
            label={key}
            type="number"
            value={value}
            onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) })}
          />
        ))}
      </div>
      <RoleGuard minRole="SUPER_ADMIN">
        <div className="mt-4 flex justify-end">
          <Button onClick={() => mutation.mutate()} loading={mutation.isPending}>Save Changes</Button>
        </div>
      </RoleGuard>
    </Card>
  );
}

function JsonTab({ title, data, onSave, qc }: { title: string; data: unknown; onSave: (d: any) => Promise<unknown>; qc: ReturnType<typeof useQueryClient> }) {
  const [form, setForm] = useState(JSON.stringify(data, null, 2));
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: () => onSave(JSON.parse(form)),
    onSuccess: () => { toast.success(`${title} updated`); qc.invalidateQueries({ queryKey: ['settings'] }); setError(''); },
    onError: () => toast.error('Failed to update'),
  });

  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-gray-700">{title}</h3>
      <textarea
        className="w-full rounded-lg border border-gray-300 p-3 font-mono text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        rows={16}
        value={form}
        onChange={(e) => {
          setForm(e.target.value);
          try { JSON.parse(e.target.value); setError(''); } catch { setError('Invalid JSON'); }
        }}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      <RoleGuard minRole="SUPER_ADMIN">
        <div className="mt-4 flex justify-end">
          <Button onClick={() => mutation.mutate()} loading={mutation.isPending} disabled={!!error}>Save Changes</Button>
        </div>
      </RoleGuard>
    </Card>
  );
}
