// QAMPUS design tokens. Import `theme` — never hardcode colors, spacing, or fonts.

import { Ionicons } from '@expo/vector-icons';

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------

export const colors = {
  ink: '#0A0A0A',
  gold: '#FFC72C',
  deepGold: '#C9982A',
  paper: '#FAF7F0',
  slate: '#6E6B63',
  error: '#B3261E',
  success: '#2E7D4F',
  border: '#D9D6CF',
  disabledBg: '#E8E5E0',  
  white: '#FFFFFF'
};

export const withOpacity = (hex, alpha) =>
  hex + Math.round(alpha * 255).toString(16).padStart(2, '0').toUpperCase();

// Confirmed 1:1 against the live "Badge/Status" Figma component (all 7 variants)
export const statusBadge = {
  waiting: { bg: withOpacity(colors.slate, 0.1), border: colors.slate, text: colors.slate },
  yourTurn: { bg: colors.gold, border: null, text: colors.ink },
  expired: { bg: withOpacity(colors.error, 0.1), border: colors.error, text: colors.error },
  inService: { bg: colors.success, border: null, text: '#FFFFFF' },
  completed: { bg: withOpacity(colors.success, 0.1), border: null, text: colors.success },
  cancelled: { bg: withOpacity(colors.slate, 0.1), border: null, text: colors.slate },
  noShow: { bg: withOpacity(colors.error, 0.1), border: null, text: colors.error },
};

// Identical across all 9 modal frames (M01–M09) in Figma
export const overlay = {
  scrim: withOpacity(colors.ink, 0.7),
};

// ---------------------------------------------------------------------------
// Typography — DM Sans only
// ---------------------------------------------------------------------------

export const typography = {
  fontFamily: {
    regular: 'DMSans_400Regular',
    medium: 'DMSans_500Medium',
    bold: 'DMSans_700Bold',
  },
  weight: { regular: '400', medium: '500', bold: '700' },
  size: { xs: 11, sm: 12, base: 14, md: 15, lg: 18, xl: 22, xxl: 28, display: 32 },
  lineHeight: { tight: 1.2, normal: 1.4, relaxed: 1.5 },
};

// ---------------------------------------------------------------------------
// Spacing & radii
// ---------------------------------------------------------------------------

export const spacing = {
  xxxs: 2, xxs: 4, xs: 6, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 28,
};

export const radii = {
  sm: 4, md: 8, lg: 12, xl: 16, xxl: 24,
  hero: 44,   // ticket-stub card corner
  full: 9999, // pill shapes — badges, status chips
};

// ---------------------------------------------------------------------------
// Elevation — proposed 3-tier scale (Figma had no shadow tokens to source)
// ---------------------------------------------------------------------------

export const elevation = {
  sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2, elevation: 2 },
  md: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.10, shadowRadius: 6, elevation: 4 },
  lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.16, shadowRadius: 16, elevation: 8 },
};

// ---------------------------------------------------------------------------
// Icons — @expo/vector-icons (Ionicons), one name per badge state
// ---------------------------------------------------------------------------

export const IconSet = Ionicons;

export const statusIcon = {
  waiting: 'time-outline',
  yourTurn: 'notifications',
  expired: 'hourglass-outline',
  inService: 'person',
  completed: 'checkmark-circle',
  cancelled: 'close-circle-outline',
  noShow: 'person-remove',
};

// ---------------------------------------------------------------------------
// Barrel export — this is the only import most components need:
//   import { theme } from '@/theme/theme';
// ---------------------------------------------------------------------------

export const theme = {
  colors,
  statusBadge,
  overlay,
  typography,
  spacing,
  radii,
  elevation,
  IconSet,
  statusIcon,
  withOpacity,
};

export default theme;