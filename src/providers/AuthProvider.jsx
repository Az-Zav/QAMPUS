// QAMPUS Auth Provider
// Root-level authentication container providing user state, profile status, and auth actions.

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '@/services/auth.service';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getState().user);
  const [status, setStatus] = useState('ready');

  useEffect(() => {
    // Rule R7: Data arrives only through the service subscription
    const unsubscribe = authService.subscribe((state) => {
      setUser(state.user);
      setStatus('ready');
    });

    return unsubscribe;
  }, []);

  const actions = useMemo(
    () => ({
      signInWithGoogle: authService.signInWithGoogle,
      continueAsGuest: authService.continueAsGuest,
      completeProfile: authService.completeProfile,
      updateProfile: authService.updateProfile,
      signOut: authService.signOut,
    }),
    []
  );

  const profileComplete = useMemo(() => {
    return user !== null && user.institutionalId !== null && user.institutionalId !== undefined;
  }, [user]);

  const value = useMemo(
    () => ({
      status,
      user,
      profileComplete,
      actions,
    }),
    [status, user, profileComplete, actions]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
