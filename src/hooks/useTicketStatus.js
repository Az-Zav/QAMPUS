// QAMPUS useTicketStatus Hook
// Derives the UI presentation status of a ticket and tracks the CALLED countdown.
// Ticks once per second ONLY while the ticket is CALLED and not yet expired.
// All other statuses are synchronously derived — no interval.

import { useEffect, useRef, useState } from 'react';
import { GRACE_PERIOD_SECONDS, TICKET_STATUS } from '@/constants/domain';
import { ticketUiStatus } from '@/utils/ticket';

/**
 * @param {import('@/types').Ticket | null | undefined} ticket
 * @returns {import('@/types').TicketStatusSummary}
 */
export function useTicketStatus(ticket) {
  const [now, setNow] = useState(() => new Date());
  const intervalRef = useRef(null);

  const isCalled = ticket?.status === TICKET_STATUS.CALLED;

  useEffect(() => {
    // Only tick during the CALLED grace period window
    if (!isCalled) {
      // Clear any existing interval — no state set synchronously
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Start 1-second ticker
    intervalRef.current = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [isCalled]);

  if (!ticket) {
    return { status: null, secondsLeft: null };
  }

  const status = ticketUiStatus(ticket, now);

  let secondsLeft = null;
  if (isCalled && ticket.calledAt) {
    const calledTime = new Date(ticket.calledAt).getTime();
    const elapsed = Math.floor((now.getTime() - calledTime) / 1000);
    secondsLeft = elapsed < GRACE_PERIOD_SECONDS ? Math.max(0, GRACE_PERIOD_SECONDS - elapsed) : null;
  }

  return { status, secondsLeft };
}
