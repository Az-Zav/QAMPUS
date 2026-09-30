import { TICKET_STATUS } from '@/constants';
import { MOCK_ACTIVE_TICKETS, MOCK_HISTORY_TICKETS, MOCK_OFFICES } from '@/data/mock';
import { toHistoryView, toTicketView } from '@/utils';
import { useMemo } from 'react';
import { useNow } from './useNow';

// The signed-in user's tickets: active (Home) and finished (History), as views.
// Ticks every second only while a ticket is CALLED, so countdowns stay live.
// Backend swap: replace the MOCK_* reads with Firestore `tickets` subscriptions; keep the return shape.
export function useMyTickets() {
  const hasCalled = MOCK_ACTIVE_TICKETS.some((t) => t.status === TICKET_STATUS.CALLED);
  const now = useNow(1000, hasCalled);

  const active = useMemo(
    () =>
      MOCK_ACTIVE_TICKETS.map((ticket) =>
        toTicketView(ticket, MOCK_OFFICES.find((o) => o.id === ticket.office_id), now),
      ),
    [now],
  );

  const history = useMemo(() => MOCK_HISTORY_TICKETS.map((ticket) => toHistoryView(ticket, now)), [now]);

  return { active, history, now };
}
