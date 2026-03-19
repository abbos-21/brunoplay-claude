import { selectWeightedRandom, type WeightedItem } from '../../../lib/selectPrize.js';

export interface RoulettePrize {
  name: string;
  type: string;
  value: number | string;
  weight: number;
}

export interface RouletteResult {
  prizeType: string;
  prizeValue: number | string;
  prizeName: string;
}

export function selectRoulettePrize(prizes: RoulettePrize[]): RouletteResult {
  const items: WeightedItem<RoulettePrize>[] = prizes.map((p) => ({
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
