import { useQuery } from '@tanstack/react-query';
import { Users, Coins, ArrowDownCircle, Star, UserPlus, Activity } from 'lucide-react';
import { getOverview, getRegistrations, getEconomyAnalytics, getGamesAnalytics } from '../api/analytics';
import { getWithdrawalStats } from '../api/withdrawals';
import { StatCard } from '../components/charts/StatCard';
import { LineChart } from '../components/charts/LineChart';
import { BarChart } from '../components/charts/BarChart';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Card } from '../components/ui/Card';

export default function DashboardPage() {
  const overview = useQuery({ queryKey: ['analytics', 'overview'], queryFn: getOverview });
  const registrations = useQuery({ queryKey: ['analytics', 'registrations'], queryFn: () => getRegistrations({ days: 30 }) });
  const economy = useQuery({ queryKey: ['analytics', 'economy'], queryFn: getEconomyAnalytics });
  const games = useQuery({ queryKey: ['analytics', 'games'], queryFn: getGamesAnalytics });
  const withdrawalStats = useQuery({ queryKey: ['withdrawals', 'stats'], queryFn: getWithdrawalStats });

  if (overview.isLoading) return <LoadingSpinner />;

  const o = overview.data;
  const ws = withdrawalStats.data;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value={o?.totalUsers ?? 0} icon={<Users size={20} />} color="blue" />
        <StatCard title="Active Today" value={o?.activeUsersToday ?? 0} icon={<Activity size={20} />} color="green" />
        <StatCard title="New Today" value={o?.newUsersToday ?? 0} icon={<UserPlus size={20} />} color="purple" />
        <StatCard title="Coins in Circulation" value={o?.totalCoinsInCirculation?.toLocaleString() ?? '0'} icon={<Coins size={20} />} color="yellow" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Total Withdrawals" value={o?.totalWithdrawalsCompleted ?? 0} icon={<ArrowDownCircle size={20} />} color="blue" />
        <StatCard title="Withdrawn TON" value={`${(o?.totalWithdrawalsTon ?? 0).toFixed(2)} TON`} icon={<Coins size={20} />} color="green" />
        <StatCard title="Stars in Circulation" value={o?.totalStarsInCirculation ?? 0} icon={<Star size={20} />} color="purple" />
      </div>

      {ws && (
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Withdrawal Overview</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-gray-500">Pending</p>
              <p className="text-lg font-bold text-yellow-600">{ws.totalPending}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Pending Amount</p>
              <p className="text-lg font-bold text-yellow-600">{ws.totalPendingAmount?.toFixed(2)} TON</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Today</p>
              <p className="text-lg font-bold text-blue-600">{ws.todayCount}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Failed</p>
              <p className="text-lg font-bold text-red-600">{ws.totalFailed}</p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {registrations.data?.daily && (
          <LineChart
            title="User Registrations (30 days)"
            data={registrations.data.daily}
            xKey="date"
            yKey="count"
            color="#8b5cf6"
          />
        )}
        {economy.data?.dailyEarnings && (
          <BarChart
            title="Daily Coin Earnings"
            data={economy.data.dailyEarnings}
            xKey="date"
            yKey="amount"
            color="#f59e0b"
          />
        )}
      </div>

      {games.data && (
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Games Overview</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-gray-500">Spin Plays</p>
              <p className="text-lg font-bold">{games.data.spin?.totalPlayed?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Roulette Plays</p>
              <p className="text-lg font-bold">{games.data.roulette?.totalPlayed?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Bruno's Ride Plays</p>
              <p className="text-lg font-bold">{games.data.brunosRide?.totalPlayed?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Stars Revenue</p>
              <p className="text-lg font-bold text-purple-600">{games.data.totalStarsRevenue?.toLocaleString()}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
