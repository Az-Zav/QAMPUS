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

test('now serving is the ticket at the window, or null when the window is free', () => {
  assert.equal(nowServing(office, { last_seq: 3, last_called_seq: 2, current_ticket_id: 'off_reg_001_20261105_2' }), 'R-002');
  // An override leaves last_called_seq above the ticket at the window
  assert.equal(nowServing(office, { last_seq: 5, last_called_seq: 5, current_ticket_id: 'off_reg_001_20261105_3' }), 'R-003');
  // After a complete or no-show the window is free: the last called number is not shown
  assert.equal(nowServing(office, { last_seq: 3, last_called_seq: 2, current_ticket_id: null }), null);
  assert.equal(nowServing(office, { last_seq: 3, last_called_seq: 0, current_ticket_id: null }), null);
  assert.equal(nowServing(office, null), null);
});
