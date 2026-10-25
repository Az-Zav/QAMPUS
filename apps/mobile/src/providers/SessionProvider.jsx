// Session: who is signed in. Students sign in with Google, guests with an anonymous Firebase account bound to the
// device; both have a Firestore profile (lib/users.js) and a unique ID reserved in institutionalIds.

import { USER_ROLE } from '@/constants';
import { auth, db, SCHOOL_EMAIL_DOMAIN } from '@/lib/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearPushToken } from '@/lib/push';
import { loadOrCreateGuest, loadOrCreateStudent, saveGuestDetails, saveStudentProgram } from '@/lib/users';
import { buildGuestProfile, claimStudentProfile, issueGuestProfile } from '@qampus/backend';
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

// Set once the student has seen onboarding, so it does not show again after a restart (per phone, not per account)
const ONBOARDED_KEY = 'qampus.onboarded';

// The profile of whoever Firebase says is signed in: an anonymous account is a guest, anything else a student
const loadProfile = (firebaseUser) => (firebaseUser.isAnonymous ? loadOrCreateGuest(firebaseUser) : loadOrCreateStudent(firebaseUser));

function profileIncomplete(user) {
  if (!user) return false;
  if (user.role === USER_ROLE.GUEST) return !user.name || !user.guest_type;
  return !user.institutional_id || !user.program;
}

export function SessionProvider({ children }) {
  const [user, setUser] = useState(null);
  const [hasOnboarded, setHasOnboarded] = useState(false);

  // False until Firebase has read the persisted session and the saved onboarding flag has been read, so the app
  // doesn't flash Login or Onboarding
  const [authChecked, setAuthChecked] = useState(false);
  const [onboardedLoaded, setOnboardedLoaded] = useState(false);
  const authReady = authChecked && onboardedLoaded;

  // Set while signInAsStudent or completeGuestProfile runs, so the listener doesn't load the same profile twice
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
      setAuthChecked(true);
    });
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDED_KEY)
      .then((saved) => setHasOnboarded(saved === '1'))
      .catch(() => {})
      .finally(() => setOnboardedLoaded(true));
  }, []);


  const value = useMemo(
    () => ({
      user,
      isSignedIn: !!user,
      needsProfile: profileIncomplete(user),
      authReady,
      hasOnboarded,
      completeOnboarding: () => {
        setHasOnboarded(true);
        AsyncStorage.setItem(ONBOARDED_KEY, '1').catch(() => {});
      },
      
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
      // Guests have no credentials (R-02): an anonymous Firebase account bound to this device. It is made HERE, when the
      // guest form's Continue succeeds, together with the profile and the unique Guest ID, so cancelling the form creates
      // nothing and a failed save removes the account again. Resolves to the Guest ID.
      completeGuestProfile: async ({ name, email, guestType }) => {
        // An older guest who signed in before filling the form already has an (empty) account: reuse it
        const existing = user?.role === USER_ROLE.GUEST ? user : null;
        let created = null;
        signingIn.current = true;
        try {
          if (!existing) created = (await signInAnonymously(auth)).user;
          const uid = existing?.id ?? created.uid;
          const guestId = await issueGuestProfile(db, { uid, name, email, guestType });
          setUser({
            ...(existing ?? buildGuestProfile({ name, email, guestType, id: guestId })),
            id: uid,
            name: name.trim(),
            email: email.trim() || null,
            guest_type: guestType,
            institutional_id: guestId,
          });
          return guestId;
        } catch (error) {
          // Leave nothing behind: no account, no half-made profile (the profile and the ID are one transaction)
          if (created) await created.delete().catch(() => firebaseSignOut(auth).catch(() => {}));
          throw error;
        } finally {
          signingIn.current = false;
        }
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