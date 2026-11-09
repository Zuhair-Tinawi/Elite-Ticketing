import { describe, it, expect } from 'vitest';
import { sortByPurchasedCategories } from './recommendations';
import type { EventRecord } from '@/types';

function makeEvent(overrides: Partial<EventRecord> = {}): EventRecord {
  return {
    id: 'e1',
    title: 'Test Event',
    description: '',
    category: 'music',
    venue: 'Venue',
    address: '',
    startDate: 0,
    endDate: 0,
    organizerId: 'org1',
    status: 'published',
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  };
}

describe('sortByPurchasedCategories', () => {
  it('puts the most-purchased category first', () => {
    const music = makeEvent({ id: 'm1', category: 'music', startDate: 100 });
    const sports = makeEvent({ id: 's1', category: 'sports', startDate: 50 });
    const tech = makeEvent({ id: 't1', category: 'tech', startDate: 200 });

    const result = sortByPurchasedCategories([sports, tech, music], {
      music: 3,
      sports: 1,
    });

    expect(result.map((e) => e.id)).toEqual(['m1', 's1', 't1']);
  });

  it('treats a category the user never bought as 0', () => {
    const tech = makeEvent({ id: 't1', category: 'tech', startDate: 10 });
    const music = makeEvent({ id: 'm1', category: 'music', startDate: 20 });

    const result = sortByPurchasedCategories([tech, music], { music: 1 });

    expect(result.map((e) => e.id)).toEqual(['m1', 't1']);
  });

  it('falls back to earliest start date within the same purchase count', () => {
    const later = makeEvent({ id: 'later', category: 'music', startDate: 200 });
    const earlier = makeEvent({ id: 'earlier', category: 'music', startDate: 100 });

    const result = sortByPurchasedCategories([later, earlier], {});

    expect(result.map((e) => e.id)).toEqual(['earlier', 'later']);
  });

  it('does not mutate the original array', () => {
    const a = makeEvent({ id: 'a', category: 'music', startDate: 2 });
    const b = makeEvent({ id: 'b', category: 'sports', startDate: 1 });
    const original = [a, b];

    sortByPurchasedCategories(original, { music: 5 });

    expect(original).toEqual([a, b]);
  });

  it('returns an empty array when given no events', () => {
    expect(sortByPurchasedCategories([], { music: 5 })).toEqual([]);
  });
});
