import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { SpinTierInfo, SpinTier, SpinResult, LiveWin, RoulettePrize, RouletteResult, RideSession, Tournament } from '@/types';
import * as gamesApi from '@/api/games';
import * as tournamentsApi from '@/api/tournaments';
import { useAuthStore } from './auth';

export const useGamesStore = defineStore('games', () => {
  // Spin
  const spinTiers = ref<SpinTierInfo[]>([]);
  const spinLiveWins = ref<LiveWin[]>([]);
  const lastSpinResult = ref<SpinResult | null>(null);

  // Roulette
  const roulettePrizes = ref<RoulettePrize[]>([]);
  const rouletteLiveWins = ref<LiveWin[]>([]);
  const lastRouletteResult = ref<RouletteResult | null>(null);

  // Ride
  const activeRideSession = ref<RideSession | null>(null);

  // Tournament
  const activeTournament = ref<Tournament | null>(null);

  const isLoading = ref(false);

  // --- Spin ---
  async function fetchSpinTiers() {
    spinTiers.value = await gamesApi.getSpinTiers();
  }

  async function fetchSpinLiveWins() {
    spinLiveWins.value = await gamesApi.getSpinLiveWins();
  }

  async function playSpin(tier: SpinTier, count: number) {
    isLoading.value = true;
    try {
      const result = await gamesApi.playSpin(tier, count);
      lastSpinResult.value = result;
      const auth = useAuthStore();
      await auth.fetchUser();
      return result;
    } finally {
      isLoading.value = false;
    }
  }

  // --- Roulette ---
  async function fetchRoulettePrizes() {
    roulettePrizes.value = await gamesApi.getRoulettePrizes();
  }

  async function fetchRouletteLiveWins() {
    rouletteLiveWins.value = await gamesApi.getRouletteLiveWins();
  }

  async function playRoulette() {
    isLoading.value = true;
    try {
      const result = await gamesApi.playRoulette();
      lastRouletteResult.value = result;
      const auth = useAuthStore();
      await auth.fetchUser();
      return result;
    } finally {
      isLoading.value = false;
    }
  }

  // --- Ride ---
  async function startRide() {
    isLoading.value = true;
    try {
      activeRideSession.value = await gamesApi.startRide();
      const auth = useAuthStore();
      await auth.fetchUser();
      return activeRideSession.value;
    } finally {
      isLoading.value = false;
    }
  }

  async function claimRide(coins: number, score: number) {
    if (!activeRideSession.value) throw new Error('No active session');
    isLoading.value = true;
    try {
      const result = await gamesApi.claimRide(activeRideSession.value.sessionId, coins, score);
      activeRideSession.value = null;
      const auth = useAuthStore();
      auth.updateUser({ coins: result.newBalance });
      return result;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchRideStatus() {
    activeRideSession.value = await gamesApi.getRideStatus();
  }

  // --- Tournament ---
  async function fetchActiveTournament() {
    activeTournament.value = await tournamentsApi.getActiveTournament();
  }

  return {
    spinTiers, spinLiveWins, lastSpinResult,
    roulettePrizes, rouletteLiveWins, lastRouletteResult,
    activeRideSession, activeTournament,
    isLoading,
    fetchSpinTiers, fetchSpinLiveWins, playSpin,
    fetchRoulettePrizes, fetchRouletteLiveWins, playRoulette,
    startRide, claimRide, fetchRideStatus,
    fetchActiveTournament,
  };
});
