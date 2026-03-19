import { describe, it, expect } from 'vitest';
import { calculateLevel } from './levelUtils.js';

describe('levelUtils', () => {
  describe('calculateLevel', () => {
    it('should return minimum of both card levels', () => {
      expect(calculateLevel(1, 1)).toBe(1);
      expect(calculateLevel(5, 3)).toBe(3);
      expect(calculateLevel(3, 5)).toBe(3);
      expect(calculateLevel(13, 13)).toBe(13);
    });

    it('should handle equal levels', () => {
      expect(calculateLevel(7, 7)).toBe(7);
    });

    it('should handle level 1 cases', () => {
      expect(calculateLevel(1, 13)).toBe(1);
      expect(calculateLevel(13, 1)).toBe(1);
    });
  });
});
