import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { CardInfo, BoosterInfo, CardName, BoosterType } from '@/types';
import * as shopApi from '@/api/shop';
import { useAuthStore } from './auth';

export const useShopStore = defineStore('shop', () => {
  const cards = ref<CardInfo[]>([]);
  const boosters = ref<BoosterInfo[]>([]);
  const isLoading = ref(false);

  async function fetchCards() {
    cards.value = await shopApi.getCards();
  }

  async function fetchBoosters() {
    boosters.value = await shopApi.getBoosters();
  }

  async function upgradeCard(cardName: CardName) {
    isLoading.value = true;
    try {
      const result = await shopApi.upgradeCard(cardName);
      const auth = useAuthStore();
      auth.updateUser({ level: result.newUserLevel });
      await fetchCards();
      return result;
    } finally {
      isLoading.value = false;
    }
  }

  async function purchaseBooster(type: BoosterType) {
    isLoading.value = true;
    try {
      const result = await shopApi.purchaseBooster(type);
      await fetchBoosters();
      return result;
    } finally {
      isLoading.value = false;
    }
  }

  return { cards, boosters, isLoading, fetchCards, fetchBoosters, upgradeCard, purchaseBooster };
});
