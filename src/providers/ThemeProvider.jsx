// Theme: which color scheme the app renders in. Follows the device until the user
// picks Light or Dark in Settings. In-memory for now, like onboarding in SessionProvider.

import { ColorScheme, THEMES, ThemePreference } from '@/constants';
import { createContext, useContext, useMemo, useState } from 'react';
import { Appearance, useColorScheme } from 'react-native';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [preference, setPreferenceState] = useState(ThemePreference.SYSTEM);
  const deviceScheme = useColorScheme();

  const scheme =
    preference === ThemePreference.SYSTEM
      ? deviceScheme === ColorScheme.DARK
        ? ColorScheme.DARK
        : ColorScheme.LIGHT
      : preference;

  const value = useMemo(
    () => ({
      ...THEMES[scheme],
      preference,
      setPreference: (next) => {
        // Native UI (keyboard, alerts, date pickers) follows the override too;
        // 'unspecified' hands control back to the device.
        Appearance.setColorScheme(next === ThemePreference.SYSTEM ? 'unspecified' : next);
        setPreferenceState(next);
      },
    }),
    [scheme, preference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error('useTheme must be used inside ThemeProvider');
  return theme;
}

// makeStyles: (colors) => StyleSheet.create({...}), declared at module level.
// Each sheet is built once per scheme and shared by every instance.
const styleCache = new WeakMap();

function stylesFor(makeStyles, scheme, colors) {
  let byScheme = styleCache.get(makeStyles);
  if (!byScheme) {
    byScheme = {};
    styleCache.set(makeStyles, byScheme);
  }
  byScheme[scheme] ??= makeStyles(colors);
  return byScheme[scheme];
}

export function useThemedStyles(makeStyles) {
  const { scheme, colors } = useTheme();
  return stylesFor(makeStyles, scheme, colors);
}
