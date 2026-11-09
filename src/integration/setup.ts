import { connectFirestoreEmulator } from 'firebase/firestore';
import { connectAuthEmulator } from 'firebase/auth';
import { auth, db } from '@/firebase/config';

// Points the app's real Firebase Auth/Firestore singletons at the local
// emulators instead of the live project, so these tests exercise the exact
// same service functions the app uses in production - including real
// security rule enforcement - without touching real user data. Wrapped in
// try/catch because connecting twice throws, in case this setup file ever
// runs more than once inside the same module registry.
try {
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
} catch {
  // already connected
}
try {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
} catch {
  // already connected
}
