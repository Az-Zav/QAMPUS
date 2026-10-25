// Ticket selectors: turn stored ticket records into the view objects
// components render. Components never read raw records.

import { HistoryGroup, TicketStatus } from '@/constants';
import { estimatedWaitMinutes, nowServing, peopleAhead } from '@qampus/backend';
import { daysBetween, formatDateTime, getRemainingSeconds, toShortTicketNumber, toTicketStatus } from '@qampus/core';

// Grace-period and status derivation are shared with the staff app
export { getRemainingSeconds, toTicketStatus };

// Active ticket (Home, TicketModal, CalledModal) — short number per R-08a.
// `office` is the stored office record (location, wait default); `queue` is today's queue doc.
// Position, people ahead and the wait estimate are not stored; they come from the queue doc.
export function toTicketView(ticket, office, queue, now) {
  const status = toTicketStatus(ticket, now);
  const ahead = peopleAhead(ticket, queue);
  const officeCode = ticket.ticket_number.split('-')[0];

  return {
    id: ticket.id,
    shortNumber: toShortTicketNumber(ticket.ticket_number),
    fullNumber: ticket.ticket_number,
    officeName: ticket.office_name,
    location: office?.location ?? '',
    nowServing: nowServing({ code: officeCode }, queue) ?? '—',
    status,
    position: ahead + 1,
    peopleAhead: ahead,
    estimatedWaitMinutes: estimatedWaitMinutes(ahead, office, queue),
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
