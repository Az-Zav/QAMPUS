// Centralized Mock Data Store for QAMPUS
// Matches PRD v1.3 and QAMPUS Client Guide Part 2 specifications.
// Seed timestamps are built when the service starts (not at static import).

import {
  GUEST_TYPE,
  NOTIFICATION_TYPE,
  OFFENSE_TYPE,
  QUEUE_STATUS,
  TICKET_STATUS,
  USER_ROLE,
} from '@/constants/domain';

// ---------------------------------------------------------------------------
// 1. Users
// ---------------------------------------------------------------------------

export const MOCK_USER_STUDENT = Object.freeze({
  id: 'usr_std_001',
  role: USER_ROLE.STUDENT,
  name: 'Victor Jazz',
  email: 'victor.jazz@university.edu',
  institutionalId: '2140123',
  program: 'BS Computer Science',
  guestType: null,
});

export const MOCK_USER_GUEST = Object.freeze({
  id: 'usr_gst_002',
  role: USER_ROLE.GUEST,
  name: 'Maria Santos',
  email: null,
  institutionalId: 'G104728',
  program: null,
  guestType: GUEST_TYPE.PARENT_GUARDIAN,
});

export const MOCK_USER_BANNED = Object.freeze({
  id: 'usr_bnd_003',
  role: USER_ROLE.STUDENT,
  name: 'Alex Rivera',
  email: 'alex.rivera@university.edu',
  institutionalId: '2140999',
  program: 'BS Information Technology',
  guestType: null,
});

export const MOCK_USERS = Object.freeze({
  [MOCK_USER_STUDENT.id]: MOCK_USER_STUDENT,
  [MOCK_USER_GUEST.id]: MOCK_USER_GUEST,
  [MOCK_USER_BANNED.id]: MOCK_USER_BANNED,
});

// ---------------------------------------------------------------------------
// 2. Offices
// ---------------------------------------------------------------------------

export const MOCK_OFFICES = Object.freeze([
  {
    id: 'off_reg_001',
    code: 'R',
    name: 'Office of the University Registrar',
    location: 'Administration Building, 1st Floor, Room 101',
    avgServiceMinutes: 5,
    hours: {
      MON: { open: '08:00', close: '17:00' },
      TUE: { open: '08:00', close: '17:00' },
      WED: { open: '08:00', close: '17:00' },
      THU: { open: '08:00', close: '17:00' },
      FRI: { open: '08:00', close: '17:00' },
      SAT: null,
      SUN: null,
    },
    queue: {
      status: QUEUE_STATUS.OPEN,
      waitingCount: 8,
      nowServingSequence: 12,
      estimatedWaitMinutes: 25,
      cutoffOverridden: false,
    },
  },
  {
    id: 'off_med_002',
    code: 'M',
    name: 'Medical and Dental Services',
    location: 'Health Services Building, 1st Floor',
    avgServiceMinutes: 8,
    hours: {
      MON: { open: '08:00', close: '17:00' },
      TUE: { open: '08:00', close: '17:00' },
      WED: { open: '08:00', close: '17:00' },
      THU: { open: '08:00', close: '17:00' },
      FRI: { open: '08:00', close: '17:00' },
      SAT: null,
      SUN: null,
    },
    queue: {
      status: QUEUE_STATUS.OPEN,
      waitingCount: 3,
      nowServingSequence: 5,
      estimatedWaitMinutes: 15,
      cutoffOverridden: false,
    },
  },
  {
    id: 'off_acc_003',
    code: 'S',
    name: 'Student Accounting Office',
    location: 'Finance Hall, Ground Floor, Windows 1-4',
    avgServiceMinutes: 4,
    hours: {
      MON: { open: '09:00', close: '16:00' },
      TUE: { open: '09:00', close: '16:00' },
      WED: { open: '09:00', close: '16:00' },
      THU: { open: '09:00', close: '16:00' },
      FRI: { open: '09:00', close: '16:00' },
      SAT: null,
      SUN: null,
    },
    queue: {
      status: QUEUE_STATUS.CLOSED,
      waitingCount: 0,
      nowServingSequence: null,
      estimatedWaitMinutes: 0,
      cutoffOverridden: false,
    },
  },
]);

// ---------------------------------------------------------------------------
// 3. Dynamic Seed Generator (Tickets, Notifications, Bans, Settings)
// ---------------------------------------------------------------------------

/**
 * Builds initial mock data keyed and timestamped relative to runtime initialization.
 *
 * @param {Date} [baseDate=new Date()]
 */
export function buildSeedData(baseDate = new Date()) {
  const baseTime = baseDate.getTime();

  const tickets = [
    // Live Ticket 1: CALLED (recently called, within 60s grace period)
    {
      id: 'tkt_001',
      userId: MOCK_USER_STUDENT.id,
      officeId: 'off_reg_001',
      officeCode: 'R',
      officeName: 'Office of the University Registrar',
      ticketNumber: 'R-09-29-015',
      dailySequence: 15,
      status: TICKET_STATUS.CALLED,
      joinedAt: new Date(baseTime - 15 * 60000).toISOString(),
      calledAt: new Date(baseTime - 25000).toISOString(), // 25s ago
      serviceStartedAt: null,
      completedAt: null,
      cancelledAt: null,
      noShowAt: null,
      cancelledBy: null,
      counterNumber: 3,
      positionInQueue: null,
      aheadCount: 0,
      estimatedWaitMinutes: null,
    },
    // Live Ticket 2: WAITING
    {
      id: 'tkt_002',
      userId: MOCK_USER_STUDENT.id,
      officeId: 'off_med_002',
      officeCode: 'M',
      officeName: 'Medical and Dental Services',
      ticketNumber: 'M-09-29-006',
      dailySequence: 6,
      status: TICKET_STATUS.WAITING,
      joinedAt: new Date(baseTime - 10 * 60000).toISOString(),
      calledAt: null,
      serviceStartedAt: null,
      completedAt: null,
      cancelledAt: null,
      noShowAt: null,
      cancelledBy: null,
      counterNumber: null,
      positionInQueue: 2,
      aheadCount: 1,
      estimatedWaitMinutes: 8,
    },
    // History 1: COMPLETED (student)
    {
      id: 'tkt_hist_001',
      userId: MOCK_USER_STUDENT.id,
      officeId: 'off_reg_001',
      officeCode: 'R',
      officeName: 'Office of the University Registrar',
      ticketNumber: 'R-09-29-003',
      dailySequence: 3,
      status: TICKET_STATUS.COMPLETED,
      joinedAt: new Date(baseTime - 120 * 60000).toISOString(),
      calledAt: new Date(baseTime - 105 * 60000).toISOString(),
      serviceStartedAt: new Date(baseTime - 104 * 60000).toISOString(),
      completedAt: new Date(baseTime - 90 * 60000).toISOString(),
      cancelledAt: null,
      noShowAt: null,
      cancelledBy: null,
      counterNumber: 1,
      positionInQueue: null,
      aheadCount: null,
      estimatedWaitMinutes: null,
    },
    // History 2: CANCELLED by USER
    {
      id: 'tkt_hist_002',
      userId: MOCK_USER_STUDENT.id,
      officeId: 'off_acc_003',
      officeCode: 'S',
      officeName: 'Student Accounting Office',
      ticketNumber: 'S-09-28-018',
      dailySequence: 18,
      status: TICKET_STATUS.CANCELLED,
      joinedAt: new Date(baseTime - 24 * 3600 * 1000).toISOString(),
      calledAt: null,
      serviceStartedAt: null,
      completedAt: null,
      cancelledAt: new Date(baseTime - 24 * 3600 * 1000 + 12 * 60000).toISOString(),
      noShowAt: null,
      cancelledBy: 'USER',
      counterNumber: null,
      positionInQueue: null,
      aheadCount: null,
      estimatedWaitMinutes: null,
    },
    // History 3: belongs to the guest (Client Guide rule)
    {
      id: 'tkt_hist_003',
      userId: MOCK_USER_GUEST.id,
      officeId: 'off_reg_001',
      officeCode: 'R',
      officeName: 'Office of the University Registrar',
      ticketNumber: 'R-09-28-009',
      dailySequence: 9,
      status: TICKET_STATUS.COMPLETED,
      joinedAt: new Date(baseTime - 25 * 3600 * 1000).toISOString(),
      calledAt: new Date(baseTime - 25 * 3600 * 1000 + 20 * 60000).toISOString(),
      serviceStartedAt: new Date(baseTime - 25 * 3600 * 1000 + 21 * 60000).toISOString(),
      completedAt: new Date(baseTime - 25 * 3600 * 1000 + 35 * 60000).toISOString(),
      cancelledAt: null,
      noShowAt: null,
      cancelledBy: null,
      counterNumber: 2,
      positionInQueue: null,
      aheadCount: null,
      estimatedWaitMinutes: null,
    },
    // History 4: CANCELLED by OFFICE (Client Guide rule)
    {
      id: 'tkt_hist_004',
      userId: MOCK_USER_STUDENT.id,
      officeId: 'off_med_002',
      officeCode: 'M',
      officeName: 'Medical and Dental Services',
      ticketNumber: 'M-09-27-022',
      dailySequence: 22,
      status: TICKET_STATUS.CANCELLED,
      joinedAt: new Date(baseTime - 48 * 3600 * 1000).toISOString(),
      calledAt: null,
      serviceStartedAt: null,
      completedAt: null,
      cancelledAt: new Date(baseTime - 48 * 3600 * 1000 + 15 * 60000).toISOString(),
      noShowAt: null,
      cancelledBy: 'OFFICE',
      counterNumber: null,
      positionInQueue: null,
      aheadCount: null,
      estimatedWaitMinutes: null,
    },
    // History 5: NO_SHOW
    {
      id: 'tkt_hist_005',
      userId: MOCK_USER_STUDENT.id,
      officeId: 'off_acc_003',
      officeCode: 'S',
      officeName: 'Student Accounting Office',
      ticketNumber: 'S-09-26-004',
      dailySequence: 4,
      status: TICKET_STATUS.NO_SHOW,
      joinedAt: new Date(baseTime - 72 * 3600 * 1000).toISOString(),
      calledAt: new Date(baseTime - 72 * 3600 * 1000 + 10 * 60000).toISOString(),
      serviceStartedAt: null,
      completedAt: null,
      cancelledAt: null,
      noShowAt: new Date(baseTime - 72 * 3600 * 1000 + 12 * 60000).toISOString(),
      cancelledBy: null,
      counterNumber: 4,
      positionInQueue: null,
      aheadCount: null,
      estimatedWaitMinutes: null,
    },
  ];

  const bans = {
    [MOCK_USER_STUDENT.id]: {
      offenseCount: 0,
      ban: null,
    },
    [MOCK_USER_GUEST.id]: {
      offenseCount: 1,
      ban: null,
    },
    [MOCK_USER_BANNED.id]: {
      offenseCount: 2,
      ban: {
        expiresAt: new Date(baseTime + 20 * 3600 * 1000).toISOString(), // 20 hours remaining
        offenseIds: ['off_001', 'off_002'],
      },
    },
  };

  const offenses = [
    {
      id: 'off_001',
      userId: MOCK_USER_GUEST.id,
      ticketId: 'tkt_old_901',
      officeName: 'Office of the University Registrar',
      ticketNumber: 'R-09-27-010',
      type: OFFENSE_TYPE.NO_SHOW,
      causedBan: false,
      revokedAt: null,
      createdAt: new Date(baseTime - 24 * 3600 * 1000).toISOString(),
    },
    {
      id: 'off_002',
      userId: MOCK_USER_BANNED.id,
      ticketId: 'tkt_old_902',
      officeName: 'Student Accounting Office',
      ticketNumber: 'S-09-28-005',
      type: OFFENSE_TYPE.CANCELLED_AFTER_CALL,
      causedBan: true,
      revokedAt: null,
      createdAt: new Date(baseTime - 4 * 3600 * 1000).toISOString(),
    },
  ];

  const notifications = [
    {
      id: 'notif_001',
      userId: MOCK_USER_STUDENT.id,
      type: NOTIFICATION_TYPE.YOUR_TURN,
      title: 'Your Turn at Window 3!',
      message: 'Ticket R-015 called at Office of the University Registrar. Verify arrival within 60s.',
      isRead: false,
      createdAt: new Date(baseTime - 25000).toISOString(),
    },
    {
      id: 'notif_002',
      userId: MOCK_USER_STUDENT.id,
      type: NOTIFICATION_TYPE.QUEUE_CONFIRMED,
      title: 'Queue Confirmed',
      message: 'You joined Medical and Dental Services. Ticket M-006, 1 person ahead.',
      isRead: true,
      createdAt: new Date(baseTime - 10 * 60000).toISOString(),
    },
    {
      id: 'notif_003',
      userId: MOCK_USER_STUDENT.id,
      type: NOTIFICATION_TYPE.SERVICE_COMPLETED,
      title: 'Service Completed',
      message: 'Your transaction at the University Registrar is complete.',
      isRead: true,
      createdAt: new Date(baseTime - 90 * 60000).toISOString(),
    },
  ];

  const settings = {
    [MOCK_USER_STUDENT.id]: {
      theme: 'system',
      biometricsEnabled: true,
      pushEnabled: true,
    },
    [MOCK_USER_GUEST.id]: {
      theme: 'system',
      biometricsEnabled: false,
      pushEnabled: true,
    },
    [MOCK_USER_BANNED.id]: {
      theme: 'system',
      biometricsEnabled: false,
      pushEnabled: false,
    },
  };

  return {
    tickets,
    bans,
    offenses,
    notifications,
    settings,
  };
}
