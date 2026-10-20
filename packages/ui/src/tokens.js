// QAMPUS design tokens shared by every app (mobile, staff web).
// Pure data + RN Platform; app-specific themes (status badges, icons) are layered on via createThemes().
//   ink        primary text & icons          paper      page background
//   white      raised surface (cards, inputs) inverse   strong contrast surface
//   onInverse  text & icons on `inverse`     onGold / onSuccess  text & icons on gold / success
//   scrim      modal backdrop

import { Platform } from 'react-native';

// ---------------------------------------------------------------------------
// Color Palette Tokens
// ---------------------------------------------------------------------------

export const ColorScheme = Object.freeze({
  LIGHT: 'light',
  DARK: 'dark',
});

// What the user picked in Settings; SYSTEM follows the device
export const ThemePreference = Object.freeze({
  SYSTEM: 'system',
  LIGHT: ColorScheme.LIGHT,
  DARK: ColorScheme.DARK,
});

const LIGHT_COLORS = Object.freeze({
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
  inverse: '#0A0A0A',
  onInverse: '#FAF7F0',
  onGold: '#0A0A0A',
  onSuccess: '#FFFFFF',
  scrim: '#000000B3', // 70% black behind modals
});

const DARK_COLORS = Object.freeze({
  ink: '#F2EEE6',
  gold: '#FFC72C',
  goldLight: '#2B2412',
  deepGold: '#E0B24A',
  paper: '#121110',
  slate: '#A29E95',
  error: '#EF6B61',
  success: '#5CB88A',
  border: '#3A3833',
  borderLight: '#2E2C28',
  disabledBg: '#2A2926',
  white: '#1E1D1B',
  inverse: '#34312C',
  onInverse: '#F2EEE6',
  onGold: '#0A0A0A',
  onSuccess: '#0A0A0A',
  scrim: '#000000B3',
});

export const PALETTES = Object.freeze({
  [ColorScheme.LIGHT]: LIGHT_COLORS,
  [ColorScheme.DARK]: DARK_COLORS,
});

// Helper to append alpha channel to hex color
export const withOpacity = (hex, alpha) =>
  hex + Math.round(alpha * 255).toString(16).padStart(2, '0').toUpperCase();

// ---------------------------------------------------------------------------
// Resolved Themes — what useTheme() hands out, built once per scheme.
// `extend(colors, scheme)` returns app-specific keys (e.g. status, stub) merged into each theme.
// ---------------------------------------------------------------------------

export const createThemes = (extend = () => ({})) => {
  const build = (scheme) =>
    Object.freeze({
      scheme,
      isDark: scheme === ColorScheme.DARK,
      colors: PALETTES[scheme],
      ...extend(PALETTES[scheme], scheme),
    });

  return Object.freeze({
    [ColorScheme.LIGHT]: build(ColorScheme.LIGHT),
    [ColorScheme.DARK]: build(ColorScheme.DARK),
  });
};

// ---------------------------------------------------------------------------
// 3. Typography Tokens (DM Sans)
// ---------------------------------------------------------------------------

export const TYPOGRAPHY = Object.freeze({
  fontFamily: {
    regular: 'DMSans_400Regular',
    medium: 'DMSans_500Medium',
    bold: 'DMSans_700Bold',
    mono: Platform.select({ ios: 'Menlo', default: 'monospace' }), // IDs (Guest ID)
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
    color: '#000000',
    opacity: 0.16,
  },
});

// ---------------------------------------------------------------------------
// Component UI Type Enums (shared primitives)
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
