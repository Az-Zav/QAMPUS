// QAMPUS Settings Provider
// Provides the current user's appearance, biometrics, and push notification preferences.

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { settingsService } from '@/services/settings.service';
import { useAuth } from './AuthProvider';

const SettingsContext = createContext(null);

const DEFAULT_SETTINGS = {
  theme: 'system',
  biometricsEnabled: false,
  pushEnabled: true,
};

export function SettingsProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id;

  const [settings, setSettings] = useState(() => {
    return userId ? settingsService.getUserSettings(userId) : DEFAULT_SETTINGS;
  });
  const [status, setStatus] = useState('ready');

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = settingsService.subscribe(() => {
      const userSettings = settingsService.getUserSettings(userId);
      setSettings(userSettings);
      setStatus('ready');
    });

    return unsubscribe;
  }, [userId]);

  const actions = useMemo(
    () => ({
      setTheme: settingsService.setTheme,
      setBiometrics: settingsService.setBiometrics,
      setPush: settingsService.setPush,
    }),
    []
  );

  const value = useMemo(
    () => ({
      status,
      theme: settings.theme,
      biometricsEnabled: settings.biometricsEnabled,
      pushEnabled: settings.pushEnabled,
      actions,
    }),
    [status, settings.theme, settings.biometricsEnabled, settings.pushEnabled, actions]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
