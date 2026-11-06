import { db } from '@/lib/firebase';
import { useQueueData } from '@/providers/QueueDataProvider';
import { checkInByCode, pickCheckInTicket, TicketingError } from '@qampus/backend';
import { useCallback, useState } from 'react';

// Checks the student in for a called ticket, with the office code.
// checkIn(code, { officeCode }) resolves to null on success, or a TicketingError code the screen maps to copy.
// `officeCode` comes from a scanned QR: a QR of an office that is not calling the student is told apart from a wrong code.
export function useCheckIn() {
  const { board, tickets } = useQueueData();
  const [checkingIn, setCheckingIn] = useState(false);

  const checkIn = useCallback(
    async (code, { officeCode = null } = {}) => {
      // With several offices calling at once, the code (or the QR's office) picks the ticket (BUG-022)
      const picked = pickCheckInTicket({ tickets, offices: board.offices, code, officeCode, now: Date.now() });
      if (picked.error) return picked.error;
      const { ticket, office } = picked;
      setCheckingIn(true);
      try {
        await checkInByCode(db, { ticket, office, code });
        return null;
      } catch (error) {
        console.warn('Check-in failed', error);
        return error.code ?? TicketingError.UNKNOWN;
      } finally {
        setCheckingIn(false);
      }
    },
    [board, tickets],
  );

  return { checkIn, checkingIn };
}
