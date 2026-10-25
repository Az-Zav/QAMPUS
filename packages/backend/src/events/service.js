// Activity log write. `target` is the transaction or write batch that makes the change, so the line is saved
// (or refused) together with it. Security Rules only check the shape, the actor and the time.

import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { buildEvent } from './build.js';

export function logEvent(db, target, fields) {
  target.set(doc(collection(db, 'events')), { ...buildEvent(fields), created_at: serverTimestamp() });
}
