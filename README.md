Elite Ticketing is a self-hosted alternative to third-party platforms like Eventbrite and Ticketmaster, built as a capstone project.

Live deployment: https://elite-ticketing.web.app




1. What it does

Elite Ticketing lets organizers create and publish events with their own ticket types and pricing, lets attendees buy tickets and receive an instant QR-coded digital ticket, and lets door staff check attendees in by scanning that code — all backed by a real-time Firestore database with role-based access control enforced both in the UI and in the database's own security rules.

Four roles, each with a distinct set of permissions:

- Attendee — browse events, buy tickets, earn and redeem loyalty points
- Organizer — create/publish/manage events and ticket types, view sales analytics
- Staff — scan ticket QR codes to check attendees in
- Admin — promote any user to any role from a dedicated dashboard



2. Features

- Secure authentication and four-role authorization (enforced in both the UI and Firestore Security Rules)
- Event creation with multiple ticket types, independent pricing and inventory per type
- Instant QR-coded digital tickets, validated against the live database at the door
- A loyalty points and rewards program — every dollar paid earns a point, redeemable for tiered discounts
- Purchase-history-based event recommendations on the Browse Events page
- Per-event sales analytics for organizers
- An AI chatbot assistant (Google Gemini, behind a serverless proxy that keeps the API key off the client) to help visitors use the platform





3. Tech stack

- Frontend: React + TypeScript, Vite
- Backend: Firebase Authentication, Cloud Firestore, Firebase Hosting
- Other: html5-qrcode / qrcode.react for QR scanning and generation, Recharts for analytics, a small Vercel-hosted serverless function fronting the Gemini API





4. Testing

The project has two layers of automated tests plus a manual UAT checklist 

see TESTING.md for full details and results.


npm test                  44 unit tests (Vitest) — fast, no network
npm run test:integration  17 integration tests against the Firebase Local Emulator Suite






5. Project structure
   
src/
  components/   shared UI (layout, protected routes, chat widget)
  context/      auth context
  firebase/     Firebase app config
  pages/        route-level pages, grouped by role (admin/, attendee/, organizer/, staff/, auth/)
  services/     Firestore read/write functions (events, tickets, users)
  types/        shared TypeScript types
  utils/        pure business logic (roles, rewards, recommendations, ticket decisions) + their unit tests
  integration/  integration tests run against the Firebase emulator
firestore.rules  database-level access control
TESTING.md       full testing write-up and results




Zouhair Al Tinawi — Capstone Final Project, Computer Science, Lebanese American University (LAU).
