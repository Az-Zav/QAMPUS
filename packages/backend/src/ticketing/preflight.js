// Checks that run before a write, so the UI can explain a refusal. Security Rules enforce the same
// conditions; these only give a readable reason. Pure: no Firebase.

import { QUEUE_STATUS, RULES, TICKET_STATUS } from '@qampus/core/domain';
import { getRemainingSeconds } from '@qampus/core/ticket';

export const TicketingError = Object.freeze({
  PROFILE_INCOMPLETE: 'PROFILE_INCOMPLETE',
  OFFICE_INACTIVE: 'OFFICE_INACTIVE',
  QUEUE_CLOSED: 'QUEUE_CLOSED',
  BANNED: 'BANNED',
  ALREADY_QUEUED: 'ALREADY_QUEUED',
  LIMIT_REACHED: 'LIMIT_REACHED',
  WINDOW_BUSY: 'WINDOW_BUSY',
  TICKET_UNAVAILABLE: 'TICKET_UNAVAILABLE',
  NOT_CALLED: 'NOT_CALLED',
  GRACE_EXPIRED: 'GRACE_EXPIRED',
  INVALID_CODE: 'INVALID_CODE',
  ID_MISMATCH: 'ID_MISMATCH',
  NOT_IN_SERVICE: 'NOT_IN_SERVICE',
  GRACE_NOT_EXPIRED: 'GRACE_NOT_EXPIRED',
  REASON_REQUIRED: 'REASON_REQUIRED',
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
// `bannedUntil` is the end of the user's ban (R-14: a ban blocks joining only).
// `activeCount` is the user's counter of active tickets across all offices (R-07). `activeOffices` is the map
// of offices where the user already holds an active ticket: one active ticket per office at a time.
export function checkJoin({ user, office, queue, activeCount = 0, activeOffices = {}, bannedUntil = null, now = new Date() }) {
  if (!user?.institutional_id || !user?.name) return TicketingError.PROFILE_INCOMPLETE;
  if (bannedUntil && new Date(bannedUntil).getTime() > new Date(now).getTime()) return TicketingError.BANNED;
  if (office.status === 'INACTIVE') return TicketingError.OFFICE_INACTIVE;
  if (activeOffices[office.id]) return TicketingError.ALREADY_QUEUED;
  if (activeCount >= RULES.MAX_ACTIVE_TICKETS) return TicketingError.LIMIT_REACHED;
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

// A CALLED ticket can start service only inside the grace period (R-12). `now` is in ms or a Date.
function checkArrival({ ticket, now }) {
  if (!ticket || ticket.status !== TICKET_STATUS.CALLED) return TicketingError.NOT_CALLED;
  if (getRemainingSeconds(ticket.called_at, new Date(now).getTime()) === 0) return TicketingError.GRACE_EXPIRED;
  return null;
}

// Student checks in with the office code (the QR payload or the 6 digits typed by hand)
export function checkCheckIn({ ticket, office, code, now }) {
  const early = checkArrival({ ticket, now });
  if (early) return early;
  const typed = String(code ?? '').replace(/\D/g, '');
  if (!typed || typed !== String(office?.check_in_code ?? '')) return TicketingError.INVALID_CODE;
  return null;
}

// Staff verify the called ticket by the holder's student or guest ID
export function checkVerifyById({ ticket, idNumber, now }) {
  const early = checkArrival({ ticket, now });
  if (early) return early;
  const norm = (value) => String(value ?? '').trim().toUpperCase();
  if (!norm(idNumber) || norm(idNumber) !== norm(ticket.holder_institutional_id)) return TicketingError.ID_MISMATCH;
  return null;
}

// Staff complete the ticket at the window: it must be IN_SERVICE and the queue's current ticket
export function checkComplete({ ticket, queue }) {
  if (!ticket || ticket.status !== TICKET_STATUS.IN_SERVICE || queue?.current_ticket_id !== ticket.id) {
    return TicketingError.NOT_IN_SERVICE;
  }
  return null;
}

// Staff mark the current ticket a no-show: a CALLED ticket only after its grace period (R-12), an
// IN_SERVICE one (verification reversed, R-23a) only with a reason.
export function checkNoShow({ ticket, queue, reason, now }) {
  if (!ticket || queue?.current_ticket_id !== ticket.id) return TicketingError.TICKET_UNAVAILABLE;
  if (ticket.status === TICKET_STATUS.CALLED) {
    return getRemainingSeconds(ticket.called_at, new Date(now).getTime()) > 0 ? TicketingError.GRACE_NOT_EXPIRED : null;
  }
  if (ticket.status === TICKET_STATUS.IN_SERVICE) {
    return String(reason ?? '').trim() ? null : TicketingError.REASON_REQUIRED;
  }
  return TicketingError.TICKET_UNAVAILABLE;
}

// A student may cancel a WAITING ticket (free) or a CALLED one, expired or not (an offense, R-11).
// An IN_SERVICE ticket is already being served and cannot be cancelled.
export function checkCancel({ ticket }) {
  const cancellable = ticket?.status === TICKET_STATUS.WAITING || ticket?.status === TICKET_STATUS.CALLED;
  return cancellable ? null : TicketingError.TICKET_UNAVAILABLE;
}
