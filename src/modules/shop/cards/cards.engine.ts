export interface CardUpgradeValues {
  coinCapacity: number[];
  miningRate: number[];
}

export function getCardValue(
  upgradeValues: CardUpgradeValues,
  cardName: 'COIN_CAPACITY' | 'MINING_RATE',
  level: number,
): number {
  const values = cardName === 'COIN_CAPACITY' ? upgradeValues.coinCapacity : upgradeValues.miningRate;
  const index = level - 1;
  if (index < 0 || index >= values.length) return 0;
  return values[index];
}

export function getNextLevel(currentLevel: number, maxLevel: number): number | null {
  if (currentLevel >= maxLevel) return null;
  return currentLevel + 1;
}
