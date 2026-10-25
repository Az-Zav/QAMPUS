import assert from 'node:assert/strict';
import { test } from 'node:test';
import { displayState } from '../src/ticketing/derive.js';

const office = { code: 'R' };
const queue = (extra = {}) => ({
  status: 'OPEN',
  last_seq: 0,
  last_called_seq: 0,
  current_ticket_id: null,
  ...extra,
});

test('an open queue with nobody called shows no ticket at the window and the first three numbers', () => {
  const state = displayState({ office, queue: queue({ last_seq: 5 }) });
  assert.equal(state.isOpen, true);
  assert.equal(state.nowServing, null);
  assert.deepEqual(state.next, ['R-001', 'R-002', 'R-003']);
});

test('the ticket at the window is now serving and the next numbers follow it', () => {
  const state = displayState({
    office,
    queue: queue({ last_seq: 7, last_called_seq: 4, current_ticket_id: 'off_reg_001_20261025_4' }),
  });
  assert.equal(state.nowServing, 'R-004');
  assert.deepEqual(state.next, ['R-005', 'R-006', 'R-007']);
});

test('a free window after a visit shows nobody serving and no stale number', () => {
  const state = displayState({ office, queue: queue({ last_seq: 5, last_called_seq: 4 }) });
  assert.equal(state.nowServing, null);
  assert.deepEqual(state.next, ['R-005']);
});

test('the next list stops at the last ticket issued and never passes the count', () => {
  assert.deepEqual(displayState({ office, queue: queue({ last_seq: 2 }) }).next, ['R-001', 'R-002']);
  assert.deepEqual(displayState({ office, queue: queue({ last_seq: 20 }), nextCount: 2 }).next, ['R-001', 'R-002']);
});

test('a closed or missing queue is closed with nothing listed', () => {
  assert.deepEqual(displayState({ office, queue: queue({ status: 'CLOSED', last_seq: 4 }) }), {
    isOpen: false,
    nowServing: null,
    next: [],
  });
  assert.equal(displayState({ office, queue: null }).isOpen, false);
});
