import { describe, it, expect } from 'vitest';
import { roleCanManageEvent, roleCanScanTickets, roleIsAdmin, ROLE_LABELS } from './roles';

describe('roleCanManageEvent', () => {
  it('returns true for organizer', () => {
    expect(roleCanManageEvent('organizer')).toBe(true);
  });
  it('returns true for admin', () => {
    expect(roleCanManageEvent('admin')).toBe(true);
  });
  it('returns false for attendee', () => {
    expect(roleCanManageEvent('attendee')).toBe(false);
  });
  it('returns false for staff', () => {
    expect(roleCanManageEvent('staff')).toBe(false);
  });
  it('returns false for undefined', () => {
    expect(roleCanManageEvent(undefined)).toBe(false);
  });
});

describe('roleCanScanTickets', () => {
  it('returns true for staff, organizer, and admin', () => {
    expect(roleCanScanTickets('staff')).toBe(true);
    expect(roleCanScanTickets('organizer')).toBe(true);
    expect(roleCanScanTickets('admin')).toBe(true);
  });
  it('returns false for attendee', () => {
    expect(roleCanScanTickets('attendee')).toBe(false);
  });
});

describe('roleIsAdmin', () => {
  it('returns true only for admin', () => {
    expect(roleIsAdmin('admin')).toBe(true);
    expect(roleIsAdmin('organizer')).toBe(false);
    expect(roleIsAdmin('staff')).toBe(false);
    expect(roleIsAdmin('attendee')).toBe(false);
    expect(roleIsAdmin(undefined)).toBe(false);
  });
});

describe('ROLE_LABELS', () => {
  it('has a readable label for every role', () => {
    expect(ROLE_LABELS.admin).toBe('Administrator');
    expect(ROLE_LABELS.organizer).toBe('Event Organizer');
    expect(ROLE_LABELS.staff).toBe('Event Staff');
    expect(ROLE_LABELS.attendee).toBe('Attendee');
  });
});