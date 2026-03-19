import client from './client';
import type { WithdrawalInfo, Withdrawal, StarsBalance, PaginatedResponse } from '@/types';

// === Withdrawals ===
export function getWithdrawalInfo() {
  return client.get<WithdrawalInfo>('/withdrawals/info').then((r) => r.data);
}

export function createWithdrawal(targetAddress: string, amountCoins: number) {
  return client.post<{ withdrawal: Withdrawal }>('/withdrawals', { targetAddress, amountCoins }).then((r) => r.data.withdrawal);
}

export function getWithdrawalHistory(page = 1) {
  return client.get<PaginatedResponse<Withdrawal>>('/withdrawals/history', { params: { page } }).then((r) => r.data);
}

// === Stars ===
export function getStarsBalance() {
  return client.get<StarsBalance>('/stars/balance').then((r) => r.data);
}

export function createStarsInvoice(amount: number) {
  return client.post<{ invoiceUrl: string }>('/stars/create-invoice', { amount }).then((r) => r.data);
}

export function topUpWithTon(amountTon: number) {
  return client.post<{ starsAdded: number; newBalance: number }>('/stars/topup-ton', { amountTon }).then((r) => r.data);
}
