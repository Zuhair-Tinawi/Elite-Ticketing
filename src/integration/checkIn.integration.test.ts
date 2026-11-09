import { beforeAll, describe, expect, it } from 'vitest';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { purchaseTicket, validateAndCheckInTicket } from '@/services/ticketService';
import {
  createTestUser,
  seedPublishedEvent,
  signInAs,
  signOutCurrent,
  type TestUser,
} from './helpers';

let organizer: TestUser;
let staff: TestUser;

beforeAll(async () => {
  organizer = await createTestUser('organizer');
  staff = await createTestUser('staff');
});

async function purchaseOneTicket() {
  await signInAs(organizer);
  const { eventId, ticketTypeId } = await seedPublishedEvent(organizer);
  await signOutCurrent();

  const buyer = await createTestUser('attendee', 'ciBuyer');
  await signInAs(buyer);
  const ticketId = await purchaseTicket({ eventId, ticketTypeId, buyer });

  // Read the ticket back while the buyer (its owner) is still signed in -
  // the tickets read rule requires isSignedIn(), so this would be denied
  // if we signed out first.
  const ticketSnap = await getDoc(doc(db, 'tickets', ticketId));
  const qrCodeValue = ticketSnap.data()?.qrCodeValue as string;
  await signOutCurrent();
  return { qrCodeValue };
}

describe('scanning a ticket', () => {
  it('checks in a valid ticket', async () => {
    const { qrCodeValue } = await purchaseOneTicket();
    await signInAs(staff);
    const result = await validateAndCheckInTicket(qrCodeValue, staff.uid);
    await signOutCurrent();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.ticket.status).toBe('used');
    }
  });

  it('rejects scanning the same ticket twice', async () => {
    const { qrCodeValue } = await purchaseOneTicket();
    await signInAs(staff);
    await validateAndCheckInTicket(qrCodeValue, staff.uid);
    const second = await validateAndCheckInTicket(qrCodeValue, staff.uid);
    await signOutCurrent();

    expect(second).toEqual({ ok: false, reason: 'already_used' });
  });

  it('reports an unknown code as not found rather than throwing', async () => {
    await signInAs(staff);
    const result = await validateAndCheckInTicket('not-a-real-code', staff.uid);
    await signOutCurrent();

    expect(result).toEqual({ ok: false, reason: 'not_found' });
  });

  it('does not let an attendee check in a ticket themselves', async () => {
    const { qrCodeValue } = await purchaseOneTicket();
    const someAttendee = await createTestUser('attendee', 'selfScan');
    await signInAs(someAttendee);
    await expect(validateAndCheckInTicket(qrCodeValue, someAttendee.uid)).rejects.toThrow();
    await signOutCurrent();
  });
});
