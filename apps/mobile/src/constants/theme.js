// QAMPUS mobile theme: tokens come from @qampus/ui; this file adds the student app's
// status badge themes, ticket stub themes, Ionicons set and mobile-only component enums.

import { Ionicons } from '@expo/vector-icons';
import { ColorScheme, createThemes, withOpacity } from '@qampus/ui/tokens';
import { TicketStatus } from './domain';

export * from '@qampus/ui/tokens';

// ---------------------------------------------------------------------------
// 2. Status Badge Themes & Icons
// ---------------------------------------------------------------------------

const buildStatusTheme = (c) => ({
  waiting: {
    bg: withOpacity(c.slate, 0.1),
    border: c.slate,
    text: c.slate,
    icon: 'time-outline',
    label: 'Waiting',
  },
  yourTurn: {
    bg: c.gold,
    border: null,
    text: c.onGold,
    icon: 'notifications',
    label: 'Your turn',
  },
  expired: {
    bg: withOpacity(c.error, 0.1),
    border: c.error,
    text: c.error,
    icon: 'hourglass-outline',
    label: 'Expired',
  },
  inService: {
    bg: c.success,
    border: null,
    text: c.onSuccess,
    icon: 'person',
    label: 'In service',
  },
  completed: {
    bg: withOpacity(c.success, 0.1),
    border: null,
    text: c.success,
    icon: 'checkmark-circle',
    label: 'Completed',
  },
  cancelled: {
    bg: withOpacity(c.slate, 0.1),
    border: null,
    text: c.slate,
    icon: 'close-circle-outline',
    label: 'Cancelled',
  },
  cancelledByOffice: {
    bg: withOpacity(c.slate, 0.1),
    border: null,
    text: c.slate,
    icon: 'close-circle-outline',
    label: 'Cancelled by office',
  },
  noShow: {
    bg: withOpacity(c.error, 0.1),
    border: null,
    text: c.error,
    icon: 'person-remove',
    label: 'No-show',
  },
});

// ---------------------------------------------------------------------------
// 5b. Ticket Stub Themes (tickets/TicketStubCard + TicketStubShape)
// ---------------------------------------------------------------------------

const PERFORATION = withOpacity('#747878', 0.5);

// "Your turn" is the inverse card; in dark mode a gold outline keeps it the standout
const buildStubTheme = (c, scheme) => ({
  [TicketStatus.WAITING]: { fill: c.white, stroke: c.white, text: c.ink, perforation: PERFORATION },
  [TicketStatus.YOUR_TURN]: {
    fill: c.inverse,
    stroke: scheme === ColorScheme.DARK ? c.gold : c.inverse,
    text: c.onInverse,
    perforation: PERFORATION,
  },
  [TicketStatus.EXPIRED]: { fill: c.white, stroke: c.error, text: c.ink, perforation: PERFORATION },
  [TicketStatus.IN_SERVICE]: { fill: c.white, stroke: c.white, text: c.ink, perforation: PERFORATION },
});

// ---------------------------------------------------------------------------
// 5c. Resolved Themes — what useTheme() hands out, built once per scheme
// ---------------------------------------------------------------------------

export const THEMES = createThemes((colors, scheme) => ({
  status: buildStatusTheme(colors),
  stub: buildStubTheme(colors, scheme),
}));

// ---------------------------------------------------------------------------
// 6. Icons & IconSet
// ---------------------------------------------------------------------------

export const IconSet = Ionicons;

export const ICONS = Object.freeze({
  waiting: 'time-outline',
  yourTurn: 'notifications',
  expired: 'hourglass-outline',
  inService: 'person',
  completed: 'checkmark-circle',
  cancelled: 'close-circle-outline',
  noShow: 'person-remove',
  home: 'home',
  scan: 'qr-code',
  queue: 'list',
  bell: 'notifications-outline',
  person: 'person-outline',
  arrowBack: 'arrow-back',
  close: 'close',
  search: 'search-outline',
  warning: 'alert-circle-outline',
  chevronForward: 'chevron-forward',
});

// ---------------------------------------------------------------------------
// 7. Component UI Type Enums (Styling & Component Variants)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// 7. Component UI Type Enums (mobile-only; shared ones live in @qampus/ui)
// ---------------------------------------------------------------------------

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

// Shared by ConfirmModal, NoticeModal and ModalShell's header icon
export const ModalTone = Object.freeze({
  DEFAULT: 'default',
  DESTRUCTIVE: 'destructive',
});

// Each variant owns its icon and copy (see shell/EmptyState)
export const EmptyStateType = Object.freeze({
  NO_TICKETS: 'noTickets',
  NO_HISTORY: 'noHistory',
  NO_NOTIFICATIONS: 'noNotifications',
  CLEAN_RECORD: 'cleanRecord',
  NO_RESULTS: 'noResults',
  OFFLINE: 'offline',
});
