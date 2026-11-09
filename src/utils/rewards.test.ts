import { describe, it, expect } from 'vitest';
import {
  REWARD_TIERS,
  getRewardById,
  getAvailableRewards,
  applyRewardDiscount,
  calculatePointsEarned,
} from './rewards';

describe('getRewardById', () => {
  it('finds the 10% off reward', () => {
    expect(getRewardById('discount10')).toEqual(REWARD_TIERS[0]);
  });
  it('finds the free ticket reward', () => {
    expect(getRewardById('freeTicket')).toEqual(REWARD_TIERS[2]);
  });
  it('returns undefined for an unknown id', () => {
    expect(getRewardById('not-a-real-reward')).toBeUndefined();
  });
  it('returns undefined when no id is given', () => {
    expect(getRewardById(undefined)).toBeUndefined();
  });
});

describe('getAvailableRewards', () => {
  it('returns nothing when points are below every tier', () => {
    expect(getAvailableRewards(50)).toEqual([]);
  });
  it('returns only the 10% tier at exactly 90 points', () => {
    expect(getAvailableRewards(90)).toEqual([REWARD_TIERS[0]]);
  });
  it('returns the 10% and 20% tiers at 200 points', () => {
    expect(getAvailableRewards(200)).toEqual([REWARD_TIERS[0], REWARD_TIERS[1]]);
  });
  it('returns all three tiers at 500 or more points', () => {
    expect(getAvailableRewards(500)).toEqual(REWARD_TIERS);
  });
});

describe('applyRewardDiscount', () => {
  it('returns the original price when no reward is given', () => {
    expect(applyRewardDiscount(30, undefined)).toBe(30);
  });
  it('applies a 10% discount correctly', () => {
    expect(applyRewardDiscount(30, REWARD_TIERS[0])).toBe(27);
  });
  it('applies a 20% discount correctly', () => {
    expect(applyRewardDiscount(50, REWARD_TIERS[1])).toBe(40);
  });
  it('applies a free ticket (100% off) correctly', () => {
    expect(applyRewardDiscount(25, REWARD_TIERS[2])).toBe(0);
  });
});

describe('calculatePointsEarned', () => {
  it('earns 1 point per dollar paid', () => {
    expect(calculatePointsEarned(25)).toBe(25);
  });
  it('rounds to the nearest whole point', () => {
    expect(calculatePointsEarned(27.4)).toBe(27);
    expect(calculatePointsEarned(27.6)).toBe(28);
  });
  it('earns 0 points on a free ticket', () => {
    expect(calculatePointsEarned(0)).toBe(0);
  });
});