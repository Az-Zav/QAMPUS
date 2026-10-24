// Staff session: who is signed in. Firebase Auth (Google popup) proves the email; the
// staff/{email} document says which office the person is assigned to. No document means
// the Not Assigned screen (W02).

import { auth, db } from '@/lib/firebase';
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

const SessionContext = createContext(null);

export const SignInStatus = Object.freeze({
  IDLE: 'idle',
  LOADING: 'loading',
  ERROR: 'error',
});

// Staff are identified by the doc, not by the email domain. A missing doc is an unassigned user.
async function loadStaff(firebaseUser) {
  const email = firebaseUser.email.toLowerCase();
  const snap = await getDoc(doc(db, 'staff', email));
  const staff = snap.exists() ? snap.data() : {};
  return {
    id: firebaseUser.uid,
    email,
    role: staff.role ?? null,
    name: staff.name ?? firebaseUser.displayName ?? email,
    office_id: staff.office_id ?? null,
  };
}

export function SessionProvider({ children }) {
  const [user, setUser] = useState(null);
  const [signInStatus, setSignInStatus] = useState(SignInStatus.IDLE);
  // False until Firebase has read the persisted session, so a reload doesn't flash Sign in
  const [authReady, setAuthReady] = useState(false);
  // Set while signIn runs, so the listener doesn't load the same staff doc twice
  const signingIn = useRef(false);

  useEffect(() => {
    // Fires once on load, then on every sign-in / sign-out
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (!signingIn.current) {
        try {
          setUser(firebaseUser ? await loadStaff(firebaseUser) : null);
        } catch (error) {
          console.warn('Could not load staff profile', error);
          setUser(null);
        }
      }
      setAuthReady(true);
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      isSignedIn: !!user,
      // STAFF/SUPER_ADMIN without an office assignment get the Not Assigned screen (W02)
      hasOffice: !!user?.office_id,
      authReady,
      signInStatus,

      signIn: async () => {
        setSignInStatus(SignInStatus.LOADING);
        signingIn.current = true;
        try {
          const { user: firebaseUser } = await signInWithPopup(auth, new GoogleAuthProvider());
          setUser(await loadStaff(firebaseUser));
          setSignInStatus(SignInStatus.IDLE);
        } catch (error) {
          // Closing the popup is not an error worth showing
          const dismissed =
            error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request';
          if (!dismissed) console.warn('Staff sign-in failed', error);
          await firebaseSignOut(auth).catch(() => {});
          setSignInStatus(dismissed ? SignInStatus.IDLE : SignInStatus.ERROR);
        } finally {
          signingIn.current = false;
        }
      },
      signOut: async () => {
        await firebaseSignOut(auth).catch(() => {});
        setUser(null);
        setSignInStatus(SignInStatus.IDLE);
      },
    }),
    [user, authReady, signInStatus],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used within a SessionProvider');
  return context;
}
