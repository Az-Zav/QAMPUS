// Theme: which color scheme the app renders in (shared by mobile and staff web). Follows the device until the user
// picks Light or Dark in Settings. Pass `storage` ({ get(): Promise<string | null>, set(value) }) to remember the
// choice across restarts; the mobile app does, the staff web (no theme picker) does not.

import { ColorScheme, createThemes, ThemePreference } from './tokens';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, useColorScheme } from 'react-native';

const ThemeContext = createContext(null);
const BASE_THEMES = createThemes();

// `themes`: { light, dark } from createThemes(extend) when the app layers its own keys on top of the base theme.
export function ThemeProvider({ children, themes = BASE_THEMES, storage = null }) {
  const [preference, setPreferenceState] = useState(ThemePreference.SYSTEM);
  const deviceScheme = useColorScheme();

  // Native UI (keyboard, alerts, date pickers) follows the override too;
  // 'unspecified' hands control back to the device.
  const apply = useCallback((next) => {
    Appearance.setColorScheme(next === ThemePreference.SYSTEM ? 'unspecified' : next);
    setPreferenceState(next);
  }, []);

  // A saved choice replaces "follow the device" as soon as it has been read
  useEffect(() => {
    if (!storage) return undefined;
    let cancelled = false;
    storage
      .get()
      .then((saved) => {
        if (!cancelled && (saved === ColorScheme.LIGHT || saved === ColorScheme.DARK)) apply(saved);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [storage, apply]);

  const scheme =
    preference === ThemePreference.SYSTEM
      ? deviceScheme === ColorScheme.DARK
        ? ColorScheme.DARK
        : ColorScheme.LIGHT
      : preference;

  const value = useMemo(
    () => ({
      ...themes[scheme],
      preference,
      setPreference: (next) => {
        apply(next);
        storage?.set(next);
      },
    }),
    [themes, scheme, preference, apply, storage],
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
