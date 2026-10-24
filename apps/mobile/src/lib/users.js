// Student profile in Firestore: users/{uid}. Security Rules let a user create and edit only their own
// document, and never `role`, `strike_count` or `banned_until`.

import { USER_ROLE } from '@/constants';
import { db } from '@/lib/firebase';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';

// Returns the signed-in student's profile, creating an empty one on first sign-in (R-01).
export async function loadOrCreateStudent(firebaseUser) {
  const ref = doc(db, 'users', firebaseUser.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return { id: snap.id, ...snap.data() };

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
  };
  await setDoc(ref, { ...profile, created_at: serverTimestamp() });
  return { id: ref.id, ...profile };
}

export const saveStudentProfile = (uid, { studentId, program }) =>
  updateDoc(doc(db, 'users', uid), { institutional_id: studentId, program });
