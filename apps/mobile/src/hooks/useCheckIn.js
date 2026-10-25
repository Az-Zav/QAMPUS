import { TICKET_STATUS } from '@/constants';
import { db } from '@/lib/firebase';
import { useQueueData } from '@/providers/QueueDataProvider';
import { checkInByCode, TicketingError } from '@qampus/backend';
import { getRemainingSeconds } from '@qampus/core';
import { useCallback, useState } from 'react';

// Checks the student in for the ticket being called, with the office code.
// checkIn(code, { officeCode }) resolves to null on success, or a TicketingError code the screen maps to copy.
// `officeCode` comes from a scanned QR: a QR of another office than the called ticket's is told apart from a wrong code.
export function useCheckIn() {
  const { board, tickets } = useQueueData();
  const [checkingIn, setCheckingIn] = useState(false);

  const checkIn = useCallback(
    async (code, { officeCode = null } = {}) => {
      const now = Date.now();
      // Prefer a ticket whose grace period is still running; an expired one still explains itself
      const called = tickets.filter((ticket) => ticket.status === TICKET_STATUS.CALLED);
      const ticket = called.find((t) => getRemainingSeconds(t.called_at, now) > 0) ?? called[0];
      if (!ticket) return TicketingError.NOT_CALLED;

      const office = board.offices.find((o) => o.id === ticket.office_id);
      if (officeCode && office?.code && officeCode.toUpperCase() !== String(office.code).toUpperCase()) {
        return TicketingError.WRONG_OFFICE;
      }
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
