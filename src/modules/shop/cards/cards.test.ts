import { describe, it, expect } from 'vitest';
import { getCardValue, getNextLevel, type CardUpgradeValues } from './cards.engine.js';

describe('cards.engine', () => {
  const upgradeValues: CardUpgradeValues = {
    coinCapacity: [100, 200, 350, 500, 750, 1000, 1400, 1800, 2300, 3000, 3800, 4800, 6000],
    miningRate: [0.0278, 0.0556, 0.0972, 0.1389, 0.2083, 0.2778, 0.3889, 0.5, 0.6389, 0.8333, 1.0556, 1.3333, 1.6667],
  };

  describe('getCardValue', () => {
    it('should return correct values for COIN_CAPACITY', () => {
      expect(getCardValue(upgradeValues, 'COIN_CAPACITY', 1)).toBe(100);
      expect(getCardValue(upgradeValues, 'COIN_CAPACITY', 13)).toBe(6000);
    });

    it('should return correct values for MINING_RATE', () => {
      expect(getCardValue(upgradeValues, 'MINING_RATE', 1)).toBe(0.0278);
      expect(getCardValue(upgradeValues, 'MINING_RATE', 13)).toBe(1.6667);
    });

    it('should return 0 for invalid levels', () => {
      expect(getCardValue(upgradeValues, 'COIN_CAPACITY', 0)).toBe(0);
      expect(getCardValue(upgradeValues, 'COIN_CAPACITY', 14)).toBe(0);
    });
  });

  describe('getNextLevel', () => {
    it('should return next level when not at max', () => {
      expect(getNextLevel(1, 13)).toBe(2);
      expect(getNextLevel(12, 13)).toBe(13);
    });

    it('should return null when at max level', () => {
      expect(getNextLevel(13, 13)).toBeNull();
    });
  });
});
