import client from './client';
import type { DailyCombo } from '../types';

export const listDailyCombos = (params?: { startDate?: string; endDate?: string }) =>
  client.get<{ data: DailyCombo[] }>('/admin/daily-combo', { params }).then((r) => r.data.data);

export const createDailyCombo = (data: { date: string; correctItems: number[] }) =>
  client.post('/admin/daily-combo', data).then((r) => r.data);

export const bulkCreateDailyCombos = (data: { combos: { date: string; correctItems: number[] }[] }) =>
  client.post('/admin/daily-combo/bulk', data).then((r) => r.data);
