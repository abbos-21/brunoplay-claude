import client from './client';
import type {
  OverviewAnalytics,
  RegistrationAnalytics,
  EconomyAnalytics,
  GamesAnalytics,
  ReferralAnalytics,
} from '../types';

export const getOverview = () =>
  client.get<OverviewAnalytics>('/admin/analytics/overview').then((r) => r.data);

export const getRegistrations = (params?: { days?: number }) =>
  client.get<RegistrationAnalytics>('/admin/analytics/registrations', { params }).then((r) => r.data);

export const getEconomyAnalytics = () =>
  client.get<EconomyAnalytics>('/admin/analytics/economy').then((r) => r.data);

export const getGamesAnalytics = () =>
  client.get<GamesAnalytics>('/admin/analytics/games').then((r) => r.data);

export const getReferralAnalytics = () =>
  client.get<ReferralAnalytics>('/admin/analytics/referrals').then((r) => r.data);
