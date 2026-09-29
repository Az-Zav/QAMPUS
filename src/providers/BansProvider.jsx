// QAMPUS Bans Provider
// Provides the current user's offense history, offense counts, and active ban state.

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { bansService } from '@/services/bans.service';
import { useAuth } from './AuthProvider';

const BansContext = createContext(null);

export function BansProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id;

  const [banData, setBanData] = useState(() => {
    if (!userId) return { offenses: [], offenseCount: 0, ban: null };
    const userBan = bansService.getUserBans(userId);
    const offenses = bansService.getUserOffenses(userId);
    return {
      offenses,
      offenseCount: userBan.offenseCount,
      ban: userBan.ban,
    };
  });

  const [status, setStatus] = useState(() => (userId ? 'ready' : 'loading'));

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = bansService.subscribe(() => {
      const userBan = bansService.getUserBans(userId);
      const offenses = bansService.getUserOffenses(userId);
      setBanData({
        offenses,
        offenseCount: userBan.offenseCount,
        ban: userBan.ban,
      });
      // Guide Line 92: status becomes ready after both bans and offenses deliver
      setStatus('ready');
    });

    return unsubscribe;
  }, [userId]);

  const actions = useMemo(() => ({}), []);

  const value = useMemo(
    () => ({
      status,
      offenses: banData.offenses,
      offenseCount: banData.offenseCount,
      ban: banData.ban,
      actions,
    }),
    [status, banData.offenses, banData.offenseCount, banData.ban, actions]
  );

  return <BansContext.Provider value={value}>{children}</BansContext.Provider>;
}

export function useBans() {
  const context = useContext(BansContext);
  if (!context) {
    throw new Error('useBans must be used within a BansProvider');
  }
  return context;
}
