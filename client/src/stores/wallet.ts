import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { WithdrawalInfo, Withdrawal, StarsBalance } from '@/types';
import * as walletApi from '@/api/wallet';
import { useAuthStore } from './auth';

export const useWalletStore = defineStore('wallet', () => {
  const withdrawalInfo = ref<WithdrawalInfo | null>(null);
  const withdrawals = ref<Withdrawal[]>([]);
  const withdrawalsPage = ref(1);
  const withdrawalsTotalPages = ref(1);
  const starsBalance = ref<StarsBalance | null>(null);
  const isLoading = ref(false);

  async function fetchWithdrawalInfo() {
    withdrawalInfo.value = await walletApi.getWithdrawalInfo();
  }

  async function fetchWithdrawals(page = 1) {
    const data = await walletApi.getWithdrawalHistory(page);
    withdrawals.value = data.data;
    withdrawalsPage.value = data.page;
    withdrawalsTotalPages.value = data.totalPages;
  }

  async function createWithdrawal(address: string, amountCoins: number) {
    isLoading.value = true;
    try {
      const result = await walletApi.createWithdrawal(address, amountCoins);
      const auth = useAuthStore();
      await auth.fetchUser();
      await fetchWithdrawals();
      return result;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchStarsBalance() {
    starsBalance.value = await walletApi.getStarsBalance();
  }

  async function topUpWithTon(amountTon: number) {
    isLoading.value = true;
    try {
      const result = await walletApi.topUpWithTon(amountTon);
      const auth = useAuthStore();
      auth.updateUser({ starsBalance: result.newBalance });
      await fetchStarsBalance();
      return result;
    } finally {
      isLoading.value = false;
    }
  }

  async function init() {
    await Promise.all([fetchWithdrawalInfo(), fetchWithdrawals(), fetchStarsBalance()]);
  }

  return {
    withdrawalInfo, withdrawals, withdrawalsPage, withdrawalsTotalPages,
    starsBalance, isLoading,
    fetchWithdrawalInfo, fetchWithdrawals, createWithdrawal,
    fetchStarsBalance, topUpWithTon, init,
  };
});
