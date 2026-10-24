import { TICKET_STATUS } from '@/constants';
import { useQueueData } from '@/providers/QueueDataProvider';
import { toHistoryView, toTicketView } from '@/utils';
import { campusDate } from '@qampus/core';
import { useMemo } from 'react';
import { useNow } from './useNow';

const FINISHED = [TICKET_STATUS.COMPLETED, TICKET_STATUS.CANCELLED, TICKET_STATUS.NO_SHOW];
const finishedAt = (ticket) => ticket.completed_at ?? ticket.cancelled_at ?? ticket.no_show_at ?? ticket.joined_at;

// The signed-in user's tickets: active (Home) and finished (History), as views.
// Ticks every second only while a ticket is CALLED, so countdowns stay live.
// Known gap (slice 1): an unfinished ticket from an earlier day is not shown anywhere.
export function useMyTickets() {
  const { board, tickets } = useQueueData();
  const hasCalled = tickets.some((t) => t.status === TICKET_STATUS.CALLED);
  const now = useNow(1000, hasCalled);

  const active = useMemo(() => {
    const today = campusDate(now).key;
    return tickets
      .filter((ticket) => !FINISHED.includes(ticket.status) && ticket.queue_date === today)
      .sort((a, b) => new Date(a.joined_at) - new Date(b.joined_at))
      .map((ticket) =>
        toTicketView(
          ticket,
          board.offices.find((office) => office.id === ticket.office_id),
          board.queues[ticket.office_id],
          now,
        ),
      );
  }, [tickets, board, now]);

  const history = useMemo(
    () =>
      tickets
        .filter((ticket) => FINISHED.includes(ticket.status))
        .sort((a, b) => new Date(finishedAt(b)) - new Date(finishedAt(a)))
        .map((ticket) => toHistoryView(ticket, now)),
    [tickets, now],
  );

  return { active, history, now };
}
