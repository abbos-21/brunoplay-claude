import client from './client';
import type { DailyComboStatus, ComboSubmitResult, DailyActivityStatus, DailyClaimResult } from '@/types';

// === Daily Combo ===
export function getDailyCombo() {
  return client.get<DailyComboStatus>('/daily-combo/today').then((r) => r.data);
}

export function submitDailyCombo(items: number[]) {
  return client.post<ComboSubmitResult>('/daily-combo/submit', { items }).then((r) => r.data);
}

// === Daily Activity (Login Streak) ===
export function getDailyActivityStatus() {
  return client.get<DailyActivityStatus>('/daily-activity/status').then((r) => r.data);
}

export function claimDailyReward() {
  return client.post<DailyClaimResult>('/daily-activity/claim').then((r) => r.data);
}
