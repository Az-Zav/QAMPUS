import assert from 'node:assert/strict';
import { test } from 'node:test';
import { checkJoin, TicketingError } from '../src/ticketing/preflight.js';

const user = { id: 'u1', name: 'Jazz Binalla', institutional_id: '2410001' };
const office = { id: 'off_reg_001', status: 'ACTIVE' };
const open = { status: 'OPEN', last_seq: 0, last_called_seq: 0 };

test('a student with no active ticket at the office can join', () => {
  assert.equal(checkJoin({ user, office, queue: open, activeOffices: {} }), null);
  assert.equal(checkJoin({ user, office, queue: open, activeOffices: { off_csh_002: true } }), null);
  assert.equal(checkJoin({ user, office, queue: open }), null);
});

test('a second join of the same office is refused', () => {
  assert.equal(
    checkJoin({ user, office, queue: open, activeOffices: { off_reg_001: true } }),
    TicketingError.ALREADY_QUEUED,
  );
});

test('the same-office check comes before the limit and the queue state', () => {
  assert.equal(
    checkJoin({ user, office, queue: null, activeCount: 3, activeOffices: { off_reg_001: true } }),
    TicketingError.ALREADY_QUEUED,
  );
});
