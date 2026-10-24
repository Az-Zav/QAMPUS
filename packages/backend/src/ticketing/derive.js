// Values the schema does not store: they are derived from the queue doc (docs/SCHEMA.md, reading notes).
// Pure: no Firebase.

import { RULES, TICKET_STATUS } from '@qampus/core/domain';
import { shortTicketNumber } from './ids.js';

// Waiting is approximated as last_seq - last_called_seq (a cancelled ticket still counts until called past)
export const waitingCount = (queue) => (queue ? Math.max(0, queue.last_seq - queue.last_called_seq) : 0);

// People ahead of a WAITING ticket
export const peopleAhead = (ticket, queue) =>
  queue ? Math.max(0, ticket.daily_sequence - queue.last_called_seq - 1) : 0;

// Until a measured service average exists (slice 3), the office default is used
export const estimatedWaitMinutes = (people, office) => people * (office?.default_service_minutes ?? 0);

// "Now serving" short number, or null before anyone was called
export const nowServing = (office, queue) =>
  queue && queue.last_called_seq > 0 ? shortTicketNumber(office.code, queue.last_called_seq) : null;

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
