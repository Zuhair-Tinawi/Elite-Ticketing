export type UserRole = 'admin' | 'organizer' | 'staff' | 'attendee';
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;



  /** hayda el part la baaden isa i put recomendation feature, lahalaaa not used

el Event categories the user has shown interest in metel "music", "tech", "sports". 

 */





  points: number;
  createdAt: number;
}
export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';
export interface EventRecord {
  id: string;
  title: string;
  description: string;
  category: string;
  venue: string;
  address: string;
  startDate: number;
  endDate: number;
  imageUrl?: string;
  organizerId: string;
  status: EventStatus;
  createdAt: number;
  updatedAt: number;
}
export interface TicketType {
  id: string;
  eventId: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  quantityTotal: number;
  quantitySold: number;
  salesStart?: number;
  salesEnd?: number;
}
export type TicketStatus = 'valid' | 'used' | 'cancelled' | 'refunded';
export interface Ticket {
  id: string;
  eventId: string;
  ticketTypeId: string;
  ownerId: string;
  attendeeName: string;
  attendeeEmail: string;
  price: number;
  currency: string;
  /** Hayde el Unique opaque token embedded in the QR code and checked at the door. */
  qrCodeValue: string;
  status: TicketStatus;
  purchasedAt: number;
  checkedInAt?: number;
  checkedInBy?: string;

  appliedRewardId?: string;
}
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export interface Transaction {
  id: string;
  userId: string;
  eventId: string;
  ticketIds: string[];
  amount: number;
  currency: string;
  paymentStatus: PaymentStatus;
  createdAt: number;
}

export interface RewardTier {
  id: string;
  label: string;
  pointsCost: number;
  /** 3melta eno el discount applies to the ticket price, as a whole percentage (10 = 10% off, */
  percentOff: number;
}