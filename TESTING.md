# Testing & Validation

This covers the "Testing and Validation" section of the proposal: automated
unit tests, automated integration tests, and a manual user-acceptance
checklist for the critical functionality - ticket purchases, inventory
management, and role-based access control.

## 1. Unit tests (44 tests)

Tool: [Vitest](https://vitest.dev). Pure business logic, pulled out of
components/services into `src/utils/`, with no network or Firebase
involved - fast, deterministic, no setup required.

| File | Tests | Covers |
|---|---|---|
| `src/utils/roles.test.ts` | 9 | Role-based permission checks (`roleCanManageEvent`, `roleCanScanTickets`, `roleIsAdmin`) |
| `src/utils/rewards.test.ts` | 15 | Points/reward math (`getAvailableRewards`, `applyRewardDiscount`, `calculatePointsEarned`) |
| `src/utils/recommendations.test.ts` | 5 | The "recommended for you" event sort on the Browse Events page |
| `src/utils/tickets.test.ts` | 15 | The sold-out guard, the insufficient-points guard, and the four check-in status outcomes - the same decision logic `ticketService.ts` now calls |

**Run:**
```
npm test
```
Expect `4 test files, 44 tests, all passed`.

## 2. Integration tests (17 tests)

Tool: the [Firebase Local Emulator Suite](https://firebase.google.com/docs/emulator-suite)
(Firestore + Auth) plus `@firebase/rules-unit-testing`. These run the
**real app code** (`purchaseTicket`, `validateAndCheckInTicket`,
`createEvent`, `setUserRole`, ...) against a real, local Firestore -
signed in as real test accounts created through the same sign-up path a
real user goes through - with the real `firestore.rules` enforced. This is
the only way to prove the security rules, the atomic purchase transaction,
and the inventory counter actually work together correctly; none of that
can be verified by a unit test alone.

**Prerequisite:** the emulators need a Java runtime (11+) installed. Check
with `java -version` in your terminal - if Eclipse or Android Studio is
already installed, you very likely already have one.

**Run:**
```
npm install
npm run test:integration
```
This starts the emulators, runs the suite, and shuts them down
automatically - each run starts from empty data, so it's safe to re-run
any time.

| File | Tests | Covers |
|---|---|---|
| `src/integration/ticketPurchase.integration.test.ts` | 4 | Buying a ticket actually creates it and increments `quantitySold`; a sold-out ticket type is rejected; redeeming a reward you can't afford is rejected; a valid reward discounts the price and updates the points balance - all against real Firestore |
| `src/integration/checkIn.integration.test.ts` | 4 | Staff can check in a valid ticket; a second scan of the same ticket is rejected; an unknown QR code reports "not found" instead of crashing; an attendee cannot check in their own ticket |
| `src/integration/accessControl.integration.test.ts` | 9 | Attendees can't create events; organizers can; an organizer can't edit another organizer's event; nobody can promote their own role except an admin; nobody can hand themselves a huge points jump; and the three ticket-inventory-write cases below |

### Bug found and fixed while writing these tests

The original `firestore.rules` only let an event's organizer (or an admin)
write to `ticketTypes`. But `purchaseTicket()` needs to increment
`quantitySold` as part of the *buyer's own* transaction - so a real
purchase by a real attendee would have been rejected with a Firestore
permission error in production. This had no unit-test coverage because
unit tests don't touch real security rules at all.

**Fix:** `firestore.rules` now has a narrowly-scoped rule letting any
signed-in user bump `quantitySold` by exactly one, and nothing else about
the ticket type (not price, not name, not a bigger jump). The three tests
in the "ticket type inventory writes" section of
`accessControl.integration.test.ts` prove the fix works *and* that it
can't be abused: a direct price change is still rejected, a bulk
`quantitySold` jump is still rejected, and only the one-at-a-time
increment a real purchase performs is allowed.

## 3. User Acceptance Testing (manual)

Run on 2026-11-09 against the live dev build (`npm run dev`) in a real
browser, signed in as real test accounts - not the emulator, not a
simulation.

| # | Role | Step | Result |
|---|---|---|---|
| 1 | Attendee | Sign up for a new account | Pass |
| 2 | Attendee | Browse published events | Pass |
| 3 | Organizer | Create a new event and a ticket type | Pass |
| 4 | Attendee | Buy a ticket for that event | Initially **failed** - see finding below. Passed after the fix was deployed. |
| 5 | Attendee | See the ticket under "My Tickets" with a QR code | Pass |
| 6 | Attendee | Earn points from that purchase and see the balance update | Pass |
| 7 | Attendee | Redeem a reward on a second purchase and see the discounted price | Pass |
| 8 | Staff | Scan the first ticket's QR code and see it accepted | Pass |
| 9 | Staff | Scan the same ticket again and see it rejected as already used | Pass |
| 10 | Organizer | View the event's analytics dashboard | Pass |
| 11 | Admin | Promote a user's role from the Admin dashboard | Pass |
| 12 | Anyone | Try to reach an admin/organizer-only page while logged in as an attendee and confirm it's blocked | Pass |

### Finding during UAT: the rules fix hadn't been deployed

Step 4 failed on the first attempt with Firestore's "Missing or
insufficient permissions." error - the exact failure the integration
tests predicted. The cause: the `ticketTypes` rules fix (see section 2)
had been made in the local `firestore.rules` file and verified against
the emulator, but never pushed to the live Firebase project, so
production was still running the old rules. Running:

```
firebase deploy --only firestore:rules
```

pushed the fix live, and the exact same purchase then succeeded. This is
good evidence for the report: it shows the integration tests caught a
real bug *before* it reached a real user, and UAT caught that the fix
still needed to be deployed - exactly the kind of gap unit tests alone
can't catch.

## What's not covered yet

- `eventService.ts` / `userService.ts` don't have dedicated unit tests
  (thinner Firestore CRUD wrappers with less business logic to get wrong -
  lower priority than purchase/inventory/access control).
- No true concurrent-multi-client race test (e.g. two buyers hitting the
  last seat at the exact same millisecond) - the sold-out guard is proven
  against the real transaction sequentially, but simulating true
  concurrency would need separate Firebase app instances per simulated
  client, which is a reasonable future addition, not required to show the
  transaction is atomic.
- No automated end-to-end browser test (e.g. Playwright) driving the real
  UI - the UAT checklist above is the manual substitute for the capstone.
