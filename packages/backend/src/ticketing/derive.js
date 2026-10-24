// Values the schema does not store: they are derived from the queue doc (docs/SCHEMA.md, reading notes).
// Pure: no Firebase.

import { TICKET_STATUS } from '@qampus/core/domain';
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
