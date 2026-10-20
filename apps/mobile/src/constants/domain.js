// QAMPUS Domain Enums & Business Types
// Mobile navigation enums live here; shared domain enums come from @qampus/core.

// ---------------------------------------------------------------------------
// Navigation & Screen Scope Enums
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

export const HistoryGroup = Object.freeze({
  TODAY: 'TODAY',
  YESTERDAY: 'YESTERDAY',
  EARLIER: 'EARLIER',
});

// Shared with the staff web app — defined in @qampus/core
export * from '@qampus/core/domain';
