import { selectWeightedRandom, type WeightedItem } from '../../../lib/selectPrize.js';

export interface SpinPrize {
  name: string;
  type: string;
  value: number | string;
  weight: number;
}

export interface SpinResult {
  prizeType: string;
  prizeValue: number | string;
  prizeName: string;
}

export function selectSpinPrize(prizes: SpinPrize[]): SpinResult {
  const items: WeightedItem<SpinPrize>[] = prizes.map((p) => ({
    weight: p.weight,
    item: p,
  }));

  const winner = selectWeightedRandom(items);

  return {
    prizeType: winner.type,
    prizeValue: winner.value,
    prizeName: winner.name,
  };
}

export function generateSpinResults(prizes: SpinPrize[], count: number): SpinResult[] {
  const results: SpinResult[] = [];
  for (let i = 0; i < count; i++) {
    results.push(selectSpinPrize(prizes));
  }
  return results;
}

export function calculateTotalWon(results: SpinResult[]): {
  coins: number;
  stars: number;
  gifts: string[];
} {
  let coins = 0;
  let stars = 0;
  const gifts: string[] = [];

  for (const r of results) {
    switch (r.prizeType) {
      case 'coins':
        coins += typeof r.prizeValue === 'number' ? r.prizeValue : parseInt(String(r.prizeValue), 10);
        break;
      case 'stars':
        stars += typeof r.prizeValue === 'number' ? r.prizeValue : parseInt(String(r.prizeValue), 10);
        break;
      case 'gift':
        gifts.push(String(r.prizeValue));
        break;
    }
  }

  return { coins, stars, gifts };
}
