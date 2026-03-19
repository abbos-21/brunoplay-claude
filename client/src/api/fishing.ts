import client from './client';
import type { FishingStatus, CollectResult } from '@/types';

export function startFishing() {
  return client.post<FishingStatus>('/fishing/start').then((r) => r.data);
}

export function collectCoins() {
  return client.post<CollectResult>('/fishing/collect').then((r) => r.data);
}

export function getFishingStatus() {
  return client.get<FishingStatus>('/fishing/status').then((r) => r.data);
}

export function syncFishing() {
  return client.post<FishingStatus>('/fishing/sync').then((r) => r.data);
}
