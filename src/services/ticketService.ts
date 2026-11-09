import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import type { Ticket, TicketType, UserProfile } from '@/types';
import { getRewardById } from '@/utils/rewards';
import { checkCanPurchase, computePurchaseOutcome, decideCheckIn } from '@/utils/tickets';
const ticketsCol = collection(db, 'tickets');




/** Hon it creates a random, w shi ykun sa3eb to guess code to put in the ticket's QR code.*/






export function generateQrValue(): string {
  return `TKT-${crypto.randomUUID()}`;
}



/**
 * Hon buys one ticket for a signed-in user. W kel shi happens inside one
 * database transaction, hek even if many people buy at the exact same
 * moment, the number sold can never go over the total available.
 



 * w kamen isa a rewardId is given, khalayneha to check the user's real points balance
 * from the database itself mesh men the value already loaded in the app,
 * la2an hayda fiyo ykun a little outdated
 */





export async function purchaseTicket(params: {
  eventId: string;
  ticketTypeId: string;
  buyer: UserProfile;
  rewardId?: string;
}): Promise<string> {
  const { eventId, ticketTypeId, buyer, rewardId } = params;
  const ticketTypeRef = doc(db, 'events', eventId, 'ticketTypes', ticketTypeId);
  const userRef = doc(db, 'users', buyer.uid);
  const newTicketRef = doc(ticketsCol);
  await runTransaction(db, async (tx) => {
    const [ticketTypeSnap, userSnap] = await Promise.all([tx.get(ticketTypeRef), tx.get(userRef)]);
    if (!ticketTypeSnap.exists()) throw new Error('Ticket type not found');
    if (!userSnap.exists()) throw new Error('User profile not found');
    const ticketType = ticketTypeSnap.data() as TicketType;
    const currentPoints = (userSnap.data().points as number | undefined) ?? 0;
    const reward = getRewardById(rewardId);

    const purchaseCheck = checkCanPurchase(ticketType, currentPoints, reward);
    if (!purchaseCheck.ok) {
      throw new Error(
        purchaseCheck.reason === 'sold_out'
          ? 'This ticket type is sold out'
          : 'Not enough points for that reward'
      );
    }

    const { finalPrice, newPointsBalance } = computePurchaseOutcome(
      ticketType.price,
      currentPoints,
      reward
    );
    const ticket: Omit<Ticket, 'id'> = {
      eventId,
      ticketTypeId,
      ownerId: buyer.uid,
      attendeeName: buyer.displayName,
      attendeeEmail: buyer.email,
      price: finalPrice,
      currency: ticketType.currency,
      qrCodeValue: generateQrValue(),
      status: 'valid',
      purchasedAt: Date.now(),
      ...(reward ? { appliedRewardId: reward.id } : {}),
    };
    tx.set(newTicketRef, { ...ticket, purchasedAt: serverTimestamp() });
    tx.update(ticketTypeRef, { quantitySold: ticketType.quantitySold + 1 });
    tx.update(userRef, { points: newPointsBalance });
  });
  return newTicketRef.id;
}
export async function getMyTickets(uid: string): Promise<Ticket[]> {
  const q = query(ticketsCol, where('ownerId', '==', uid), orderBy('purchasedAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Ticket));
}
export async function getTicketsForEvent(eventId: string): Promise<Ticket[]> {
  const q = query(ticketsCol, where('eventId', '==', eventId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Ticket));
}
export type CheckInResult =
  | { ok: true; ticket: Ticket }
  | { ok: false; reason: 'not_found' | 'already_used' | 'cancelled' };






/**
 * hon it Checks a scanned QR code and marks that ticket as used. 3melneha to run as a
 * transaction so two staff phones can't both check in the same ticket
 * at the exact same moment.
 */



export async function validateAndCheckInTicket(
  qrCodeValue: string,
  staffUid: string
): Promise<CheckInResult> {
  const q = query(ticketsCol, where('qrCodeValue', '==', qrCodeValue));
  const snap = await getDocs(q);
  if (snap.empty) return { ok: false, reason: 'not_found' };
  const ticketDoc = snap.docs[0];
  const ticketRef = doc(db, 'tickets', ticketDoc.id);
  return runTransaction(db, async (tx) => {
    const fresh = await tx.get(ticketRef);
    const data = fresh.data() as Ticket;
    const decision = decideCheckIn(data.status);
    if (!decision.ok) return decision;
    tx.update(ticketRef, {
      status: 'used',
      checkedInAt: serverTimestamp(),
      checkedInBy: staffUid,
    });
    return { ok: true, ticket: { ...data, id: ticketDoc.id, status: 'used' } };
  });
}