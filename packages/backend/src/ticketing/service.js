// Ticketing writes. Staff open and close today's queue; students join it. Security Rules (firestore.rules)
// decide what is allowed; preflight only supplies readable reasons. Every function takes `db` first.

import { QUEUE_STATUS, TICKET_STATUS } from '@qampus/core/domain';
import { campusDate } from '@qampus/core/format';
import { doc, runTransaction, serverTimestamp, updateDoc } from 'firebase/firestore';
import { queueIdFor, ticketIdFor, ticketNumberFor } from './ids.js';
import { waitingTickets } from './derive.js';
import { checkCall, checkJoin, TicketingError, TicketingFailure } from './preflight.js';

// Firestore refusals become a TicketingFailure with a code the UI can map to copy
function asFailure(error) {
  if (error instanceof TicketingFailure) return error;
  return new TicketingFailure(error?.code === 'permission-denied' ? TicketingError.DENIED : TicketingError.UNKNOWN);
}

// Staff: open today's queue. Creates the doc on the first open of the day, reopens a closed one.
export async function openQueue(db, office, now = new Date()) {
  const ref = doc(db, 'queues', queueIdFor(office.id, now));
  try {
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists()) {
        tx.set(ref, {
          status: QUEUE_STATUS.OPEN,
          last_seq: 0,
          last_called_seq: 0,
          current_ticket_id: null,
          cutoff_overridden: false,
          completed_count: 0,
          service_seconds_total: 0,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        });
      } else if (snap.data().status !== QUEUE_STATUS.OPEN) {
        tx.update(ref, { status: QUEUE_STATUS.OPEN, updated_at: serverTimestamp() });
      }
    });
  } catch (error) {
    throw asFailure(error);
  }
}

// Staff: stop new joins. Tickets already issued stay valid. A queue that was never opened is already closed.
export async function closeQueue(db, office, now = new Date()) {
  try {
    await updateDoc(doc(db, 'queues', queueIdFor(office.id, now)), {
      status: QUEUE_STATUS.CLOSED,
      updated_at: serverTimestamp(),
    });
  } catch (error) {
    if (error?.code !== 'not-found') throw asFailure(error);
  }
}

// Student: take the next number in today's queue. The queue bump and the ticket are one atomic write,
// and the ticket id includes the number, so two students can never end up with the same one.
// `user` needs { id, name, institutional_id }; `office` needs { id, code, name, status }.
export async function joinQueue(db, { user, office, now = new Date() }) {
  const queueRef = doc(db, 'queues', queueIdFor(office.id, now));
  try {
    return await runTransaction(db, async (tx) => {
      const snap = await tx.get(queueRef);
      const reason = checkJoin({ user, office, queue: snap.exists() ? snap.data() : null });
      if (reason) throw new TicketingFailure(reason);

      const seq = snap.data().last_seq + 1;
      const ticketRef = doc(db, 'tickets', ticketIdFor(queueRef.id, seq));
      const ticketNumber = ticketNumberFor(office.code, now, seq);

      tx.update(queueRef, { last_seq: seq, updated_at: serverTimestamp() });
      tx.set(ticketRef, {
        office_id: office.id,
        office_name: office.name,
        queue_date: campusDate(now).key,
        user_id: user.id,
        holder_name: user.name,
        holder_institutional_id: user.institutional_id,
        daily_sequence: seq,
        ticket_number: ticketNumber,
        status: TICKET_STATUS.WAITING,
        joined_at: serverTimestamp(),
      });
      return { id: ticketRef.id, ticket_number: ticketNumber };
    });
  } catch (error) {
    throw asFailure(error);
  }
}

// Staff: call one WAITING ticket to the window. The queue (current ticket, last called number) and the
// ticket (CALLED, called_at) change in one atomic write, so two staff cannot call different tickets.
export async function callTicket(db, { office, ticketId, now = new Date() }) {
  const queueRef = doc(db, 'queues', queueIdFor(office.id, now));
  const ticketRef = doc(db, 'tickets', ticketId);
  try {
    await runTransaction(db, async (tx) => {
      const [queueSnap, ticketSnap] = await Promise.all([tx.get(queueRef), tx.get(ticketRef)]);
      const queue = queueSnap.exists() ? queueSnap.data() : null;
      const ticket = ticketSnap.exists() ? ticketSnap.data() : null;
      const reason = checkCall({ officeId: office.id, queue, ticket });
      if (reason) throw new TicketingFailure(reason);

      tx.update(queueRef, {
        last_called_seq: Math.max(queue.last_called_seq, ticket.daily_sequence),
        current_ticket_id: ticketRef.id,
        updated_at: serverTimestamp(),
      });
      tx.update(ticketRef, { status: TICKET_STATUS.CALLED, called_at: serverTimestamp() });
    });
  } catch (error) {
    throw asFailure(error);
  }
}

// Staff: call the first waiting ticket (FIFO). `tickets` are the office's tickets for today.
export async function callNext(db, { office, tickets, now = new Date() }) {
  const [first] = waitingTickets(tickets);
  if (!first) throw new TicketingFailure(TicketingError.TICKET_UNAVAILABLE);
  await callTicket(db, { office, ticketId: first.id, now });
}
