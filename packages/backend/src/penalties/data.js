// Firestore listeners for penalties. Each returns an unsubscribe function.

import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';
import { toPlain } from '../plain.js';

// The signed-in student's own profile, live (strike count and ban); null until it exists
export function watchProfile(db, uid, onData, onError) {
  return onSnapshot(doc(db, 'users', uid), (snap) => onData(snap.exists() ? toPlain(snap) : null), onError);
}

// Every offense of one student, any office (Bans & Warnings)
export function watchMyOffenses(db, uid, onData, onError) {
  return onSnapshot(
    query(collection(db, 'offenses'), where('user_id', '==', uid)),
    (snap) => onData(snap.docs.map(toPlain)),
    onError,
  );
}

// Every offense recorded at one office (staff Offenses screen)
export function watchOfficeOffenses(db, officeId, onData, onError) {
  return onSnapshot(
    query(collection(db, 'offenses'), where('office_id', '==', officeId)),
    (snap) => onData(snap.docs.map(toPlain)),
    onError,
  );
}
