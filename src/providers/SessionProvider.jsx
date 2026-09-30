// Session: who is signed in. In-memory for now; later backed by Firebase Auth
// (onAuthStateChanged) with the same value shape.

import { USER_ROLE } from '@/constants';
import { MOCK_USER_GUEST, MOCK_USER_STUDENT } from '@/data/mock';
import { createContext, useContext, useMemo, useState } from 'react';

const SessionContext = createContext(null);

// First sign-in accounts: profile fields not filled yet (R-01, R-02)
const NEW_STUDENT = { ...MOCK_USER_STUDENT, institutional_id: null, program: null };
const NEW_GUEST = { ...MOCK_USER_GUEST, name: null, email: null, guest_type: null, institutional_id: null };

function profileIncomplete(user) {
  if (!user) return false;
  if (user.role === USER_ROLE.GUEST) return !user.name || !user.guest_type;
  return !user.institutional_id || !user.program;
}

export function SessionProvider({ children }) {
  const [user, setUser] = useState(null);
  // In-memory: onboarding shows again after an app restart until storage is added
  const [hasOnboarded, setHasOnboarded] = useState(false);

  const value = useMemo(
    () => ({
      user,
      isSignedIn: !!user,
      needsProfile: profileIncomplete(user),
      hasOnboarded,
      completeOnboarding: () => setHasOnboarded(true),
      signInAsStudent: () => setUser(NEW_STUDENT),
      signInAsGuest: () => setUser(NEW_GUEST),
      signOut: () => setUser(null),

      // Backend swap: these become Cloud Function calls; the server validates and saves.
      completeStudentProfile: ({ studentId, program }) =>
        setUser((prev) => ({ ...prev, institutional_id: studentId, program })),

      // The server issues the Guest ID (R-02, R-30); the mock passes back a fixed one.
      completeGuestProfile: ({ name, email, guestType }) => {
        const guestId = MOCK_USER_GUEST.institutional_id;
        setUser((prev) => ({ ...prev, name, email: email || null, guest_type: guestType, institutional_id: guestId }));
        return guestId;
      },
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