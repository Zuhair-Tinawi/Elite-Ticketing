import type { RewardTier } from '@/types';

/** How many points a user earns per $1 actually paid for a ticket

Masalan hay example - isa a user uses a 10%-off reward and ends up paying $27 instead of $30, they earn points based on that $27, not the original $30. */



export const POINTS_PER_DOLLAR = 1;

/**el list is ordered starting bi the reward that costs the least points. w it goes up from there. hayde el array yale fiya my three rewards/ 10 20 w free */



export const REWARD_TIERS: RewardTier[] = [
  { id: 'discount10', label: '10% off this ticket', pointsCost: 90, percentOff: 10 },
  { id: 'discount20', label: '20% off this ticket', pointsCost: 200, percentOff: 20 },
  { id: 'freeTicket', label: 'Free ticket (100% off)', pointsCost: 500, percentOff: 100 },
];

export function getRewardById(rewardId: string | undefined): RewardTier | undefined {
  return REWARD_TIERS.find((tier) => tier.id === rewardId);
}







/** from all the three rewards hay will return el reward yale the user aando enough points for. */
export function getAvailableRewards(points: number): RewardTier[] {
  return REWARD_TIERS.filter((tier) => tier.pointsCost <= points);
}






/** Hayde applies a reward's discount to a ticket price w isa no reward selected just, returns the original price unchanged. */
export function applyRewardDiscount(price: number, reward: RewardTier | undefined): number {
  if (!reward) return price;
  const discounted = price * (1 - reward.percentOff / 100);
  return Math.round(discounted * 100) / 100;
}




/**1 point per $1,  btaamol calculate on the final price so redeeming a reward doesn't also earn a full set of new points. */
export function calculatePointsEarned(amountPaid: number): number {
  return Math.round(amountPaid * POINTS_PER_DOLLAR);
}