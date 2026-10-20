// Ticket selectors: turn stored ticket records into the view objects
// components render. Components never read raw records.

import { HistoryGroup, TicketStatus } from '@/constants';
import { daysBetween, formatDateTime, getRemainingSeconds, toTicketStatus } from '@qampus/core';

// Grace-period and status derivation are shared with the staff app
export { getRemainingSeconds, toTicketStatus };

// Active ticket (Home, TicketModal, CalledModal) — short number per R-08a
export function toTicketView(ticket, office, now) {
  const status = toTicketStatus(ticket, now);

  return {
    id: ticket.id,
    shortNumber: ticket.short_ticket_number,
    fullNumber: ticket.ticket_number,
    officeName: ticket.office_name,
    location: office?.location ?? '',
    nowServing: office?.queue?.current_ticket_number ?? '—',
    status,
    position: ticket.position_in_queue,
    peopleAhead: ticket.ahead_count,
    estimatedWaitMinutes: ticket.estimated_wait_minutes,
    remainingSeconds:
      status === TicketStatus.YOUR_TURN || status === TicketStatus.EXPIRED
        ? getRemainingSeconds(ticket.called_at, now)
        : null,
  };
}

function finishedAt(ticket) {
  return ticket.completed_at ?? ticket.cancelled_at ?? ticket.no_show_at ?? ticket.joined_at;
}

// Finished ticket (Queue › History) — full number per R-08a
export function toHistoryView(ticket, now) {
  return {
    id: ticket.id,
    fullNumber: ticket.ticket_number,
    officeName: ticket.office_name,
    dateLabel: formatDateTime(finishedAt(ticket)),
    status: toTicketStatus(ticket, now),
    finishedAt: finishedAt(ticket),
  };
}

// History views -> [{ group, items }] for Today / Yesterday / Earlier
export function groupHistory(views, now) {
  const buckets = {
    [HistoryGroup.TODAY]: [],
    [HistoryGroup.YESTERDAY]: [],
    [HistoryGroup.EARLIER]: [],
  };

  views.forEach((view) => {
    const days = daysBetween(view.finishedAt, now);
    const group = days <= 0 ? HistoryGroup.TODAY : days === 1 ? HistoryGroup.YESTERDAY : HistoryGroup.EARLIER;
    buckets[group].push(view);
  });

  return Object.entries(buckets)
    .filter(([, items]) => items.length > 0)
    .map(([group, items]) => ({ group, items }));
}
