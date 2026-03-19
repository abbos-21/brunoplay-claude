import { describe, it, expect } from 'vitest';
import { calculateFishingSync, canStartFishing, type FishingState } from './fishing.engine.js';

describe('fishing.engine', () => {
  const baseState: FishingState = {
    isFishing: true,
    fishingStartedAt: new Date('2024-01-01T00:00:00Z'),
    tankCoins: 0,
    tankCapacity: 100,
    miningRate: 0.0278,
    boosterMultiplier: 1.0,
  };

  describe('calculateFishingSync', () => {
    it('should return 0 coins when 0 seconds elapsed', () => {
      const now = new Date('2024-01-01T00:00:00Z');
      const result = calculateFishingSync(baseState, now, 3600);
      expect(result.coinsGenerated).toBe(0);
      expect(result.newTankCoins).toBe(0);
      expect(result.fishingComplete).toBe(false);
    });

    it('should calculate coins for partial duration', () => {
      const now = new Date('2024-01-01T00:30:00Z'); // 1800 seconds
      const result = calculateFishingSync(baseState, now, 3600);
      expect(result.coinsGenerated).toBeCloseTo(1800 * 0.0278, 1);
      expect(result.fishingComplete).toBe(false);
    });

    it('should calculate coins for exactly 3600 seconds (capped by tank)', () => {
      const now = new Date('2024-01-01T01:00:00Z');
      const result = calculateFishingSync(baseState, now, 3600);
      // 3600 * 0.0278 = 100.08, but tank capacity is 100, so capped
      expect(result.coinsGenerated).toBe(100);
      expect(result.isTankFull).toBe(true);
      expect(result.fishingComplete).toBe(true);
    });

    it('should cap at fishingDurationSeconds when >3600 seconds', () => {
      const now = new Date('2024-01-01T02:00:00Z'); // 7200 seconds
      const result = calculateFishingSync(baseState, now, 3600);
      // Also capped by tank capacity
      expect(result.coinsGenerated).toBe(100);
      expect(result.isTankFull).toBe(true);
      expect(result.fishingComplete).toBe(true);
    });

    it('should cap at tank capacity', () => {
      const state: FishingState = {
        ...baseState,
        tankCapacity: 10,
        miningRate: 1.0,
      };
      const now = new Date('2024-01-01T01:00:00Z');
      const result = calculateFishingSync(state, now, 3600);
      expect(result.newTankCoins).toBe(10);
      expect(result.isTankFull).toBe(true);
    });

    it('should account for existing tankCoins', () => {
      const state: FishingState = {
        ...baseState,
        tankCoins: 90,
        tankCapacity: 100,
        miningRate: 1.0,
      };
      const now = new Date('2024-01-01T01:00:00Z');
      const result = calculateFishingSync(state, now, 3600);
      expect(result.newTankCoins).toBe(100);
      expect(result.coinsGenerated).toBe(10);
      expect(result.isTankFull).toBe(true);
    });

    it('should apply booster multiplier correctly', () => {
      const state: FishingState = {
        ...baseState,
        boosterMultiplier: 1.5,
      };
      const now = new Date('2024-01-01T00:30:00Z'); // 1800 seconds
      const result = calculateFishingSync(state, now, 3600);
      expect(result.coinsGenerated).toBeCloseTo(1800 * 0.0278 * 1.5, 1);
    });

    it('should handle not fishing state', () => {
      const state: FishingState = { ...baseState, isFishing: false };
      const now = new Date('2024-01-01T01:00:00Z');
      const result = calculateFishingSync(state, now, 3600);
      expect(result.coinsGenerated).toBe(0);
    });

    it('should handle null fishingStartedAt', () => {
      const state: FishingState = { ...baseState, fishingStartedAt: null };
      const now = new Date('2024-01-01T01:00:00Z');
      const result = calculateFishingSync(state, now, 3600);
      expect(result.coinsGenerated).toBe(0);
    });

    it('should handle tiny fractional rates', () => {
      const state: FishingState = {
        ...baseState,
        miningRate: 0.001,
      };
      const now = new Date('2024-01-01T01:00:00Z');
      const result = calculateFishingSync(state, now, 3600);
      expect(result.coinsGenerated).toBeCloseTo(3.6, 1);
    });
  });

  describe('canStartFishing', () => {
    it('should allow starting when not fishing', () => {
      const state: FishingState = { ...baseState, isFishing: false };
      const result = canStartFishing(state);
      expect(result.allowed).toBe(true);
    });

    it('should not allow starting when already fishing', () => {
      const result = canStartFishing(baseState);
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('Already fishing');
    });
  });
});
