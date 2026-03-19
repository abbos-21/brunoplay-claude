import client from './client';
import type { GameSettings } from '../types';

export const getSettings = () =>
  client.get<GameSettings>('/admin/settings').then((r) => r.data);

export const updateSettings = (data: Partial<GameSettings>) =>
  client.put('/admin/settings', data).then((r) => r.data);

export const updateCardValues = (data: Record<string, number[]>) =>
  client.put('/admin/settings/card-values', data).then((r) => r.data);

export const updateReferralRewards = (data: Record<string, number>) =>
  client.put('/admin/settings/referral-rewards', data).then((r) => r.data);

export const updateSpinTiers = (data: { spinTiers: unknown[] }) =>
  client.put('/admin/settings/spin-tiers', data).then((r) => r.data);

export const updateRoulette = (data: { rouletteCostStars: number; roulettePrizes: unknown[] }) =>
  client.put('/admin/settings/roulette', data).then((r) => r.data);

export const updateEconomy = (data: Record<string, number>) =>
  client.put('/admin/settings/economy', data).then((r) => r.data);

export const updateBoosters = (data: Record<string, number>) =>
  client.put('/admin/settings/boosters', data).then((r) => r.data);

export const updateComboRewards = (data: Record<string, number>) =>
  client.put('/admin/settings/combo-rewards', data).then((r) => r.data);

export const updateLoginStreakRewards = (data: Record<string, number>) =>
  client.put('/admin/settings/login-streak-rewards', data).then((r) => r.data);
