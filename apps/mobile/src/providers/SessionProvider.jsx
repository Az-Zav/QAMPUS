// Session: who is signed in. Students are backed by Firebase Auth (Google) and a Firestore
// profile (lib/users.js). Guests are still mock until their backend slice exists.

import { USER_ROLE } from '@/constants';
import { auth, SCHOOL_EMAIL_DOMAIN } from '@/lib/firebase';
import { loadOrCreateStudent, saveStudentProfile, saveStudentProgram } from '@/lib/users';
import { MOCK_USER_GUEST } from '@qampus/core/mock';
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { GoogleSignin, isSuccessResponse } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, onAuthStateChanged, signInWithCredential, signOut as firebaseSignOut } from 'firebase/auth';

const SessionContext = createContext(null);

// First sign-in guest: profile fields not filled yet (R-02)
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

    // False until Firebase has read the persisted session, so the app doesn't flash Login
  const [authReady, setAuthReady] = useState(false);

  // Set while signInAsStudent runs, so the listener doesn't load the same profile twice
  const signingIn = useRef(false);

  useEffect(() => {
    // Fires once on launch, then on every sign-in / sign-out
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (!signingIn.current) {
        try {
          setUser(firebaseUser ? await loadOrCreateStudent(firebaseUser) : null);
        } catch (error) {
          console.warn('Could not load profile', error);
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
      needsProfile: profileIncomplete(user),
      authReady,
      hasOnboarded,
      completeOnboarding: () => setHasOnboarded(true),
      
      signInAsStudent: async () => {
        await GoogleSignin.hasPlayServices();
        const response = await GoogleSignin.signIn();
        if (!isSuccessResponse(response)) return false; // user cancelled the picker
        const { idToken, user: googleUser } = response.data;

        if (!googleUser.email.toLowerCase().endsWith(`@${SCHOOL_EMAIL_DOMAIN}`)) {
          await GoogleSignin.signOut().catch(() => {});
          throw Object.assign(new Error('Not a school account'), { code: 'wrong-domain' });
        }

        signingIn.current = true;
        try {
          const { user: firebaseUser } = await signInWithCredential(auth, GoogleAuthProvider.credential(idToken));
          setUser(await loadOrCreateStudent(firebaseUser));
        } catch (error) {
          await firebaseSignOut(auth).catch(() => {});
          throw error;
        } finally {
          signingIn.current = false;
        }
        return true;
      },

      signInAsGuest: () => setUser(NEW_GUEST),

      signOut: async () => {
        // Also clear Google's cached account, or the picker is skipped next time
        await GoogleSignin.signOut().catch(() => {});
        await firebaseSignOut(auth).catch(() => {});
        // Guests have no Firebase user, so the auth listener never clears them
        setUser(null);
      },

      completeStudentProfile: async ({ studentId, program }) => {
        await saveStudentProfile(user.id, { studentId, program });
        setUser((prev) => ({ ...prev, institutional_id: studentId, program }));
      },
      // Edit Profile: a student's program is saved to Firestore (the student ID is locked, R-01); a guest's details
      // change in memory only until the guest slice gives guests a profile document.
      updateProfile: async (changes) => {
        if (user.role === USER_ROLE.GUEST) {
          setUser((prev) => ({ ...prev, ...changes }));
          return;
        }
        await saveStudentProgram(user.id, changes.program);
        setUser((prev) => ({ ...prev, program: changes.program }));
      },
      // Backend swap: the guest profile moves to Firestore with the guest slice.
      // The server issues the Guest ID (R-02, R-30); the mock passes back a fixed one.
      completeGuestProfile: ({ name, email, guestType }) => {
        const guestId = MOCK_USER_GUEST.institutional_id;
        setUser((prev) => ({ ...prev, name, email: email || null, guest_type: guestType, institutional_id: guestId }));
        return guestId;
      },
    }),
    [user, hasOnboarded, authReady],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used within a SessionProvider');
  return context;
}