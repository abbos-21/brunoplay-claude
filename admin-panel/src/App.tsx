import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UsersListPage from './pages/users/UsersListPage';
import UserDetailPage from './pages/users/UserDetailPage';
import WithdrawalsPage from './pages/withdrawals/WithdrawalsPage';
import WithdrawalDetailPage from './pages/withdrawals/WithdrawalDetailPage';
import SettingsPage from './pages/settings/SettingsPage';
import TasksPage from './pages/tasks/TasksPage';
import DailyComboPage from './pages/dailyCombo/DailyComboPage';
import TournamentsPage from './pages/tournaments/TournamentsPage';
import SeasonsPage from './pages/seasons/SeasonsPage';
import CardRequirementsPage from './pages/cardRequirements/CardRequirementsPage';
import BroadcastPage from './pages/broadcast/BroadcastPage';
import AuditLogPage from './pages/auditLog/AuditLogPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter basename="/admin">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/users" element={<UsersListPage />} />
          <Route path="/users/:userId" element={<UserDetailPage />} />
          <Route path="/withdrawals" element={<WithdrawalsPage />} />
          <Route path="/withdrawals/:id" element={<WithdrawalDetailPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/daily-combo" element={<DailyComboPage />} />
          <Route path="/tournaments" element={<TournamentsPage />} />
          <Route path="/seasons" element={<SeasonsPage />} />
          <Route path="/card-requirements" element={<CardRequirementsPage />} />
          <Route path="/broadcast" element={<BroadcastPage />} />
          <Route path="/audit-log" element={<AuditLogPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
