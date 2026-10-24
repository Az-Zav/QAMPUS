import assert from 'node:assert/strict';
import { test } from 'node:test';
import { checkJoin, TicketingError } from '../src/ticketing/preflight.js';

const user = { id: 'u1', name: 'Jazz Binalla', institutional_id: '2410001' };
const office = { id: 'off_reg_001', status: 'ACTIVE' };
const open = { status: 'OPEN', last_seq: 0, last_called_seq: 0 };

test('an open queue and a complete profile can join', () => {
  assert.equal(checkJoin({ user, office, queue: open }), null);
});

test('no queue doc means staff have not opened it', () => {
  assert.equal(checkJoin({ user, office, queue: null }), TicketingError.QUEUE_CLOSED);
});

test('a closed queue refuses joins', () => {
  assert.equal(checkJoin({ user, office, queue: { ...open, status: 'CLOSED' } }), TicketingError.QUEUE_CLOSED);
});

test('an incomplete profile is reported before the queue state', () => {
  assert.equal(checkJoin({ user: { ...user, institutional_id: null }, office, queue: null }), TicketingError.PROFILE_INCOMPLETE);
  assert.equal(checkJoin({ user: { ...user, name: null }, office, queue: open }), TicketingError.PROFILE_INCOMPLETE);
});

test('an inactive office refuses joins', () => {
  assert.equal(checkJoin({ user, office: { ...office, status: 'INACTIVE' }, queue: open }), TicketingError.OFFICE_INACTIVE);
});
