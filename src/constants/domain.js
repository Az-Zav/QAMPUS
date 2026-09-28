// QAMPUS Domain Enums & Business Types
// Authoritative definitions for Domain Entities, States, Navigation, and Lifecycle Enums.

// ---------------------------------------------------------------------------
// 1. Navigation & Screen Scope Enums
// ---------------------------------------------------------------------------

export const Screen = Object.freeze({
  HOME: 'home',
  QUEUE: 'queue',
  SCAN: 'scan',
  PROFILE: 'profile',
  NOTIFICATIONS: 'notifications',
  SETTINGS: 'settings',
  BANS: 'bans',
  HELP: 'help',
  ONBOARDING: 'onboarding',
  LOGIN: 'login',
  COMPLETE_PROFILE: 'complete-profile',
  GUEST_PROFILE: 'guest-profile',
  EDIT_PROFILE: 'edit-profile',
});

export const AppTab = Object.freeze({
  HOME: 'home',
  SCAN: 'scan',
  QUEUE: 'queue',
});

export const QueueView = Object.freeze({
  JOIN: 'Join',
  HISTORY: 'History',
});

export const QueueModalKey = Object.freeze({
  JOIN_CONFIRM: 'join',
  SUCCESS: 'success',
});

export const HistoryGroup = Object.freeze({
  TODAY: 'TODAY',
  YESTERDAY: 'YESTERDAY',
  EARLIER: 'EARLIER',
});

// ---------------------------------------------------------------------------
// 2. Ticket & Queue Domain Enums
// ---------------------------------------------------------------------------

export const TICKET_STATUS = Object.freeze({
  WAITING: 'WAITING',
  CALLED: 'CALLED',
  IN_SERVICE: 'IN_SERVICE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW',
});

// UI Presentation status mapping
export const TicketStatus = Object.freeze({
  WAITING: 'waiting',
  YOUR_TURN: 'yourTurn',
  EXPIRED: 'expired',
  IN_SERVICE: 'inService',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'noShow',
});

export const HistoryStatus = Object.freeze({
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW',
  CANCELLED_BY_OFFICE: 'CANCELLED_BY_OFFICE',
});

export const QUEUE_STATUS = Object.freeze({
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
});

// ---------------------------------------------------------------------------
// 3. User, Auth & Roles
// ---------------------------------------------------------------------------

export const USER_ROLE = Object.freeze({
  STUDENT: 'STUDENT',
  GUEST: 'GUEST',
  STAFF: 'STAFF',
  SUPER_ADMIN: 'SUPER_ADMIN',
});

export const UserRole = USER_ROLE;

export const GUEST_TYPE = Object.freeze({
  PARENT_GUARDIAN: 'PARENT_GUARDIAN',
  REPRESENTATIVE: 'REPRESENTATIVE',
  ALUMNI: 'ALUMNI',
});

export const GuestType = GUEST_TYPE;

// ---------------------------------------------------------------------------
// 4. Notifications & Offenses
// ---------------------------------------------------------------------------

export const NOTIFICATION_TYPE = Object.freeze({
  QUEUE_CONFIRMED: 'QUEUE_CONFIRMED',
  YOUR_TURN: 'YOUR_TURN',
  APPROACHING_TURN: 'APPROACHING_TURN',
  NO_SHOW: 'NO_SHOW',
  QUEUE_CANCELLED: 'QUEUE_CANCELLED',
  SERVICE_COMPLETED: 'SERVICE_COMPLETED',
  WARNING: 'WARNING',
  OFFENSE_REVOKED: 'OFFENSE_REVOKED',
  GLOBAL_ANNOUNCEMENT: 'GLOBAL_ANNOUNCEMENT',
});

export const NotificationType = NOTIFICATION_TYPE;

export const OFFENSE_TYPE = Object.freeze({
  NO_SHOW: 'NO_SHOW',
  CANCELLED_AFTER_CALL: 'CANCELLED_AFTER_CALL',
});

export const OffenseType = OFFENSE_TYPE;

export const OffenseState = Object.freeze({
  ACTIVE: 'active',
  REVOKED: 'revoked',
  CAUSED_BAN: 'causedBan',
});
