// QAMPUS Domain Enums & Business Types
// Authoritative definitions for Domain Entities, States, Navigation, Error Codes, and Lifecycle Enums.

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
  CANCELLED_BY_OFFICE: 'cancelledByOffice',
  NO_SHOW: 'noShow',
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

// ---------------------------------------------------------------------------
// 5. Error Codes & Limits
// ---------------------------------------------------------------------------

export const ERROR_CODE = Object.freeze({
  BANNED: 'BANNED',
  TICKET_LIMIT: 'TICKET_LIMIT',
  QUEUE_CLOSED: 'QUEUE_CLOSED',
  CAPACITY_REACHED: 'CAPACITY_REACHED',
  WRONG_OFFICE: 'WRONG_OFFICE',
  NO_CALLED_TICKET: 'NO_CALLED_TICKET',
  EXPIRED: 'EXPIRED',
  INVALID_DOMAIN: 'INVALID_DOMAIN',
  SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
  STUDENT_ID_TAKEN: 'STUDENT_ID_TAKEN',
  NETWORK: 'NETWORK',
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  UNKNOWN: 'UNKNOWN',
});

export const GRACE_PERIOD_SECONDS = 60;
export const MAX_ACTIVE_TICKETS = 3;

// ---------------------------------------------------------------------------
// 6. Component Presentation Registries
// ---------------------------------------------------------------------------

export const BADGE_STYLE = Object.freeze({
  [TicketStatus.WAITING]: { label: 'Waiting', tone: 'neutral', icon: 'time-outline' },
  [TicketStatus.YOUR_TURN]: { label: 'Your turn', tone: 'highlight', icon: 'notifications' },
  [TicketStatus.EXPIRED]: { label: 'Expired', tone: 'error', icon: 'hourglass-outline' },
  [TicketStatus.IN_SERVICE]: { label: 'In service', tone: 'success', icon: 'person' },
  [TicketStatus.COMPLETED]: { label: 'Completed', tone: 'success', icon: 'checkmark-circle' },
  [TicketStatus.CANCELLED]: { label: 'Cancelled', tone: 'neutral', icon: 'close-circle-outline' },
  [TicketStatus.CANCELLED_BY_OFFICE]: { label: 'Cancelled by office', tone: 'neutral', icon: 'close-circle-outline' },
  [TicketStatus.NO_SHOW]: { label: 'No-show', tone: 'error', icon: 'person-remove' },
  [OffenseState.ACTIVE]: { label: 'Offense recorded', tone: 'neutral', icon: 'alert-circle-outline' },
  [OffenseState.REVOKED]: { label: 'Revoked', tone: 'success', icon: 'checkmark-circle-outline' },
  [OffenseState.CAUSED_BAN]: { label: 'Caused 24h ban', tone: 'error', icon: 'ban-outline' },
});

export const NOTIFICATION_STYLE = Object.freeze({
  [NOTIFICATION_TYPE.QUEUE_CONFIRMED]: { icon: 'ticket-outline', tone: 'highlight' },
  [NOTIFICATION_TYPE.YOUR_TURN]: { icon: 'notifications', tone: 'highlight' },
  [NOTIFICATION_TYPE.APPROACHING_TURN]: { icon: 'time-outline', tone: 'highlight' },
  [NOTIFICATION_TYPE.NO_SHOW]: { icon: 'person-remove', tone: 'error' },
  [NOTIFICATION_TYPE.QUEUE_CANCELLED]: { icon: 'close-circle-outline', tone: 'neutral' },
  [NOTIFICATION_TYPE.SERVICE_COMPLETED]: { icon: 'checkmark-circle', tone: 'success' },
  [NOTIFICATION_TYPE.WARNING]: { icon: 'warning-outline', tone: 'error' },
  [NOTIFICATION_TYPE.OFFENSE_REVOKED]: { icon: 'shield-checkmark-outline', tone: 'success' },
  [NOTIFICATION_TYPE.GLOBAL_ANNOUNCEMENT]: { icon: 'megaphone-outline', tone: 'highlight' },
});

export const NOTIFICATION_ROUTE = Object.freeze({
  [NOTIFICATION_TYPE.QUEUE_CONFIRMED]: Screen.HOME,
  [NOTIFICATION_TYPE.YOUR_TURN]: Screen.SCAN,
  [NOTIFICATION_TYPE.APPROACHING_TURN]: Screen.HOME,
  [NOTIFICATION_TYPE.NO_SHOW]: Screen.BANS,
  [NOTIFICATION_TYPE.QUEUE_CANCELLED]: Screen.HOME,
  [NOTIFICATION_TYPE.SERVICE_COMPLETED]: Screen.QUEUE,
  [NOTIFICATION_TYPE.WARNING]: null,
  [NOTIFICATION_TYPE.OFFENSE_REVOKED]: Screen.BANS,
  [NOTIFICATION_TYPE.GLOBAL_ANNOUNCEMENT]: null,
});

export const OFFICE_ICON = Object.freeze({
  R: 'document-text-outline',
  M: 'medkit-outline',
  S: 'card-outline',
  default: 'business-outline',
});

export const EMPTY_COPY = Object.freeze({
  home: {
    icon: 'ticket-outline',
    title: 'No active tickets',
    message: 'Join a queue to get in line for campus services.',
    actionLabel: 'Join a Queue',
  },
  history: {
    icon: 'time-outline',
    title: 'No past tickets',
    message: 'Your completed and cancelled tickets will appear here.',
  },
  notifications: {
    icon: 'notifications-off-outline',
    title: 'No notifications',
    message: 'Updates on your tickets and queue status will appear here.',
  },
  bans: {
    icon: 'shield-checkmark-outline',
    title: 'Clean record',
    message: 'You have no offenses on your account. Keep up the good work!',
  },
  outage: {
    icon: 'cloud-offline-outline',
    title: 'Service unavailable',
    message: 'Unable to connect to Qampus services. Please check your connection or try again later.',
    actionLabel: 'Retry',
  },
});

export const INFO_COPY = Object.freeze({
  banStatus: {
    clean: {
      icon: 'shield-checkmark-outline',
      title: 'Clean record',
      body: 'No offenses on your record.',
    },
    warning: {
      icon: 'alert-circle-outline',
      title: '1 offense on record',
      body: 'One more offense will pause your ability to join queues for 24 hours.',
    },
    banned: {
      icon: 'ban-outline',
      title: 'Joining paused',
      body: 'Your offenses reset once the pause ends.',
    },
  },
  policy: {
    title: 'How offenses work',
    rules: [
      {
        icon: 'close-circle-outline',
        tone: 'error',
        text: "Missing your turn, or cancelling after you've been called, counts as an offense.",
      },
      {
        icon: 'ticket-outline',
        tone: 'success',
        text: "Leaving a queue before you're called is always free and never counted.",
      },
      {
        icon: 'ban-outline',
        tone: 'neutral',
        text: 'Two offenses pause joining for 24 hours. Browsing, your tickets and your history stay open.',
      },
    ],
  },
});

/**
 * @deprecated HistoryStatus is retired per Client Guide R11.
 * Retained temporarily as an alias to TicketStatus to avoid runtime crashes in unmigrated components until Phase 7.
 */
export const HistoryStatus = Object.freeze({
  COMPLETED: TicketStatus.COMPLETED,
  CANCELLED: TicketStatus.CANCELLED,
  NO_SHOW: TicketStatus.NO_SHOW,
  CANCELLED_BY_OFFICE: TicketStatus.CANCELLED_BY_OFFICE,
});
