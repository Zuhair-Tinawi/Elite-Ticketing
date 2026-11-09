import { beforeAll, describe, it } from 'vitest';
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { createEvent, updateEvent, updateTicketType } from '@/services/eventService';
import { setUserRole } from '@/services/userService';
import {
  createTestUser,
  seedPublishedEvent,
  signInAs,
  signOutCurrent,
  type TestUser,
} from './helpers';

let attendee: TestUser;
let organizerA: TestUser;
let organizerB: TestUser;
let admin: TestUser;

beforeAll(async () => {
  attendee = await createTestUser('attendee');
  organizerA = await createTestUser('organizer', 'organizerA');
  organizerB = await createTestUser('organizer', 'organizerB');
  admin = await createTestUser('admin');
});

describe('event creation', () => {
  it('blocks an attendee from creating an event', async () => {
    await signInAs(attendee);
    await assertFails(
      createEvent({
        title: 'Hack attempt',
        description: '',
        category: 'music',
        venue: '',
        address: '',
        startDate: Date.now(),
        endDate: Date.now(),
        organizerId: attendee.uid,
        status: 'draft',
      })
    );
    await signOutCurrent();
  });

  it('lets an organizer create their own event', async () => {
    await signInAs(organizerA);
    await assertSucceeds(
      createEvent({
        title: 'Organizer A event',
        description: '',
        category: 'music',
        venue: '',
        address: '',
        startDate: Date.now(),
        endDate: Date.now(),
        organizerId: organizerA.uid,
        status: 'draft',
      })
    );
    await signOutCurrent();
  });
});

describe('event ownership', () => {
  it('blocks one organizer from editing another organizer’s event', async () => {
    await signInAs(organizerA);
    const { eventId } = await seedPublishedEvent(organizerA);
    await signOutCurrent();

    await signInAs(organizerB);
    await assertFails(updateEvent(eventId, { title: 'Hijacked' }));
    await signOutCurrent();
  });
});

describe('role changes', () => {
  it('blocks a non-admin from promoting themself', async () => {
    await signInAs(attendee);
    await assertFails(updateDoc(doc(db, 'users', attendee.uid), { role: 'admin' }));
    await signOutCurrent();
  });

  it('lets an admin change another user’s role', async () => {
    const target = await createTestUser('attendee', 'promotable');
    await signInAs(admin);
    await assertSucceeds(setUserRole(target.uid, 'staff'));
    await signOutCurrent();
  });
});

describe('points tampering', () => {
  it('blocks a user from giving themself a huge points jump', async () => {
    await signInAs(attendee);
    await assertFails(updateDoc(doc(db, 'users', attendee.uid), { points: 999999 }));
    await signOutCurrent();
  });
});

describe('ticket type inventory writes', () => {
  it('blocks an attendee from directly discounting a ticket price', async () => {
    await signInAs(organizerA);
    const { eventId, ticketTypeId } = await seedPublishedEvent(organizerA, { price: 50 });
    await signOutCurrent();

    await signInAs(attendee);
    await assertFails(updateTicketType(eventId, ticketTypeId, { price: 0 }));
    await signOutCurrent();
  });

  it('blocks an attendee from incrementing quantitySold by more than one at a time', async () => {
    await signInAs(organizerA);
    const { eventId, ticketTypeId } = await seedPublishedEvent(organizerA);
    await signOutCurrent();

    await signInAs(attendee);
    await assertFails(updateTicketType(eventId, ticketTypeId, { quantitySold: 5 }));
    await signOutCurrent();
  });

  it('lets a signed-in buyer bump quantitySold by exactly one, the way a real purchase does', async () => {
    await signInAs(organizerA);
    const { eventId, ticketTypeId } = await seedPublishedEvent(organizerA);
    await signOutCurrent();

    await signInAs(attendee);
    await assertSucceeds(updateTicketType(eventId, ticketTypeId, { quantitySold: 1 }));
    await signOutCurrent();
  });
});
