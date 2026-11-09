import { collection, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import type { UserProfile, UserRole } from '@/types';

const usersCol = collection(db, 'users');

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function listUsers(): Promise<UserProfile[]> {
  const snap = await getDocs(usersCol);
  return snap.docs.map((d) => d.data() as UserProfile);
}










/**bas el admin fiyo yaamol promote aw demotes la a user */


export async function setUserRole(uid: string, role: UserRole): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { role });
}

export async function updateInterests(uid: string, interests: string[]): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { interests });
}
