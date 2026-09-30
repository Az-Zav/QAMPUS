// Session: who is signed in. In-memory for now; later backed by Firebase Auth
// (onAuthStateChanged) with the same value shape.

import { MOCK_USER_GUEST, MOCK_USER_STUDENT } from '@/data/mock';
import { createContext, useContext, useMemo, useState } from 'react';

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [user, setUser] = useState(null);
  // In-memory: onboarding shows again after an app restart until storage is added
  const [hasOnboarded, setHasOnboarded] = useState(false);

  const value = useMemo(
    () => ({
      user,
      isSignedIn: !!user,
      hasOnboarded,
      completeOnboarding: () => setHasOnboarded(true),
      signInAsStudent: () => setUser(MOCK_USER_STUDENT),
      signInAsGuest: () => setUser(MOCK_USER_GUEST),
      signOut: () => setUser(null),
    }),
    [user, hasOnboarded],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used within a SessionProvider');
  return context;
}
