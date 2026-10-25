// Ticketing writes. Staff open and close today's queue; students join it. Security Rules (firestore.rules)
// decide what is allowed; preflight only supplies readable reasons. Every function takes `db` first.
//
// The three-ticket limit (R-07) is a counter on the student's users doc, `active_count`. A join raises it by
// one in the same write as the ticket (Security Rules require that); every write that takes a ticket out of the
// active states (complete, no-show, cancel, office cancel) lowers it by one in the same transaction.
// `active_offices` (office id -> true) holds the offices where the student has an active ticket, so a student
// cannot join the same office twice; it is set by a join and cleared by the same writes that lower the counter.

import { ACTIVITY_ACTION, CANCELLED_BY, NOTIFICATION_TYPE, QUEUE_STATUS, RULES, TICKET_STATUS } from '@qampus/core/domain';
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
  where,
  writeBatch,
} from 'firebase/firestore';
import { EVENT_ENTITY } from '../events/build.js';
import { logEvent } from '../events/service.js';
import { approachingTicket } from '../notifications/build.js';
import { notify } from '../notifications/service.js';
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

// The activity log line for a change to one ticket / to the queue, saved with the change (events/service.js)
const logTicket = (db, target, ticket, actor, action, { from = null, to = null, reason = null } = {}) =>
  logEvent(db, target, {
    entity: EVENT_ENTITY.TICKET,
    entityId: ticket.id,
    action,
    officeId: ticket.office_id,
    ticketNumber: ticket.ticket_number,
    from,
    to,
    actor,
    reason,
  });

const logQueue = (db, target, queueRef, officeId, actor, action, reason = null) =>
  logEvent(db, target, { entity: EVENT_ENTITY.QUEUE, entityId: queueRef.id, action, officeId, actor, reason });

// Staff: open today's queue. Creates the doc on the first open of the day, reopens a closed one.
// `actor` is { uid, name } of the signed-in person; it names who did it in the activity log.
export async function openQueue(db, office, actor, now = new Date()) {
  const ref = doc(db, 'queues', queueIdFor(office.id, now));
  try {
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      if (snap.exists() && snap.data().status === QUEUE_STATUS.OPEN) return;
      logQueue(db, tx, ref, office.id, actor, ACTIVITY_ACTION.QUEUE_OPENED);
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
      } else {
        tx.update(ref, { status: QUEUE_STATUS.OPEN, updated_at: serverTimestamp() });
      }
    });
  } catch (error) {
    throw asFailure(error);
  }
}

// Staff: stop new joins. Tickets already issued stay valid. A queue that was never opened is already closed.
export async function closeQueue(db, office, actor, now = new Date()) {
  const ref = doc(db, 'queues', queueIdFor(office.id, now));
  try {
    const batch = writeBatch(db);
    batch.update(ref, { status: QUEUE_STATUS.CLOSED, updated_at: serverTimestamp() });
    logQueue(db, batch, ref, office.id, actor, ACTIVITY_ACTION.QUEUE_CLOSED);
    await batch.commit();
  } catch (error) {
    if (error?.code !== 'not-found') throw asFailure(error);
  }
}

// Staff: let students join past the capacity cutoff for the rest of the day (R-19). One write plus its log line.
export async function overrideCutoff(db, office, actor, now = new Date()) {
  const ref = doc(db, 'queues', queueIdFor(office.id, now));
  try {
    const batch = writeBatch(db);
    batch.update(ref, { cutoff_overridden: true, updated_at: serverTimestamp() });
    logQueue(db, batch, ref, office.id, actor, ACTIVITY_ACTION.CUTOFF_OVERRIDE);
    await batch.commit();
  } catch (error) {
    throw asFailure(error);
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
      // The stored office carries the hours and the default visit length the capacity cutoff needs
      const officeSnap = await tx.get(doc(db, 'offices', office.id));
      const profile = userSnap.exists() ? userSnap.data() : {};
      const activeCount = profile.active_count ?? 0;
      const reason = checkJoin({
        user,
        office: officeSnap.exists() ? { ...office, ...officeSnap.data() } : office,
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
      logTicket(
        db,
        tx,
        { id: ticketRef.id, office_id: office.id, ticket_number: ticketNumber },
        { uid: user.id, name: user.name },
        ACTIVITY_ACTION.JOINED,
        { to: TICKET_STATUS.WAITING },
      );
      notify(db, tx, user.id, NOTIFICATION_TYPE.QUEUE_CONFIRMED, {
        ticket: { id: ticketRef.id, office_id: office.id, office_name: office.name, ticket_number: ticketNumber },
      });
      return { id: ticketRef.id, ticket_number: ticketNumber };
    });
  } catch (error) {
    throw asFailure(error);
  }
}

// Staff: call one WAITING ticket to the window. The queue (current ticket, last called number) and the
// ticket (CALLED, called_at) change in one atomic write, so two staff cannot call different tickets.
// `override` marks a call out of order (logged as OVERRIDE); `reason` is kept on that log line. The called
// student is told it is their turn; `tickets` (the office's tickets for today) lets the student a few places
// back be told theirs is near.
export async function callTicket(
  db,
  { office, ticketId, actor, tickets = [], override = false, reason = null, now = new Date() },
) {
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
      logTicket(
        db,
        tx,
        { id: ticketRef.id, ...ticket },
        actor,
        override ? ACTIVITY_ACTION.OVERRIDE : ACTIVITY_ACTION.CALLED,
        { from: TICKET_STATUS.WAITING, to: TICKET_STATUS.CALLED, reason },
      );
      notify(db, tx, ticket.user_id, NOTIFICATION_TYPE.YOUR_TURN, { ticket: { id: ticketRef.id, ...ticket } });
      const near = approachingTicket(waitingTickets(tickets), ticketRef.id);
      if (near && near.user_id !== ticket.user_id) {
        notify(db, tx, near.user_id, NOTIFICATION_TYPE.APPROACHING_TURN, { ticket: near, position: RULES.APPROACHING_PLACE });
      }
    });
  } catch (error) {
    throw asFailure(error);
  }
}

// Staff: call the first waiting ticket (FIFO). `tickets` are the office's tickets for today.
export async function callNext(db, { office, tickets, actor, now = new Date() }) {
  const [first] = waitingTickets(tickets);
  if (!first) throw new TicketingFailure(TicketingError.TICKET_UNAVAILABLE);
  await callTicket(db, { office, ticketId: first.id, actor, tickets, now });
}

// CALLED -> IN_SERVICE. Rules allow it only inside the grace period (called_at + 60 s, by server time).
// `actor` is the student who checked in or the staff member who verified.
async function startService(db, ticket, actor) {
  try {
    const batch = writeBatch(db);
    batch.update(doc(db, 'tickets', ticket.id), {
      status: TICKET_STATUS.IN_SERVICE,
      service_started_at: serverTimestamp(),
    });
    logTicket(db, batch, ticket, actor, ACTIVITY_ACTION.SERVICE_STARTED, {
      from: TICKET_STATUS.CALLED,
      to: TICKET_STATUS.IN_SERVICE,
    });
    await batch.commit();
  } catch (error) {
    throw asFailure(error);
  }
}

// Student: check in with the office code (QR payload or typed digits). `ticket` is the user's CALLED
// ticket and `office` its office record. The code is not secret (R-20), so the check here is a courtesy.
export async function checkInByCode(db, { ticket, office, code, now = new Date() }) {
  const reason = checkCheckIn({ ticket, office, code, now });
  if (reason) throw new TicketingFailure(reason);
  await startService(db, ticket, { uid: ticket.user_id, name: ticket.holder_name });
}

// Staff: verify the called ticket by the holder's student or guest ID.
export async function verifyByHolderId(db, { ticket, idNumber, actor, now = new Date() }) {
  const reason = checkVerifyById({ ticket, idNumber, now });
  if (reason) throw new TicketingFailure(reason);
  await startService(db, ticket, actor);
}

// Staff: finish service. The ticket becomes COMPLETED, the window is freed and the holder's slot is released in
// one atomic write; the queue also counts the visit and its length, which later feed the service-time average.
export async function completeTicket(db, { office, ticket, actor, now = new Date() }) {
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
      logTicket(db, tx, current, actor, ACTIVITY_ACTION.COMPLETED, {
        from: TICKET_STATUS.IN_SERVICE,
        to: TICKET_STATUS.COMPLETED,
      });
    });
  } catch (error) {
    throw asFailure(error);
  }
}

// Staff: mark the current ticket a no-show, free the window, release the holder's slot and record the offense
// (R-11, R-12, R-23a): the holder's strikes move in the same transaction, and the second offense sets the ban.
export async function markTicketNoShow(db, { office, ticket, actor, reason = '', now = new Date() }) {
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
      logTicket(db, tx, current, actor, ACTIVITY_ACTION.NO_SHOW, {
        from: current.status,
        to: TICKET_STATUS.NO_SHOW,
        reason: trimmed,
      });
      notify(db, tx, current.user_id, NOTIFICATION_TYPE.NO_SHOW, {
        ticket: current,
        resultedInBan: penalty.resulted_in_ban,
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
        notify(db, tx, current.user_id, NOTIFICATION_TYPE.WARNING, {
          ticket: current,
          resultedInBan: penalty.resulted_in_ban,
        });
      } else {
        releaseHolder(db, tx, current);
      }
      tx.update(ticketRef, cancelled);
      logTicket(db, tx, current, { uid: current.user_id, name: current.holder_name }, ACTIVITY_ACTION.CANCELLED, {
        from: current.status,
        to: TICKET_STATUS.CANCELLED,
      });
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
export async function cancelOfficeQueue(db, { office, reason, actor, now = new Date() }) {
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
      // One log line for the whole cancellation, not one per ticket (after the reads: a transaction reads first)
      logQueue(db, tx, queueRef, office.id, actor, ACTIVITY_ACTION.QUEUE_CANCELLED, trimmed);
      tx.update(queueRef, { status: QUEUE_STATUS.CLOSED, current_ticket_id: null, updated_at: serverTimestamp() });
      if (current) {
        releaseHolder(db, tx, current);
        tx.update(doc(db, 'tickets', current.id), cancelled());
        notify(db, tx, current.user_id, NOTIFICATION_TYPE.QUEUE_CANCELLED, { ticket: current, reason: trimmed });
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
          const waitingTicket = { id: snap.id, ...snap.data() };
          releaseHolder(db, tx, waitingTicket);
          tx.update(snap.ref, cancelled());
          notify(db, tx, waitingTicket.user_id, NOTIFICATION_TYPE.QUEUE_CANCELLED, { ticket: waitingTicket, reason: trimmed });
        }
      });
    }
  } catch (error) {
    throw asFailure(error);
  }
}
