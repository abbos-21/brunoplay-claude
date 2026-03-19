export interface WeightedItem<T = unknown> {
  weight: number;
  item: T;
}

export function selectWeightedRandom<T>(items: WeightedItem<T>[]): T {
  const totalWeight = items.reduce((sum, i) => sum + i.weight, 0);
  let random = Math.random() * totalWeight;

  for (const { weight, item } of items) {
    random -= weight;
    if (random <= 0) {
      return item;
    }
  }

  return items[items.length - 1].item;
}
