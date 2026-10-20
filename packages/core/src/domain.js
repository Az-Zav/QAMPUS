// QAMPUS shared domain enums & business rules — used by the mobile app and the staff web app.
// Pure JS: no react-native, no UI. Navigation/screen enums live in each app.

// ---------------------------------------------------------------------------
// 1. Ticket & Queue Domain Enums
// ---------------------------------------------------------------------------

export const TICKET_STATUS = Object.freeze({
  WAITING: 'WAITING',
  CALLED: 'CALLED',
  IN_SERVICE: 'IN_SERVICE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW',
});

// UI presentation status — the only status components read. Derived from
// TICKET_STATUS by @qampus/core (toTicketStatus); keys match the theme's status map (constants/theme).
export const TicketStatus = Object.freeze({
  WAITING: 'waiting',
  YOUR_TURN: 'yourTurn',
  EXPIRED: 'expired',
  IN_SERVICE: 'inService',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  CANCELLED_BY_OFFICE: 'cancelledByOffice',
  NO_SHOW: 'noShow',
});

// Who cancelled a CANCELLED ticket — office/system cancellations never penalize (R-16)
export const CANCELLED_BY = Object.freeze({
  USER: 'USER',
  OFFICE: 'OFFICE',
});

export const QUEUE_STATUS = Object.freeze({
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
});

// ---------------------------------------------------------------------------
// 1b. Business Rule Limits (PRD)
// ---------------------------------------------------------------------------

export const RULES = Object.freeze({
  GRACE_PERIOD_SECONDS: 60, // R-12
  MAX_ACTIVE_TICKETS: 3, // R-07
  OFFENSES_PER_BAN: 2, // R-13
  BAN_HOURS: 24, // R-13
});

// ---------------------------------------------------------------------------
// 2. User, Auth & Roles
// ---------------------------------------------------------------------------

export const USER_ROLE = Object.freeze({
  STUDENT: 'STUDENT',
  GUEST: 'GUEST',
  STAFF: 'STAFF',
  SUPER_ADMIN: 'SUPER_ADMIN',
});

export const GUEST_TYPE = Object.freeze({
  PARENT_GUARDIAN: 'PARENT_GUARDIAN',
  REPRESENTATIVE: 'REPRESENTATIVE',
  ALUMNI: 'ALUMNI',
});

export const GUEST_TYPE_LABEL = Object.freeze({
  [GUEST_TYPE.PARENT_GUARDIAN]: 'Parent or guardian',
  [GUEST_TYPE.REPRESENTATIVE]: 'Representative',
  [GUEST_TYPE.ALUMNI]: 'Alumni',
});

// ---------------------------------------------------------------------------
// 3. Notifications & Offenses
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

export const OFFENSE_TYPE = Object.freeze({
  NO_SHOW: 'NO_SHOW',
  CANCELLED_AFTER_CALL: 'CANCELLED_AFTER_CALL',
});

export const OffenseState = Object.freeze({
  ACTIVE: 'active',
  REVOKED: 'revoked',
  CAUSED_BAN: 'causedBan',
});
