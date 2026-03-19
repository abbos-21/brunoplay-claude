export interface FishingState {
  isFishing: boolean;
  fishingStartedAt: Date | null;
  tankCoins: number;
  tankCapacity: number;
  miningRate: number;
  boosterMultiplier: number;
}

export interface FishingCalcResult {
  newTankCoins: number;
  coinsGenerated: number;
  isTankFull: boolean;
  fishingComplete: boolean;
}

export function calculateFishingSync(
  state: FishingState,
  now: Date,
  fishingDurationSeconds: number,
): FishingCalcResult {
  if (!state.isFishing || !state.fishingStartedAt) {
    return {
      newTankCoins: state.tankCoins,
      coinsGenerated: 0,
      isTankFull: state.tankCoins >= state.tankCapacity,
      fishingComplete: false,
    };
  }

  const elapsedMs = now.getTime() - state.fishingStartedAt.getTime();
  const elapsedSeconds = Math.min(Math.max(elapsedMs / 1000, 0), fishingDurationSeconds);

  const effectiveRate = state.miningRate * state.boosterMultiplier;
  const rawCoins = elapsedSeconds * effectiveRate;
  const availableSpace = Math.max(state.tankCapacity - state.tankCoins, 0);
  const coinsGenerated = Math.min(rawCoins, availableSpace);

  const newTankCoins = state.tankCoins + coinsGenerated;

  return {
    newTankCoins,
    coinsGenerated,
    isTankFull: newTankCoins >= state.tankCapacity,
    fishingComplete: elapsedSeconds >= fishingDurationSeconds,
  };
}

export function canStartFishing(state: FishingState): {
  allowed: boolean;
  reason?: string;
} {
  if (state.isFishing) {
    return { allowed: false, reason: 'Already fishing' };
  }
  return { allowed: true };
}
