import { beforeAll, describe, expect, it } from 'vitest';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { getTicketTypes } from '@/services/eventService';
import { purchaseTicket } from '@/services/ticketService';
import { getUserProfile } from '@/services/userService';
import { REWARD_TIERS } from '@/utils/rewards';
import {
  createTestUser,
  seedPublishedEvent,
  setPointsDirectly,
  signInAs,
  signOutCurrent,
  type TestUser,
} from './helpers';

let organizer: TestUser;

beforeAll(async () => {
  organizer = await createTestUser('organizer');
});

async function createEventWithTicketType(quantityTotal: number, price = 30) {
  await signInAs(organizer);
  const result = await seedPublishedEvent(organizer, { quantityTotal, price });
  await signOutCurrent();
  return result;
}

describe('purchasing a ticket', () => {
  it('creates a valid ticket and increments quantitySold against the real emulator', async () => {
    const { eventId, ticketTypeId } = await createEventWithTicketType(5);
    const buyer = await createTestUser('attendee', 'buyer1');
    await signInAs(buyer);

    const ticketId = await purchaseTicket({ eventId, ticketTypeId, buyer });

    // Read the ticket back while the buyer is still signed in - the
    // tickets read rule requires isSignedIn() (plus being the owner,
    // staff, organizer, or admin), so this would be denied if we signed
    // out first.
    const ticketSnap = await getDoc(doc(db, 'tickets', ticketId));
    expect(ticketSnap.exists()).toBe(true);
    expect(ticketSnap.data()?.status).toBe('valid');
    expect(ticketSnap.data()?.price).toBe(30);
    await signOutCurrent();

    const [ticketType] = await getTicketTypes(eventId);
    expect(ticketType.quantitySold).toBe(1);
  });

  it('rejects a purchase once the ticket type is sold out', async () => {
    const { eventId, ticketTypeId } = await createEventWithTicketType(1);
    const buyer1 = await createTestUser('attendee', 'soldout1');
    const buyer2 = await createTestUser('attendee', 'soldout2');

    await signInAs(buyer1);
    await purchaseTicket({ eventId, ticketTypeId, buyer: buyer1 });
    await signOutCurrent();

    await signInAs(buyer2);
    await expect(
      purchaseTicket({ eventId, ticketTypeId, buyer: buyer2 })
    ).rejects.toThrow('sold out');
    await signOutCurrent();

    const [ticketType] = await getTicketTypes(eventId);
    expect(ticketType.quantitySold).toBe(1);
  });

  it('rejects redeeming a reward the buyer cannot afford', async () => {
    const { eventId, ticketTypeId } = await createEventWithTicketType(5);
    const buyer = await createTestUser('attendee', 'poorBuyer');
    await setPointsDirectly(buyer.uid, 10);

    await signInAs(buyer);
    await expect(
      purchaseTicket({ eventId, ticketTypeId, buyer, rewardId: REWARD_TIERS[0].id })
    ).rejects.toThrow('Not enough points');
    await signOutCurrent();
  });

  it("applies a reward discount and updates the buyer's points balance", async () => {
    const { eventId, ticketTypeId } = await createEventWithTicketType(5, 30);
    const buyer = await createTestUser('attendee', 'rewardBuyer');
    await setPointsDirectly(buyer.uid, 90);

    await signInAs(buyer);
    const ticketId = await purchaseTicket({
      eventId,
      ticketTypeId,
      buyer,
      rewardId: REWARD_TIERS[0].id, // discount10: 90 points -> 10% off
    });

    const ticketSnap = await getDoc(doc(db, 'tickets', ticketId));
    expect(ticketSnap.data()?.price).toBe(27); // 30 - 10%

    const profile = await getUserProfile(buyer.uid);
    await signOutCurrent();
    // 90 points spent on the reward + 27 points earned on the $27 paid
    expect(profile?.points).toBe(27);
  });
});
