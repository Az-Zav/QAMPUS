// Values the schema does not store: they are derived from the queue doc (docs/ARCHITECTURE.md, reading notes).
// Pure: no Firebase.

import { QUEUE_STATUS, RULES, TICKET_STATUS } from '@qampus/core/domain';
import { campusDayStart, nextOpening, todayHours } from '@qampus/core/format';
import { shortTicketNumber } from './ids.js';

// Waiting is approximated as last_seq - last_called_seq (a cancelled ticket still counts until called past)
export const waitingCount = (queue) => (queue ? Math.max(0, queue.last_seq - queue.last_called_seq) : 0);

// People ahead of a WAITING ticket
export const peopleAhead = (ticket, queue) =>
  queue ? Math.max(0, ticket.daily_sequence - queue.last_called_seq - 1) : 0;

// Average minutes per visit: measured from today's completed visits (the queue doc keeps their count and total
// seconds) once there are at least RULES.MIN_MEASURED_VISITS of them, and never below RULES.MIN_VISIT_MINUTES; until
// then the office default. Today only; the PRD says today and yesterday (a prototype simplification).
export function averageServiceMinutes(office, queue) {
  const done = queue?.completed_count ?? 0;
  const seconds = queue?.service_seconds_total ?? 0;
  if (done >= RULES.MIN_MEASURED_VISITS && seconds > 0) return Math.max(RULES.MIN_VISIT_MINUTES, seconds / done / 60);
  return office?.default_service_minutes ?? 0;
}

export const estimatedWaitMinutes = (people, office, queue = null) =>
  Math.round(people * averageServiceMinutes(office, queue));

export const CutoffReason = Object.freeze({
  PAST_CLOSING: 'PAST_CLOSING',
  NO_CAPACITY: 'NO_CAPACITY',
});

// Capacity cutoff (R-17..R-19). A new join is refused when the minutes left before the office closes, divided by
// the average visit, are fewer than the people waiting plus one. `cutoffAt` is the latest instant a join is still
// accepted with today's waiting count (it moves as the line changes). Staff can override it for the day
// (`queue.cutoff_overridden`). An office with no hours today has nothing to measure against, so no cutoff applies.
// `closesAtMinute` is the closing time as minutes since campus midnight; `nextOpen` the next opening day.
export function cutoffState({ office, queue, now = new Date() }) {
  const hours = todayHours(office?.hours, now);
  const avgMinutes = averageServiceMinutes(office, queue);
  const waiting = waitingCount(queue);
  const open = {
    canJoin: true,
    reason: null,
    avgMinutes,
    waiting,
    closesAtMinute: hours?.close_min ?? null,
    closesInMinutes: null,
    cutoffAt: null,
    nextOpen: nextOpening(office?.hours, now),
  };
  if (!hours) return open;

  const nowMs = new Date(now).getTime();
  const closeMs = campusDayStart(now).getTime() + hours.close_min * 60000;
  const cutoffAt = new Date(closeMs - (waiting + 1) * avgMinutes * 60000);
  const reason = closeMs <= nowMs ? CutoffReason.PAST_CLOSING : nowMs > cutoffAt.getTime() ? CutoffReason.NO_CAPACITY : null;
  const overridden = queue?.cutoff_overridden === true;
  return {
    ...open,
    canJoin: overridden || !reason,
    reason: overridden ? null : reason,
    closesInMinutes: (closeMs - nowMs) / 60000,
    cutoffAt,
  };
}

// "Now serving" short number, or null before anyone was called
export const nowServing = (office, queue) =>
  queue && queue.last_called_seq > 0 ? shortTicketNumber(office.code, queue.last_called_seq) : null;

// What the public display shows (D01): only ticket numbers, never names. `nowServing` is the ticket at the window
// (the queue's current ticket, its number is the id's last segment), or null; `next` is the following numbers still to
// be called, up to `nextCount`. Cancelled numbers can appear and a ticket called out of order is skipped past, the same
// accepted imprecision as the waiting count (the queue doc does not store who is waiting).
export function displayState({ office, queue, nextCount = 3 }) {
  const isOpen = queue?.status === QUEUE_STATUS.OPEN;
  const currentSeq = Number(String(queue?.current_ticket_id ?? '').split('_').pop()) || 0;
  const nowServing = currentSeq > 0 ? shortTicketNumber(office.code, currentSeq) : null;
  const first = Math.max(queue?.last_called_seq ?? 0, currentSeq) + 1;
  const last = Math.min(queue?.last_seq ?? 0, first + nextCount - 1);
  const next = [];
  for (let seq = first; seq <= last; seq += 1) next.push(shortTicketNumber(office.code, seq));
  return { isOpen, nowServing, next: isOpen ? next : [] };
}

// Waiting tickets in FIFO order (lowest number first)
export const waitingTickets = (tickets) =>
  tickets.filter((ticket) => ticket.status === TICKET_STATUS.WAITING).sort((a, b) => a.daily_sequence - b.daily_sequence);

// WAITING, CALLED and IN_SERVICE tickets are active: they count toward the three-ticket limit (R-07)
const ACTIVE_STATUSES = [TICKET_STATUS.WAITING, TICKET_STATUS.CALLED, TICKET_STATUS.IN_SERVICE];
export const isActiveTicket = (ticket) => ACTIVE_STATUSES.includes(ticket.status);

// How many more tickets the user may take
export const remainingSlots = (tickets) =>
  Math.max(0, RULES.MAX_ACTIVE_TICKETS - tickets.filter(isActiveTicket).length);

// Groups tickets into chunks of at most `size`, never putting two tickets of one holder in the same chunk
// (a holder's counter can only be lowered once per write)
export function chunkByHolder(tickets, size) {
  const chunks = [];
  let rest = [...tickets];
  while (rest.length) {
    const chunk = [];
    const holders = new Set();
    const left = [];
    for (const ticket of rest) {
      if (chunk.length < size && !holders.has(ticket.user_id)) {
        chunk.push(ticket);
        holders.add(ticket.user_id);
      } else {
        left.push(ticket);
      }
    }
    chunks.push(chunk);
    rest = left;
  }
  return chunks;
}
