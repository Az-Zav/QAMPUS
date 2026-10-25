// Remembers the Light / Dark choice from Settings on this phone (the ThemeProvider's `storage`). A choice of
// "follow the device" is stored as nothing, so only an explicit Light or Dark is kept.

import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = 'qampus.theme';

export const themeStorage = Object.freeze({
  get: () => AsyncStorage.getItem(THEME_KEY),
  set: (value) => {
    const save = value === 'light' || value === 'dark' ? AsyncStorage.setItem(THEME_KEY, value) : AsyncStorage.removeItem(THEME_KEY);
    save.catch(() => {});
  },
});
