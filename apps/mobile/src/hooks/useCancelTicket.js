import { db } from '@/lib/firebase';
import { useQueueData } from '@/providers/QueueDataProvider';
import { cancelOwnTicket, TicketingError } from '@qampus/backend';
import { useCallback, useState } from 'react';

// Cancels one of the student's own tickets: WAITING (free) or CALLED (an offense once penalties exist).
// cancel(ticketId) resolves to null on success, or a TicketingError code the screen maps to copy.
export function useCancelTicket() {
  const { tickets } = useQueueData();
  const [cancelling, setCancelling] = useState(false);

  const cancel = useCallback(
    async (ticketId) => {
      const ticket = tickets.find((t) => t.id === ticketId);
      if (!ticket) return TicketingError.TICKET_UNAVAILABLE;
      setCancelling(true);
      try {
        await cancelOwnTicket(db, { ticket });
        return null;
      } catch (error) {
        console.warn('Cancel failed', error);
        return error.code ?? TicketingError.UNKNOWN;
      } finally {
        setCancelling(false);
      }
    },
    [tickets],
  );

  return { cancel, cancelling };
}
