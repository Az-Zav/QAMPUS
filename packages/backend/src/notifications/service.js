// Notification writes. `target` is the transaction or write batch that makes the change, so the notification is
// saved (or refused) together with it. Every function takes `db` first.

import { collection, doc, getDocs, query, serverTimestamp, updateDoc, where, writeBatch } from 'firebase/firestore';
import { buildNotification } from './build.js';

// Put one notification in `uid`'s mailbox, inside the write that causes it
export function notify(db, target, uid, type, context) {
  target.set(doc(collection(db, 'users', uid, 'notifications')), {
    ...buildNotification(type, context),
    created_at: serverTimestamp(),
  });
}

// The owner opens one notification
export function markNotificationRead(db, uid, id) {
  return updateDoc(doc(db, 'users', uid, 'notifications', id), { is_read: true, read_at: serverTimestamp() });
}

// The owner marks every unread notification read (one batch; a mailbox is small)
export async function markAllNotificationsRead(db, uid) {
  const unread = await getDocs(query(collection(db, 'users', uid, 'notifications'), where('is_read', '==', false)));
  if (unread.empty) return;
  const batch = writeBatch(db);
  unread.docs.forEach((snap) => batch.update(snap.ref, { is_read: true, read_at: serverTimestamp() }));
  await batch.commit();
}
