import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import fs from 'node:fs';
import { auth, db } from '@/firebase/config';
import { createEvent, createTicketType } from '@/services/eventService';
import type { TicketType, UserProfile, UserRole } from '@/types';

let envPromise: Promise<RulesTestEnvironment> | null = null;

/** Only used to bypass rules for two things that need it: seeding a test
 * user's role at creation time (the real create rule only ever allows a
 * brand-new account to self-create as 'attendee'; a human normally sets the
 * first admin by hand in the Firebase console, which is what this stands in
 * for), and directly setting points for reward tests. Every actual action
 * a test performs otherwise goes through the real, rule-checked app code. */
function getRulesTestEnv(): Promise<RulesTestEnvironment> {
  if (!envPromise) {
    envPromise = initializeTestEnvironment({
      // Must match the app's real VITE_FIREBASE_PROJECT_ID - the emulator
      // only serves one project id at a time (singleProjectMode), and the
      // app's own db/auth singletons (redirected to the emulator in
      // setup.ts) still carry that real id from firebase/config.ts.
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      firestore: {
        rules: fs.readFileSync('firestore.rules', 'utf8'),
        host: '127.0.0.1',
        port: 8080,
      },
    });
  }
  return envPromise!;
}

let counter = 0;
function uniqueEmail(label: string): string {
  counter += 1;
  return `${label}-${Date.now()}-${counter}@test.local`;
}

export const TEST_PASSWORD = 'Test1234!';

/** Shaped exactly like UserProfile so a TestUser can be passed anywhere the
 * app expects a real signed-up user (e.g. purchaseTicket's buyer param). */
export type TestUser = UserProfile;

/**
 * Signs up a real Auth-emulator account the same way Register.tsx does
 * (createUserWithEmailAndPassword + a self-created 'attendee' Firestore
 * profile), then promotes it to the requested role if it isn't attendee.
 * Signs the user back out before returning, so each test controls exactly
 * who's signed in when.
 */
export async function createTestUser(role: UserRole, label: string = role): Promise<TestUser> {
  const email = uniqueEmail(label);
  const displayName = `Test ${label}`;
  const createdAt = Date.now();

  const credential = await createUserWithEmailAndPassword(auth, email, TEST_PASSWORD);
  const uid = credential.user.uid;
  const profile: UserProfile = { uid, email, displayName, role: 'attendee', points: 0, createdAt };
  await setDoc(doc(db, 'users', uid), { ...profile, createdAt: serverTimestamp() });

  if (role !== 'attendee') {
    const env = await getRulesTestEnv();
    await env.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().doc(`users/${uid}`).update({ role });
    });
  }

  await signOut(auth);
  return { ...profile, role };
}

export async function signInAs(user: Pick<TestUser, 'email'>): Promise<void> {
  await signInWithEmailAndPassword(auth, user.email, TEST_PASSWORD);
}

export async function signOutCurrent(): Promise<void> {
  await signOut(auth);
}

/** Directly sets a user's points, bypassing rules - lets reward tests set
 * up a starting balance without needing an admin signed in or hitting the
 * per-write point-jump cap meant for real purchases. */
export async function setPointsDirectly(uid: string, points: number): Promise<void> {
  const env = await getRulesTestEnv();
  await env.withSecurityRulesDisabled(async (ctx) => {
    await ctx.firestore().doc(`users/${uid}`).update({ points });
  });
}

/** Creates a published event with one ticket type, as the given organizer.
 * Caller must already be signed in as that organizer. */
export async function seedPublishedEvent(
  organizer: Pick<TestUser, 'uid'>,
  ticketTypeOverrides: Partial<Omit<TicketType, 'id' | 'eventId' | 'quantitySold'>> = {}
): Promise<{ eventId: string; ticketTypeId: string }> {
  const eventId = await createEvent({
    title: 'Integration Test Event',
    description: '',
    category: 'music',
    venue: 'Test Venue',
    address: '',
    startDate: Date.now() + 86_400_000,
    endDate: Date.now() + 90_000_000,
    organizerId: organizer.uid,
    status: 'published',
  });
  const ticketTypeId = await createTicketType(eventId, {
    name: 'General Admission',
    price: 30,
    currency: 'USD',
    quantityTotal: 10,
    ...ticketTypeOverrides,
  });
  return { eventId, ticketTypeId };
}
