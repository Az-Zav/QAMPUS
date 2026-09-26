// Central registry for `type` prop values across primitive components.
// Import these instead of hardcoding string literals — typos in a raw
// string ("secondry") fail silently at runtime; typos here don't compile.

export const ButtonType = Object.freeze({
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  DESTRUCTIVE: 'destructive',
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
