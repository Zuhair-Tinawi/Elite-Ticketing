import { describe, it, expect } from 'vitest';
import { REWARD_TIERS } from './rewards';
import { checkCanPurchase, computePurchaseOutcome, decideCheckIn } from './tickets';

const [discount10, discount20, freeTicket] = REWARD_TIERS;

describe('checkCanPurchase', () => {
  it('allows a purchase when seats remain and no reward is used', () => {
    expect(checkCanPurchase({ quantitySold: 2, quantityTotal: 10 }, 0, undefined)).toEqual({
      ok: true,
    });
  });

  it('rejects a sold-out ticket type', () => {
    expect(checkCanPurchase({ quantitySold: 10, quantityTotal: 10 }, 1000, undefined)).toEqual({
      ok: false,
      reason: 'sold_out',
    });
  });

  it('rejects when quantitySold has somehow gone over the total', () => {
    expect(checkCanPurchase({ quantitySold: 11, quantityTotal: 10 }, 1000, undefined)).toEqual({
      ok: false,
      reason: 'sold_out',
    });
  });

  it('checks inventory before points, even if both would fail', () => {
    expect(checkCanPurchase({ quantitySold: 10, quantityTotal: 10 }, 0, freeTicket)).toEqual({
      ok: false,
      reason: 'sold_out',
    });
  });

  it('rejects a reward the buyer cannot afford', () => {
    expect(checkCanPurchase({ quantitySold: 0, quantityTotal: 10 }, 50, discount10)).toEqual({
      ok: false,
      reason: 'insufficient_points',
    });
  });

  it('allows a reward the buyer has exactly enough points for', () => {
    expect(checkCanPurchase({ quantitySold: 0, quantityTotal: 10 }, 90, discount10)).toEqual({
      ok: true,
    });
  });
});

describe('computePurchaseOutcome', () => {
  it('charges full price and earns points 1:1 when no reward is used', () => {
    expect(computePurchaseOutcome(30, 0, undefined)).toEqual({
      finalPrice: 30,
      pointsEarned: 30,
      newPointsBalance: 30,
    });
  });

  it('applies a 10% reward, spends its points, and earns points on the discounted price', () => {
    expect(computePurchaseOutcome(30, 90, discount10)).toEqual({
      finalPrice: 27,
      pointsEarned: 27,
      newPointsBalance: 27, // 90 - 90 spent + 27 earned
    });
  });

  it('applies a 20% reward correctly', () => {
    expect(computePurchaseOutcome(50, 200, discount20)).toEqual({
      finalPrice: 40,
      pointsEarned: 40,
      newPointsBalance: 40,
    });
  });

  it('charges nothing and earns nothing on a free ticket', () => {
    expect(computePurchaseOutcome(25, 500, freeTicket)).toEqual({
      finalPrice: 0,
      pointsEarned: 0,
      newPointsBalance: 0,
    });
  });
});

describe('decideCheckIn', () => {
  it('allows check-in for a valid ticket', () => {
    expect(decideCheckIn('valid')).toEqual({ ok: true });
  });

  it('rejects a ticket that was already checked in', () => {
    expect(decideCheckIn('used')).toEqual({ ok: false, reason: 'already_used' });
  });

  it('rejects a cancelled ticket', () => {
    expect(decideCheckIn('cancelled')).toEqual({ ok: false, reason: 'cancelled' });
  });

  it('rejects a refunded ticket', () => {
    expect(decideCheckIn('refunded')).toEqual({ ok: false, reason: 'cancelled' });
  });
});
