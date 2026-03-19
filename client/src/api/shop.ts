import client from './client';
import type { CardInfo, UpgradeResult, BoosterInfo, CardName, BoosterType } from '@/types';

export function getCards() {
  return client.get<{ cards: CardInfo[] }>('/shop/cards').then((r) => r.data.cards);
}

export function upgradeCard(cardName: CardName) {
  return client.post<UpgradeResult>(`/shop/cards/${cardName}/upgrade`).then((r) => r.data);
}

export function getBoosters() {
  return client.get<{ boosters: BoosterInfo[] }>('/shop/boosters').then((r) => r.data.boosters);
}

export function purchaseBooster(type: BoosterType) {
  return client.post<BoosterInfo>(`/shop/boosters/${type}/purchase`).then((r) => r.data);
}
