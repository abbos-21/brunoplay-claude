export function calculateLevel(coinCapacityLevel: number, miningRateLevel: number): number {
  return Math.min(coinCapacityLevel, miningRateLevel);
}
