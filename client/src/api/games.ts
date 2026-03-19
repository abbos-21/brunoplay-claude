import client from './client';
import type {
  SpinTierInfo, SpinTier, SpinResult, LiveWin,
  RoulettePrize, RouletteResult,
  RideSession, RideClaimResult,
  PaginatedResponse,
} from '@/types';

// === Spin ===
export function getSpinTiers() {
  return client.get<{ tiers: SpinTierInfo[] }>('/games/spin/tiers').then((r) => r.data.tiers);
}

export function playSpin(tier: SpinTier, count: number) {
  return client.post<SpinResult>('/games/spin/play', { tier, count }).then((r) => r.data);
}

export function getSpinPrizes(tier: SpinTier) {
  return client.get<{ prizes: SpinTierInfo['prizes'] }>(`/games/spin/prizes/${tier}`).then((r) => r.data.prizes);
}

export function getSpinLiveWins() {
  return client.get<{ wins: LiveWin[] }>('/games/spin/live-wins').then((r) => r.data.wins);
}

export function getSpinWinners(page = 1) {
  return client.get<PaginatedResponse<LiveWin>>('/games/spin/winners', { params: { page } }).then((r) => r.data);
}

// === Roulette ===
export function playRoulette() {
  return client.post<RouletteResult>('/games/roulette/play').then((r) => r.data);
}

export function getRoulettePrizes() {
  return client.get<{ prizes: RoulettePrize[] }>('/games/roulette/prizes').then((r) => r.data.prizes);
}

export function getRouletteLiveWins() {
  return client.get<{ wins: LiveWin[] }>('/games/roulette/live-wins').then((r) => r.data.wins);
}

// === Bruno's Ride ===
export function startRide() {
  return client.post<RideSession>('/games/brunos-ride/start').then((r) => r.data);
}

export function claimRide(sessionId: string, coins: number, score: number) {
  return client.post<RideClaimResult>('/games/brunos-ride/claim', { sessionId, coins, score }).then((r) => r.data);
}

export function getRideStatus() {
  return client.get<{ session: RideSession | null }>('/games/brunos-ride/status').then((r) => r.data.session);
}
