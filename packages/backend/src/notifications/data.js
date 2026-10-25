// The signed-in student's notifications, newest first (the latest 50). Single-field order: no composite index.

import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import { toPlain } from '../plain.js';
import { NOTIFICATIONS_LIMIT } from './build.js';

export function watchMyNotifications(db, uid, onData, onError) {
  return onSnapshot(
    query(collection(db, 'users', uid, 'notifications'), orderBy('created_at', 'desc'), limit(NOTIFICATIONS_LIMIT)),
    (snap) => onData(snap.docs.map(toPlain)),
    onError,
  );
}
