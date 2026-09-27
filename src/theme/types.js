// Central registry for `type` prop values across primitive components.
// Import these instead of hardcoding string literals — typos in a raw
// string ("secondry") fail silently at runtime; typos here don't compile.

export const ButtonType = Object.freeze({
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  DESTRUCTIVE: 'destructive',
  ACCENT: 'accent',   // dark pill, gold label — compact inline actions (e.g. OfficeCard's Join)
  DISABLED: 'disabled',
});

export const ToggleType = Object.freeze({
  FUNCTIONAL: 'functional',
  DISABLED: 'disabled',
});

export const InputType = Object.freeze({
  DEFAULT: 'default',
  ERROR: 'error',
  DISABLED: 'disabled',
});
export const InfoCardType = Object.freeze({
  OFFICE_HOURS: 'officeHours',
  BAN_BANNER: 'banBanner',
  STRIKE_METER: 'strikeMeter',
  POLICY: 'policy',
  FAQ: 'faq',
});

export const ListRowType = Object.freeze({
  MENU: 'menu',
  NOTIFICATION: 'notification',
  OFFENSE: 'offense',
  HISTORY: 'history',
});

export const ListRowTone = Object.freeze({
  NEUTRAL: 'neutral',
  HIGHLIGHT: 'highlight',
  SUCCESS: 'success',
  ERROR: 'error',
});

export const HistoryStatus = Object.freeze({
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW',
  CANCELLED_BY_OFFICE: 'CANCELLED_BY_OFFICE',
});

export const OffenseState = Object.freeze({
  ACTIVE: 'active',
  REVOKED: 'revoked',
  CAUSED_BAN: 'causedBan',
});

export const ConfirmModalType = Object.freeze({
  DEFAULT: 'default',         // M03, M09 — consequential action in ink
  DESTRUCTIVE: 'destructive', // M04 — consequential action in danger red
});

// Which screen a shared shell component (e.g. Header) is rendering on —
// lets that component vary appearance (logo mark, etc.) per screen.
export const Screen = Object.freeze({
  HOME: 'home',
  QUEUE: 'queue',
});

// Queue tab's Join/History segmented switcher state.
export const QueueView = Object.freeze({
  JOIN: 'Join',
  HISTORY: 'History',
});

// Which modal is open on the Queue screen.
export const QueueModalKey = Object.freeze({
  JOIN_CONFIRM: 'join',
  SUCCESS: 'success',
});

// History list section groups — shared between the mock data and the
// fixed order they're rendered in.
export const HistoryGroup = Object.freeze({
  TODAY: 'TODAY',
  YESTERDAY: 'YESTERDAY',
  EARLIER: 'EARLIER',
});

// Ticket status values used across badge, ticket card, ticket modal, etc.
export const TicketStatus = Object.freeze({
  WAITING: 'waiting',
  YOUR_TURN: 'yourTurn',
  EXPIRED: 'expired',
  IN_SERVICE: 'inService',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'noShow',
});

// App navigation tab identifiers
export const AppTab = Object.freeze({
  HOME: 'home',
  SCAN: 'scan',
  QUEUE: 'queue',
});


