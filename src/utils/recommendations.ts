import type { EventRecord } from '@/types';

/** Sorts events so his most purchased categories come first. A category
  he's never bought counts as 0. */
export function sortByPurchasedCategories(
  events: EventRecord[],
  categoryCounts: Record<string, number>
): EventRecord[] {
  return [...events].sort((a, b) => {
    const countA = categoryCounts[a.category] ?? 0;
    const countB = categoryCounts[b.category] ?? 0;
    if (countA !== countB) return countB - countA;
    return a.startDate - b.startDate;
  });
}
