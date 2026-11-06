// The check-in QR (R-20): what the public display encodes and what the student app reads back. Pure, no Firebase,
// unit tested. One place for the format, so the two sides cannot drift apart.

import { TICKET_STATUS } from '@qampus/core/domain';
import { getRemainingSeconds } from '@qampus/core/ticket';
import { TicketingError } from './preflight.js';

// Payload for an office's QR: qampus://check-in/{office code}/{6-digit check-in code}
export const checkInPayload = (office) => `qampus://check-in/${office.code}/${office.check_in_code}`;

const PAYLOAD = /^qampus:\/\/check-in\/([A-Za-z0-9]+)\/(\d{6})$/;

// The office code (capitals) and the 6 digits inside a scanned QR, or null when it is not one of ours
export function parseCheckInPayload(data) {
  const match = PAYLOAD.exec(String(data ?? '').trim());
  return match ? { officeCode: match[1].toUpperCase(), code: match[2] } : null;
}

// Which called ticket a check-in is for, when several offices call the student at once (BUG-022).
// A scanned QR names its office: only that office's called ticket can match, else WRONG_OFFICE.
// A typed code is matched to the called ticket whose office has that code; with no match, every called
// ticket stays a candidate so the check-in can still explain itself (INVALID_CODE, GRACE_EXPIRED).
// Among candidates a ticket still in its grace period comes first.
// Returns { ticket, office } or { error } (a TicketingError code). `now` is in ms.
export function pickCheckInTicket({ tickets, offices, code, officeCode = null, now = Date.now() }) {
  const officeOf = (ticket) => offices.find((o) => o.id === ticket.office_id) ?? null;
  const called = tickets.filter((ticket) => ticket.status === TICKET_STATUS.CALLED);
  if (called.length === 0) return { error: TicketingError.NOT_CALLED };

  let candidates;
  if (officeCode) {
    const wanted = String(officeCode).toUpperCase();
    candidates = called.filter((t) => String(officeOf(t)?.code ?? '').toUpperCase() === wanted);
    if (candidates.length === 0) return { error: TicketingError.WRONG_OFFICE };
  } else {
    const typed = String(code ?? '').replace(/\D/g, '');
    const matching = called.filter((t) => typed && String(officeOf(t)?.check_in_code ?? '') === typed);
    candidates = matching.length > 0 ? matching : called;
  }

  const ticket = candidates.find((t) => getRemainingSeconds(t.called_at, now) > 0) ?? candidates[0];
  return { ticket, office: officeOf(ticket) };
}
