import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { DailyComboStatus, ComboSubmitResult, DailyActivityStatus } from '@/types';
import * as dailyApi from '@/api/daily';
import { useAuthStore } from './auth';

export const useDailyStore = defineStore('daily', () => {
  const comboStatus = ref<DailyComboStatus | null>(null);
  const lastComboResult = ref<ComboSubmitResult | null>(null);
  const activityStatus = ref<DailyActivityStatus | null>(null);
  const isLoading = ref(false);

  async function fetchCombo() {
    comboStatus.value = await dailyApi.getDailyCombo();
  }

  async function submitCombo(items: number[]) {
    isLoading.value = true;
    try {
      const result = await dailyApi.submitDailyCombo(items);
      lastComboResult.value = result;
      const auth = useAuthStore();
      await auth.fetchUser();
      await fetchCombo();
      return result;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchActivity() {
    activityStatus.value = await dailyApi.getDailyActivityStatus();
  }

  async function claimDaily() {
    isLoading.value = true;
    try {
      const result = await dailyApi.claimDailyReward();
      const auth = useAuthStore();
      auth.updateUser({ coins: result.newBalance, loginStreak: result.newStreak });
      await fetchActivity();
      return result;
    } finally {
      isLoading.value = false;
    }
  }

  return { comboStatus, lastComboResult, activityStatus, isLoading, fetchCombo, submitCombo, fetchActivity, claimDaily };
});
