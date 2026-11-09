import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import type { EventRecord, TicketType } from '@/types';

const eventsCol = collection(db, 'events');

export async function getPublishedEvents(): Promise<EventRecord[]> {
  const q = query(
    eventsCol,
    where('status', '==', 'published'),
    orderBy('startDate', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as EventRecord));
}

export async function getEvent(eventId: string): Promise<EventRecord | null> {
  const snap = await getDoc(doc(db, 'events', eventId));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as EventRecord) : null;
}

export async function getEventsByOrganizer(organizerId: string): Promise<EventRecord[]> {
  const q = query(
    eventsCol,
    where('organizerId', '==', organizerId),
    orderBy('startDate', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as EventRecord));
}

export async function createEvent(
  data: Omit<EventRecord, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const ref = await addDoc(eventsCol, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateEvent(
  eventId: string,
  data: Partial<Omit<EventRecord, 'id'>>
): Promise<void> {
  await updateDoc(doc(db, 'events', eventId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteEvent(eventId: string): Promise<void> {
  await deleteDoc(doc(db, 'events', eventId));
}

export async function getTicketTypes(eventId: string): Promise<TicketType[]> {
  const snap = await getDocs(collection(db, 'events', eventId, 'ticketTypes'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as TicketType));
}

export async function createTicketType(
  eventId: string,
  data: Omit<TicketType, 'id' | 'eventId' | 'quantitySold'>
): Promise<string> {
  const ref = await addDoc(collection(db, 'events', eventId, 'ticketTypes'), {
    ...data,
    eventId,
    quantitySold: 0,
  });
  return ref.id;
}

export async function updateTicketType(
  eventId: string,
  ticketTypeId: string,
  data: Partial<Omit<TicketType, 'id' | 'eventId'>>
): Promise<void> {
  await updateDoc(doc(db, 'events', eventId, 'ticketTypes', ticketTypeId), data);
}
