// Ticket state derivation shared by student and staff apps.

import { CANCELLED_BY, RULES, TICKET_STATUS, TicketStatus } from './domain';

// Seconds left in the grace period (R-12); 0 once lapsed
export function getRemainingSeconds(calledAt, now) {
  if (!calledAt) return 0;
  const elapsed = (now - new Date(calledAt).getTime()) / 1000;
  return Math.max(0, Math.ceil(RULES.GRACE_PERIOD_SECONDS - elapsed));
}

// Stored TICKET_STATUS -> UI TicketStatus
export function toTicketStatus(ticket, now) {
  switch (ticket.status) {
    case TICKET_STATUS.WAITING:
      return TicketStatus.WAITING;
    case TICKET_STATUS.CALLED:
      return getRemainingSeconds(ticket.called_at, now) > 0 ? TicketStatus.YOUR_TURN : TicketStatus.EXPIRED;
    case TICKET_STATUS.IN_SERVICE:
      return TicketStatus.IN_SERVICE;
    case TICKET_STATUS.COMPLETED:
      return TicketStatus.COMPLETED;
    case TICKET_STATUS.CANCELLED:
      return ticket.cancelled_by === CANCELLED_BY.OFFICE ? TicketStatus.CANCELLED_BY_OFFICE : TicketStatus.CANCELLED;
    case TICKET_STATUS.NO_SHOW:
      return TicketStatus.NO_SHOW;
    default:
      return TicketStatus.WAITING;
  }
}

// "R-10-24-003" -> "R-003" (the short number shown on the student's ticket, R-08a)
export function toShortTicketNumber(ticketNumber) {
  if (!ticketNumber) return '';
  const [code, , , seq] = ticketNumber.split('-');
  return `${code}-${seq}`;
}
