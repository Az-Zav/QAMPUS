import assert from 'node:assert/strict';
import { test } from 'node:test';
import { estimatedWaitMinutes, nowServing, peopleAhead, waitingCount } from '../src/ticketing/derive.js';

const office = { code: 'R', default_service_minutes: 5 };

test('waiting count is last_seq - last_called_seq, never negative, 0 without a queue', () => {
  assert.equal(waitingCount({ last_seq: 8, last_called_seq: 3 }), 5);
  assert.equal(waitingCount({ last_seq: 2, last_called_seq: 5 }), 0);
  assert.equal(waitingCount(null), 0);
});

test('people ahead excludes the ticket itself and anyone already called', () => {
  const queue = { last_seq: 9, last_called_seq: 4 };
  assert.equal(peopleAhead({ daily_sequence: 5 }, queue), 0);
  assert.equal(peopleAhead({ daily_sequence: 9 }, queue), 4);
  assert.equal(peopleAhead({ daily_sequence: 3 }, queue), 0);
  assert.equal(peopleAhead({ daily_sequence: 3 }, null), 0);
});

test('estimated wait multiplies people by the office default', () => {
  assert.equal(estimatedWaitMinutes(4, office), 20);
  assert.equal(estimatedWaitMinutes(4, null), 0);
});

test('now serving is the last called number, or null before any call', () => {
  assert.equal(nowServing(office, { last_seq: 3, last_called_seq: 2 }), 'R-002');
  assert.equal(nowServing(office, { last_seq: 3, last_called_seq: 0 }), null);
  assert.equal(nowServing(office, null), null);
});
