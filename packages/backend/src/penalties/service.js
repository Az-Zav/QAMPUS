// Penalty writes. Recording an offense happens inside the ticket transactions (ticketing/service.js); this file
// holds the revoke. Every function takes `db` first.

import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { TicketingError, TicketingFailure } from '../ticketing/preflight.js';
import { revokeEffect } from './progress.js';

// Staff: revoke an offense of their office (R-15). The record stays, marked revoked with who and why; the
// student's strikes and ban are corrected in the same transaction. `staffEmail` names the revoker.
export async function revokeOffense(db, { offense, reason, staffEmail }) {
  const trimmed = String(reason ?? '').trim();
  if (!trimmed) throw new TicketingFailure(TicketingError.REASON_REQUIRED);

  const offenseRef = doc(db, 'offenses', offense.id);
  const userRef = doc(db, 'users', offense.user_id);
  try {
    await runTransaction(db, async (tx) => {
      const offenseSnap = await tx.get(offenseRef);
      const userSnap = await tx.get(userRef);
      if (!offenseSnap.exists() || offenseSnap.data().revoked_at) {
        throw new TicketingFailure(TicketingError.TICKET_UNAVAILABLE);
      }

      const effect = revokeEffect(userSnap.exists() ? userSnap.data() : null, offenseSnap.data());
      if (effect) tx.update(userRef, effect);
      tx.update(offenseRef, {
        revoked_at: serverTimestamp(),
        revoked_by: staffEmail,
        revoke_reason: trimmed,
      });
    });
  } catch (error) {
    if (error instanceof TicketingFailure) throw error;
    throw new TicketingFailure(error?.code === 'permission-denied' ? TicketingError.DENIED : TicketingError.UNKNOWN);
  }
}
