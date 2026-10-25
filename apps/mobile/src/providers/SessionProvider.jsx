// Session: who is signed in. Students sign in with Google, guests with an anonymous Firebase account bound to the
// device; both have a Firestore profile (lib/users.js) and a unique ID reserved in institutionalIds.

import { USER_ROLE } from '@/constants';
import { auth, db, SCHOOL_EMAIL_DOMAIN } from '@/lib/firebase';
import { clearPushToken } from '@/lib/push';
import { loadOrCreateGuest, loadOrCreateStudent, saveGuestDetails, saveStudentProgram } from '@/lib/users';
import { claimStudentProfile, issueGuestProfile } from '@qampus/backend';
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { GoogleSignin, isSuccessResponse } from '@react-native-google-signin/google-signin';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInAnonymously,
  signInWithCredential,
  signOut as firebaseSignOut,
} from 'firebase/auth';

const SessionContext = createContext(null);

// The profile of whoever Firebase says is signed in: an anonymous account is a guest, anything else a student
const loadProfile = (firebaseUser) => (firebaseUser.isAnonymous ? loadOrCreateGuest(firebaseUser) : loadOrCreateStudent(firebaseUser));

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

  // Set while signInAsStudent or signInAsGuest runs, so the listener doesn't load the same profile twice
  const signingIn = useRef(false);

  useEffect(() => {
    // Fires once on launch, then on every sign-in / sign-out
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (!signingIn.current) {
        try {
          setUser(firebaseUser ? await loadProfile(firebaseUser) : null);
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

      // Guests have no credentials: an anonymous Firebase account bound to this device (R-02)
      signInAsGuest: async () => {
        signingIn.current = true;
        try {
          const { user: firebaseUser } = await signInAnonymously(auth);
          setUser(await loadOrCreateGuest(firebaseUser));
        } catch (error) {
          await firebaseSignOut(auth).catch(() => {});
          throw error;
        } finally {
          signingIn.current = false;
        }
      },

      signOut: async () => {
        // This phone must stop receiving this account's pushes (best effort, before the session ends)
        if (user) await clearPushToken(user.id).catch(() => {});
        // Also clear Google's cached account, or the picker is skipped next time
        await GoogleSignin.signOut().catch(() => {});
        await firebaseSignOut(auth).catch(() => {});
        setUser(null);
      },

      // Reserves the student ID (a second account entering the same one is refused with ID_TAKEN)
      completeStudentProfile: async ({ studentId, program }) => {
        await claimStudentProfile(db, { uid: user.id, studentId, program });
        setUser((prev) => ({ ...prev, institutional_id: studentId, program }));
      },
      // Edit Profile: a student changes their program (the student ID is locked, R-01); a guest changes name,
      // email and guest type (the Guest ID stays as issued)
      updateProfile: async (changes) => {
        if (user.role === USER_ROLE.GUEST) {
          await saveGuestDetails(user.id, changes);
          setUser((prev) => ({ ...prev, ...changes }));
          return;
        }
        await saveStudentProgram(user.id, changes.program);
        setUser((prev) => ({ ...prev, program: changes.program }));
      },
      // Saves the guest's details and issues their unique Guest ID (R-02). Resolves to the ID.
      completeGuestProfile: async ({ name, email, guestType }) => {
        const guestId = await issueGuestProfile(db, { uid: user.id, name, email, guestType });
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