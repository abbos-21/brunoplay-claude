import client from './client';
import type { PaginatedResponse, Withdrawal, WithdrawalStats } from '../types';

interface ListWithdrawalsParams {
  page?: number;
  limit?: number;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
}

export const listWithdrawals = (params: ListWithdrawalsParams) =>
  client.get<PaginatedResponse<Withdrawal>>('/admin/withdrawals', { params }).then((r) => r.data);

export const getWithdrawalStats = () =>
  client.get<WithdrawalStats>('/admin/withdrawals/stats').then((r) => r.data);

export const getWithdrawal = (id: number) =>
  client.get<{ withdrawal: Withdrawal }>(`/admin/withdrawals/${id}`).then((r) => r.data.withdrawal);

export const approveWithdrawal = (id: number) =>
  client.put(`/admin/withdrawals/${id}/approve`).then((r) => r.data);

export const rejectWithdrawal = (id: number) =>
  client.put(`/admin/withdrawals/${id}/reject`).then((r) => r.data);
