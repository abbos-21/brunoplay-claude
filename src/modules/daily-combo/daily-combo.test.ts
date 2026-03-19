import { describe, it, expect } from 'vitest';
import { evaluateComboAnswer, getComboReward } from './daily-combo.engine.js';

describe('daily-combo.engine', () => {
  describe('evaluateComboAnswer', () => {
    it('should return 4 correct for exact match', () => {
      const result = evaluateComboAnswer([1, 2, 3, 4], [1, 2, 3, 4]);
      expect(result.correctCount).toBe(4);
    });

    it('should return 3 correct for 3 matching positions', () => {
      const result = evaluateComboAnswer([1, 2, 3, 5], [1, 2, 3, 4]);
      expect(result.correctCount).toBe(3);
    });

    it('should return 2 correct for 2 matching positions', () => {
      const result = evaluateComboAnswer([1, 2, 5, 6], [1, 2, 3, 4]);
      expect(result.correctCount).toBe(2);
    });

    it('should return 1 correct for 1 matching position', () => {
      const result = evaluateComboAnswer([1, 5, 6, 7], [1, 2, 3, 4]);
      expect(result.correctCount).toBe(1);
    });

    it('should return 0 correct for no matching positions', () => {
      const result = evaluateComboAnswer([5, 6, 7, 8], [1, 2, 3, 4]);
      expect(result.correctCount).toBe(0);
    });

    it('should not count items in wrong positions', () => {
      const result = evaluateComboAnswer([4, 3, 2, 1], [1, 2, 3, 4]);
      expect(result.correctCount).toBe(0);
    });

    it('should handle partial overlap in wrong positions', () => {
      const result = evaluateComboAnswer([2, 1, 4, 3], [1, 2, 3, 4]);
      expect(result.correctCount).toBe(0);
    });
  });

  describe('getComboReward', () => {
    const rewards = { '4': 100, '3': 75, '2': 50, '1': 25 };

    it('should return correct reward for each count', () => {
      expect(getComboReward(4, rewards)).toBe(100);
      expect(getComboReward(3, rewards)).toBe(75);
      expect(getComboReward(2, rewards)).toBe(50);
      expect(getComboReward(1, rewards)).toBe(25);
    });

    it('should return 0 for 0 correct', () => {
      expect(getComboReward(0, rewards)).toBe(0);
    });
  });
});
