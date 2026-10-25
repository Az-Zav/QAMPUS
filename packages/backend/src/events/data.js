// Activity log reads (staff Activity Log). Pages of 50, newest first, Gmail style: page 1 is a live listener,
// older pages are one-time reads that start after the last document of the page before. The queries need the
// composite indexes in firestore.indexes.json (office_id + created_at, and office_id + action + created_at).

import { collection, getDocs, limit, onSnapshot, orderBy, query, startAfter, where } from 'firebase/firestore';
import { toPlain } from '../plain.js';
import { EVENTS_PAGE_SIZE } from './build.js';

// `filters`: { action?, from?, to? }; `from` and `to` are Dates (from inclusive, to exclusive)
function pageQuery(db, officeId, { action = null, from = null, to = null } = {}, after = null) {
  const parts = [where('office_id', '==', officeId)];
  if (action) parts.push(where('action', '==', action));
  if (from) parts.push(where('created_at', '>=', from));
  if (to) parts.push(where('created_at', '<', to));
  parts.push(orderBy('created_at', 'desc'));
  if (after) parts.push(startAfter(after));
  parts.push(limit(EVENTS_PAGE_SIZE));
  return query(collection(db, 'events'), ...parts);
}

// A page: plain events, the cursor to start the next page after, and whether a next page may exist
function toPage(snap) {
  return {
    events: snap.docs.map(toPlain),
    cursor: snap.docs[snap.docs.length - 1] ?? null,
    hasMore: snap.docs.length === EVENTS_PAGE_SIZE,
  };
}

// Page 1, live: onData(page) on every change (a new event appears at the top)
export function watchOfficeEvents(db, officeId, filters, onData, onError) {
  return onSnapshot(pageQuery(db, officeId, filters), (snap) => onData(toPage(snap)), onError);
}

// An older page, once: the 50 events after `after` (the cursor of the page before)
export async function loadEventsPage(db, officeId, filters, after) {
  return toPage(await getDocs(pageQuery(db, officeId, filters, after)));
}
