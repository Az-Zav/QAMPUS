// QAMPUS Design System Tokens (Theme-specific)
// Authoritative definitions for Colors, Typography, Spacing, Radii, Elevation, and Icons.

import { Ionicons } from '@expo/vector-icons';
import { TicketStatus } from './domain';

// ---------------------------------------------------------------------------
// 1. Color Palette Tokens
// ---------------------------------------------------------------------------

export const COLORS = Object.freeze({
  ink: '#0A0A0A',
  gold: '#FFC72C',
  goldLight: '#FFF8E7',
  deepGold: '#C9982A',
  paper: '#FAF7F0',
  slate: '#6E6B63',
  error: '#B3261E',
  success: '#2E7D4F',
  border: '#D9D6CF',
  borderLight: '#E5DFD3',
  disabledBg: '#E8E5E0',
  white: '#FFFFFF',
});

// Helper to append alpha channel to hex color
export const withOpacity = (hex, alpha) =>
  hex + Math.round(alpha * 255).toString(16).padStart(2, '0').toUpperCase();

// Overlay scrim
export const OVERLAY = Object.freeze({
  scrim: withOpacity(COLORS.ink, 0.7),
});

// ---------------------------------------------------------------------------
// 2. Status Badge Themes & Icons
// ---------------------------------------------------------------------------

export const STATUS_THEME = Object.freeze({
  waiting: {
    bg: withOpacity(COLORS.slate, 0.1),
    border: COLORS.slate,
    text: COLORS.slate,
    icon: 'time-outline',
    label: 'Waiting',
  },
  yourTurn: {
    bg: COLORS.gold,
    border: null,
    text: COLORS.ink,
    icon: 'notifications',
    label: 'Your turn',
  },
  expired: {
    bg: withOpacity(COLORS.error, 0.1),
    border: COLORS.error,
    text: COLORS.error,
    icon: 'hourglass-outline',
    label: 'Expired',
  },
  inService: {
    bg: COLORS.success,
    border: null,
    text: COLORS.white,
    icon: 'person',
    label: 'In service',
  },
  completed: {
    bg: withOpacity(COLORS.success, 0.1),
    border: null,
    text: COLORS.success,
    icon: 'checkmark-circle',
    label: 'Completed',
  },
  cancelled: {
    bg: withOpacity(COLORS.slate, 0.1),
    border: null,
    text: COLORS.slate,
    icon: 'close-circle-outline',
    label: 'Cancelled',
  },
  cancelledByOffice: {
    bg: withOpacity(COLORS.slate, 0.1),
    border: null,
    text: COLORS.slate,
    icon: 'close-circle-outline',
    label: 'Cancelled by office',
  },
  noShow: {
    bg: withOpacity(COLORS.error, 0.1),
    border: null,
    text: COLORS.error,
    icon: 'person-remove',
    label: 'No-show',
  },
});

// ---------------------------------------------------------------------------
// 3. Typography Tokens (DM Sans)
// ---------------------------------------------------------------------------

export const TYPOGRAPHY = Object.freeze({
  fontFamily: {
    regular: 'DMSans_400Regular',
    medium: 'DMSans_500Medium',
    bold: 'DMSans_700Bold',
  },
  weight: {
    regular: '400',
    medium: '500',
    bold: '700',
  },
  size: {
    xxs: 9,
    xs: 11,
    sm: 12,
    base: 14,
    md: 15,
    lg: 18,
    xl: 22,
    xxl: 28,
    display: 32,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.5,
  },
});

// Absolute lineHeight for a font size (RN needs pixels, not multipliers)
export const lineHeightFor = (size, ratio = TYPOGRAPHY.lineHeight.normal) => Math.round(size * ratio);

// ---------------------------------------------------------------------------
// 4. Spacing & Radii Tokens
// ---------------------------------------------------------------------------

export const SPACING = Object.freeze({
  xxxs: 2,
  xxs: 4,
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  huge: 32,
});

export const RADII = Object.freeze({
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  hero: 44,
  full: 9999,
});

// ---------------------------------------------------------------------------
// 5. Elevation Tokens
// ---------------------------------------------------------------------------

export const ELEVATION = Object.freeze({
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
  // SVG drop shadow for shaped art (tickets/TicketStubShape); traces the outline
  stub: {
    dx: 0,
    dy: 6,
    blur: 8,
    color: COLORS.ink,
    opacity: 0.16,
  },
});

// ---------------------------------------------------------------------------
// 5b. Ticket Stub Themes (tickets/TicketStubCard + TicketStubShape)
// ---------------------------------------------------------------------------

const PERFORATION = withOpacity('#747878', 0.5);

export const TICKET_STUB_THEME = Object.freeze({
  [TicketStatus.WAITING]: { fill: COLORS.white, stroke: COLORS.white, text: COLORS.ink, perforation: PERFORATION },
  [TicketStatus.YOUR_TURN]: { fill: COLORS.ink, stroke: COLORS.ink, text: COLORS.paper, perforation: PERFORATION },
  [TicketStatus.EXPIRED]: { fill: COLORS.white, stroke: COLORS.error, text: COLORS.ink, perforation: PERFORATION },
  [TicketStatus.IN_SERVICE]: { fill: COLORS.white, stroke: COLORS.white, text: COLORS.ink, perforation: PERFORATION },
});

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

export const ComponentSize = Object.freeze({
  SM: 'sm',
  MD: 'md',
});

export const ButtonType = Object.freeze({
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  DESTRUCTIVE: 'destructive',
  ACCENT: 'accent',
  TEXT: 'text',
});

export const InputType = Object.freeze({
  DEFAULT: 'default',
  ERROR: 'error',
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
