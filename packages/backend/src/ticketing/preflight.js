// Checks that run before a write, so the UI can explain a refusal. Security Rules enforce the same
// conditions; these only give a readable reason. Pure: no Firebase.

import { QUEUE_STATUS, TICKET_STATUS } from '@qampus/core/domain';

export const TicketingError = Object.freeze({
  PROFILE_INCOMPLETE: 'PROFILE_INCOMPLETE',
  OFFICE_INACTIVE: 'OFFICE_INACTIVE',
  QUEUE_CLOSED: 'QUEUE_CLOSED',
  WINDOW_BUSY: 'WINDOW_BUSY',
  TICKET_UNAVAILABLE: 'TICKET_UNAVAILABLE',
  DENIED: 'DENIED',
  UNKNOWN: 'UNKNOWN',
});

export class TicketingFailure extends Error {
  constructor(code) {
    super(code);
    this.name = 'TicketingFailure';
    this.code = code;
  }
}

// Returns null when the user may join `office`, else the reason (a TicketingError).
// `queue` is today's queue doc data, or null when staff have not opened the queue.
export function checkJoin({ user, office, queue }) {
  if (!user?.institutional_id || !user?.name) return TicketingError.PROFILE_INCOMPLETE;
  if (office.status === 'INACTIVE') return TicketingError.OFFICE_INACTIVE;
  if (!queue || queue.status !== QUEUE_STATUS.OPEN) return TicketingError.QUEUE_CLOSED;
  return null;
}

// Returns null when staff of `officeId` may call `ticket` now, else the reason (a TicketingError).
// One ticket at the window at a time: the window is busy while the queue has a current ticket.
export function checkCall({ officeId, queue, ticket }) {
  if (!queue || queue.status !== QUEUE_STATUS.OPEN) return TicketingError.QUEUE_CLOSED;
  if (queue.current_ticket_id) return TicketingError.WINDOW_BUSY;
  if (!ticket || ticket.office_id !== officeId || ticket.status !== TICKET_STATUS.WAITING) {
    return TicketingError.TICKET_UNAVAILABLE;
  }
  return null;
}
