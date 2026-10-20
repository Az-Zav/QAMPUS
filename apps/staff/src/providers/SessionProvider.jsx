// Staff session: who is signed in. In-memory for now; later backed by the same auth backend
// as the mobile app (Firebase Auth) with the same value shape.

import { MOCK_USER_STAFF, MOCK_USER_STAFF_UNASSIGNED } from '@qampus/core/mock';
import { createContext, useContext, useMemo, useState } from 'react';

const SessionContext = createContext(null);

export const SignInStatus = Object.freeze({
  IDLE: 'idle',
  LOADING: 'loading',
  ERROR: 'error',
});

export function SessionProvider({ children }) {
  const [user, setUser] = useState(null);
  const [signInStatus, setSignInStatus] = useState(SignInStatus.IDLE);

  const value = useMemo(
    () => ({
      user,
      isSignedIn: !!user,
      // STAFF/SUPER_ADMIN without an office assignment get the Not Assigned screen (W02)
      hasOffice: !!user?.office_id,
      signInStatus,

      // Backend swap: Google sign-in + a server-side lookup of the office assignment.
      // `variant: 'unassigned'` lets the mock exercise the Not Assigned screen.
      signIn: async ({ variant } = {}) => {
        setSignInStatus(SignInStatus.LOADING);
        await new Promise((resolve) => setTimeout(resolve, 600));
        setUser(variant === 'unassigned' ? MOCK_USER_STAFF_UNASSIGNED : MOCK_USER_STAFF);
        setSignInStatus(SignInStatus.IDLE);
      },
      signOut: () => {
        setUser(null);
        setSignInStatus(SignInStatus.IDLE);
      },
    }),
    [user, signInStatus],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used within a SessionProvider');
  return context;
}
