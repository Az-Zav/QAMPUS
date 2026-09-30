// Session: who is signed in. In-memory for now; later backed by Firebase Auth
// (onAuthStateChanged) with the same value shape.

import { MOCK_USER_GUEST, MOCK_USER_STUDENT } from '@/data/mock';
import { createContext, useContext, useMemo, useState } from 'react';

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [user, setUser] = useState(null);

  const value = useMemo(
    () => ({
      user,
      isSignedIn: !!user,
      signInAsStudent: () => setUser(MOCK_USER_STUDENT),
      signInAsGuest: () => setUser(MOCK_USER_GUEST),
      signOut: () => setUser(null),
    }),
    [user],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used within a SessionProvider');
  return context;
}
