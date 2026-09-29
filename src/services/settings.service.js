// QAMPUS Settings Service
// Manages device preferences, theme choice, biometrics, and push notifications.

import { buildSeedData } from '@/data/mock';
import { authService } from './auth.service';
import { createStore } from './createStore';

const initialSeeds = buildSeedData();

const store = createStore({
  settings: initialSeeds.settings,
});

export const settingsService = {
  subscribe: store.subscribe,
  getState: store.getState,

  /**
   * Retrieves settings for a user.
   *
   * @param {string} userId
   * @returns {import('@/types').Settings}
   */
  getUserSettings: (userId) => {
    return (
      store.getState().settings[userId] || {
        theme: 'system',
        biometricsEnabled: false,
        pushEnabled: true,
      }
    );
  },

  /**
   * Sets app appearance theme ('system' | 'light' | 'dark').
   *
   * @param {'system' | 'light' | 'dark'} theme
   * @returns {Promise<import('@/types').ActionResult<import('@/types').Settings>>}
   */
  setTheme: async (theme) => {
    const user = authService.getCurrentUser();
    if (!user) {
      return { ok: false, code: 'UNAUTHENTICATED', message: 'No active session.' };
    }

    const current = settingsService.getUserSettings(user.id);
    const updated = { ...current, theme };

    store.setState({
      settings: {
        ...store.getState().settings,
        [user.id]: updated,
      },
    });

    return { ok: true, data: updated };
  },

  /**
   * Sets biometrics preference.
   *
   * @param {boolean} biometricsEnabled
   * @returns {Promise<import('@/types').ActionResult<import('@/types').Settings>>}
   */
  setBiometrics: async (biometricsEnabled) => {
    const user = authService.getCurrentUser();
    if (!user) {
      return { ok: false, code: 'UNAUTHENTICATED', message: 'No active session.' };
    }

    const current = settingsService.getUserSettings(user.id);
    const updated = { ...current, biometricsEnabled };

    store.setState({
      settings: {
        ...store.getState().settings,
        [user.id]: updated,
      },
    });

    return { ok: true, data: updated };
  },

  /**
   * Sets push notification preference.
   *
   * @param {boolean} pushEnabled
   * @returns {Promise<import('@/types').ActionResult<import('@/types').Settings>>}
   */
  setPush: async (pushEnabled) => {
    const user = authService.getCurrentUser();
    if (!user) {
      return { ok: false, code: 'UNAUTHENTICATED', message: 'No active session.' };
    }

    const current = settingsService.getUserSettings(user.id);
    const updated = { ...current, pushEnabled };

    store.setState({
      settings: {
        ...store.getState().settings,
        [user.id]: updated,
      },
    });

    return { ok: true, data: updated };
  },
};
