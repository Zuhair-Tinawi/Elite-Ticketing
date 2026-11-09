import type { RewardTier, Ticket, TicketType } from '@/types';
import { applyRewardDiscount, calculatePointsEarned } from './rewards';

export type PurchaseCheck =
  | { ok: true }
  | { ok: false; reason: 'sold_out' | 'insufficient_points' };

/** Pure version of the two guards purchaseTicket() enforces inside its
 * Firestore transaction: the ticket type can't be oversold, and a reward
 * can't be redeemed for more points than the buyer actually has. */
export function checkCanPurchase(
  ticketType: Pick<TicketType, 'quantitySold' | 'quantityTotal'>,
  currentPoints: number,
  reward: RewardTier | undefined
): PurchaseCheck {
  if (ticketType.quantitySold >= ticketType.quantityTotal) {
    return { ok: false, reason: 'sold_out' };
  }
  if (reward && currentPoints < reward.pointsCost) {
    return { ok: false, reason: 'insufficient_points' };
  }
  return { ok: true };
}

export interface PurchaseOutcome {
  finalPrice: number;
  pointsEarned: number;
  newPointsBalance: number;
}

/** Works out what a purchase actually costs and how the buyer's points
 * balance changes, given an already-approved purchase (call checkCanPurchase
 * first). */
export function computePurchaseOutcome(
  price: number,
  currentPoints: number,
  reward: RewardTier | undefined
): PurchaseOutcome {
  const finalPrice = applyRewardDiscount(price, reward);
  const pointsEarned = calculatePointsEarned(finalPrice);
  const newPointsBalance = currentPoints - (reward?.pointsCost ?? 0) + pointsEarned;
  return { finalPrice, pointsEarned, newPointsBalance };
}

export type CheckInDecision =
  | { ok: true }
  | { ok: false; reason: 'already_used' | 'cancelled' };

/** Pure version of the status check validateAndCheckInTicket() makes before
 * marking a ticket used. Does not look at 'not_found' - that's decided
 * earlier, before a ticket document even exists to check. */
export function decideCheckIn(status: Ticket['status']): CheckInDecision {
  if (status === 'used') return { ok: false, reason: 'already_used' };
  if (status === 'cancelled' || status === 'refunded') {
    return { ok: false, reason: 'cancelled' };
  }
  return { ok: true };
}
