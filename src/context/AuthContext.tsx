import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';



import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase/config';
import type { UserProfile } from '@/types';
interface AuthContextValue {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}



const AuthContext = createContext<AuthContextValue | undefined>(undefined);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const snap = await getDoc(doc(db, 'users', user.uid));
        setUserProfile(snap.exists() ? (snap.data() as UserProfile) : null);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);
  async function signup(email: string, password: string, displayName: string) {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName });










//kel new signup starts as atendee. baaden fina to promote them using admin dashboard
    const profile: UserProfile = {
      uid: credential.user.uid,
      email,
      displayName,
      role: 'attendee',
      points: 0,
      createdAt: Date.now(),
    };
    await setDoc(doc(db, 'users', credential.user.uid), {
      ...profile,
      createdAt: serverTimestamp(),
    });
    setUserProfile(profile);
  }
  async function login(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }
  async function logout() {
    await signOut(auth);
  }





  //hayde it gets the signed-in user's own profile doc from Firestore. men 3uza 
  // after a ticket purchase so the points balance shown on screen updates do8re.
  //badal ma yaamlo refresh bas naamol log out w sign in again



  async function refreshProfile() {
    if (!currentUser) return;
    const snap = await getDoc(doc(db, 'users', currentUser.uid));
    setUserProfile(snap.exists() ? (snap.data() as UserProfile) : null);
  }
  const value: AuthContextValue = {
    currentUser,
    userProfile,
    loading,
    signup,
    login,
    logout,
    refreshProfile,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}