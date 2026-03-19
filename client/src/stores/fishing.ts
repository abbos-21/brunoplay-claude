import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { FishingStatus } from '@/types';
import * as fishingApi from '@/api/fishing';
import { useAuthStore } from './auth';

export const useFishingStore = defineStore('fishing', () => {
  const status = ref<FishingStatus | null>(null);
  const isLoading = ref(false);

  const isFishing = computed(() => status.value?.isFishing ?? false);
  const isComplete = computed(() => status.value?.isComplete ?? false);
  const tankPercent = computed(() => {
    if (!status.value) return 0;
    return Math.min(100, (status.value.tankCoins / status.value.tankCapacity) * 100);
  });

  async function fetchStatus() {
    try {
      status.value = await fishingApi.getFishingStatus();
    } catch {
      // ignore
    }
  }

  async function start() {
    isLoading.value = true;
    try {
      status.value = await fishingApi.startFishing();
    } finally {
      isLoading.value = false;
    }
  }

  async function collect() {
    isLoading.value = true;
    try {
      const result = await fishingApi.collectCoins();
      const auth = useAuthStore();
      auth.updateUser({ coins: result.newBalance });
      await fetchStatus();
      return result;
    } finally {
      isLoading.value = false;
    }
  }

  async function sync() {
    try {
      status.value = await fishingApi.syncFishing();
    } catch {
      // ignore
    }
  }

  return { status, isLoading, isFishing, isComplete, tankPercent, fetchStatus, start, collect, sync };
});
