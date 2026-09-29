// QAMPUS Ticket Utilities
// Pure helpers for ticket formatting and UI presentation status resolution.

import { GRACE_PERIOD_SECONDS, TICKET_STATUS, TicketStatus } from '@/constants/domain';

/**
 * Formats an office code and sequential number into a 3+ digit ticket code.
 * E.g. ('R', 15) -> 'R-015', ('M', 1042) -> 'M-1042'.
 *
 * @param {string} officeCode - The office identifier code (e.g. 'R', 'M', 'S')
 * @param {number|string} sequence - The sequential number of the ticket
 * @returns {string} Formatted short ticket number, or empty string if invalid
 */
export function shortNumber(officeCode, sequence) {
  if (sequence == null || sequence === '') return '';
  const seqNum = Number(sequence);
  if (isNaN(seqNum) || seqNum <= 0) return '';
  const padded = String(seqNum).padStart(3, '0');
  return officeCode ? `${officeCode}-${padded}` : padded;
}

/**
 * Maps a stored Ticket entity and current time to its UI presentation status.
 * Terminal states (COMPLETED, NO_SHOW, CANCELLED) do not require `now`.
 *
 * @param {import('@/types').Ticket} ticket - Live or historical ticket object
 * @param {Date|string|number} [now] - Current clock timestamp (optional for terminal tickets)
 * @returns {import('@/types').TicketUiStatusType} UI presentation status
 */
export function ticketUiStatus(ticket, now) {
  if (!ticket || !ticket.status) return TicketStatus.WAITING;

  switch (ticket.status) {
    case TICKET_STATUS.WAITING:
      return TicketStatus.WAITING;

    case TICKET_STATUS.CALLED: {
      if (!ticket.calledAt) return TicketStatus.YOUR_TURN;
      if (!now) return TicketStatus.YOUR_TURN;

      const calledTime = new Date(ticket.calledAt).getTime();
      const currentTime = (now instanceof Date ? now : new Date(now)).getTime();
      const elapsedSeconds = Math.floor((currentTime - calledTime) / 1000);

      if (elapsedSeconds >= GRACE_PERIOD_SECONDS) {
        return TicketStatus.EXPIRED;
      }
      return TicketStatus.YOUR_TURN;
    }

    case TICKET_STATUS.IN_SERVICE:
      return TicketStatus.IN_SERVICE;

    case TICKET_STATUS.COMPLETED:
      return TicketStatus.COMPLETED;

    case TICKET_STATUS.CANCELLED:
      if (ticket.cancelledBy === 'OFFICE') {
        return TicketStatus.CANCELLED_BY_OFFICE;
      }
      return TicketStatus.CANCELLED;

    case TICKET_STATUS.NO_SHOW:
      return TicketStatus.NO_SHOW;

    default:
      return TicketStatus.WAITING;
  }
}
