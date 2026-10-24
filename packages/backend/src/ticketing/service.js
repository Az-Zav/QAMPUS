// Ticketing writes. Staff open and close today's queue; students join it. Security Rules (firestore.rules)
// decide what is allowed; preflight only supplies readable reasons. Every function takes `db` first.
//
// The three-ticket limit (R-07) is a counter on the student's users doc, `active_count`. A join raises it by
// one in the same write as the ticket (Security Rules require that); every write that takes a ticket out of the
// active states (complete, no-show, cancel, office cancel) lowers it by one in the same transaction.
// `active_offices` (office id -> true) holds the offices where the student has an active ticket, so a student
// cannot join the same office twice; it is set by a join and cleared by the same writes that lower the counter.

import { CANCELLED_BY, QUEUE_STATUS, TICKET_STATUS } from '@qampus/core/domain';
import { campusDate } from '@qampus/core/format';
import {
  collection,
  deleteField,
  doc,
  getDocs,
  increment,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { buildOffense, OFFENSE_TYPE } from '../penalties/offense.js';
import { nextPenalty } from '../penalties/progress.js';
import { chunkByHolder, isActiveTicket, waitingTickets } from './derive.js';
import { queueIdFor, ticketIdFor, ticketNumberFor } from './ids.js';
import {
  checkCall,
  checkCancel,
  checkCheckIn,
  checkComplete,
  checkJoin,
  checkNoShow,
  checkVerifyById,
  TicketingError,
  TicketingFailure,
} from './preflight.js';

// Firestore refusals become a TicketingFailure with a code the UI can map to copy
function asFailure(error) {
  if (error instanceof TicketingFailure) return error;
  return new TicketingFailure(error?.code === 'permission-denied' ? TicketingError.DENIED : TicketingError.UNKNOWN);
}

// A ticket leaves the active states: give its holder's slot back and clear the office from their active
// offices (inside the same transaction)
// `extra` carries the strike and ban fields when the ticket ends in an offense.
function releaseHolder(db, tx, ticket, extra = {}) {
  tx.update(doc(db, 'users', ticket.user_id), {
    active_count: increment(-1),
    [`active_offices.${ticket.office_id}`]: deleteField(),
    ...extra,
  });
}

// The strike and ban fields of a student's profile after one more offense (banned_until only when it causes a ban)
const penaltyFields = (penalty) => ({
  strike_count: penalty.strike_count,
  ...(penalty.banned_until ? { banned_until: penalty.banned_until } : {}),
});

// The offense document, created with the ticket change that causes it (same id as the ticket)
function recordOffense(db, tx, ticket, type, penalty) {
  tx.set(doc(db, 'offenses', ticket.id), {
    ...buildOffense({ ticket, type, resultedInBan: penalty.resulted_in_ban }),
    created_at: serverTimestamp(),
  });
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

// Student: take the next number in today's queue. The queue bump, the ticket and the student's counter are one
// atomic write, and the ticket id includes the number, so two students can never end up with the same one.
// `user` needs { id, name, institutional_id }; `office` needs { id, code, name, status }.
export async function joinQueue(db, { user, office, now = new Date() }) {
  const queueRef = doc(db, 'queues', queueIdFor(office.id, now));
  const userRef = doc(db, 'users', user.id);
  try {
    return await runTransaction(db, async (tx) => {
      const snap = await tx.get(queueRef);
      const userSnap = await tx.get(userRef);
      const profile = userSnap.exists() ? userSnap.data() : {};
      const activeCount = profile.active_count ?? 0;
      const reason = checkJoin({
        user,
        office,
        queue: snap.exists() ? snap.data() : null,
        activeCount,
        activeOffices: profile.active_offices ?? {},
        bannedUntil: profile.banned_until?.toDate?.() ?? null,
        now,
      });
      if (reason) throw new TicketingFailure(reason);

      const seq = snap.data().last_seq + 1;
      const ticketRef = doc(db, 'tickets', ticketIdFor(queueRef.id, seq));
      const ticketNumber = ticketNumberFor(office.code, now, seq);

      tx.update(queueRef, { last_seq: seq, updated_at: serverTimestamp() });
      // An exact number, not increment(1): the ticket rule reads the counter as it will be after this write
      // (getAfter) and compares it with the old value plus one
      tx.update(userRef, { active_count: activeCount + 1, [`active_offices.${office.id}`]: true });
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

// CALLED -> IN_SERVICE. Rules allow it only inside the grace period (called_at + 60 s, by server time).
async function startService(db, ticketId) {
  try {
    await updateDoc(doc(db, 'tickets', ticketId), {
      status: TICKET_STATUS.IN_SERVICE,
      service_started_at: serverTimestamp(),
    });
  } catch (error) {
    throw asFailure(error);
  }
}

// Student: check in with the office code (QR payload or typed digits). `ticket` is the user's CALLED
// ticket and `office` its office record. The code is not secret (R-20), so the check here is a courtesy.
export async function checkInByCode(db, { ticket, office, code, now = new Date() }) {
  const reason = checkCheckIn({ ticket, office, code, now });
  if (reason) throw new TicketingFailure(reason);
  await startService(db, ticket.id);
}

// Staff: verify the called ticket by the holder's student or guest ID.
export async function verifyByHolderId(db, { ticket, idNumber, now = new Date() }) {
  const reason = checkVerifyById({ ticket, idNumber, now });
  if (reason) throw new TicketingFailure(reason);
  await startService(db, ticket.id);
}

// Staff: finish service. The ticket becomes COMPLETED, the window is freed and the holder's slot is released in
// one atomic write; the queue also counts the visit and its length, which later feed the service-time average.
export async function completeTicket(db, { office, ticket, now = new Date() }) {
  const queueRef = doc(db, 'queues', queueIdFor(office.id, now));
  const ticketRef = doc(db, 'tickets', ticket.id);
  try {
    await runTransaction(db, async (tx) => {
      const queueSnap = await tx.get(queueRef);
      const ticketSnap = await tx.get(ticketRef);
      const current = ticketSnap.exists() ? { id: ticketSnap.id, ...ticketSnap.data() } : null;
      const reason = checkComplete({ ticket: current, queue: queueSnap.exists() ? queueSnap.data() : null });
      if (reason) throw new TicketingFailure(reason);

      const startedAt = ticketSnap.data().service_started_at?.toMillis?.() ?? now.getTime();
      const seconds = Math.max(0, Math.round((now.getTime() - startedAt) / 1000));
      tx.update(queueRef, {
        current_ticket_id: null,
        completed_count: increment(1),
        service_seconds_total: increment(seconds),
        updated_at: serverTimestamp(),
      });
      releaseHolder(db, tx, current);
      tx.update(ticketRef, { status: TICKET_STATUS.COMPLETED, completed_at: serverTimestamp() });
    });
  } catch (error) {
    throw asFailure(error);
  }
}

// Staff: mark the current ticket a no-show, free the window, release the holder's slot and record the offense
// (R-11, R-12, R-23a): the holder's strikes move in the same transaction, and the second offense sets the ban.
export async function markTicketNoShow(db, { office, ticket, reason = '', now = new Date() }) {
  const queueRef = doc(db, 'queues', queueIdFor(office.id, now));
  const ticketRef = doc(db, 'tickets', ticket.id);
  const userRef = doc(db, 'users', ticket.user_id);
  try {
    await runTransaction(db, async (tx) => {
      const queueSnap = await tx.get(queueRef);
      const ticketSnap = await tx.get(ticketRef);
      const userSnap = await tx.get(userRef);
      const current = ticketSnap.exists() ? { id: ticketSnap.id, ...ticketSnap.data() } : null;
      const failure = checkNoShow({ ticket: current, queue: queueSnap.exists() ? queueSnap.data() : null, reason, now });
      if (failure) throw new TicketingFailure(failure);

      const penalty = nextPenalty(userSnap.exists() ? userSnap.data() : null, now);
      const trimmed = reason.trim();
      tx.update(queueRef, { current_ticket_id: null, updated_at: serverTimestamp() });
      releaseHolder(db, tx, current, penaltyFields(penalty));
      recordOffense(db, tx, current, OFFENSE_TYPE.NO_SHOW, penalty);
      tx.update(ticketRef, {
        status: TICKET_STATUS.NO_SHOW,
        no_show_at: serverTimestamp(),
        ...(trimmed ? { reason: trimmed } : {}),
      });
    });
  } catch (error) {
    throw asFailure(error);
  }
}

// Student: cancel their own ticket and give the slot back. Cancelling while WAITING is free. A CALLED ticket is
// at the window, so the same write also frees the window, and it is an offense (R-11): the offense and the
// student's strikes and ban are written in the same transaction.
export async function cancelOwnTicket(db, { ticket, now = new Date() }) {
  const failure = checkCancel({ ticket });
  if (failure) throw new TicketingFailure(failure);

  const ticketRef = doc(db, 'tickets', ticket.id);
  const userRef = doc(db, 'users', ticket.user_id);
  const cancelled = { status: TICKET_STATUS.CANCELLED, cancelled_by: CANCELLED_BY.USER, cancelled_at: serverTimestamp() };
  try {
    await runTransaction(db, async (tx) => {
      const ticketSnap = await tx.get(ticketRef);
      const current = ticketSnap.exists() ? { id: ticketSnap.id, ...ticketSnap.data() } : null;
      const stillFailure = checkCancel({ ticket: current });
      if (stillFailure) throw new TicketingFailure(stillFailure);

      if (current.status === TICKET_STATUS.CALLED) {
        const queueRef = doc(db, 'queues', `${current.office_id}_${current.queue_date}`);
        const queueSnap = await tx.get(queueRef);
        const userSnap = await tx.get(userRef);
        if (!queueSnap.exists() || queueSnap.data().current_ticket_id !== current.id) {
          throw new TicketingFailure(TicketingError.TICKET_UNAVAILABLE);
        }
        const penalty = nextPenalty(userSnap.exists() ? userSnap.data() : null, now);
        tx.update(queueRef, { current_ticket_id: null, updated_at: serverTimestamp() });
        releaseHolder(db, tx, current, penaltyFields(penalty));
        recordOffense(db, tx, current, OFFENSE_TYPE.CANCELLED_AFTER_CALL, penalty);
      } else {
        releaseHolder(db, tx, current);
      }
      tx.update(ticketRef, cancelled);
    });
  } catch (error) {
    throw asFailure(error);
  }
}

// Staff: cancel the whole queue (R-16), nobody penalized. Step 1 closes the queue and cancels the ticket at the
// window (if any) in one transaction, so no one can join and the window is clear. Step 2 cancels the waiting
// tickets in small transactions: each cancellation also releases its holder's slot, and Security Rules allow only
// a handful of document lookups per write. A holder never appears twice in one transaction (their counter would
// be lowered twice in one write). The reason is stored on every cancelled ticket. Running it again finishes
// whatever an interrupted run left behind.
export async function cancelOfficeQueue(db, { office, reason, now = new Date() }) {
  const trimmed = String(reason ?? '').trim();
  if (!trimmed) throw new TicketingFailure(TicketingError.REASON_REQUIRED);

  const queueRef = doc(db, 'queues', queueIdFor(office.id, now));
  const cancelled = () => ({
    status: TICKET_STATUS.CANCELLED,
    cancelled_by: CANCELLED_BY.OFFICE,
    cancelled_at: serverTimestamp(),
    reason: trimmed,
  });

  try {
    await runTransaction(db, async (tx) => {
      const queueSnap = await tx.get(queueRef);
      if (!queueSnap.exists()) return; // never opened today: nothing to cancel
      const queue = queueSnap.data();
      if (queue.status === QUEUE_STATUS.CLOSED && !queue.current_ticket_id) return;

      let current = null;
      if (queue.current_ticket_id) {
        const currentSnap = await tx.get(doc(db, 'tickets', queue.current_ticket_id));
        if (currentSnap.exists() && isActiveTicket(currentSnap.data())) {
          current = { id: currentSnap.id, ...currentSnap.data() };
        }
      }
      tx.update(queueRef, { status: QUEUE_STATUS.CLOSED, current_ticket_id: null, updated_at: serverTimestamp() });
      if (current) {
        releaseHolder(db, tx, current);
        tx.update(doc(db, 'tickets', current.id), cancelled());
      }
    });

    const todays = await getDocs(
      query(collection(db, 'tickets'), where('office_id', '==', office.id), where('queue_date', '==', campusDate(now).key)),
    );
    const waiting = todays.docs.map((d) => ({ id: d.id, ...d.data() })).filter((t) => t.status === TICKET_STATUS.WAITING);

    for (const chunk of chunkByHolder(waiting, 3)) {
      await runTransaction(db, async (tx) => {
        const snaps = await Promise.all(chunk.map((t) => tx.get(doc(db, 'tickets', t.id))));
        for (const snap of snaps) {
          if (!snap.exists() || snap.data().status !== TICKET_STATUS.WAITING) continue;
          releaseHolder(db, tx, { id: snap.id, ...snap.data() });
          tx.update(snap.ref, cancelled());
        }
      });
    }
  } catch (error) {
    throw asFailure(error);
  }
}
