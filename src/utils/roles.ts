import type { UserRole } from '@/types';

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrator',
  organizer: 'Event Organizer',
  staff: 'Event Staff',
  attendee: 'Attendee',
};



export function roleCanManageEvent(role: UserRole | undefined): boolean {
  return role === 'organizer' || role === 'admin';
}
export function roleCanScanTickets(role: UserRole | undefined): boolean {
  return role === 'staff' || role === 'organizer' || role === 'admin';
}
export function roleIsAdmin(role: UserRole | undefined): boolean {
  return role === 'admin';
}