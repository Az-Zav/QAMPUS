// Student profile in Firestore: users/{uid}. Security Rules let a user create and edit only their own
// document, and never `role`, `strike_count`, `banned_until` or `active_count`.

import { USER_ROLE } from '@/constants';
import { db } from '@/lib/firebase';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';

// Returns the signed-in student's profile, creating an empty one on first sign-in (R-01).
// `avatar_url` is the Google account's photo, read from the sign-in each time and never stored in Firestore.
export async function loadOrCreateStudent(firebaseUser) {
  const ref = doc(db, 'users', firebaseUser.uid);
  const snap = await getDoc(ref);
  const avatar_url = firebaseUser.photoURL ?? null;
  if (snap.exists()) return { id: snap.id, ...snap.data(), avatar_url };

  const profile = {
    role: USER_ROLE.STUDENT,
    name: firebaseUser.displayName ?? null,
    email: firebaseUser.email ?? null,
    institutional_id: null,
    program: null,
    guest_type: null,
    push_enabled: true,
    strike_count: 0,
    banned_until: null,
    active_count: 0,
    active_offices: {},
  };
  await setDoc(ref, { ...profile, created_at: serverTimestamp() });
  return { id: ref.id, ...profile, avatar_url };
}

// A guest's profile (R-02): created empty on the first anonymous sign-in; the form and the unique Guest ID come later
// (issueGuestProfile in @qampus/backend).
export async function loadOrCreateGuest(firebaseUser) {
  const ref = doc(db, 'users', firebaseUser.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return { id: snap.id, ...snap.data() };

  const profile = {
    role: USER_ROLE.GUEST,
    name: null,
    email: null,
    institutional_id: null,
    program: null,
    guest_type: null,
    push_enabled: true,
    strike_count: 0,
    banned_until: null,
    active_count: 0,
    active_offices: {},
  };
  await setDoc(ref, { ...profile, created_at: serverTimestamp() });
  return { id: ref.id, ...profile };
}

// A guest may edit their name, email and guest type afterwards; the Guest ID stays as issued
export const saveGuestDetails = (uid, { name, email, guest_type }) =>
  updateDoc(doc(db, 'users', uid), { name, email, guest_type });

// Edit Profile (S14): a student may change their program; the student ID stays as first saved (R-01, and the
// rules refuse a change once it is set).
export const saveStudentProgram = (uid, program) => updateDoc(doc(db, 'users', uid), { program });
