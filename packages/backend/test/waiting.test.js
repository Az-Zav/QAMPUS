import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cutoffState, displayState, peopleAhead, waitingCount, waitingSeqs } from '../src/ticketing/derive.js';

const office = { code: 'R', default_service_minutes: 5 };

// The 2026-11-05 test: R-016 and R-017 waiting, R-018 called out of order (override), R-019 waiting
const afterOverride = {
  status: 'OPEN',
  last_seq: 19,
  last_called_seq: 18,
  current_ticket_id: 'off_reg_001_20261105_18',
  waiting_seqs: [16, 17, 19],
};

test('the waiting list is read lowest first, and null when the queue doc has none', () => {
  assert.deepEqual(waitingSeqs({ waiting_seqs: [19, 16, 17] }), [16, 17, 19]);
  assert.deepEqual(waitingSeqs({ waiting_seqs: [] }), []);
  assert.equal(waitingSeqs({ last_seq: 3, last_called_seq: 1 }), null);
  assert.equal(waitingSeqs(null), null);
});

test('after an override the count and people ahead still include the people passed over', () => {
  assert.equal(waitingCount(afterOverride), 3);
  assert.equal(peopleAhead({ daily_sequence: 19 }, afterOverride), 2);
  assert.equal(peopleAhead({ daily_sequence: 17 }, afterOverride), 1);
  assert.equal(peopleAhead({ daily_sequence: 16 }, afterOverride), 0);
});

test('a cancelled number no longer counts once it is off the list', () => {
  const queue = { ...afterOverride, waiting_seqs: [16, 17] };
  assert.equal(waitingCount(queue), 2);
  assert.deepEqual(displayState({ office, queue }).next, ['R-016', 'R-017']);
});

test('the display lists the lowest waiting numbers, not the numbers after the last call', () => {
  assert.deepEqual(displayState({ office, queue: afterOverride }).next, ['R-016', 'R-017', 'R-019']);
  assert.deepEqual(displayState({ office, queue: afterOverride, nextCount: 2 }).next, ['R-016', 'R-017']);
});

test('the display never says nobody is waiting while someone is', () => {
  // R-021 completed after the override run: last_called_seq caught up with last_seq, yet two people wait
  const queue = { status: 'OPEN', last_seq: 21, last_called_seq: 21, current_ticket_id: null, waiting_seqs: [16, 17] };
  assert.equal(waitingCount(queue), 2);
  assert.deepEqual(displayState({ office, queue }).next, ['R-016', 'R-017']);
});

test('an empty list means nobody is waiting', () => {
  const queue = { status: 'OPEN', last_seq: 4, last_called_seq: 2, current_ticket_id: null, waiting_seqs: [] };
  assert.equal(waitingCount(queue), 0);
  assert.deepEqual(displayState({ office, queue }).next, []);
});

test('a queue doc from before the list keeps the old estimate', () => {
  const queue = { status: 'OPEN', last_seq: 9, last_called_seq: 4, current_ticket_id: null };
  assert.equal(waitingCount(queue), 5);
  assert.equal(peopleAhead({ daily_sequence: 9 }, queue), 4);
  assert.deepEqual(displayState({ office, queue }).next, ['R-005', 'R-006', 'R-007']);
});

test('the capacity cutoff counts the real waiting list', () => {
  // Thursday 2026-11-05 16:40 campus time (08:40 UTC); the office closes at 17:00, visits take 5 minutes
  const now = new Date('2026-11-05T08:40:00Z');
  const hoursOffice = { ...office, hours: { THU: { open_min: 480, close_min: 1020 } } };
  // 20 minutes left, 5 per visit: room for 4. The old estimate saw 0 waiting; the list holds 4
  const queue = { ...afterOverride, last_called_seq: 21, last_seq: 21, waiting_seqs: [16, 17, 19, 20] };
  const state = cutoffState({ office: hoursOffice, queue, now });
  assert.equal(state.waiting, 4);
  assert.equal(state.canJoin, false);
  const shorter = cutoffState({ office: hoursOffice, queue: { ...queue, waiting_seqs: [16, 17] }, now });
  assert.equal(shorter.canJoin, true);
});
