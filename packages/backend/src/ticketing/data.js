// Firestore listeners for offices, queues and tickets. Each returns an unsubscribe function.
// Timestamps arrive as ISO strings, so views can pass them straight to `new Date()`.

import { collection, doc, limit, onSnapshot, query, where } from 'firebase/firestore';
import { campusDate } from '@qampus/core/format';
import { toPlain } from '../plain.js';
import { queueIdFor } from './ids.js';

// Today's queue doc for one office; null when staff have not opened the queue
export function watchQueue(db, officeId, now, onData, onError) {
  return onSnapshot(
    doc(db, 'queues', queueIdFor(officeId, now)),
    (snap) => onData(snap.exists() ? toPlain(snap) : null),
    onError,
  );
}

// All offices plus today's queue per office: onData({ offices: [...], queues: { [officeId]: queue | null } }).
// A queue that has not arrived yet is missing from `queues`, which readers treat as closed.
export function watchBoard(db, now, onData, onError) {
  let offices = [];
  const queues = new Map();
  const stops = new Map();
  const emit = () => onData({ offices, queues: Object.fromEntries(queues) });

  const stopOffices = onSnapshot(
    collection(db, 'offices'),
    (snap) => {
      offices = snap.docs.map(toPlain);
      const ids = new Set(offices.map((office) => office.id));
      for (const [id, stop] of stops) {
        if (!ids.has(id)) {
          stop();
          stops.delete(id);
          queues.delete(id);
        }
      }
      for (const id of ids) {
        if (stops.has(id)) continue;
        stops.set(
          id,
          watchQueue(
            db,
            id,
            now,
            (queue) => {
              queues.set(id, queue);
              emit();
            },
            onError,
          ),
        );
      }
      emit();
    },
    onError,
  );

  return () => {
    stopOffices();
    stops.forEach((stop) => stop());
    stops.clear();
  };
}

// Every ticket the user holds (any day); callers split active from finished
export function watchMyTickets(db, uid, onData, onError) {
  return onSnapshot(
    query(collection(db, 'tickets'), where('user_id', '==', uid)),
    (snap) => onData(snap.docs.map(toPlain)),
    onError,
  );
}

// Every ticket of an office for the campus day of `now` (staff queue screen); callers split waiting from current
export function watchOfficeTickets(db, officeId, now, onData, onError) {
  return onSnapshot(
    query(collection(db, 'tickets'), where('office_id', '==', officeId), where('queue_date', '==', campusDate(now).key)),
    (snap) => onData(snap.docs.map(toPlain)),
    onError,
  );
}

// The office whose code is `code` (the public display's address, /display/R), live: onData(office | null).
// The code is looked up in capitals, as offices store it.
export function watchOfficeByCode(db, code, onData, onError) {
  return onSnapshot(
    query(collection(db, 'offices'), where('code', '==', String(code ?? '').trim().toUpperCase()), limit(1)),
    (snap) => onData(snap.empty ? null : toPlain(snap.docs[0])),
    onError,
  );
}
