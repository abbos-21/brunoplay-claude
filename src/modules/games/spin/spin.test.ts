import { describe, it, expect } from 'vitest';
import { selectSpinPrize, generateSpinResults, calculateTotalWon, type SpinPrize } from './spin.engine.js';

describe('spin.engine', () => {
  const prizes: SpinPrize[] = [
    { name: '10 Coins', type: 'coins', value: 10, weight: 0.50 },
    { name: '5 Stars', type: 'stars', value: 5, weight: 0.30 },
    { name: 'Gift', type: 'gift', value: 'small_gift', weight: 0.20 },
  ];

  describe('selectSpinPrize', () => {
    it('should return a valid prize', () => {
      const result = selectSpinPrize(prizes);
      expect(result).toHaveProperty('prizeType');
      expect(result).toHaveProperty('prizeValue');
      expect(result).toHaveProperty('prizeName');
      expect(['coins', 'stars', 'gift']).toContain(result.prizeType);
    });

    it('should respect weight distribution over many iterations', () => {
      const counts: Record<string, number> = { coins: 0, stars: 0, gift: 0 };
      const iterations = 10000;

      for (let i = 0; i < iterations; i++) {
        const result = selectSpinPrize(prizes);
        counts[result.prizeType]++;
      }

      // Expect roughly: coins 50%, stars 30%, gift 20% (with 10% tolerance)
      expect(counts.coins / iterations).toBeGreaterThan(0.40);
      expect(counts.coins / iterations).toBeLessThan(0.60);
      expect(counts.stars / iterations).toBeGreaterThan(0.20);
      expect(counts.stars / iterations).toBeLessThan(0.40);
      expect(counts.gift / iterations).toBeGreaterThan(0.10);
      expect(counts.gift / iterations).toBeLessThan(0.30);
    });
  });

  describe('generateSpinResults', () => {
    it('should generate correct number of results', () => {
      expect(generateSpinResults(prizes, 1)).toHaveLength(1);
      expect(generateSpinResults(prizes, 3)).toHaveLength(3);
      expect(generateSpinResults(prizes, 5)).toHaveLength(5);
      expect(generateSpinResults(prizes, 10)).toHaveLength(10);
    });
  });

  describe('calculateTotalWon', () => {
    it('should sum coins, stars, and collect gifts', () => {
      const results = [
        { prizeType: 'coins', prizeValue: 10, prizeName: '10 Coins' },
        { prizeType: 'coins', prizeValue: 25, prizeName: '25 Coins' },
        { prizeType: 'stars', prizeValue: 5, prizeName: '5 Stars' },
        { prizeType: 'gift', prizeValue: 'small_gift', prizeName: 'Gift' },
      ];

      const total = calculateTotalWon(results);
      expect(total.coins).toBe(35);
      expect(total.stars).toBe(5);
      expect(total.gifts).toEqual(['small_gift']);
    });

    it('should handle empty results', () => {
      const total = calculateTotalWon([]);
      expect(total.coins).toBe(0);
      expect(total.stars).toBe(0);
      expect(total.gifts).toEqual([]);
    });
  });
});
